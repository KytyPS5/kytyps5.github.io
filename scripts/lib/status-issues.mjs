/**
 * Pure helpers for the KytyPS5 → site mirror-issue pipeline
 * (scripts/sync-status-issues.mjs + .github/workflows/compat-convert.yml).
 *
 * The poller mirrors every unconverted "[GAME STATUS]" issue from the KytyPS5
 * repo as an issue in THIS repo (label `compat`) — one per (game, OS) — so
 * GitHub Actions can react to it here: a maintainer comments `/compat` on a
 * mirror to convert it into its own report PR (see compat-convert.yml). That
 * keeps every game's PR separate instead of one standing report PR that grows
 * a game at a time.
 *
 * The mirror issue body is the upstream issue's raw body plus a `## Source`
 * footer recording the upstream issue number / URL / creation date. The footer
 * sits after a `## ` group heading, so the template parser in
 * scripts/lib/issue-form.mjs ignores it, while mirrorSource() (used by the
 * /compat workflow) reads it back. Everything here is pure — no I/O — so it
 * is unit-testable.
 *
 * Dedup: a report on the site is per (game, OS) and records ONE source issue
 * + its date, so two upstream issues for the same game would clobber each
 * other's marker when converted. shouldCreateMirror() therefore compares
 * DATES instead of issue numbers — an upstream issue is only mirrored when no
 * report for its (game, OS) is already as new or newer — with one exception:
 * a run that finds two or more issues for the same (game, OS) is a fresh
 * batch and mirrors all of them.
 */

import { cleanField, normalizeOs, parseIssueBody } from "./issue-form.mjs";

/** Label every mirror issue carries (closed = already converted via /compat). */
export const MIRROR_LABEL = "compat";

/** Cap for the mirrored body — GitHub issue bodies allow ~64k chars. */
const BODY_CAP = 60_000;

/**
 * Title for a mirror issue: `[GAME STATUS] <Game title> (<os>)`. The OS suffix
 * keeps a Windows and a Linux mirror of the same game distinct in the list.
 * Falls back to the upstream issue's own title when the body has no parsable
 * "Game title" / "OS" fields (the mirror is still created; the /compat
 * conversion will fail loudly with the real reason).
 */
export function mirrorTitle(upstreamBody, fallbackTitle) {
  const sections = parseIssueBody(upstreamBody);
  const title = cleanField(sections, "Game title") || fallbackTitle || "Unknown game";
  // The upstream issue title already starts with the [GAME STATUS] prefix;
  // don't double it when the body has no parsable "Game title" field.
  const prefix = /^\[GAME STATUS\]/i.test(title) ? "" : "[GAME STATUS] ";
  const os = normalizeOs(cleanField(sections, "OS"));
  return os ? `${prefix}${title} (${os})` : `${prefix}${title}`;
}

/**
 * Body for a mirror issue = the upstream issue's raw body (capped) + a
 * `## Source` footer. The footer is the only machine-readable record of where
 * the report came from; /compat reads it via mirrorSource(). Kept after a `## `
 * group heading so parseIssueBody() never mistakes it for a form answer.
 */
export function buildMirrorBody(upstreamBody, { number, url, created }) {
  const body = String(upstreamBody ?? "").trim();
  const capped = body.length > BODY_CAP ? `${body.slice(0, BODY_CAP)}\n\n…(body truncated)` : body;
  return [
    capped,
    "## Source",
    `Mirrors [KytyPS5 issue #${number}](${url}) — created ${created}.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Read the upstream source back out of a mirror issue body.
 * Returns { number, url, created } or null when the body is not a compat
 * mirror (no `## Source` footer). Only the text after the LAST `## Source`
 * group heading is scanned, so a "KytyPS5 issue #N" mention typed inside the
 * upstream answers is never mistaken for the provenance.
 */
export function mirrorSource(body) {
  const lines = String(body ?? "").split(/\r?\n/);
  let tail = "";
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Source\s*$/.test(lines[i].trim())) tail = lines.slice(i + 1).join("\n");
  }
  if (!tail.trim()) return null;

  const number = tail.match(/KytyPS5 issue #(\d+)/)?.[1];
  const url = tail.match(/https:\/\/github\.com\/KytyPS5\/KytyPS5\/issues\/\d+/)?.[0];
  const created = tail.match(/created (\d{4}-\d{2}-\d{2})/)?.[1];
  if (!number || !url || !created) return null;
  return { number: Number(number), url, created };
}

/**
 * Report slug for an upstream issue: `<game-title>-<os>`, the exact filename
 * (minus `.md`) the /compat conversion writes under src/content/compat/.
 * Uses the same normalized title + OS as issue-to-compat.mjs, so a candidate
 * can be matched against the report that already exists for its (game, OS).
 * A leading `[GAME STATUS]` prefix is stripped (report slugs never carry it);
 * returns undefined when nothing usable can be derived.
 */
export function mirrorSlug(upstreamBody, fallbackTitle) {
  const sections = parseIssueBody(upstreamBody);
  const title = String(cleanField(sections, "Game title") || fallbackTitle || "")
    .replace(/^\[GAME STATUS\][:\s-]*/i, "")
    .trim();
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!base) return undefined;
  const os = normalizeOs(cleanField(sections, "OS"));
  return os ? `${base}-${os}` : base;
}

/** The `testedDate` frontmatter of a report (the source issue's creation date). */
export function reportTestedDate(md) {
  const m = String(md ?? "").match(/^testedDate:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m);
  return m ? m[1] : undefined;
}

/** The `> Source:` footer's KytyPS5 issue number, if the report is a conversion. */
export function reportSourceNumber(md) {
  const m = String(md ?? "").match(/Source:.*?issues\/(\d+)/);
  return m ? Number(m[1]) : undefined;
}

/**
 * Scheduled-run gate: should an upstream issue get a mirror?
 *
 * A report is per (game, OS) and records ONE source issue + its date, so two
 * upstream issues for the same game clobber each other's marker when
 * converted. Instead of tracking per issue number, compare dates: skip when a
 * report for the same (game, OS) is already as new or newer than the
 * candidate. Exception: when TWO OR MORE candidates for the same (game, OS)
 * arrive in the same run they're a fresh batch — all of them are mirrored.
 * Manual runs never call this (workflow_dispatch always mirrors the issue).
 *
 * `candidate` is { number, created } with created = YYYY-MM-DD; `report` is
 * the existing report for the candidate's slug ({ sourceNumber, testedDate })
 * or undefined; `batchSize` is how many candidates this run found for that
 * slug. Returns { create, reason? }.
 */
export function shouldCreateMirror(candidate, { report, batchSize }) {
  if (report) {
    if (report.sourceNumber === candidate.number) {
      return { create: false, reason: "already converted" };
    }
    if (batchSize > 1) {
      return { create: true, reason: "same-run batch" };
    }
    if (report.testedDate && !(candidate.created > report.testedDate)) {
      return {
        create: false,
        reason: `existing ${report.testedDate} report is as new or newer`,
      };
    }
  }
  return { create: true };
}
