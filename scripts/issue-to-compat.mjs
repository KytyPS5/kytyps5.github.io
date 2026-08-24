#!/usr/bin/env node
/**
 * Convert a structured game-status issue into a Markdown report under
 * src/content/compat/. Invoked by .github/workflows/compat-convert.yml (the
 * `/compat` comment command on a compat mirror issue).
 *
 * Issues now live on the KytyPS5 repo (Game Emulation Status Report template,
 * .github/ISSUE_TEMPLATE/kytyps5-game-emulation.yaml) and are fetched from
 * there — this script parses that template's fields straight out of the raw
 * issue body, with fallbacks for the site repo's legacy 4-tier template so old
 * issues can still be converted.
 *
 * Usage (new template — body parsed from the raw issue):
 *   node scripts/issue-to-compat.mjs --issue-body-file /tmp/issue-body.txt \
 *     --date 2026-08-10 --source "#123" \
 *     --source-url "https://github.com/KytyPS5/KytyPS5/issues/123" \
 *     [--title "Astro Bot"] [--slug astro-bot-windows]
 *
 * Usage (explicit flags — legacy / manual runs):
 *   node scripts/issue-to-compat.mjs --title "Disgaea 6" --status "in-game" \
 *     --version "main" --date 2026-08-10 --os windows --hardware "Ryzen 9 / RTX 5090" \
 *     --body "notes…" --steps "1. Boot…" --expected-behavior "…" --extra-notes "settings…" \
 *     --source "#123" --source-url "https://github.com/org/repo/issues/123" \
 *     [--game-version "1.004"] [--slug disgaea-6] [--title-id PPSA01234]
 *
 * Explicit flags ALWAYS override values parsed from --issue-body-file.
 * Writes (or overwrites) src/content/compat/<slug>.md with the report.
 *
 * Manual overrides: a mirror issue body may carry a `## Overrides` section
 * (recorded by the /setos /setid /settitle comment commands, see
 * scripts/set-compat-override.mjs) with human-corrected os / titleId / title
 * values. They win over the values parsed from the issue body but lose to
 * explicit CLI flags. This is how a mirror whose OS doesn't generalize — or
 * whose PPSA-XXXXX / title still needs a human fix — still converts.
 */
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { cleanField, normalizeOs, parseIssueBody } from "./lib/issue-form.mjs";
import { gameKeyFor, readOverrides, reportOs, reportTitleId } from "./lib/status-issues.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src", "content", "compat");
const GAMES_FILE = path.join(ROOT, "src", "data", "games.json");

const STATUSES = ["doesnt-boot", "logo", "main-menu", "in-game"];
const OSES = ["windows", "linux", "macos"];
const TITLE_ID_REGEX = /^PPSA-?\d{5}$/i;
const TITLE_ID_LIST_REGEX = /PPSA[\s-]?\d{5}/gi;

/**
 * Some submitters list several serials for one game (region variants of the
 * same title — the games DB tracks them all as allTitleIds). The report
 * stores a single titleId, so pick the first valid PPSA code; "Unknown" and
 * garbage still fall through to the existing validation errors.
 */
function pickTitleId(raw) {
  const v = String(raw ?? "").trim();
  if (!v || /^unknown$/i.test(v)) return v || undefined;
  const codes = v.match(TITLE_ID_LIST_REGEX);
  if (codes && codes.length > 1) {
    console.warn(
      `[issue-to-compat] ⚠ "Game ID / serial" lists ${codes.length} serials (${codes.join(", ")}) — ` +
        `using ${codes[0]} as the report's titleId (the games DB keeps every region variant)`,
    );
  }
  const chosen = codes?.[0] ?? v;
  return chosen.replace(/\s+/g, "").toUpperCase();
}

/**
 * Canonical status ladder = the Game Emulation Status Report template options:
 *   doesnt-boot → logo → main-menu → in-game
 *
 * normalizeStatus() maps:
 *   - the template's option strings ("Doesn't boot", "Logo", "Main menu", "In game")
 *   - the site repo's OLD 4-tier template values (nothing → boots → playable →
 *     perfect), for legacy issues converted after the migration
 *   - the ancient 6-tier ladder (menus / ingame / playable-low-fps / playable)
 * Stored reports must use the new ladder (validate-compat rejects anything
 * else); this only normalizes issue intake.
 */
