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
