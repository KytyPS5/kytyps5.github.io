#!/usr/bin/env node
/**
 * Convert a structured "Compatibility report" issue into a Markdown report
 * under src/content/compat/. Invoked by .github/workflows/compat-report.yml.
 *
 * Usage:
 *   node scripts/issue-to-compat.mjs --title "Disgaea 6" --status ingame \
 *     --version "main" --date 2026-08-10 --os windows --hardware "Ryzen 9 / RTX 5090" \
 *     --body "notes…" --source "#123" --source-url "https://github.com/org/repo/issues/123" \
 *     [--game-version "1.004"] [--slug disgaea-6] [--title-id PPSA01234]
 *
 * Writes (or overwrites) src/content/compat/<slug>.md with the report.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src", "content", "compat");

const STATUSES = ["nothing", "boots", "menus", "ingame", "playable-low-fps", "playable"];
const OSES = ["windows", "linux", "macos"];
const TITLE_ID_REGEX = /^PPSA-?\d{5}$/i;

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : undefined;
}

const title = arg("title");
const status = arg("status");
const version = arg("version");
const date = arg("date");
const os = arg("os");
const hardware = arg("hardware");
const body = arg("body") || "See the original issue for details.";
const source = arg("source");
const sourceUrl = arg("source-url");
const gameVersion = arg("game-version");
const titleId = arg("title-id");
// One report per (game, OS): the default slug appends the OS so a Windows and
// a Linux report for the same game live in separate files, and re-running a
// conversion for the same game + OS overwrites that OS's status in place.
const slug =
  arg("slug") ||
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + (os ? `-${os}` : "");

const errors = [];
if (!title) errors.push("--title is required");
if (!titleId) errors.push("--title-id is required");
else if (!TITLE_ID_REGEX.test(titleId)) errors.push(`--title-id must look like PPSA-XXXXX`);
if (!STATUSES.includes(status)) errors.push(`--status must be one of ${STATUSES.join(" | ")}`);
if (!version) errors.push("--version is required");
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("--date must be YYYY-MM-DD");
if (!os) errors.push("--os is required (one report per operating system)");
else if (!OSES.includes(os)) errors.push(`--os must be ${OSES.join(" | ")}`);
if (errors.length) {
  console.error("[issue-to-compat] " + errors.join("; "));
  process.exit(1);
}

const frontmatter = [
  "---",
  `title: "${title}"`,
  `titleId: "${titleId}"`,
  `status: "${status}"`,
  `testedVersion: "${version}"`,
  `testedDate: "${date}"`,
  `os: "${os}"`,
  hardware ? `hardware: "${hardware}"` : null,
  gameVersion ? `gameVersion: "${gameVersion}"` : null,
  "---",
  "",
  body,
  "",
  source && sourceUrl
    ? `> Source: [GitHub compatibility report ${source}](${sourceUrl})`
    : source
      ? `> Source: GitHub compatibility report ${source}`
      : "",
].filter((line) => line !== null);

await mkdir(DIR, { recursive: true });
const out = path.join(DIR, `${slug}.md`);
await writeFile(out, frontmatter.join("\n") + "\n");
console.log(`[issue-to-compat] wrote ${path.relative(ROOT, out)}`);
