/**
 * Parser (Phase 1): transforms a `_kyty.txt` stream into typed LogEvents.
 *
 * Requirements implemented:
 * - Deterministic, single pass, O(N) in log size.
 * - Incremental: lines are processed one at a time via a readline stream.
 *   Only matched lines are retained (events[]); unknown lines merely
 *   increment a counter, so memory grows with the number of matched events
 *   (typically tiny), not with the total line count.
 * - Tolerant: unknown lines are counted, never crash the parse.
 * - Identifiers come from stable fields (subsystem, family, opcode, symbol,
 *   code), never from source file:line references.
 */
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import type { LogEvent, LogMetadata } from "./types.ts";

const TITLE_ID = /(PPSA-?\d{5,6})/i;

export interface ParseOutcome {
  metadata: LogMetadata;
  events: LogEvent[];
  unknownLines: number;
  matchedLines: number;
}

const emptyMetadata = (): LogMetadata => ({
  build: { version: "", official: false },
  host: { os: "", cpu: "", threads: "" },
  game: { title: "", titleId: "", eboot: "" },
});

function detectGame(path: string): { title: string; titleId: string } {
  const m = path.match(TITLE_ID);
  const titleId = m ? m[1].toUpperCase() : "";
  let title = "";
  const segs = path.split(/[/\\]/);
  for (const seg of segs) {
    const parts = seg.split(/-PPSA/i);
    if (parts.length > 1) {
      title = parts[0].replace(/\.+$/g, "");
      break;
    }
  }
  return { title, titleId };
}

const SECTION_MARKERS = /^--- (Error|Fatal Error|Build) ---\s*$/;

/**
 * Parse a log incrementally from an async line source.
 */
