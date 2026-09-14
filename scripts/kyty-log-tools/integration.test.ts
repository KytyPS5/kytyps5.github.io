import { describe, expect, it } from "vitest";
import { parseLogFromLines } from "./parser.ts";
import { analyze } from "./analyzer.ts";
import type { AnalyzedLog } from "./types.ts";

const SAMPLE_LINES = [
  "Build",
  "  version: Official build KytyPS5-2026-09-09-0b4e78c",
  "",
  "Host",
  "  os:      Windows",
  "  cpu:     Intel 12th Gen Core i3-12100F",
  "  threads: 8",
  "",
  "--- Relocate program: E:/homebrew/SILENT.HILL.The.Short.Message-PPSA10112-ASIA-Game-v1.001-PS5/PPSA10112-app/sce_module/libc.prx ---",
  "Relocate: unresolved PLT import patched to stub [169] [0000000907b05b88] <- 0000000200000000, kFhuwHrIUqs[PlayerInvitationDialog_v1][PlayerInvitationDialog_v1.1][Func], Func, Global, E:/homebrew/SILENT.HILL.The.Short.Message-PPSA10112-ASIA-Game-v1.001-PS5/PPSA10112-app/eboot.bin",
  "0x0000000123456789: UNSUPPORTED ; family=MIMG opcode=0xe6 raw=[0x00000000 0x00000001] reason=MIMG opcode is not implemented",
  "ShaderRecompiler MS CFG dispatcher fallback: stage=MS hash=0x4e991d9d461f621d phase=BuildGraph failure=UnsupportedInstruction block=3 pc=0x00000008..0x00000020 preds=2 succs=1 blocks=4 loops=0 back_edges=0 reason=unsupported decoded instruction in CFG at pc",
  "Not implemented (some module): feature X",
  "warning: executing wave64 compute shader cs=0x0000002007870000",
  "SPIR-V emission failed: stage=PS hash=0xbec4dad884d4b676",
  "guest fault context: address=0x10 pc=0x20",
  "this is completely unknown noise that no pattern matches",
  "",
  "--- Build ---",
  "Official build KytyPS5-2026-09-09-0b4e78c",
  "--- Error ---",
  "Unhandled host exception: type=1 code=3221225477 pc=0x00007ff963ae3221 access=1 address=0x0000000000000004",
  " in D:\\a\\KytyPS5\\KytyPS5\\src\\loader\\runtimeLinker.cpp:843",
];

function asAsync(lines: string[]): AsyncIterable<string> {
  return (async function* () {
    yield* lines;
  })();
}

async function fullPipeline(sample: string[]): Promise<AnalyzedLog> {
  const { metadata, events, unknownLines, matchedLines } = await parseLogFromLines(asAsync(sample));
  const { signatures, analysis } = analyze(events, null);
  return {
    metadata,
    parse: {
      file: "sample",
      sizeBytes: sample.join("\n").length,
      lineCount: sample.length,
      durationMs: 1,
      peakMemoryMB: 1,
      unknownLineCount: unknownLines,
      matchedLineCount: matchedLines,
    },
    events,
    signatures,
    analysis,
  };
}

describe("integration: log -> parser -> analyzer -> JSON", () => {
  it("produces a full AnalyzedLog covering the sample", async () => {
    const result = await fullPipeline(SAMPLE_LINES);

    expect(result.parse.matchedLineCount).toBeGreaterThan(0);
    expect(result.parse.unknownLineCount).toBe(3); // blank-after-version, noise, blank-after-noise

    // metadata
    expect(result.metadata.build.version).toContain("KytyPS5-2026-09-09-0b4e78c");
    expect(result.metadata.host.os).toBe("Windows");
    expect(result.metadata.game.title).toBe("SILENT.HILL.The.Short.Message");
    expect(result.metadata.game.titleId).toBe("PPSA10112");

    // events collected
    const kinds = result.events.map((e) => e.kind);
    expect(kinds).toContain("import-stub");
    expect(kinds).toContain("shader-opcode");
    expect(kinds).toContain("cfg-fallback");
    expect(kinds).toContain("not-implemented");
    expect(kinds).toContain("spirv-failure");
    expect(kinds).toContain("guest-fault");
    expect(kinds).toContain("warning");
    expect(kinds).toContain("host-exception");
    expect(kinds).toContain("stack-frame");
    expect(kinds).toContain("fatal-section");

    // signatures: only warning/error/fatal, sorted by occurrences
    const ids = result.signatures.map((s) => s.id);
    expect(ids).toContain("shader/unsupported-opcode/family=MIMG/opcode=0xe6");
    expect(ids).toContain("import/unresolved-import/module=PlayerInvitationDialog/type=Func");
    expect(ids).toContain("system/host-exception/code=0xC0000005");
    expect(result.signatures.every((s) => s.occurrences >= 1)).toBe(true);

    // analysis produced candidates
    expect(result.analysis.candidates.length).toBeGreaterThanOrEqual(3);
    expect(result.analysis.candidates.some((c) => c.title.includes("MIMG/0xe6"))).toBe(true);
  });

  it("serialises the full AnalyzedLog to JSON without losing fields", async () => {
    const result = await fullPipeline(SAMPLE_LINES);
    const json = JSON.parse(JSON.stringify(result));
    expect(json.metadata.build.version).toContain("KytyPS5-2026-09-09-0b4e78c");
    expect(json.signatures).toHaveLength(result.signatures.length);
    expect(json.events).toHaveLength(result.events.length);
    expect(json.analysis.observations).toBeInstanceOf(Array);
  });
});