const TEMPLATE_STATUS = {
  "doesn't boot": "doesnt-boot",
  logo: "logo",
  "main menu": "main-menu",
  "in game": "in-game",
};
const LEGACY_4_TIER = {
  nothing: "doesnt-boot",
  boots: "logo",
  playable: "main-menu",
  perfect: "in-game",
};
const LEGACY_6_TIER = {
  menus: "main-menu",
  ingame: "in-game",
  "playable-low-fps": "in-game",
  playable: "in-game",
};

function normalizeStatus(status) {
  const v = String(status ?? "")
    .trim()
    .toLowerCase();
  if (STATUSES.includes(v)) return v; // canonical slug passed directly
  return TEMPLATE_STATUS[v] ?? LEGACY_4_TIER[v] ?? LEGACY_6_TIER[v] ?? undefined;
}

/**
 * Pull the intake values out of an issue body. Recognizes BOTH the new
 * Game Emulation Status Report template and the legacy 4-tier template, so a
 * legacy issue converted after the migration still works.
 */
function readIntake(body, flags) {
  const sections = parseIssueBody(body);
  // Values set by the /setos /setid /settitle comment commands on the mirror
  // issue. Precedence is flags > overrides > parsed, except the title where
  // the parsed "Game title" field stays more reliable than a CLI --title.
  const overrides = readOverrides(body);

  // New Game Emulation Status Report template headings.
  const title = cleanField(sections, "Game title") || undefined;
  const titleId = cleanField(sections, "Game ID / serial") || undefined;
  const version = cleanField(sections, "KytyPS5 version") || undefined;
  const statusRaw = cleanField(sections, "Compatibility status") || undefined;
  const notes = cleanField(sections, "Result details") || undefined;
  const steps = cleanField(sections, "Steps to reproduce the result") || undefined;
  const expected = cleanField(sections, "Expected behavior") || undefined;
  const regression = cleanField(sections, "Last working build / first broken build") || undefined;
  const extra = cleanField(sections, "Extra notes") || undefined;
  const os = normalizeOs(cleanField(sections, "OS") || undefined);
  const cpu = cleanField(sections, "CPU") || undefined;
  const gpu = cleanField(sections, "GPU") || undefined;
  const ram = cleanField(sections, "RAM / VRAM") || undefined;

  // Legacy 4-tier template uses different headings for the same concepts
  // (old issues converted after the migration keep working).
  const titleIdLegacy = cleanField(sections, "Title ID") || undefined;
  const versionLegacy = cleanField(sections, "KytyPS5 build (commit or release, not the game version)") || undefined;
  const statusLegacy = cleanField(sections, "Compatibility status") || undefined;
  const notesLegacy = cleanField(sections, "What works / what breaks") || undefined;
  const stepsLegacy = cleanField(sections, "Steps to reproduce") || undefined;
  const extraLegacy = cleanField(sections, "Extra notes") || undefined;
  const osLegacy = normalizeOs(cleanField(sections, "Operating system") || undefined);
  const legacyDate = cleanField(sections, "Test date") || undefined;
  const legacyGameVersion = cleanField(sections, "Game version") || undefined;
  const legacyHardware = cleanField(sections, "Hardware (CPU / GPU)") || undefined;

  // Explicit flags win over parsed values, except the title (the parsed
  // "Game title" field is more reliable than the issue title) and the date
  // (a legacy "Test date" is the real test date, better than created_at).
  return {
    title: overrides.title ?? title ?? flags.title,
    titleId: overrides.titleId ?? flags.titleId ?? titleId ?? titleIdLegacy,
    statusRaw: overrides.status ?? flags.status ?? statusRaw ?? statusLegacy,
    version: flags.version ?? version ?? versionLegacy,
    date: legacyDate ?? flags.date, // new template has no date — workflow passes issue.created_at
    os: overrides.os ?? flags.os ?? os ?? osLegacy,
    osRaw:
      overrides.os ??
      (cleanField(sections, "OS") || cleanField(sections, "Operating system") || undefined),
    hardware:
      flags.hardware ??
      legacyHardware ??
      ([cpu, gpu, ram].filter(Boolean).join(" / ") || undefined),
    gameVersion: flags.gameVersion ?? legacyGameVersion,
    notes: flags.body ?? notes ?? notesLegacy,
    steps: flags.steps ?? steps ?? stepsLegacy,
    expected: flags.expected ?? expected,
    regression,
    extra: flags.extraNotes ?? extra ?? extraLegacy,
  };
}

