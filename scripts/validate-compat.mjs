#!/usr/bin/env node
/**
 * Validate every compatibility report in src/content/compat/. Runs during
 * `prebuild` and fails the build on invalid reports — the same schema as the
 * site's runtime parser in src/lib/compat.ts.
 */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src", "content", "compat");

const STATUSES = ["nothing", "boots", "playable", "perfect"];
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

const PUBLIC_DIR = path.join(ROOT, "public");

/**
 * Resolve a report-relative asset path to a file under public/. Returns null
 * when the path would escape public/ (e.g. "../x") — those are rejected. A
 * value already prefixed with "public/" (common copy-paste) or carrying a
 * query/hash is normalized first.
 */
function localAssetPath(rel) {
  const clean = rel
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/^public\//i, "")
    .replace(/[?#].*$/, "");
  const resolved = path.resolve(PUBLIC_DIR, clean);
  return resolved.startsWith(PUBLIC_DIR + path.sep) ? resolved : null;
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

  // Screenshots are hosted in this repo (public/screenshots/) so the carousel
  // can't break when the upstream gallery changes: a relative path must exist,
  // remote URLs are allowed but warn (policy — prefer local hosting).
  if (data.screenshot) {
    const shot = String(data.screenshot);
    if (/^https?:\/\//i.test(shot)) {
      console.warn(
        `[compat] ⚠ ${slug}: screenshot \"${shot}\" is a remote URL — move it to public/screenshots/ and reference \"screenshots/<file>\" so the build can verify it.`,
      );
    } else {
      const file = localAssetPath(shot);
      if (file === null) {
        errors.push(`screenshot path must stay inside public/: \"${shot}\"`);
      } else if (!existsSync(file)) {
        errors.push(`screenshot file not found: \"${shot}\" (expected at public/${shot.replace(/^public\//i, "")})`);
      }
    }
  }

  // Same guarantee for image embeds in the report body (game pages render
  // them). Only local references under screenshots/ are checked — remote
  // embeds warn, other local paths are out of scope.
  for (const m of raw.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const src = m[1].trim();
    if (/^https?:\/\//i.test(src)) {
      console.warn(`[compat] ⚠ ${slug}: body image \"${src}\" is a remote URL — prefer hosting it in public/screenshots/.`);
      continue;
    }
    if (/^data:/i.test(src) || !/^screenshots\//.test(src)) continue;
    const file = localAssetPath(src);
    if (file === null) errors.push(`body image path must stay inside public/: \"${src}\"`);
    else if (!existsSync(file)) errors.push(`body image not found: \"${src}\" (expected at public/${src})`);
  }

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
