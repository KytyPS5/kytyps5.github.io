/**
 * Opcode catalogue generator (Phase 2).
 *
 * Derives `family + opcode -> mnemonic` from the canonical KytyPS5 C++
 * decoder tables (`*_OPCODE_LIST` in the frontend/decode directory). No
 * second, manually-maintained source of truth is kept: the catalogue is
 * regenerated from the C++ sources, so it always reflects the emulator build
 * it was generated from.
 */
import { readFile } from "node:fs/promises";

export interface ExtractedTable {
  /** Canonical family as it appears in `family=` log fields. */
  family: string;
  tableName: string;
  filePath: string;
  entries: Array<{ encoding: number; name: string }>;
}

/** Known multi-token table names -> canonical Family enum name. */
const TABLE_FAMILY_OVERRIDES: Record<string, string> = {
  MIMG_SAMPLE_OPCODE_LIST: "MIMG",
  MIMG_GATHER_OPCODE_LIST: "MIMG",
  VOP3_ENCODED_VOP1_OPCODE_LIST: "VOP3",
};

const KNOWN_FAMILIES = [
  "SOP1", "SOP2", "SOPK", "SOPC", "SOPP",
  "VOP1", "VOP2", "VOP3", "VOP3P", "VOPC", "VINTRP",
  "SMEM", "MUBUF", "MTBUF", "FLAT", "DS", "MIMG", "EXP",
];

const TABLE_START = /constexpr\s+[\w:]+\s+(\w+_OPCODE_LIST)\s*\[\]\s*=\s*\{/;
const ENTRY = /\{\s*0x([0-9a-fA-F]+)u?\s*,\s*Opcode::([A-Za-z0-9_]+)\b/g;

function familyFromTableName(tableName: string): string | null {
  if (TABLE_FAMILY_OVERRIDES[tableName]) return TABLE_FAMILY_OVERRIDES[tableName];
  const first = tableName.split("_")[0];
  return KNOWN_FAMILIES.includes(first) ? first : null;
}

/**
 * Parse a single C++ decoder source file and return its opcode tables.
 */
export function extractTablesFromSource(filePath: string, source: string): ExtractedTable[] {
  const tables: ExtractedTable[] = [];
  let scan = 0; // index into source

  let start: number;
  while ((start = source.indexOf("constexpr", scan ?? 0)) !== -1) {
    const rest = source.slice(start);
    const m = rest.match(TABLE_START);
    if (!m) {
      // find next "constexpr" beyond this occurrence
      const idx = source.indexOf("constexpr", start + 9);
      if (idx === -1) break;
      scan = idx;
      continue;
    }
    const tableName = m[1];
    const family = familyFromTableName(tableName);
    if (family === null) {
      const idx = source.indexOf("constexpr", start + 9);
      if (idx === -1) break;
      scan = idx;
      continue;
    }

    // find the closing "};" of this table after the opening brace
    const openBrace = rest.indexOf("{") + (source.length - rest.length);
    const closeMarker = source.indexOf("};", openBrace + 1);
    if (closeMarker === -1) break;
    const body = source.slice(openBrace + 1, closeMarker);

    const entries: ExtractedTable["entries"] = [];
    let mm: RegExpExecArray | null;
    const re = new RegExp(ENTRY.source, "g");
    while ((mm = re.exec(body)) !== null) {
      entries.push({
        encoding: parseInt(mm[1], 16),
        name: mm[2],
      });
    }

    tables.push({ family, tableName, filePath, entries });
    scan = closeMarker + 2;
  }

  return tables;
}

export interface ExtractedCatalog {
  source: string;
  familyOpcode: Record<string, Record<string, string>>;
  tables: Array<{ family: string; tableName: string; encodingCount: number }>;
  /** encodings resolved by more than one table within one family. */
  collisions: Array<{ family: string; opcode: string; names: string[] }>;
}

/**
 * Extract the opcode catalogue from a set of decoder sources.
 */
export function buildCatalog(files: Array<{ filePath: string; source: string }>): ExtractedCatalog {
  const familyOpcode: Record<string, Record<string, string>> = {};
  const collisions: ExtractedCatalog["collisions"] = [];
  const tables: ExtractedCatalog["tables"] = [];

  for (const file of files) {
    for (const table of extractTablesFromSource(file.filePath, file.source)) {
      tables.push({ family: table.family, tableName: table.tableName, encodingCount: table.entries.length });
      const fam = (familyOpcode[table.family] ??= {});
      for (const e of table.entries) {
        const key = `0x${e.encoding.toString(16).padStart(2, "0")}`;
        const existing = fam[key];
        if (existing !== undefined && existing !== e.name) {
          const rec = collisions.find((c) => c.family === table.family && c.opcode === key);
          if (rec) {
            if (!rec.names.includes(e.name)) rec.names.push(e.name);
          } else {
            collisions.push({ family: table.family, opcode: key, names: [existing, e.name] });
          }
          continue; // keep first; log collision
        }
        fam[key] = e.name;
      }
    }
  }

  return { source: "KytyPS5 frontend/decode (derived)", familyOpcode, tables, collisions };
}

/**
 * Locate and read all decoder table sources from a KytyPS5 checkout.
 */
export async function loadDecoderSources(kytyRoot: string): Promise<Array<{ filePath: string; source: string }>> {
  const dir = `${kytyRoot}/src/graphics/shader/recompiler/frontend/decode`;
  const files = ["MemoryOps.cpp", "ImageOps.cpp", "ScalarAluOps.cpp", "VectorAluOps.cpp", "ExportOps.cpp"];
  const out: Array<{ filePath: string; source: string }> = [];
  for (const f of files) {
    const filePath = `${dir}/${f}`;
    try {
      out.push({ filePath: `${filePath}`.replace(/\\/g, "/"), source: await readFile(filePath, "utf8") });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") continue;
      throw err;
    }
  }
  return out;
}