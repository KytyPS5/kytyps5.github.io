#!/usr/bin/env node
/**
 * Mirror unconverted game-status issues from the KytyPS5 repo as issues in
 * THIS repo (label `compat`) — one mirror per (game, OS) — so GitHub Actions
 * can react to them here. A maintainer comments `/compat` on a mirror to
 * convert it into its own report PR (see .github/workflows/compat-convert.yml);
 * the poller never converts reports or opens PRs itself. This is what the old
 * fetch-status-issues.mjs + convert-in-PR flow was replaced with: one game per
 * issue, one game per PR, instead of a single standing report PR.
 *
 * A KytyPS5 issue is skipped when it is already handled:
 *   - a mirror issue exists for it (open = pending conversion, closed = was
 *     converted via /compat), or
 *   - a report on main for the same (game, OS) is already as new or newer
 *     than the issue. Reports are per (game, OS) and record ONE source issue
 *     + its date, so converting a newer issue for the same game overwrites
 *     the older one's marker — dates are compared, not issue numbers. The one
 *     exception: a run that finds TWO OR MORE issues for the same (game, OS)
 *     is a fresh batch and mirrors all of them.
 *
 * Scheduled runs create new mirrors and refresh OPEN mirrors whose upstream
 * body changed (so fixing the upstream issue is picked up). Manual runs
 * (--issue-number, workflow_dispatch) also reopen a CLOSED mirror, so a
 * verified / corrected issue can be converted again via /compat.
 *
 * Usage:
 *   GITHUB_TOKEN=… node scripts/sync-status-issues.mjs \
 *     [--repo KytyPS5/KytyPS5] [--this-repo owner/repo] [--issue-number 42]
 *
 * The token needs issues:write on --this-repo (the workflow's GITHUB_TOKEN).
 * The KytyPS5 side is read through the PUBLIC API (no token needed).
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  buildMirrorBody,
  MIRROR_LABEL,
  mirrorSlug,
  mirrorSource,
  mirrorTitle,
  reportSourceNumber,
  reportTestedDate,
  shouldCreateMirror,
} from "./lib/status-issues.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : undefined;
}

const upstreamRepo = arg("repo") || "KytyPS5/KytyPS5";
const thisRepo = arg("this-repo") || process.env.GITHUB_REPOSITORY;
const issueNumber = arg("issue-number");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!thisRepo) {
  console.error("[sync-status-issues] --this-repo is required (or set GITHUB_REPOSITORY)");
  process.exit(1);
}
if (!token) {
  console.error("[sync-status-issues] GITHUB_TOKEN is required to create issues on " + thisRepo);
  process.exit(1);
}

async function api(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

/** One KytyPS5 issue, or every open issue (paginated, [GAME STATUS] titles). */
async function fetchCandidates() {
  if (issueNumber) {
    const issue = await api(`https://api.github.com/repos/${upstreamRepo}/issues/${issueNumber}`);
    return [issue];
  }
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await api(
      `https://api.github.com/repos/${upstreamRepo}/issues?state=open&per_page=100&page=${page}`,
    );
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter((issue) => !issue.pull_request && /^\[GAME STATUS\]/i.test(issue.title ?? ""));
}

/** Reports on this checkout (main): report slug → { sourceNumber, testedDate }. */
async function reportIndex() {
  const reports = new Map();
  for (const file of await readdir(COMPAT_DIR)) {
    if (!file.endsWith(".md")) continue;
    const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
    reports.set(file.slice(0, -3), {
      sourceNumber: reportSourceNumber(raw),
      testedDate: reportTestedDate(raw),
    });
  }
  return reports;
}

/** Existing mirrors in this repo: KytyPS5 issue number → { state, body }. */
async function fetchMirrors() {
  const headers = { authorization: `Bearer ${token}` };
  const mirrors = new Map();
  for (let page = 1; page <= 5; page++) {
    const batch = await api(
      `https://api.github.com/repos/${thisRepo}/issues?state=all&labels=${MIRROR_LABEL}&per_page=100&page=${page}`,
      { headers },
    );
    for (const issue of batch) {
      if (issue.pull_request) continue;
      const src = mirrorSource(issue.body);
      if (src) mirrors.set(src.number, { number: issue.number, state: issue.state, body: issue.body ?? "" });
    }
    if (batch.length < 100) break;
  }
  return mirrors;
}

async function patchIssue(number, fields) {
  await api(`https://api.github.com/repos/${thisRepo}/issues/${number}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(fields),
  });
}

async function createIssue(title, body) {
  await api(`https://api.github.com/repos/${thisRepo}/issues`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ title, body, labels: [MIRROR_LABEL] }),
  });
}

const candidates = await fetchCandidates();
const reports = await reportIndex();
// How many candidates this run map to each report slug — a run that finds two
// or more issues for one (game, OS) mirrors all of them (see shouldCreateMirror).
const slugCounts = new Map();
for (const issue of candidates) {
  const slug = mirrorSlug(issue.body, issue.title);
  if (slug) slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
}
const mirrors = await fetchMirrors();

let created = 0;
let updated = 0;
let skipped = 0;

for (const issue of candidates) {
  const number = issue.number;
  const mirror = mirrors.get(number);
  const createdDate = String(issue.created_at).slice(0, 10);
  const newBody = buildMirrorBody(issue.body, {
    number,
    url: issue.html_url,
    created: createdDate,
  });
  const newTitle = mirrorTitle(issue.body, issue.title);

  if (mirror) {
    if (mirror.state === "closed" && !issueNumber) {
      // Closed = already converted via /compat (or intentionally declined).
      skipped++;
      continue;
    }
    if (mirror.body === newBody && mirror.state === "open") {
      skipped++; // nothing to refresh
      continue;
    }
    // Refresh the snapshot (and reopen a closed mirror on manual runs).
    const patch = mirror.body === newBody ? {} : { body: newBody };
    if (mirror.state === "closed") patch.state = "open";
    await patchIssue(mirror.number, patch);
    updated++;
    console.log(`[sync-status-issues] refreshed mirror for KytyPS5 issue #${number} (${issue.title})`);
    continue;
  }

  if (!issueNumber) {
    // Scheduled run: only mirror when no report for this (game, OS) is
    // already as new or newer. Manual runs always mirror the issue.
    const slug = mirrorSlug(issue.body, issue.title);
    const decision = shouldCreateMirror(
      { number, created: createdDate },
      {
        report: slug ? reports.get(slug) : undefined,
        batchSize: slug ? (slugCounts.get(slug) ?? 1) : 1,
      },
    );
    if (!decision.create) {
      skipped++;
      console.log(
        `[sync-status-issues] skipped KytyPS5 issue #${number} (${newTitle}): ${decision.reason}`,
      );
      continue;
    }
  }

  await createIssue(newTitle, newBody);
  created++;
  console.log(`[sync-status-issues] created mirror issue for KytyPS5 issue #${number} (${newTitle})`);
}

console.log(
  `[sync-status-issues] ${candidates.length} candidate(s): ${created} created, ${updated} updated, ${skipped} skipped`,
);
