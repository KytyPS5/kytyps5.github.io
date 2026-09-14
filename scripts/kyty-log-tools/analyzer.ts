/**
 * Analyzer (Phase 2, minimal): organises Parser facts into normalised
 * ErrorSignatures, performs catalogue lookups for (family, opcode) pairs and
 * produces evidence-backed candidates.
 *
 * Distinction contract (approved):
 * - FACTS (observations) come directly from the log.
 * - SIGNATURES are normalised representations of the facts.
 * - EVIDENCE are concrete log lines that support a candidate.
 * - CANDIDATES are possible interpretations; never asserted as confirmed
 *   root causes.
 */
import type { LogEvent, ErrorSignature, Candidate, Analysis } from "./types.ts";

/** Maps log event kind -> normalised subsystem. */
function subsystemOf(event: LogEvent): ErrorSignature["subsystem"] {
  switch (event.kind) {
    case "shader-opcode":
    case "cfg-fallback":
    case "spirv-failure":
      return "shader";
    case "import-stub":
      return "import";
    case "host-exception":
    case "guest-fault":
    case "fatal-section":
      return "system";
    default:
      return "system";
  }
}

/** Maps event kind -> normalised errorType. */
function errorTypeOf(event: LogEvent): string {
  switch (event.kind) {
    case "shader-opcode": return "unsupported-opcode";
    case "cfg-fallback": return "cfg-fallback";
    case "spirv-failure": return "spirv-failure";
    case "import-stub": return "unresolved-import";
    case "host-exception": return "host-exception";
    case "guest-fault": return "guest-fault";
    case "fatal-section": return "fatal-section";
    case "not-implemented": return "not-implemented";
    case "warning": return "warning";
    default: return event.kind;
  }
}

/** Stable identifiers (never include source file:line). */
function stableIdentifiersOf(event: LogEvent): Record<string, string> {
  switch (event.kind) {
    case "shader-opcode":
    case "cfg-fallback":
      return pick(event.fields, ["family", "opcode", "stage", "failure", "hash"]);
    case "import-stub":
      return pick(event.fields, ["module", "type"]);
    case "host-exception":
    case "guest-fault":
      // Only `code` is stable across runs: pc/address vary per instance
      // (ASLR, allocator, loaded base); they remain available in `fields`.
      return pick(event.fields, ["code"]);
    case "fatal-section":
      return pick(event.fields, ["section"]);
    default:
      return {};
  }
}

function pick(fields: Record<string, string>, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    if (fields[key] !== undefined && fields[key] !== "") out[key] = fields[key];
  }
  return out;
}

/** Builds a canonical signature id from subsystem + identifiers. */
export function signatureIdOf(event: LogEvent): string {
  const subsystem = subsystemOf(event);
  const errorType = errorTypeOf(event);
  const ids = stableIdentifiersOf(event);
  const idParts = [`${subsystem}/${errorType}`];
  for (const [key, value] of Object.entries(ids)) {
    idParts.push(`${key}=${value}`);
  }
  return idParts.join("/");
}

/**
 * Group events into normalised signatures.
 */
export function buildSignatures(events: LogEvent[]): ErrorSignature[] {
  const map = new Map<string, ErrorSignature>();
  for (const event of events) {
    if (event.severity === "info") continue;
    const id = signatureIdOf(event);
    let existing = map.get(id);
    if (!existing) {
      existing = {
        id,
        subsystem: subsystemOf(event),
        errorType: errorTypeOf(event),
        stableIdentifiers: stableIdentifiersOf(event),
        occurrences: 0,
        lines: [],
        example: event.message,
      };
      map.set(id, existing);
    }
    existing.occurrences++;
    if (existing.lines.length < 50) existing.lines.push(event.line);
  }
  return [...map.values()].sort((a, b) => b.occurrences - a.occurrences);
}

export interface Catalog {
  familyOpcode: Record<string, Record<string, string>>;
  source: string;
}

/**
 * Minimal Analyzer: produces facts, signatures, opcode catalogue matches and
 * evidence-backed candidates from parsed events.
 */
