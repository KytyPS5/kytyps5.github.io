#!/usr/bin/env node
/**
 * Fetch open game-status issues from the KytyPS5 repo (the Game Emulation
 * Status Report template, .github/ISSUE_TEMPLATE/kytyps5-game-emulation.yaml)
 * that don't have a site report yet. Used by .github/workflows/compat-report.yml.
 *
 * Issues live on the KytyPS5 repo; this workflow polls them via the PUBLIC
 * API (no token — the Actions GITHUB_TOKEN can't read other repos, and public
 * reads don't need one). "Already converted" is tracked by each report's own
 * `> Source: …issues/<N>` line, so no mirror issues or extra state are needed.
 *
 * Usage:
 *   node scripts/fetch-status-issues.mjs \
 *     --repo KytyPS5/KytyPS5 --output /tmp/status-issues.json
 *   node scripts/fetch-status-issues.mjs \
 *     --repo KytyPS5/KytyPS5 --output /tmp/status-issues.json \
 *     --issue-number 42 [--force]
 *
 * Poll mode writes every open "[GAME STATUS]" issue whose source issue number
 * isn't already linked from src/content/compat/*.md. Single-issue mode
 * (--issue-number) always includes the issue — re-running a conversion after
 * verification intentionally overwrites that game's report.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : undefined;
}

const repo = arg("repo") || "KytyPS5/KytyPS5";
const output = arg("output");
const issueNumber = arg("issue-number");
const force = arg("force") === "true";

/** Fetch one issue, or every open issue (paginated). */
async function fetchIssues() {
  const base = `https://api.github.com/repos/${repo}/issues`;
  if (issueNumber) {
    const res = await fetch(`${base}/${issueNumber}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching issue #${issueNumber}`);
    return [await res.json()];
  }
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${base}?state=open&per_page=100&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching issues (page ${page})`);
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

/** Source issue numbers already linked from stored reports. */
async function convertedIssueNumbers() {
  const nums = new Set();
  for (const file of await readdir(COMPAT_DIR)) {
    if (!file.endsWith(".md")) continue;
    const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
    for (const m of raw.matchAll(/Source:.*?issues\/(\d+)/g)) nums.add(Number(m[1]));
  }
  return nums;
}

const issues = await fetchIssues();
const converted = await convertedIssueNumbers();

const candidates = issues.filter((issue) => {
  if (issue.pull_request) return false; // the issues endpoint also returns PRs
  if (issueNumber) return true; // explicit number — convert/overwrite on demand
  if (!/^\[GAME STATUS\]/i.test(issue.title ?? "")) return false;
  if (!force && converted.has(issue.number)) return false; // already a report
  return true;
});

const slim = candidates.map((issue) => ({
  number: issue.number,
  title: issue.title,
  created_at: issue.created_at,
  html_url: issue.html_url,
  body: issue.body,
}));

const out = output ?? path.join(ROOT, ".freebuff", "status-issues.json");
await writeFile(out, JSON.stringify(slim, null, 2) + "\n");
console.log(
  `[fetch-status-issues] ${slim.length} unconverted game-status issue(s) → ${path.relative(ROOT, out)}`,
);
