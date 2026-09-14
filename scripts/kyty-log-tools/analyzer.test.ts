import { describe, expect, it } from "vitest";
import { analyze, buildSignatures, signatureIdOf } from "./analyzer.ts";
import { parseLogFromLines } from "./parser.ts";
import type { LogEvent } from "./types.ts";

const CATALOG: Record<string, Record<string, string>> = {
  MIMG: { "0x0f": "IMAGE_ATOMIC_SWAP", "0xe6": "IMAGE_BVH_INTERSECT_RAY" },
  MUBUF: { "0x5a": "BUFFER_ATOMIC_OR_X2" },
};

function ev(kind: LogEvent["kind"], severity: LogEvent["severity"], fields: Record<string, string>): LogEvent {
  return { kind, severity, line: 1, message: "x", raw: "x", fields };
}

function lines(text: string): AsyncIterable<string> {
  return (async function* () {
    yield* text.split("\n");
  })();
}

describe("signatureIdOf", () => {
  it("uses stable identifiers (family/opcode), not file:line", () => {
    const e = ev("shader-opcode", "error", { family: "MIMG", opcode: "0xe6", reason: "not implemented" });
    expect(signatureIdOf(e)).toBe("shader/unsupported-opcode/family=MIMG/opcode=0xe6");
  });

  it("ignores empty unstable fields", () => {
    const a = ev("shader-opcode", "error", { family: "MIMG", opcode: "0xe6", reason: "" });
    expect(signatureIdOf(a)).not.toContain("reason=");
  });

  it("normalises import by module", () => {
    const e = ev("import-stub", "warning", { module: "Agc", type: "Func" });
    expect(signatureIdOf(e)).toBe("import/unresolved-import/module=Agc/type=Func");
  });

  it("keeps host-exception signature stable across pc/address instances", () => {
    const a = ev("host-exception", "fatal", { code: "0xC0000005", pc: "0x1", address: "0x2" });
    const b = ev("host-exception", "fatal", { code: "0xC0000005", pc: "0xff", address: "0x22" });
    expect(signatureIdOf(a)).toBe(signatureIdOf(b));
    expect(signatureIdOf(a)).toBe("system/host-exception/code=0xC0000005");
  });

  it("distinguishes host exceptions with different codes", () => {
    const a = ev("host-exception", "fatal", { code: "0xC0000005" });
    const b = ev("host-exception", "fatal", { code: "0xC000000D" });
    expect(signatureIdOf(a)).not.toBe(signatureIdOf(b));
  });

  it("does not let the shader reason fragment the signature", () => {
    const a = ev("shader-opcode", "error", { family: "MIMG", opcode: "0xe6", reason: "not implemented" });
    const b = ev("shader-opcode", "error", { family: "MIMG", opcode: "0xe6", reason: "unsupported in image interval" });
    expect(signatureIdOf(a)).toBe(signatureIdOf(b));
    expect(signatureIdOf(b)).toBe("shader/unsupported-opcode/family=MIMG/opcode=0xe6");
  });
});

describe("buildSignatures", () => {
  it("groups identical events and counts occurrences", () => {
    const events = [
      ev("shader-opcode", "error", { family: "MIMG", opcode: "0xe6" }),
      ev("shader-opcode", "error", { family: "MIMG", opcode: "0xe6" }),
      ev("import-stub", "warning", { module: "Agc", type: "Func" }),
    ];
    const sigs = buildSignatures(events);
    expect(sigs.length).toBe(2);
    expect(sigs[0].occurrences).toBe(2);
    expect(sigs[1].occurrences).toBe(1);
  });
});

describe("analyze", () => {
  it("resolves known opcodes from catalogue", async () => {
    const src = await parseLogFromLines(
      lines("0x1: UNSUPPORTED ; family=MIMG opcode=0x0f raw=[0x1] reason=X"),
    );
    const { analysis } = analyze(src.events, { familyOpcode: CATALOG, source: "test" });
    const seen = analysis.opcodesSeen.find((o) => o.family === "MIMG" && o.opcode === "0x0f");
    expect(seen?.name).toBe("IMAGE_ATOMIC_SWAP");
  });

  it("marks absent-from-catalog opcodes as catalog-mismatch candidates", async () => {
    const src = await parseLogFromLines(
      lines("0x1: UNSUPPORTED ; family=MIMG opcode=0x44 raw=[0x1] reason=X"),
    );
    const { analysis } = analyze(src.events, { familyOpcode: CATALOG, source: "test" });
    const cand = analysis.candidates.find((c) => c.kind === "catalog-mismatch");
    expect(cand?.title).toContain("MIMG/0x44");
  });

  it("produces factual observations and separates facts from hypotheses", async () => {
    const src = await parseLogFromLines(
      lines(
        "Unhandled host exception: type=1 code=3221225477 pc=0x1 access=1 address=0x2\nwarning: something",
      ),
    );
    const { analysis } = analyze(src.events, null);
    expect(analysis.observations.some((o) => o.includes("Host exception observed 1x"))).toBe(true);
    expect(analysis.candidates.some((c) => c.kind === "hypothesis")).toBe(true);
  });
});