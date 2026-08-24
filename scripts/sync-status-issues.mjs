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
 * A refresh rebuilds the upstream snapshot but PRESERVES the `## Overrides`
 * section — manual /setos /setid /settitle corrections (see
 * scripts/set-compat-override.mjs) survive even when the upstream issue
 * changes.
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
  appendOverrides,
  buildMirrorBody,
  buildUpdatedMirrorBody,
  gameKeyFor,
  issueOs,
  issueStatus,
  issueTitleId,
  issueVersion,
  MIRROR_LABEL,
  mirrorSlug,
  mirrorSource,
  mirrorTitle,
  readOverrides,
  refreshMirrorBody,
  reportOs,
  reportSourceNumber,
  reportStatus,
  reportTestedDate,
  reportTitleId,
  reportVersion,
  shouldCreateMirror,
  titleIdKey,
  UPDATED_LABEL,
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

/** One KytyPS5 issue, or recent issues via GraphQL / REST. */
async function fetchCandidates() {
  const [owner, name] = upstreamRepo.split("/");
  if (token) {
    try {
      if (issueNumber) {
        const query = `query {
          repository(owner: "${owner}", name: "${name}") {
            issue(number: ${issueNumber}) {
              number
              title
              state
              createdAt
              lastEditedAt
              updatedAt
              body
              url
            }
          }
        }`;
        const res = await api("https://api.github.com/graphql", {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const issue = res?.data?.repository?.issue;
        if (issue) return [{ ...issue, html_url: issue.url }];
      } else {
        const all = [];
        let cursor = null;
        for (let page = 1; page <= 5; page++) {
          const afterClause = cursor ? `, after: "${cursor}"` : "";
          const query = `query {
            repository(owner: "${owner}", name: "${name}") {
              issues(first: 100, states: [OPEN, CLOSED], orderBy: { field: UPDATED_AT, direction: DESC }${afterClause}) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  number
                  title
                  state
                  createdAt
                  lastEditedAt
                  updatedAt
                  body
                  url
                }
              }
            }
          }`;
          const res = await api("https://api.github.com/graphql", {
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const issuesData = res?.data?.repository?.issues;
          if (!issuesData?.nodes?.length) break;
          all.push(...issuesData.nodes.map((i) => ({ ...i, html_url: i.url })));
          if (!issuesData.pageInfo.hasNextPage) break;
          cursor = issuesData.pageInfo.endCursor;
        }
        return all.filter(
          (issue) =>
            /\[GAME (?:STATUS|BUG)\]/i.test(issue.title ?? "") ||
            (issue.body && issue.body.includes("### Compatibility status")),
        );
      }
    } catch (err) {
      console.warn(`[sync-status-issues] GraphQL query failed (${err.message}), falling back to REST API`);
    }
  }

  const headers = token ? { authorization: `Bearer ${token}` } : {};
  if (issueNumber) {
    const issue = await api(`https://api.github.com/repos/${upstreamRepo}/issues/${issueNumber}`, { headers });
    return [issue];
  }
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await api(
      `https://api.github.com/repos/${upstreamRepo}/issues?state=all&sort=updated&direction=desc&per_page=100&page=${page}`,
      { headers },
    );
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter(
    (issue) =>
      !issue.pull_request &&
      (/\[GAME (?:STATUS|BUG)\]/i.test(issue.title ?? "") ||
        (issue.body && issue.body.includes("### Compatibility status"))),
  );
}

/** Reports on this checkout (main): report slug → { titleId, os, status, version, sourceNumber, testedDate }. */
async function reportIndex() {
  const reports = new Map();
  for (const file of await readdir(COMPAT_DIR)) {
    if (!file.endsWith(".md")) continue;
    const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
    reports.set(file.slice(0, -3), {
      titleId: reportTitleId(raw),
      os: reportOs(raw),
      status: reportStatus(raw),
      version: reportVersion(raw),
      sourceNumber: reportSourceNumber(raw),
      testedDate: reportTestedDate(raw),
    });
  }
  return reports;
}

/** Existing mirrors in this repo: KytyPS5 issue number → { number, state, body }. */
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

async function createIssue(title, body, labels = [MIRROR_LABEL]) {
  await api(`https://api.github.com/repos/${thisRepo}/issues`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ title, body, labels }),
  });
}

const candidates = await fetchCandidates();
const games = JSON.parse(await readFile(path.join(ROOT, "src", "data", "games.json"), "utf8"));
const reports = await reportIndex();

// Reports keyed by (game, OS)
const byGameOs = new Map();
for (const report of reports.values()) {
  if (!report.titleId || !report.os) continue;
  const gameKey = gameKeyFor(report.titleId, games);
  byGameOs.set(`${gameKey}|${report.os}`, report);
  byGameOs.set(`${report.titleId}|${report.os}`, report);
}

const candidateKey = (issue) => {
  const body = issue.body ?? "";
  const titleId = issueTitleId(body);
  const os = issueOs(body);
  if (titleId && os) return `${gameKeyFor(titleId, games)}|${os}`;
  const slug = mirrorSlug(body, issue.title);
  return slug ? `slug:${slug}` : undefined;
};

const batchCounts = new Map();
for (const issue of candidates) {
  const key = candidateKey(issue);
  if (key) batchCounts.set(key, (batchCounts.get(key) ?? 0) + 1);
}
const mirrors = await fetchMirrors();

let created = 0;
let updated = 0;
let skipped = 0;

for (const issue of candidates) {
  const number = issue.number;
  const mirror = mirrors.get(number);
  const createdDate = String(issue.createdAt || issue.created_at || "").slice(0, 10);
  const lastEditDate = issue.lastEditedAt ? String(issue.lastEditedAt).slice(0, 10) : undefined;
  const effectiveDate = lastEditDate || createdDate;
  const isEdited = issue.lastEditedAt !== null && issue.lastEditedAt !== undefined;

  const key = candidateKey(issue);
  const report = key
    ? key.startsWith("slug:")
      ? reports.get(key.slice(5))
      : (byGameOs.get(key) ?? undefined)
    : undefined;

  const candStatus = issueStatus(issue.body);
  const candVersion = issueVersion(issue.body);
  const statusChanged = candStatus && report?.status && candStatus !== report.status;
  const versionChanged = candVersion && report?.version && candVersion !== report.version;
  const isNewerEdit = Boolean(
    isEdited && lastEditDate && (!report?.testedDate || lastEditDate > report.testedDate),
  );
  const isUpdate = isNewerEdit && (statusChanged || versionChanged);

  const baseBody = isUpdate
    ? buildUpdatedMirrorBody(
        issue.body,
        {
          oldStatus: report?.status,
          newStatus: candStatus,
          oldVersion: report?.version,
          newVersion: candVersion,
        },
        { number, url: issue.html_url, created: effectiveDate },
      )
    : refreshMirrorBody(issue.body, mirror?.body, {
        number,
        url: issue.html_url,
        created: effectiveDate,
      });

  const newBody = isUpdate && mirror?.body
    ? appendOverrides(baseBody, readOverrides(mirror.body))
    : baseBody;
  const newTitle = mirrorTitle(issue.body, issue.title);

  if (mirror) {
    if (mirror.state === "closed" && !issueNumber && !isUpdate) {
      // Closed = already converted via /compat (and no status/version edit detected).
      skipped++;
      continue;
    }
    if (mirror.body === newBody && mirror.state === "open" && !isUpdate) {
      skipped++; // nothing to refresh
      continue;
    }
    // Refresh the snapshot (and reopen closed mirror if updated or manual run).
    const patch = mirror.body === newBody ? {} : { body: newBody };
    if (mirror.state === "closed") patch.state = "open";
    if (isUpdate) patch.labels = [MIRROR_LABEL, UPDATED_LABEL];
    await patchIssue(mirror.number, patch);
    updated++;
    console.log(
      `[sync-status-issues] refreshed mirror for KytyPS5 issue #${number} (${issue.title})${isUpdate ? " [updated-existing]" : ""}`,
    );
    continue;
  }

  if (!issueNumber) {
    const decision = shouldCreateMirror(
      {
        number,
        created: effectiveDate,
        isEdited,
        editDate: lastEditDate,
        statusChanged,
        versionChanged,
      },
      {
        report,
        batchSize: key ? (batchCounts.get(key) ?? 1) : 1,
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

  const labels = isUpdate ? [MIRROR_LABEL, UPDATED_LABEL] : [MIRROR_LABEL];
  await createIssue(newTitle, newBody, labels);
  created++;
  console.log(
    `[sync-status-issues] created mirror issue for KytyPS5 issue #${number} (${newTitle})${isUpdate ? " [updated-existing]" : ""}`,
  );
}

console.log(
  `[sync-status-issues] ${candidates.length} candidate(s): ${created} created, ${updated} updated, ${skipped} skipped`,
);
