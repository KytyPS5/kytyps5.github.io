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
 *
 * The (game, OS) match is keyed by TITLE ID, not the title+OS slug: two
 * issues that spell a title differently ("Demon Souls" vs "Demon's Souls")
 * or use a region-variant serial (PPSA03528 vs PPSA03527) must still dedup
 * against the same report. issueTitleId() / gameKeyFor() provide the keys;
 * the slug is only a fallback when an issue carries no parsable serial.
 *
 * Manual field corrections: a maintainer can comment /setos, /setid or
 * /settitle on a mirror issue (scripts/set-compat-override.mjs) to record a
 * human override when the upstream issue can't express a field correctly
 * (e.g. an OS that doesn't normalize). The command appends a `## Overrides`
 * section after the `## Source` footer:
 *
 *   ## Overrides
 *   - os: windows
 *   - titleId: PPSA01234
 *   - title: Astro Bot
 *
 * readOverrides()/appendOverrides() manage that section; the /compat
 * conversion (issue-to-compat.mjs) reads it and the overrides win over the
 * values parsed from the issue body. Poller refreshes preserve the section
 * (see sync-status-issues.mjs), and mirrorSource() stops at it so override
 * values can never be mistaken for provenance.
 */

import { cleanField, normalizeOs, parseIssueBody } from "./issue-form.mjs";

/** Label every mirror issue carries (closed = already converted via /compat). */
export const MIRROR_LABEL = "compat";

/** Label added when an upstream issue was edited with status/version changes. */
export const UPDATED_LABEL = "updated-existing";

/** Cap for the mirrored body — GitHub issue bodies allow ~64k chars. */
const BODY_CAP = 60_000;

/**
 * Title for a mirror issue: `[GAME STATUS] <Game title> (<os>)`. The OS suffix
 * keeps a Windows and a Linux mirror of the same game distinct in the list.
 * Falls back to the upstream issue's own title when the body has no parsable
 * "Game title" / "OS" fields (the mirror is still created; the /compat
 * conversion will fail loudly with the real reason).
 *
 * `overrides` ({ os?, title? }) — read from the mirror's `## Overrides`
 * section (see readOverrides) — win over the parsed fields, so a /setos or
 * /settitle command is reflected in the title (e.g. an OS that can't be
 * normalized still gets its `(<os>)` suffix).
 */
export function mirrorTitle(upstreamBody, fallbackTitle, overrides = {}) {
  const sections = parseIssueBody(upstreamBody);
  const title = overrides.title ?? (cleanField(sections, "Game title") || fallbackTitle || "Unknown game");
  // The upstream issue title already starts with the [GAME STATUS] prefix;
  // don't double it when the body has no parsable "Game title" field.
  const prefix = /^\[GAME STATUS\]/i.test(title) ? "" : "[GAME STATUS] ";
  const os = overrides.os ?? normalizeOs(cleanField(sections, "OS"));
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
 * group heading is scanned — and collection stops at the next `## ` heading
 * (the `## Overrides` section appended by /setos /setid /settitle) — so a
 * "KytyPS5 issue #N" mention typed inside the upstream answers or an override
 * value is never mistaken for the provenance.
 */
export function mirrorSource(body) {
  const lines = String(body ?? "").split(/\r?\n/);
  let tail = "";
  let collecting = false;
  for (const line of lines) {
    if (/^##\s+Source\s*$/.test(line.trim())) {
      collecting = true;
      tail = "";
      continue;
    }
    if (collecting && /^##\s+/.test(line)) {
      collecting = false; // e.g. the `## Overrides` section after the footer
      continue;
    }
    if (collecting) tail += line + "\n";
  }
  if (!tail.trim()) return null;

  const number = tail.match(/KytyPS5 issue #(\d+)/)?.[1];
  const url = tail.match(/https:\/\/github\.com\/KytyPS5\/KytyPS5\/issues\/\d+/)?.[0];
  const created = tail.match(/created (\d{4}-\d{2}-\d{2})/)?.[1];
  if (!number || !url || !created) return null;
  return { number: Number(number), url, created };
}

/**
 * The upstream issue body inside a mirror: everything before the mirror's own
 * `## Source` footer (the `## Overrides` section appended after it is excluded
 * too). Used to recompute the mirror title after a /setos or /settitle
 * override (see scripts/set-compat-override.mjs).
 */
export function mirrorUpstreamBody(body) {
  const lines = String(body ?? "").split(/\r?\n/);
  let cut = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Source\s*$/.test(lines[i].trim())) cut = i;
  }
  return lines.slice(0, cut).join("\n").trimEnd();
}

/**
 * Read the `## Overrides` section from a mirror issue body — the manual field
 * corrections recorded by the /setos, /setid and /settitle comment commands
 * (scripts/set-compat-override.mjs). Format, appended after the `## Source`
 * footer:
 *
 *   ## Overrides
 *   - os: windows
 *   - titleId: PPSA01234
 *   - title: Astro Bot
 *
 * Returns { os?, titleId?, title? } with only the keys present (values stored
 * exactly as the command recorded them), or {} when the body has no Overrides
 * section. Parsing stops at the next `## ` heading. Bullet entries — not
 * `### ` form headings — so parseIssueBody() never mistakes an override for a
 * template answer.
 */
export function readOverrides(body) {
  const lines = String(body ?? "").split(/\r?\n/);
  let collecting = false;
  const overrides = {};
  for (const line of lines) {
    if (/^##\s+Overrides\s*$/.test(line.trim())) {
      collecting = true;
      continue;
    }
    if (collecting && /^##\s+/.test(line)) break;
    if (!collecting) continue;
    const m = line.match(/^\s*-\s*([A-Za-z]+)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "os") overrides.os = value;
    else if (key === "titleid") overrides.titleId = value;
    else if (key === "title") overrides.title = value;
  }
  return overrides;
}

/**
 * The body a refreshed mirror should have: the rebuilt upstream snapshot plus
 * any `## Overrides` preserved from the existing mirror. `mirrorBody` is
 * optional — a candidate with no mirror yet (undefined) must simply get the
 * plain rebuilt body; callers must never read overrides off an undefined
 * mirror.
 */
export function refreshMirrorBody(issueBody, mirrorBody, { number, url, created }) {
  let body = buildMirrorBody(issueBody, { number, url, created });
  const overrides = readOverrides(mirrorBody);
  if (Object.keys(overrides).length) body = appendOverrides(body, overrides);
  return body;
}

/**
 * Append (or replace) the `## Overrides` section on a mirror body, keeping any
 * other existing overrides. Used by scripts/set-compat-override.mjs to record
 * a /setos /setid /settitle value and by sync-status-issues.mjs to carry the
 * existing overrides across a mirror refresh. Returns the body unchanged when
 * `overrides` is empty.
 */
export function appendOverrides(body, overrides = {}) {
  const raw = String(body ?? "");
  const idx = raw.search(/^##\s+Overrides\s*$/m);
  const base = (idx > -1 ? raw.slice(0, idx) : raw).trimEnd();
  const entries = [];
  if (overrides.os) entries.push(`- os: ${overrides.os}`);
  if (overrides.titleId) entries.push(`- titleId: ${overrides.titleId}`);
  if (overrides.title) entries.push(`- title: ${overrides.title}`);
  if (!entries.length) return base;
  return `${base}\n\n## Overrides\n${entries.join("\n")}\n`;
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

/** The `titleId` frontmatter of a report (normalized bare uppercase). */
export function reportTitleId(md) {
  const m = String(md ?? "").match(/^titleId:\s*"?([^"\n]+)"?/m);
  return m ? titleIdKey(m[1]) : undefined;
}

/** The `os` frontmatter of a report (canonical lowercase OS). */
export function reportOs(md) {
  const m = String(md ?? "").match(/^os:\s*"?([^"\n]+)"?/m);
  return m ? String(m[1]).trim().toLowerCase() : undefined;
}

/** The `> Source:` footer's KytyPS5 issue number, if the report is a conversion. */
export function reportSourceNumber(md) {
  const m = String(md ?? "").match(/Source:.*?issues\/(\d+)/);
  return m ? Number(m[1]) : undefined;
}

/** Normalized bare uppercase title ID — the dedup key for games (PPSA-XXXXX → PPSAXXXXX). */
export function titleIdKey(titleId) {
  return String(titleId ?? "").replace(/-/g, "").toUpperCase();
}

/** The PPSA-XXXXX in an upstream issue body (new "Game ID / serial" or legacy "Title ID"). */
export function issueTitleId(body) {
  const sections = parseIssueBody(body);
  const raw = cleanField(sections, "Game ID / serial") || cleanField(sections, "Title ID");
  const m = String(raw ?? "").match(/PPSA-?\d{5}/i);
  return m ? titleIdKey(m[0]) : undefined;
}

/** The OS an upstream issue was tested on (new "OS" or legacy "Operating system"). */
export function issueOs(body) {
  const sections = parseIssueBody(body);
  return normalizeOs(cleanField(sections, "OS") || cleanField(sections, "Operating system"));
}

/**
 * The canonical game key for a title ID: every region variant of a game
 * (games.json `allTitleIds`) resolves to the game's own title ID, so a
 * PPSA03528 report dedups against a PPSA03527 report of the same game.
 * Returns the normalized title ID itself when it's not in the store.
 */
export function gameKeyFor(titleId, games) {
  const key = titleIdKey(titleId);
  if (!key) return undefined;
  for (const g of games ?? []) {
    if ((g.allTitleIds ?? []).some((id) => titleIdKey(id) === key)) return titleIdKey(g.titleId);
  }
  return key;
}

/** The `status` frontmatter of a report (canonical status slug). */
export function reportStatus(md) {
  const m = String(md ?? "").match(/^status:\s*"?([^"\n]+)"?/m);
  return m ? String(m[1]).trim().toLowerCase() : undefined;
}

/** The `testedVersion` frontmatter of a report. */
export function reportVersion(md) {
  const m = String(md ?? "").match(/^testedVersion:\s*"?([^"\n]+)"?/m);
  return m ? String(m[1]).trim() : undefined;
}