function arg(name) {
  // Exact-token match: `--title` must not match the `--title-id` flag (a
  // plain indexOf would collide on the shared prefix). Value follows the flag.
  const flag = `--${name}`;
  const idx = process.argv.findIndex((a) => a === flag);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : undefined;
}

const flags = {
  title: arg("title"),
  titleId: arg("title-id"),
  status: arg("status"),
  version: arg("version"),
  date: arg("date"),
  os: arg("os"),
  hardware: arg("hardware"),
  body: arg("body"),
  steps: arg("steps"),
  expected: arg("expected-behavior"),
  extraNotes: arg("extra-notes"),
  source: arg("source"),
  sourceUrl: arg("source-url"),
  gameVersion: arg("game-version"),
  slug: arg("slug"),
  issueBodyFile: arg("issue-body-file"),
};

const issueBody = flags.issueBodyFile ? await readFile(flags.issueBodyFile, "utf8") : "";
// Explicit-flag mode maps the CLI flags onto the same shape readIntake
// returns, so the rest of the script is agnostic to how the values got here.
const intake = flags.issueBodyFile
  ? readIntake(issueBody, flags)
  : {
      title: flags.title,
      titleId: flags.titleId,
      statusRaw: flags.status,
      version: flags.version,
      date: flags.date,
      os: flags.os,
      osRaw: flags.os,
      hardware: flags.hardware,
      notes: flags.body,
      steps: flags.steps,
      expected: flags.expected,
      extra: flags.extraNotes,
      source: flags.source,
      sourceUrl: flags.sourceUrl,
      gameVersion: flags.gameVersion,
    };

const title = intake.title;
const statusRaw = intake.statusRaw;
const status = normalizeStatus(statusRaw);
const version = intake.version;
const date = intake.date;
const os = intake.os;

/**
 * Extract screenshot URLs from the raw issue body. GitHub's editor stores
 * pasted images as `<img src="…">` tags (user-attachments / user-images
 * CDN); legacy issues may use markdown `![…](url)`. Only those two shapes
 * count — bare URLs in the body are usually uploaded LOG files, and we no
 * longer download anything to tell them apart. URLs stay hotlinked on the
 * site, so no image is copied into the repo (see validate-compat's rule).
 */
function extractScreenshotUrls(body) {
  const urls = [];
  const seen = new Set();
  const add = (u) => {
    const clean = String(u ?? "").trim();
    if (/^https?:\/\//i.test(clean) && !seen.has(clean)) {
      seen.add(clean);
      urls.push(clean);
    }
  };
  for (const m of String(body ?? "").matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of String(body ?? "").matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) add(m[1]);
  return urls.slice(0, 10); // keep reports sane; an issue rarely has more
}
const screenshots = extractScreenshotUrls(issueBody);
const hardware = intake.hardware;
const notes = intake.notes || "See the original issue for details.";
const steps = intake.steps;
const expected = intake.expected;
const regression = intake.regression;
const extra = intake.extra;
const source = intake.source ?? flags.source;
const sourceUrl = intake.sourceUrl ?? flags.sourceUrl;
const gameVersion = intake.gameVersion;
const titleId = pickTitleId(intake.titleId);
// One report per (game, OS): the default slug appends the OS so a Windows and
// a Linux report for the same game live in separate files, and re-running a
// conversion for the same game + OS overwrites that OS's status in place.
const slug =
  flags.slug ||
  (title
    ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + (os ? `-${os}` : "")
    : "");

