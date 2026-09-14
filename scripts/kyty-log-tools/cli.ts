#!/usr/bin/env node
/**
 * kyty-log-tools CLI (MVP).
 *
 * Usage:
 *   node scripts/kyty-log-tools/cli.ts analyze <logfile> [--catalog opcode-catalog.json] [--json]
 *   node scripts/kyty-log-tools/cli.ts catalog <kyty-root> [--out opcode-catalog.json]
 *
 * Reads local files only; never pushes or publishes anything.
 */
import { stat, readFile, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { parseLogFile } from "./parser.ts";
import { analyze } from "./analyzer.ts";
import { loadDecoderSources, buildCatalog } from "./catalog.ts";
import type { AnalyzedLog, OpcodeCatalog } from "./types.ts";

const DEFAULT_CATALOG = "scripts/kyty-log-tools/opcode-catalog.json";

function usage(): never {
  console.error(
    "Usage:\n" +
      "  node scripts/kyty-log-tools/cli.ts analyze <logfile> [--catalog <path>] [--json]\n" +
      "  node scripts/kyty-log-tools/cli.ts catalog <kyty-root> [--out <path>]",
  );
  process.exit(2);
}

async function loadCatalog(path: string): Promise<OpcodeCatalog | null> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as { familyOpcode: Record<string, Record<string, string>>; source: string };
    return { familyOpcode: parsed.familyOpcode, source: parsed.source };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw err;
  }
}

async function runAnalyze(logfile: string, catalogPath: string, toJson: boolean) {
  const t0 = performance.now();
  const heapBefore = process.memoryUsage().heapUsed;
  const outcome = await parseLogFile(logfile);
  const durationMs = performance.now() - t0;
  const heapDeltaMB = (process.memoryUsage().heapUsed - heapBefore) / 1048576;
  const info = await stat(logfile).catch(() => null);

  const catalog = await loadCatalog(catalogPath);

  const { signatures, analysis } = analyze(outcome.events, catalog);

  const result: AnalyzedLog = {
    metadata: outcome.metadata,
    parse: {
      file: logfile.split(/[/\\]/).pop() ?? logfile,
      sizeBytes: info?.size ?? 0,
      lineCount: outcome.events.length + outcome.unknownLines,
      durationMs: Math.round(durationMs),
      peakMemoryMB: Math.max(0, Math.round(heapDeltaMB * 10) / 10),
      unknownLineCount: outcome.unknownLines,
      matchedLineCount: outcome.matchedLines,
    },
    events: outcome.events,
    signatures,
    analysis,
  };

  if (toJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  console.log(`file: ${result.parse.file}`);
  console.log(`bytes: ${result.parse.sizeBytes}  lines: ${result.parse.lineCount}  duration: ${durationMs.toFixed(1)}ms`);
  console.log(`match/unknown: ${result.parse.matchedLineCount}/${result.parse.unknownLineCount}`);
  console.log(`build: ${result.metadata.build.version || "(not detected)"}`);
  console.log(`game: ${result.metadata.game.title || "(not detected)"} ${result.metadata.game.titleId || ""}`);
  console.log("signatures:");
  for (const s of signatures) {
    const id = s.occurrences > 500 ? `${s.id} #...` : s.id;
    console.log(`  ${s.occurrences.toString().padStart(5)}  ${id}`);
  }
  console.log("observations:");
  for (const o of result.analysis.observations) console.log(`  - ${o}`);
  console.log("candidates:");
  for (const c of result.analysis.candidates) console.log(`  - [${c.kind}] ${c.title}`);
}

async function runCatalog(kytyRoot: string, out: string | null) {
  const sources = await loadDecoderSources(kytyRoot);
  const c = buildCatalog(sources);
  const payload = JSON.stringify(
    {
      source: c.source,
      tableCount: c.tables.length,
      collisionCount: c.collisions.length,
      familyOpcode: c.familyOpcode,
      collisions: c.collisions,
    },
    null,
    2,
  );
  if (out) {
    await writeFile(out, payload + "\n", "utf8");
    console.log(`catalog written: ${out} (${c.tables.length} tables, ${c.collisions.length} collisions)`);
  } else {
    process.stdout.write(payload + "\n");
  }
}

function parseArgs(args: string[]) {
  const flags: Record<string, string> = {};
  const positionals: string[] = [];
  const valueFlags = new Set(["catalog", "out"]);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const name = a.slice(2);
      flags[name] = valueFlags.has(name) && args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
    } else {
      positionals.push(a);
    }
  }
  return { flags, positionals };
}

async function main() {
  const { flags, positionals } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (cmd === "analyze") {
    if (positionals.length < 2) usage();
    await runAnalyze(positionals[1], flags.catalog ?? DEFAULT_CATALOG, flags.json === "true");
  } else if (cmd === "catalog") {
    if (positionals.length < 2) usage();
    await runCatalog(positionals[1], flags.out ?? null);
  } else {
    usage();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});