/**
 * Normalized status ladder: maps template options & legacy statuses to canonical slugs.
 */
export function issueStatus(body) {
  const sections = parseIssueBody(body);
  const raw = cleanField(sections, "Compatibility status");
  const v = String(raw ?? "").trim().toLowerCase();
  const TEMPLATE_STATUS = {
    "doesn't boot": "doesnt-boot",
    "doesnt boot": "doesnt-boot",
    "does not boot": "doesnt-boot",
    logo: "logo",
    "main menu": "main-menu",
    "in game": "in-game",
    playable: "in-game",
    perfect: "in-game",
  };
  return TEMPLATE_STATUS[v] ?? (["doesnt-boot", "logo", "main-menu", "in-game"].includes(v) ? v : undefined);
}

/** The KytyPS5 version from an upstream issue body. */
export function issueVersion(body) {
  const sections = parseIssueBody(body);
  return (
    cleanField(sections, "KytyPS5 version") ||
    cleanField(sections, "KytyPS5 build (commit or release, not the game version)") ||
    undefined
  );
}

/**
 * Build mirror body for an updated report issue, prepending a prominent diff
 * summary notice before the upstream issue body and provenance footer.
 */
export function buildUpdatedMirrorBody(
  upstreamBody,
  { oldStatus, newStatus, oldVersion, newVersion },
  { number, url, created },
) {
  const diffLines = [
    "### 🔄 Upstream Report Updated",
    `- **Version:** \`${oldVersion || "unknown"}\` → \`${newVersion || "unknown"}\``,
    `- **Status:** \`${oldStatus || "unknown"}\` → \`${newStatus || "unknown"}\``,
  ];
  const base = buildMirrorBody(upstreamBody, { number, url, created });
  return `${diffLines.join("\n")}\n\n---\n\n${base}`;
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
 * Also mirrors when an edited issue has a changed status or version.
 * Manual runs never call this (workflow_dispatch always mirrors the issue).
 *
 * `candidate` is { number, created, isEdited?, statusChanged?, versionChanged? };
 * `report` is the existing report for the candidate's (game, OS) ({ sourceNumber,
 * testedDate, status, version }) or undefined; `batchSize` is how many candidates
 * this run found for that (game, OS). Returns { create, isUpdate?, reason? }.
 */
export function shouldCreateMirror(candidate, { report, batchSize }) {
  if (report) {
    const isNewerEdit =
      candidate.isEdited &&
      candidate.editDate &&
      (!report.testedDate || candidate.editDate > report.testedDate);
    const hasSemanticChange = candidate.statusChanged || candidate.versionChanged;
    if (isNewerEdit && hasSemanticChange) {
      return { create: true, isUpdate: true, reason: "upstream report was edited with changes" };
    }
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
