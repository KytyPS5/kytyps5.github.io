#!/usr/bin/env node
/**
 * Export the compatibility reports for the WEBSITE (not the GUI launcher).
 *
 * The site renders the build-time bundle immediately (COMPAT_REPORTS) and then
 * refreshes from this file at runtime — so a report merged through deploy.yml's
 * content-only path goes live without a full rebuild. The JSON carries the raw
 * markdown per report; the client parses it with the SAME parser used at build
 * time (parseCompatReport in src/lib/compat.ts), so there is a single source of
 * truth for the schema.
 *
 * Run during `prebuild` (full builds) and by deploy.yml's content-only path.
 *
 * Usage: node scripts/export-site-compat-json.mjs [--pretty]
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");
const OUT = path.join(ROOT, "public", "data", "compat.json");
const PRETTY = process.argv.includes("--pretty");

const reports = [];
for (const file of await readdir(COMPAT_DIR)) {
  if (!file.endsWith(".md")) continue;
  const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
  reports.push({ slug: file.replace(/\.md$/, ""), raw });
}
reports.sort((a, b) => a.slug.localeCompare(b.slug));

const payload = { version: 1, reports };
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(payload, null, PRETTY ? 2 : 0) + "\n");
console.log(
  `[compat-site] wrote ${path.relative(ROOT, OUT)} with ${reports.length} report(s) — fetched by the site at runtime.`,
);
