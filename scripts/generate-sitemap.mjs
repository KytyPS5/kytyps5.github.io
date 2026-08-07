#!/usr/bin/env node
/**
 * Build-time sitemap generation — runs during `prebuild`. Reads the static
 * routes plus every compatibility report in src/content/compat/ and writes
 * public/sitemap.xml with one URL per game page.
 *
 * Game URLs use the canonical key: titleId when known, else the report slug.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");
const CONFIG_PATH = path.join(ROOT, "src", "config.ts");
const OUT = path.join(ROOT, "public", "sitemap.xml");

/** Read the SITE_URL export from src/config.ts (TS module, regex-extracted). */
function readSiteUrl() {
  const src = readFileSync(CONFIG_PATH, "utf8");
  const match = src.match(/SITE_URL\s*=\s*"([^"]+)"/);
  if (!match) throw new Error("[sitemap] could not find SITE_URL in src/config.ts");
  return match[1].replace(/\/+$/, "");
}

const SITE_URL = readSiteUrl();

const escapeXml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    data[key] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  }
  return data;
}

// Static routes (priority mirrors the hand-written sitemap).
const STATIC = [
  ["/", "weekly", "1.0"],
  ["/download", "daily", "0.9"],
  ["/compatibility", "weekly", "0.8"],
  ["/docs", "weekly", "0.8"],
  ["/faq", "monthly", "0.7"],
  ["/contributing", "monthly", "0.6"],
  ["/about", "monthly", "0.6"],
];

const gameUrls = [];
const seen = new Set(); // one URL per game — reports share a title ID
for (const file of await readdir(COMPAT_DIR)) {
  if (!file.endsWith(".md")) continue;
  const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
  const data = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, "");
  const key = String(data.titleId || slug);
  if (seen.has(key)) continue;
  seen.add(key);
  gameUrls.push([`/game/${key}`, "weekly", "0.7"]);
}

gameUrls.sort((a, b) => a[0].localeCompare(b[0]));

const urlset = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...[...STATIC, ...gameUrls].map(
    ([loc, freq, priority]) =>
      `  <url><loc>${escapeXml(SITE_URL)}${escapeXml(loc)}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
  ),
  `</urlset>`,
  ``,
].join("\n");

await writeFile(OUT, urlset);
console.log(`[sitemap] wrote ${SITE_URL}/sitemap.xml with ${STATIC.length + gameUrls.length} URLs (${gameUrls.length} game pages).`);
