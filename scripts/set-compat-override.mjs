#!/usr/bin/env node
/**
 * `/setos`, `/setid`, `/settitle` and `/setstatus` comment commands on a
 * compat mirror issue (see .github/workflows/compat-set-fields.yml).
 *
 * These record a manual field correction on the mirror BEFORE (or after) the
 * /compat conversion, for issues whose fields can't be read cleanly:
 *
 *   /setos windows          # the issue's OS text doesn't generalize — stored
 *                           # as the canonical windows | linux | macos
 *   /setid PPSA01234        # serial missing / "Unknown" in the issue
 *   /settitle Astro Bot     # wrong or missing game title
 *   /setstatus main-menu    # status unparsed or changed (doesnt-boot | logo | main-menu | in-game)
 *
 * The value is written to the `## Overrides` section of the mirror issue body
 * (see scripts/lib/status-issues.mjs — readOverrides/appendOverrides), which
 * wins over the values parsed from the issue when /compat converts it
 * (issue-to-compat.mjs) and survives poller refreshes (sync-status-issues.mjs
 * re-applies it). The mirror title is recomputed too, so a corrected OS or
 * title shows up in the issue list. On success the command comment gets a 👀
 * reaction, like /compat acknowledges with.
 *
 * Failures are posted back to the issue as a comment — `❌ /<command> failed.
 * <reason>` — so the maintainer sees the reason without digging through the
 * workflow log; the workflow still fails (exit 1). Only mirror issues (body
 * carries a `## Source` footer) are accepted; anything else fails with a
 * readable error and the issue is left untouched.
 *
 * Usage (run by the workflow — reads the issue_comment event):
 *   GH_TOKEN=… GITHUB_REPOSITORY=owner/repo node scripts/set-compat-override.mjs
 *
 * The script uses node builtins only, so the workflow needs no `npm ci`.
 */
import { readFile } from "node:fs/promises";
import { normalizeOs, normalizeStatus } from "./lib/issue-form.mjs";
import {
  appendOverrides,
  mirrorSource,
  mirrorTitle,
  mirrorUpstreamBody,
  readOverrides,
} from "./lib/status-issues.mjs";

const TITLE_ID_REGEX = /^PPSA-?\d{5}$/i;
const MAX_TITLE_LENGTH = 200;

async function api(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// ── environment ─────────────────────────────────────────────────────────────
// Failures before this point are CI misconfiguration — nothing to comment on.
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.error("::error::set-compat-override: GITHUB_EVENT_PATH is required (run from the issue_comment workflow)");
  process.exit(1);
}
const event = JSON.parse(await readFile(eventPath, "utf8"));

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!repo || !token) {
  console.error("::error::set-compat-override: GITHUB_REPOSITORY and GH_TOKEN are required");
  process.exit(1);
}

const comment = event.comment;
const issue = event.issue;
if (!comment || !issue || issue.pull_request) {
  console.error("::error::set-compat-override: expected an issue_comment event on an issue");
  process.exit(1);
}

// ── failure reporting ───────────────────────────────────────────────────────
// From here on every failure is posted back to the issue as a comment before
// exiting 1, so the workflow stays red but the reason is visible on the issue.
let commandName = null; // set once the comment is parsed

async function postError(message) {
  const label = commandName ? `**/${commandName} failed.**` : "**Command failed.**";
  try {
    await api(`https://api.github.com/repos/${repo}/issues/${issue.number}/comments`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ body: `❌ ${label} ${message}` }),
    });
  } catch (err) {
    console.error(`::error::could not post the error comment: ${err.message}`);
  }
}

async function fail(message) {
  console.error(`::error::${message}`);
  await postError(message);
  process.exit(1);
}

// ── command ─────────────────────────────────────────────────────────────────
async function main() {
  // The command is the first line; the value is everything after it.
  const match = String(comment.body ?? "")
    .split(/\r?\n/)[0]
    .match(/^\/(setos|setid|settitle|setstatus)(?:\s+(.*))?$/i);
  if (!match) {
    await fail(
      `unrecognized command "${String(comment.body ?? "").split(/\r?\n/)[0]}" — expected /setos, /setid, /settitle or /setstatus`,
    );
  }
  const [, command, rawValue] = match;
  commandName = command;
  const value = String(rawValue ?? "").trim();

  let field;
  let stored;
  if (command === "setos") {
    field = "os";
    stored = normalizeOs(value);
    if (!stored) {
      await fail(
        `/setos — unrecognized OS "${value}" (expected windows | linux | macos, or free text like "Windows 11" that folds onto one of them)`,
      );
    }
  } else if (command === "setid") {
    field = "titleId";
    if (!TITLE_ID_REGEX.test(value)) {
      await fail(`/setid — "${value}" is not a PPSA-XXXXX title ID (e.g. PPSA01234)`);
    }
    stored = value;
  } else if (command === "setstatus") {
    field = "status";
    stored = normalizeStatus(value);
    if (!stored) {
      await fail(
        `/setstatus — unrecognized status "${value}" (expected doesnt-boot | logo | main-menu | in-game, or template values like "Main menu")`,
      );
    }
  } else {
    field = "title";
    if (!value) await fail("/settitle — a game title is required after the command");
    if (value.includes('"')) {
      await fail("/settitle — the title must not contain double quotes (reports store it in single-line frontmatter)");
    }
    if (value.length > MAX_TITLE_LENGTH) {
      await fail(`/settitle — title is ${value.length} chars, max ${MAX_TITLE_LENGTH}`);
    }
    stored = value;
  }

  const currentBody = String(issue.body ?? "");
  const source = mirrorSource(currentBody);
  if (!source) {
    await fail(
      "this issue is not a compat mirror — its body has no `## Source` footer. " +
        "/setos, /setid, /settitle and /setstatus edit the manual overrides of a mirror issue that the /compat conversion uses.",
    );
  }

  // Apply the new value on top of any existing overrides (other fields keep).
  const overrides = readOverrides(currentBody);
  overrides[field] = stored;
  const newBody = appendOverrides(currentBody, overrides);

  // Recompute the mirror title so a corrected OS / title shows in the issue
  // list ([GAME STATUS] <title> (<os>)); /setid leaves it unchanged.
  const newTitle = mirrorTitle(mirrorUpstreamBody(currentBody), String(issue.title ?? ""), overrides);

  const patch = { body: newBody };
  if (newTitle !== issue.title) patch.title = newTitle;

  await api(`https://api.github.com/repos/${repo}/issues/${issue.number}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(patch),
  });

  // Acknowledge the command comment — best effort; the override is already
  // recorded, so a reaction hiccup must not fail the command.
  try {
    await api(`https://api.github.com/repos/${repo}/issues/comments/${comment.id}/reactions`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ content: "eyes" }),
    });
  } catch (err) {
    console.error(`::error::could not react to the comment: ${err.message}`);
  }

  console.log(`[set-compat-override] ${command} → ${stored} recorded on issue #${issue.number}`);
  if (patch.title) console.log(`[set-compat-override] mirror title → ${newTitle}`);
}

try {
  await main();
} catch (err) {
  // Unexpected failure (API error, crash) — still tell the maintainer why.
  console.error(`::error::${err.message}`);
  await postError(`unexpected error: ${err.message}`);
  process.exit(1);
}