const errors = [];
if (!title) errors.push("--title / \"Game title\" is required (or set one with /settitle on the mirror issue)");
if (!titleId) errors.push("--title-id / \"Game ID / serial\" is required (or set one with /setid on the mirror issue)");
else if (/^unknown$/i.test(titleId)) errors.push("Game ID / serial is \"Unknown\" — fill in the PPSA-XXXXX on the mirror issue (/setid PPSA-XXXXX) before converting");
else if (!TITLE_ID_REGEX.test(titleId)) errors.push(`title ID must look like PPSA-XXXXX, got \"${titleId}\"`);
if (!status) errors.push(`--status / \"Compatibility status\" is required or unrecognized (got \"${String(statusRaw)}\") — expected one of: Doesn't boot | Logo | Main menu | In game`);
else if (statusRaw !== undefined &&
  !(String(statusRaw).trim().toLowerCase() in TEMPLATE_STATUS) &&
  !STATUSES.includes(String(statusRaw).trim().toLowerCase())) {
  console.warn(`[issue-to-compat] ⚠ remapped status \"${statusRaw}\" → \"${status}\" (legacy ladder)`);
}
if (!version) errors.push("--version / \"KytyPS5 version\" is required");
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("--date must be YYYY-MM-DD (workflow passes the issue's creation date)");
if (!os) errors.push(`--os / \"OS\" is required and must mention windows, linux or mac (got \"${String(intake.osRaw ?? intake.os)}\") — or set it with /setos windows|linux|macos on the mirror issue`);
else if (!OSES.includes(os)) errors.push(`--os must be ${OSES.join(" | ")}`);
if (errors.length) {
  console.error("[issue-to-compat] " + errors.join("; "));
  process.exit(1);
}

// Report body = the issue's result details followed by optional sections
// (rendered as markdown headings, which the site's markdown parser supports).
// Sections are omitted when the submitter left the field empty, so reports
// stay concise. Truncation mirrors the old workflow's 4000-char cap.
const cap = (s, n = 4000) => String(s ?? "").slice(0, n);
const bodySections = [cap(notes)];
if (steps) bodySections.push(`## Steps to reproduce\n\n${cap(steps)}`);
if (expected) bodySections.push(`## Expected behavior\n\n${cap(expected)}`);
if (regression) bodySections.push(`## Last working build / first broken build\n\n${cap(regression)}`);
if (extra) bodySections.push(`## Extra notes\n\n${cap(extra)}`);
const reportBody = bodySections.join("\n\n");

const frontmatter = [
  "---",
  `title: ${JSON.stringify(title)}`,
  `titleId: ${JSON.stringify(titleId)}`,
  `status: "${status}"`,
  `testedVersion: ${JSON.stringify(version)}`,
  `testedDate: "${date}"`,
  `os: "${os}"`,
  hardware ? `hardware: ${JSON.stringify(hardware)}` : null,
  gameVersion ? `gameVersion: ${JSON.stringify(gameVersion)}` : null,
  screenshots.length ? `screenshots: ${JSON.stringify(screenshots)}` : null,
  "---",
  "",
  reportBody,
  "",
  source && sourceUrl
    ? `> Source: [${source}](${sourceUrl})`
    : source
      ? `> Source: GitHub game status report ${source}`
      : "",
].filter((line) => line !== null);

// One verified report per (game, OS): retire any existing report for the same
// game + OS under a DIFFERENT slug, so a re-conversion with a differently
// spelled title ("Demon Souls" vs "Demon's Souls") or a region-variant serial
// replaces the old file — the report PR shows the delete — instead of leaving
// a duplicate. Matched by game key (allTitleIds) + OS; the new report is
// written over any same-slug file below.
await mkdir(DIR, { recursive: true });
const games = JSON.parse(await readFile(GAMES_FILE, "utf8"));
const gameKey = gameKeyFor(titleId, games);
for (const file of await readdir(DIR)) {
  if (!file.endsWith(".md") || file === `${slug}.md`) continue;
  const raw = await readFile(path.join(DIR, file), "utf8");
  const otherKey = reportTitleId(raw);
  const otherOs = reportOs(raw);
  if (otherKey && otherOs === os && gameKeyFor(otherKey, games) === gameKey) {
    await unlink(path.join(DIR, file));
    console.log(`[issue-to-compat] retired ${file} — same (game, OS), replaced by ${slug}.md`);
  }
}

const out = path.join(DIR, `${slug}.md`);
await writeFile(out, frontmatter.join("\n") + "\n");
console.log(`[issue-to-compat] wrote ${path.relative(ROOT, out)}`);
