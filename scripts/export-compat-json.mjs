#!/usr/bin/env node
/**
 * Export the compatibility database for the KytyPS5 GUI launcher.
 *
 * The launcher (src/launcher/src/compatibilityDatabase.cpp) downloads a JSON
 * file and parses it as { "<TITLE_ID>": { "status": "...", "comment": "..." } }.
 * Statuses are the GUI's enum strings: InGame | MainMenu | Logo | DoesntBoot |
 * Unknown. Statuses come from the compatibility reports in src/content/compat/,
 * aggregated per game by majority vote. The per-OS policy adds a `platforms`
 * block (windows | linux | macos) with OS-specific statuses, report counts and
 * tested builds; the launcher ignores fields it doesn't know, so this is
 * backward compatible.
 *
 * Run during `prebuild`; the output is public/data/compatibility.json, served
 * statically (no API calls, no rate limits — the GUI fetches it on every
 * launch). The maintainer wires the GUI's URL to the published site.
 *
 * Usage: node scripts/export-compat-json.mjs [--pretty]
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildCompatibilityDb, parseFrontmatter, STATUSES } from "./lib/compat-export.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");
const OUT = path.join(ROOT, "public", "data", "compatibility.json");
const PRETTY = process.argv.includes("--pretty");

const reports = [];
for (const file of await readdir(COMPAT_DIR)) {
  if (!file.endsWith(".md")) continue;
  const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
  const data = parseFrontmatter(raw);
  if (!data.titleId) {
    console.warn(`[compat-export] skipping ${file} — missing titleId`);
    continue;
  }
  reports.push({
    titleId: data.titleId,
    status: data.status,
    testedVersion: data.testedVersion,
    testedDate: data.testedDate,
    os: data.os,
  });
  if (!STATUSES.includes(data.status)) {
    console.warn(`[compat-export] ${file}: unknown status "${data.status}" → maps to Unknown in the GUI`);
  }
}

const db = buildCompatibilityDb(reports);
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(db, null, PRETTY ? 2 : 0) + "\n");
console.log(
  `[compat-export] wrote ${path.relative(ROOT, OUT)} with ${Object.keys(db).length} games ` +
    `(${reports.length} reports).`,
);
