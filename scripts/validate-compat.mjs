#!/usr/bin/env node
/**
 * Validate every compatibility report in src/content/compat/. Runs during
 * `prebuild` and fails the build on invalid reports — the same contract as
 *  ("the build fails on reports whose … schema is invalid").
 *
 * Mirrors the schema in src/lib/compat.ts.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src", "content", "compat");

const STATUSES = ["nothing", "boots", "menus", "ingame", "playable-low-fps", "playable"];
const OSES = ["windows", "linux", "macos"];
const TITLE_ID_REGEX = /^PPSA-?\d{5}$/i;

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^\d+$/.test(String(value))) value = Number(value);
    data[key] = value;
  }
  return { data, body: match[2].trim() };
}

let failed = false;

for (const file of await readdir(DIR)) {
  if (!file.endsWith(".md")) continue;
  const raw = await readFile(path.join(DIR, file), "utf8");
  const { data } = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, "");
  const errors = [];

  if (!data.title || !String(data.title).trim()) errors.push("missing `title`");
  if (!data.titleId) errors.push("missing required `titleId`");
  else if (!TITLE_ID_REGEX.test(String(data.titleId)))
    errors.push("`titleId` must look like PPSA-XXXXX");
  if (!STATUSES.includes(data.status)) errors.push(`status must be one of ${STATUSES.join(" | ")}`);
  if (!data.testedVersion) errors.push("missing `testedVersion`");
  if (!data.testedDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.testedDate))
    errors.push("`testedDate` required as YYYY-MM-DD");
  if (!data.os) errors.push("missing required `os` (windows | linux | macos)");
  else if (!OSES.includes(data.os)) errors.push(`os must be ${OSES.join(" | ")}`);

  if (errors.length) {
    failed = true;
    console.error(`[compat] ✗ ${slug}: ${errors.join("; ")}`);
  } else {
    console.log(`[compat] ✓ ${slug}`);
  }
}

if (failed) {
  console.error("[compat] invalid reports — fix src/content/compat/*.md before building.");
  process.exit(1);
}
console.log("[compat] all reports valid.");
