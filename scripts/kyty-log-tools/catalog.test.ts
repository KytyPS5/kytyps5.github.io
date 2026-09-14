import { describe, expect, it } from "vitest";
import { extractTablesFromSource, buildCatalog } from "./catalog.ts";

// Miniature reproduction of the canonical decoder table layout in KytyPS5.
const MINI_IMAGE_SRC = `
namespace {
struct ImageOpcodeInfo {
  uint32_t encoding = 0;
  Opcode   decoded  = Opcode::UNSUPPORTED;
  uint32_t dmask    = 0;
  uint32_t dtype    = 32;
};

constexpr ImageOpcodeInfo MIMG_SAMPLE_OPCODE_LIST[] = {
    {0x47u, Opcode::IMAGE_GATHER4_LZ, 0, 32},
    {0x4fu, Opcode::IMAGE_SAMPLE, 0, 32},
    {0x57u, Opcode::IMAGE_SAMPLE_C, 0, 32},
    {0x5fu, Opcode::IMAGE_GATHER4_LZ_O, 0, 32},
};

constexpr ImageOpcodeInfo MIMG_GATHER_OPCODE_LIST[] = {
    {0x61u, Opcode::IMAGE_GATHER4_C_LZ_O, 0, 32},
};
} // namespace
`;

const MINI_MEMORY_SRC = `
constexpr MemoryOpcodeInfo SMEM_OPCODE_LIST[] = {
    {0x00u, Opcode::S_LOAD_DWORD, 1, 32},
    {0x01u, Opcode::S_LOAD_DWORDX2, 2, 32},
};

constexpr MemoryOpcodeInfo MUBUF_OPCODE_LIST[] = {
    {0x30u, Opcode::BUFFER_ATOMIC_SWAP, 1, 32},
    {0x5au, Opcode::BUFFER_ATOMIC_OR_X2, 2, 32},
};
`;

describe("extractTablesFromSource", () => {
  it("extracts MIMG_SAMPLE and MIMG_GATHER tables", () => {
    const tables = extractTablesFromSource("image.cpp", MINI_IMAGE_SRC);
    const names = tables.map((t) => t.tableName);
    expect(names).toContain("MIMG_SAMPLE_OPCODE_LIST");
    expect(names).toContain("MIMG_GATHER_OPCODE_LIST");
    const sample = tables.find((t) => t.tableName === "MIMG_SAMPLE_OPCODE_LIST");
    expect(sample!.family).toBe("MIMG");
    expect(sample!.entries).toContainEqual({ encoding: 0x47, name: "IMAGE_GATHER4_LZ" });
  });

  it("extracts SMEM and MUBUF tables", () => {
    const tables = extractTablesFromSource("memory.cpp", MINI_MEMORY_SRC);
    const smem = tables.find((t) => t.tableName === "SMEM_OPCODE_LIST")!;
    expect(smem.family).toBe("SMEM");
    expect(smem.entries).toContainEqual({ encoding: 0x00, name: "S_LOAD_DWORD" });
    const mubuf = tables.find((t) => t.tableName === "MUBUF_OPCODE_LIST")!;
    expect(mubuf.entries).toContainEqual({ encoding: 0x5a, name: "BUFFER_ATOMIC_OR_X2" });
  });

  it("ignores tables with unknown families", () => {
    const src = `constexpr XSomething FOO_OPCODE_LIST[] = { {0x00u, Opcode::X, 1, 32} };`;
    expect(extractTablesFromSource("foo.cpp", src)).toEqual([]);
  });
});

describe("buildCatalog", () => {
  it("aggregates families and resolves opcode/name", () => {
    const catalog = buildCatalog([
      { filePath: "memory.cpp", source: MINI_MEMORY_SRC },
      { filePath: "image.cpp", source: MINI_IMAGE_SRC },
    ]);
    expect(catalog.familyOpcode.MUBUF["0x5a"]).toBe("BUFFER_ATOMIC_OR_X2");
    expect(catalog.familyOpcode.SMEM["0x01"]).toBe("S_LOAD_DWORDX2");
    expect(catalog.familyOpcode.MIMG["0x61"]).toBe("IMAGE_GATHER4_C_LZ_O");
    expect(catalog.collisions).toEqual([]);
  });

  it("reports collisions across duplicate encodings in one family", () => {
    const src = `
constexpr ImageOpcodeInfo MIMG_A_OPCODE_LIST[] = { {0x47u, Opcode::IMAGE_A, 0, 32} };
constexpr ImageOpcodeInfo MIMG_B_OPCODE_LIST[] = { {0x47u, Opcode::IMAGE_B, 0, 32} };
`;
    const catalog = buildCatalog([{ filePath: "image.cpp", source: src }]);
    expect(catalog.collisions.some((c) => c.family === "MIMG" && c.opcode === "0x47")).toBe(true);
  });
});