export function analyze(
  events: LogEvent[],
  catalog: Catalog | null,
): { signatures: ErrorSignature[]; analysis: Analysis } {
  const signatures = buildSignatures(events);

  // ---- opcodes seen in the log + catalogue resolution ----
  const opcodeCounts = new Map<string, { family: string; opcode: string; occurrences: number }>();
  for (const event of events) {
    if (event.kind !== "shader-opcode") continue;
    const family = event.fields.family ?? "";
    const opcode = event.fields.opcode ?? "";
    const key = `${family}|${opcode}`;
    const cur = opcodeCounts.get(key) ?? { family, opcode, occurrences: 0 };
    cur.occurrences++;
    opcodeCounts.set(key, cur);
  }

  const opcodesSeen = [...opcodeCounts.values()]
    .map(({ family, opcode, occurrences }) => ({
      family,
      opcode,
      name: catalog?.familyOpcode[family]?.[opcode] ?? null,
      occurrences,
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  // ---- factual observations ----
  const observations: string[] = [];
  if (opcodesSeen.length > 0) {
    for (const o of opcodesSeen) {
      observations.push(
        `Shader opcode ${o.family}/${o.opcode} observed ${o.occurrences}x` +
          (o.name ? ` (catalog: ${o.name})` : " (absent from catalog)"),
      );
    }
  }
  const imports = new Map<string, number>();
  for (const event of events) {
    if (event.kind === "import-stub") {
      const key = event.fields.module ?? "?";
      imports.set(key, (imports.get(key) ?? 0) + 1);
    }
  }
  for (const [module, count] of imports) {
    observations.push(`Unresolved import module ${module} observed ${count}x`);
  }
  const hostEx = events.filter((e) => e.kind === "host-exception");
  if (hostEx.length > 0) {
    observations.push(`Host exception observed ${hostEx.length}x`);
  }

  // ---- candidates (evidence-backed, never asserted) ----
  const candidates: Candidate[] = [];

  for (const { family, opcode, name, occurrences } of opcodesSeen) {
    if (name === null) {
      const lines = events
        .filter((e) => e.kind === "shader-opcode" && e.fields.family === family && e.fields.opcode === opcode)
        .map((e) => e.line);
      candidates.push({
        kind: "catalog-mismatch",
        title: `Opcode ${family}/${opcode} unknown in current catalog`,
        description:
          `The log contains shader opcode ${family}/${opcode} (${occurrences}x) which is not present in the ` +
          `canonical KytyPS5 opcode tables from ${catalog?.source ?? "the configured source"}. ` +
          `The emulator likely does not implement this instruction; a maintainer must confirm the intended semantics.`,
        evidence: [{ lines, summary: `${family}/${opcode} in ${occurrences} log event(s)` }],
      });
    } else {
      candidates.push({
        kind: "fact",
        title: `Opcode ${family}/${opcode} resolved to ${name} but reported UNSUPPORTED`,
        description:
          `The log reports ${family}/${opcode} = ${name} as UNSUPPORTED even though it is listed in the ` +
          `canonical KytyPS5 opcode tables. The decode result and the catalogue disagree; ` +
          `a maintainer must reconcile the intended semantics.`,
        evidence: [
          {
            lines: events
              .filter((e) => e.kind === "shader-opcode" && e.fields.family === family && e.fields.opcode === opcode)
              .map((e) => e.line),
            summary: "Catalogue lookup matched",
          },
        ],
      });
    }
  }

  for (const [module, count] of imports) {
    const lines = events.filter((e) => e.kind === "import-stub" && e.fields.module === module).map((e) => e.line);
    candidates.push({
      kind: "fact",
      title: `Unresolved import module ${module}`,
      description: `${count} call(s) to ${module} were redirected to a stub, so functionality from that module ` +
        `will be missing or stubbed at runtime.`,
      evidence: [{ lines, summary: `${count} stub call(s) to ${module}` }],
    });
  }

  if (hostEx.length > 0) {
    const lines = hostEx.map((e) => e.line);
    candidates.push({
      kind: "hypothesis",
      title: "Possible upstream crash with no KytyPS5 attribution",
      description:
        `Host exception was caught (not a guest fault). Since the PC/address point into ` +
        `relocated guest code or emulator internals, confirm with a debug build before treating it as a KytyPS5 bug.`,
      evidence: [{ lines, summary: `${hostEx.length} host exception line(s)` }],
    });
  }

  // ---- cross-game detection: no-op in single-log analysis; kept contract ----
  const crossGame: string[] = [];

  return {
    signatures,
    analysis: {
      observations,
      candidates,
      opcodesSeen,
      crossGame,
    },
  };
}