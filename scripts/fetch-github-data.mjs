#!/usr/bin/env node
/**
 * Build-time GitHub data snapshot — zero runtime API calls for visitors.
 * Runs before `vite build` via the `prebuild` script.
 *
 *   GITHUB_TOKEN=$(gh auth token) npm run build   # avoid anonymous rate limits
 *
 * Writes public/data/github.json. The site renders this instantly (no API
 * calls, no rate limit), then re-fetches live in the browser for freshness —
 * the "build renders + browser re-fetches" model.
 *
 * Failures are non-fatal (warn + keep/emit an empty snapshot) so an offline
 * or rate-limited build still succeeds; the live client fetch covers gaps.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "data", "github.json");
const REPO = "KytyPS5/KytyPS5";
const API = `https://api.github.com/repos/${REPO}`;
const TOKEN = process.env.GITHUB_TOKEN;

const headers = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };
if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;

async function get(url, fallback) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`  ! ${url.split("/").slice(-2).join("/")} → HTTP ${res.status}`);
      return fallback;
    }
    return await res.json();
  } catch (error) {
    console.warn(`  ! ${url.split("/").slice(-2).join("/")} → ${error.message}`);
    return fallback;
  }
}

const repo = await get(API, null);
if (repo) {
  // Per-request/token-volatile fields must never ship in the snapshot: the
  // refresh workflow compares the deployed github.json against a freshly
  // regenerated one, and temp_clone_token rotates on every authenticated call
  // (permissions is token-shaped too). Keeping them would make the JSON never
  // match, so the site would rebuild every 30 minutes for nothing.
  delete repo.temp_clone_token;
  delete repo.permissions;
}

const latestRelease = await get(`${API}/releases/latest`, null);
if (latestRelease && Array.isArray(latestRelease.assets)) {
  // Asset download counts bump on every download — meaningless churn for the
  // staleness comparison (the site shows the live count from the API).
  for (const asset of latestRelease.assets) delete asset.download_count;
}

async function getContributorCount() {
  try {
    const res = await fetch(`${API}/contributors?per_page=1&anon=true`, { headers });
    if (!res.ok) return null;
    const link = res.headers.get("link") || "";
    const match = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
    if (match) return Number(match[1]);
    const data = await res.json();
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

const SNAPSHOT = {
  generatedAt: new Date().toISOString(),
  repo,
  // Reuse the fetch above (already stripped of download counts) rather than
  // re-fetching — same shape, one fewer API call per run.
  latestRelease,
  contributors: await get(`${API}/contributors?per_page=14`, null),
  contributorsCount: await getContributorCount(),
  commits: await get(`${API}/commits?per_page=6`, null),
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(SNAPSHOT, null, 2));
console.log(`[github] snapshot written → ${path.relative(ROOT, OUT)}`);
console.log(`[github] ${TOKEN ? "using GITHUB_TOKEN" : "anonymous (60 req/hr — set GITHUB_TOKEN to raise the limit)"}`);
