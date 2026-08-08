#!/usr/bin/env node
/**
 * Export the compatibility data for the WEBSITE (not the GUI launcher — that's
 * export-compat-json.mjs). Runs during `prebuild` and on deploy.yml's
 * content-only path.
 *
 * Two artifacts replace the old raw-markdown compat.json, so the client never
 * parses report markdown and list views never download report notes:
 *
 *   1. public/data/compat-index.json  — ONE slim payload with every TESTED
 *      game: key, title, titleId, cover, precomputed overall + per-OS status,
 *      report counts, latest test date and carousel screenshots. Home and the
 *      compatibility page fetch this. Untested titles are excluded (the index
 *      page hides them anyway), so the payload only grows with tested games.
 *
 *   2. public/data/compat/<KEY>.json  — one small file per game with its FULL
 *      reports (notes body, hardware, score, source, …), keyed by the
 *      canonical title-ID route key. Only the game page fetches it.
 *
 * The same slim index is also written to src/data/compat-index.json — the
 * committed build-time seed (like src/data/games.json) that renders the first
 * paint and covers dev / offline, refreshed at runtime by the deployed JSON.
 *
 * Parsing uses the JS twin of the site parser (parseReport in
 * ./lib/compat-export.mjs); src/lib/compat.test.ts keeps it in sync with the
 * TS parser via a fixture comparison test.
 *
 * Usage: node scripts/export-site-compat-json.mjs [--pretty]
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildSiteIndex, parseReport } from "./lib/compat-export.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");
const GAMES_FILE = path.join(ROOT, "src", "data", "games.json");
const PUBLIC_DATA = path.join(ROOT, "public", "data");
const DETAIL_DIR = path.join(PUBLIC_DATA, "compat");
const SEED_FILE = path.join(ROOT, "src", "data", "compat-index.json");
const PRETTY = process.argv.includes("--pretty");

const reports = [];
for (const file of await readdir(COMPAT_DIR)) {
  if (!file.endsWith(".md")) continue;
  reports.push(parseReport(await readFile(path.join(COMPAT_DIR, file), "utf8"), file.replace(/\.md$/, "")));
}

const games = JSON.parse(await readFile(GAMES_FILE, "utf8"));
const index = buildSiteIndex(games, reports);

// Slim index (tested games only; the `reports` field stays out of the payload).
const slim = index.map(({ reports: _reports, ...rest }) => rest);
const payload = { version: 2, games: slim };
const json = JSON.stringify(payload, null, PRETTY ? 2 : 0) + "\n";

await mkdir(DETAIL_DIR, { recursive: true });
await writeFile(path.join(PUBLIC_DATA, "compat-index.json"), json);
await writeFile(SEED_FILE, JSON.stringify(slim, null, 2) + "\n");

// One detail file per tested game, keyed by the canonical route key.
for (const entry of index) {
  const detail = { version: 2, key: entry.key, title: entry.title, titleId: entry.titleId, reports: entry.reports };
  await writeFile(path.join(DETAIL_DIR, `${entry.key}.json`), JSON.stringify(detail, null, PRETTY ? 2 : 0) + "\n");
}

console.log(
  `[compat-site] wrote public/data/compat-index.json + ${index.length} detail file(s) in public/data/compat/ ` +
    `(seed → src/data/compat-index.json) from ${reports.length} report(s).`,
);