export async function parseLogFromLines(
  lines: AsyncIterable<string>,
): Promise<ParseOutcome> {
  const metadata = emptyMetadata();
  const events: LogEvent[] = [];
  let unknownLines = 0;
  let matchedLines = 0;

  let buildSection = false;
  let hostSection = false;

  const emit = (event: LogEvent) => {
    matchedLines++;
    events.push(event);
  };

  let lineNo = 0;
  for await (const rawLine of lines) {
    lineNo++;
    const line = rawLine.replace(/\r$/, "");
    const trimmed = line.trim();
    const trimmedLower = trimmed.toLowerCase();

    if (buildSection) {
      const ver = trimmed.match(/^version:\s*(.+)$/i);
      const official = trimmed.match(/^Official build\s*(.+)$/i);
      if (ver || official) {
        const v = (ver?.[1] ?? official?.[1] ?? "").trim();
        metadata.build.version = v;
        metadata.build.official = /official build/i.test(v) || Boolean(official);
        emit({
          kind: "build",
          severity: "info",
          line: lineNo,
          message: `Build version: ${v}`,
          raw: line,
          fields: { version: v },
        });
      }
      buildSection = false;
      continue;
    }

    if (hostSection) {
      const os = trimmed.match(/^os:\s*(.+)$/i);
      const cpu = trimmed.match(/^cpu:\s*(.+)$/i);
      const thr = trimmed.match(/^threads:\s*(\d+)$/i);
      if (os) metadata.host.os = os[1].trim();
      if (cpu) metadata.host.cpu = cpu[1].trim();
      if (thr) metadata.host.threads = thr[1].trim();
      if (os || cpu || thr || trimmed === "") {
        emit({
          kind: "host",
          severity: "info",
          line: lineNo,
          message: trimmed === "" ? "Host section end" : `${trimmed}`,
          raw: line,
          fields: {},
        });
        if (trimmed === "") hostSection = false;
        continue;
      }
    }

    const section = trimmed.match(SECTION_MARKERS);
    if (section) {
      const kind = section[1];
      if (kind === "Build") {
        buildSection = true;
        emit({
          kind: "build",
          severity: "info",
          line: lineNo,
          message: "Build section start",
          raw: line,
          fields: {},
        });
      } else {
        emit({
          kind: "fatal-section",
          severity: "fatal",
          line: lineNo,
          message: `${kind} section start`,
          raw: line,
          fields: { section: kind },
        });
      }
      continue;
    }

    if (trimmed === "Build") {
      buildSection = true;
      emit({
        kind: "build",
        severity: "info",
        line: lineNo,
        message: "Build section start",
        raw: line,
        fields: {},
      });
      continue;
    }
    if (trimmed === "Host") {
      hostSection = true;
      emit({
        kind: "host",
        severity: "info",
        line: lineNo,
        message: "Host section start",
        raw: line,
        fields: {},
      });
      continue;
    }

    // ---- host exception ----
    const hostEx = trimmed.match(/^Unhandled host exception:\s*type=(\d+)\s+code=(\d+)\s+pc=(0x[0-9a-fA-F]+)\s+access=(\d+)\s+address=(0x[0-9a-fA-F]+)/i);
    if (hostEx) {
      const codeDec = Number(hostEx[2]);
      const codeHex = "0x" + codeDec.toString(16).toUpperCase().padStart(8, "0");
      emit({
        kind: "host-exception",
        severity: "fatal",
        line: lineNo,
        message: `Unhandled host exception: code=${codeHex} pc=${hostEx[3]} access=${hostEx[4]} address=${hostEx[5]}`,
        raw: line,
        fields: {
          exceptionType: hostEx[1],
          code: codeHex,
          pc: hostEx[3],
          access: hostEx[4],
          address: hostEx[5],
        },
      });
      continue;
    }

    // ---- guest fault ----
    if (/guest\s+(fault|exception)[:\s]/i.test(trimmed)) {
      emit({
        kind: "guest-fault",
        severity: "fatal",
        line: lineNo,
        message: trimmed,
        raw: line,
        fields: { detail: trimmed },
      });
      continue;
    }

    // ---- stack trace frame ----
    const stack = trimmed.match(/^\s*in\s+(.+):(\d+)\s*$/);
    if (stack) {
      emit({
        kind: "stack-frame",
        severity: "info",
        line: lineNo,
        message: `Stack frame: ${stack[1]}:${stack[2]}`,
        raw: line,
        fields: { source: stack[1], sourceLine: stack[2] },
      });
      continue;
    }

    // ---- unresolved import stub ----
    const imp = trimmed.match(
      /^Relocate:\s+unresolved\s+PLT\s+import\s+patched\s+to\s+stub\s+\[\d+\]\s+\[[0-9a-fA-F]+\]\s*<-\s*([0-9a-fA-F]+),\s*(\w+)\[([?~:\w.\-]+?)\]\[([?~:\w.\-]+?)\]\[(\w+)\]/,
    );
    if (imp) {
      const moduleToken = imp[3];
      const module = moduleToken.replace(/_v?\d+(\.\d+)?$/i, "");
      emit({
        kind: "import-stub",
        severity: "warning",
        line: lineNo,
        message: `Unresolved import stub: ${module} (${imp[5]})`,
        raw: line,
        fields: { module, moduleVersion: moduleToken, type: imp[5], symbol: imp[2] },
      });
      continue;
    }

    // ---- shader unsupported opcode ----
    const shaderUnsup = trimmed.match(/;\s*family=(\w+)\s+opcode=0x([0-9a-fA-F]+)(?:\s+raw=\[([^\]]*)\])?(?:\s+reason=(\w.*))?$/);
    if (shaderUnsup) {
      emit({
        kind: "shader-opcode",
        severity: "error",
        line: lineNo,
        message: `Shader unsupported opcode: family=${shaderUnsup[1]} opcode=0x${shaderUnsup[2]}${shaderUnsup[4] ? ` reason=${shaderUnsup[4]}` : ""}`,
        raw: line,
        fields: {
          family: shaderUnsup[1],
          opcode: `0x${shaderUnsup[2].toLowerCase()}`,
          reason: shaderUnsup[4] ?? "",
        },
      });
      continue;
    }

    // ---- CFG dispatcher fallback ----
    const cfg = trimmed.match(/CFG dispatcher fallback:\s+stage=(\w+)\s+hash=(0x[0-9a-fA-F]+)\s+phase=(\w+)\s+failure=(\w+).*reason=(\w.*)$/);
    if (cfg) {
      emit({
        kind: "cfg-fallback",
        severity: "error",
        line: lineNo,
        message: `CFG dispatcher fallback: stage=${cfg[1]} failure=${cfg[4]} reason=${cfg[5]}`,
        raw: line,
        fields: { stage: cfg[1], hash: cfg[2], phase: cfg[3], failure: cfg[4], reason: cfg[5] },
      });
      continue;
    }

    // ---- SPIR-V failures ----
    const spirv = trimmed.match(/SPIR-V\s+(\w+)\s+(failed|error)/i);
    if (spirv) {
      emit({
        kind: "spirv-failure",
        severity: "error",
        line: lineNo,
        message: `SPIR-V ${spirv[1]} ${spirv[2]}`,
        raw: line,
        fields: { stage: spirv[1], outcome: spirv[2].toLowerCase() },
      });
      continue;
    }

    // ---- Not implemented ----
    if (trimmedLower.includes("not implemented")) {
      const reason = trimmed.replace(/^[^:]+:\s*/i, "").trim();
      emit({
        kind: "not-implemented",
        severity: "error",
        line: lineNo,
        message: `Not implemented: ${reason.slice(0, 160)}`,
        raw: line,
        fields: { reason },
      });
      continue;
    }

    // ---- module loading ----
    const mod = trimmed.match(/^---\s+Relocate program:\s+(.+?)\s*---$/);
    if (mod) {
      const game = detectGame(mod[1]);
      if (game.titleId && !metadata.game.titleId) {
        metadata.game.titleId = game.titleId;
        metadata.game.title = game.title;
      }
      const pathField = mod[1].replace(/\\/g, "/");
      emit({
        kind: "module-load",
        severity: "info",
        line: lineNo,
        message: `Relocating module: ${pathField.split("/").pop()}`,
        raw: line,
        fields: { module: pathField.split("/").pop() ?? "", path: pathField },
      });
      continue;
    }

    // ---- game loading ----
    const game = trimmed.match(/^Loading:\s+(.+?\/eboot\.bin)$/i);
    if (game) {
      const detected = detectGame(game[1]);
      metadata.game.eboot = game[1];
      if (detected.titleId) {
        metadata.game.titleId = detected.titleId;
        metadata.game.title = detected.title;
      }
      emit({
        kind: "game-load",
        severity: "info",
        line: lineNo,
        message: `Game loaded: ${detected.title || detected.titleId || game[1]}`.trim(),
        raw: line,
        fields: { title: detected.title, titleId: detected.titleId, eboot: game[1] },
      });
      continue;
    }

    // ---- warnings ----
    const warn = trimmed.match(/^\[?[Ww]arning:?\s+(.+)$/);
    if (warn) {
      const body = warn[1].trim();
      if (body) {
        emit({
          kind: "warning",
          severity: "warning",
          line: lineNo,
          message: `Warning: ${body.slice(0, 200)}`,
          raw: line,
          fields: { message: body },
        });
        continue;
      }
    }

    unknownLines++;
  }

  return { metadata, events, unknownLines, matchedLines };
}

/**
 * Parse a file path in streaming mode.
 */
export async function parseLogFile(filePath: string): Promise<ParseOutcome> {
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  try {
    return await parseLogFromLines(rl);
  } finally {
    rl.close();
  }
}