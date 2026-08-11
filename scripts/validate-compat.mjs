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

const STATUSES = ["doesnt-boot", "logo", "main-menu", "in-game"];
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
    else if (/^\[.*\]$/.test(value)) {
      // Flow-style array frontmatter (screenshots: ["url", …]).
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
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

  // Screenshots are evidence attached to a community-verified report, never a
  // status by themselves. The 6 "inferred from the upstream screenshot gallery"
  // reports were removed because they invented statuses; this guard makes that
  // impossible going forward: a screenshot requires screenshotVerified: true
  // (a maintainer attached it to an existing report) AND a linked community
  // source. Plain-text sources like "repository screenshots" are rejected —
  // they were the old inferred-report pattern.
  if (data.screenshot) {
    if (data.screenshotVerified !== true) {
      errors.push(
        '`screenshot` requires `screenshotVerified: true` — screenshots never imply a status; only attach them to a verified community report',
      );
    }
    const sourceLink = raw.match(/^> Source: \[[^\]]+\]\(https?:\/\/[^)]+\)/m);
    if (!sourceLink) {
      errors.push(
        '`screenshot` requires a linked community source (`> Source: [label](https://…)`) — a plain-text source like "repository screenshots" is not allowed',
      );
    }

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

  // `screenshots` (array) — image URLs copied from the source issue at
  // conversion time and hotlinked on the game page (nothing is downloaded
  // into the repo). Same spirit as `screenshot`: they are the report's own
  // evidence, never a status by themselves, so each must be an http(s) URL
  // and the report must link its community source.
  if (data.screenshots) {
    if (!Array.isArray(data.screenshots) || data.screenshots.length === 0) {
      errors.push("`screenshots` must be a non-empty array of http(s) URLs (e.g. [\"https://…\"]) — add it as `screenshots: [\"url1\", …]`");
    } else {
      for (const shot of data.screenshots) {
        if (typeof shot !== "string" || !/^https?:\/\//i.test(shot)) {
          errors.push(`screenshots entries must be http(s) URLs — got \"${String(shot)}\"`);
        }
      }
    }
    const sourceLink = raw.match(/^> Source: \[[^\]]+\]\(https?:\/\/[^)]+\)/m);
    if (!sourceLink) {
      errors.push(
        '`screenshots` require a linked community source (`> Source: [label](https://…)`) — they belong to the issue they were taken from',
      );
    }
  }

  // Same guarantee for image embeds in the report body (game pages render
  // them). Only local references under screenshots/ are checked — remote
  // embeds are fine (the screenshots array is the hotlink policy; body embeds
  // are left alone), other local paths are out of scope.
  for (const m of raw.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const src = m[1].trim();
    if (/^https?:\/\//i.test(src)) continue; // hotlinked embeds are allowed
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
