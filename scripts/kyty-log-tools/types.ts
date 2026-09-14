/**
 * Shared schema for kyty-log-tools (MVP Phase 1).
 *
 * Design contract (approved):
 * - The Parser produces FACTS extracted from a `_kyty.txt` log.
 * - The Analyzer produces normalised signatures, catalogue lookups and
 *   evidence-backed CANDIDATES. It never presents a hypothesis as a
 *   confirmed root cause.
 * - Identifiers are derived from stable log content (subsystem, error
 *   type, shader family, opcode, symbol). Source file:line references are
 *   NEVER used as a primary identifier because they change between builds.
 *
 * The types below are written in "erasable" TypeScript (no enums, no
 * namespaces) so the modules run unchanged under Node's native type
 * stripping and type-check cleanly with `tsc --noEmit`.
 */

export type Severity = "info" | "warning" | "error" | "fatal";

export type EventKind =
  | "build"
  | "host"
  | "fatal-section"
  | "host-exception"
  | "guest-fault"
  | "stack-frame"
  | "not-implemented"
  | "import-stub"
  | "shader-opcode"
  | "cfg-fallback"
  | "spirv-failure"
  | "warning"
  | "module-load"
  | "game-load";

export type Subsystem =
  | "system"
  | "shader"
  | "import"
  | "render"
  | "memory"
  | "module"
  | "game";

/** One raw fact observed in the log. Produced by the Parser only. */
export interface LogEvent {
  /** Normalised event category. */
  kind: EventKind;
  severity: Severity;
  /** 1-based line number in the source log. */
  line: number;
  /** Human-readable description, rebuilt from stable fields. */
  message: string;
  /** Original line, kept for auditability. */
  raw: string;
  /**
   * Normalised stable fields (no source file/line references).
   * e.g. { family: "MIMG", opcode: "0xe6", reason: "..." }
   */
  fields: Record<string, string>;
}

export interface LogMetadata {
  build: {
    version: string;
    official: boolean;
  };
  host: {
    os: string;
    cpu: string;
    threads: string;
  };
  game: {
    title: string;
    titleId: string;
    /** Path of the loaded eboot.bin, if present. */
    eboot: string;
  };
}

export interface ParseMetadata {
  /** Source filename only (no private path info). */
  file: string;
  sizeBytes: number;
  lineCount: number;
  durationMs: number;
  /** Approximate incremental heap used during parse (heapUsed delta).
   * Estimate: GC may run during the parse and under-report. */
  peakMemoryMB: number;
  /** Lines that matched no known pattern. */
  unknownLineCount: number;
  /** Lines that matched at least one pattern. */
  matchedLineCount: number;
}

/** A stable, normalised error representation produced by the Analyzer. */
export interface ErrorSignature {
  /** Canonical id, e.g. `shader/unsupported-opcode/MIMG/0xe6`. */
  id: string;
  /** `shader` | `import` | `system` | ... */
  subsystem: Subsystem;
  /** Specific error type, e.g. `unsupported-opcode`, `unresolved-import`. */
  errorType: string;
  /** Stable identifiers chosen for the signature (excludes file:line). */
  stableIdentifiers: Record<string, string>;
  /** Number of occurrences in the analysed log. */
  occurrences: number;
  /** Line numbers where it occurred (bounded, for evidence). */
  lines: number[];
  /** First raw message captured for the signature. */
  example: string;
}

/** Catalogue entry resolving (family, opcode) -> mnemonic name. */
export interface OpcodeCatalogEntry {
  family: string;
  opcode: string; // normalized lowercase hex, "0xe6"
  name: string; // canonical enum mnemonic, e.g. IMAGE_BVH_INTERSECT_RAY
}

export interface OpcodeCatalog {
  /** Canonical source identifier (repo ref + file) that generated it. */
  source: string;
  familyOpcode: Record<string, Record<string, string>>;
}

/** A single element of concrete in-log evidence supporting a candidate. */
export interface EvidenceItem {
  /** Line numbers in the analysed log. */
  lines: number[];
  /** Short factual description of the evidence. */
  summary: string;
}

/**
 * A possible interpretation. The Analyzer may produce these from
 * FACTS + CATALOGUE + signature grouping. `kind` distinguishes derivation:
 * - "fact": directly observed in the log (not a hypothesis).
 * - "catalog-mismatch": opcode present in log but absent in catalogue.
 * - "hypothesis": possible cause; requires maintainer confirmation.
 */
export interface Candidate {
  kind: "fact" | "catalog-mismatch" | "hypothesis";
  title: string;
  description: string;
  evidence: EvidenceItem[];
}

export interface Analysis {
  /** Factual observations. Never guesses. */
  observations: string[];
  /** Evidence-backed candidates. Never asserted beyond the available facts. */
  candidates: Candidate[];
  /** (family, opcode) pairs observed in the log and their catalogue status. */
  opcodesSeen: Array<{
    family: string;
    opcode: string;
    name: string | null; // null when absent from the canonical catalogue
    occurrences: number;
  }>;
  /** Signature ids that appear in more than one distinct game section. */
  crossGame: string[];
}

/** Top-level result of the whole pipeline. */
export interface AnalyzedLog {
  metadata: LogMetadata;
  parse: ParseMetadata;
  events: LogEvent[];
  signatures: ErrorSignature[];
  analysis: Analysis;
}