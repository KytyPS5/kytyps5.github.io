import { describe, expect, it } from "vitest";
import { parseLogFromLines } from "./parser.ts";

function lines(text: string): AsyncIterable<string> {
  return (async function* () {
    yield* text.split("\n");
  })();
}

describe("parser", () => {
  it("parses metadata (Build section)", async () => {
    const src = await parseLogFromLines(
      lines("Build\n  version: Official build KytyPS5-2026-09-09-0b4e78c\n\nHost\n  os:      Windows\n  cpu:     x\n  threads: 8\n"),
    );
    expect(src.metadata.build.version).toContain("KytyPS5-2026-09-09-0b4e78c");
    expect(src.metadata.build.official).toBe(true);
    expect(src.metadata.host.os).toBe("Windows");
    expect(src.metadata.host.threads).toBe("8");
  });

  it("parses the newer one-line build footer (--- Build ---)", async () => {
    const src = await parseLogFromLines(lines("--- Build ---\nOfficial build KytyPS5-2026-09-09-0b4e78c\n"));
    expect(src.metadata.build.version).toContain("KytyPS5-2026-09-09-0b4e78c");
  });

  it("detects Fatal Error section marker", async () => {
    const src = await parseLogFromLines(lines("--- Fatal Error ---"));
    const fatal = src.events.find((e) => e.kind === "fatal-section");
    expect(fatal?.severity).toBe("fatal");
    expect(fatal?.fields.section).toBe("Fatal Error");
  });

  it("parses Not implemented", async () => {
    const src = await parseLogFromLines(lines("Not implemented (foo): feature"));
    const ev = src.events.find((e) => e.kind === "not-implemented");
    expect(ev?.severity).toBe("error");
    expect(ev?.fields.reason).toBe("feature");
  });

  it("parses unresolved import stub with module token", async () => {
    const src = await parseLogFromLines(
      lines("Relocate: unresolved PLT import patched to stub [169] [0000000907b05b88] <- 0000000200000000, sym01[PlayerInvitationDialog_v1][PlayerInvitationDialog_v1.1][Func], Func, Global, E:/x/eboot.bin"),
    );
    const ev = src.events.find((e) => e.kind === "import-stub");
    expect(ev?.fields.module).toBe("PlayerInvitationDialog");
    expect(ev?.fields.type).toBe("Func");
  });

  it("parses shader unsupported opcode (family/opcode/reason)", async () => {
    const src = await parseLogFromLines(
      lines("0x0000000000000008: UNSUPPORTED ; family=MIMG opcode=0xe6 raw=[0x1 0x2] reason=MIMG opcode is not implemented"),
    );
    const ev = src.events.find((e) => e.kind === "shader-opcode");
    expect(ev?.fields).toMatchObject({ family: "MIMG", opcode: "0xe6", reason: "MIMG opcode is not implemented" });
  });

  it("parses CFG dispatcher fallback", async () => {
    const src = await parseLogFromLines(
      lines("ShaderRecompiler MS CFG dispatcher fallback: stage=MS hash=0x4e991d9d461f621d phase=BuildGraph failure=UnsupportedInstruction block=3 pc=0x00000008..0x00000020 preds=2 succs=1 blocks=4 loops=0 back_edges=0 reason=unsupported decoded instruction"),
    );
    const ev = src.events.find((e) => e.kind === "cfg-fallback");
    expect(ev?.fields.failure).toBe("UnsupportedInstruction");
    expect(ev?.fields.hash).toBe("0x4e991d9d461f621d");
  });

  it("parses host exception and normalises the decimal NTSTATUS code to hex", async () => {
    const src = await parseLogFromLines(
      lines("Unhandled host exception: type=1 code=3221225477 pc=0x00007ff963ae3221 access=1 address=0x0000000000000004"),
    );
    const ev = src.events.find((e) => e.kind === "host-exception");
    expect(ev?.fields.code).toBe("0xC0000005");
    expect(ev?.severity).toBe("fatal");
  });

  it("parses stack frame without treating it as primary id", async () => {
    const src = await parseLogFromLines(lines(" in D:\\a\\KytyPS5\\KytyPS5\\src\\loader\\runtimeLinker.cpp:843"));
    const ev = src.events.find((e) => e.kind === "stack-frame");
    expect(ev?.fields.source).toContain("runtimeLinker.cpp");
  });

  it("parses SPIR-V failures", async () => {
    const src = await parseLogFromLines(lines("SPIR-V emission failed: stage=PS hash=0x1"));
    const ev = src.events.find((e) => e.kind === "spirv-failure");
    expect(ev?.fields.stage).toBe("emission");
  });

  it("parses guest fault", async () => {
    const src = await parseLogFromLines(lines("guest fault context: address=0x10 pc=0x20"));
    const ev = src.events.find((e) => e.kind === "guest-fault");
    expect(ev?.severity).toBe("fatal");
  });

  it("detects warnings", async () => {
    const src = await parseLogFromLines(lines('warning: ignoring indirect uc reg GE_STEREO_CNTL at 0x25f, value = 0x00000000'));
    const ev = src.events.find((e) => e.kind === "warning");
    expect(ev?.severity).toBe("warning");
  });

  it("does not crash on incomplete/corrupt logs and counts unknowns", async () => {
    const src = await parseLogFromLines(
      lines(["Random garbage line", "---", "Unhandled host exception: type=", "0x1234: garbage {}"].join("\n")),
    );
    expect(src.unknownLines).toBeGreaterThanOrEqual(3);
    expect(src.events.length).toBe(0);
  });

  it("detects game load and title from eboot path", async () => {
    const src = await parseLogFromLines(
      lines("Loading: E:/homebrew/SILENT.HILL.The.Short.Message-PPSA10112-ASIA-Game-v1.001-PS5/PPSA10112-app/eboot.bin"),
    );
    expect(src.metadata.game.title).toBe("SILENT.HILL.The.Short.Message");
    expect(src.metadata.game.titleId).toBe("PPSA10112");
  });
});