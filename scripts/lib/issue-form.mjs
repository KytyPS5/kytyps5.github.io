/**
 * Parsing helpers shared by the issue intake pipeline:
 *   - scripts/issue-to-compat.mjs     (issue body → report)
 *   - scripts/sync-status-issues.mjs  (issue body → mirror issue title)
 *
 * The Game Emulation Status Report template (KytyPS5 repo) renders every
 * question under a `### <label>` heading with the answer below it; `## <group>`
 * headings separate template sections. parseIssueBody() turns that raw body
 * into `label → text` pairs, and cleanField()/normalizeOs() fold the
 * free-text answers onto the site's canonical values. Kept dependency-free
 * (node builtins only) so the workflows can import it anywhere.
 */

const GROUP_HEADINGS = new Set([
  "game and build",
  "test result",
  "hardware",
  "evidence",
  "system information",
  "environment",
  "source",
  "overrides",
]);

function isGroupHeading(line) {
  const m = line.match(/^##\s+(.+?)\s*$/);
  if (!m) return false;
  return GROUP_HEADINGS.has(m[1].trim().toLowerCase());
}

/**
 * Parse a GitHub-issue-form body into its `### Section label` → value pairs.
 * The form renders each answer under its heading (with a blank line), so
 * multi-line textarea answers are captured whole. Known `## ` group headings
 * ("## Game and build", "## Test result", mirror "## Source" footer, …) close
 * the current field without opening a new one. Arbitrary user headings inside
 * textareas (e.g. `## Logs`) are preserved in the field value.
 */
export function parseIssueBody(body) {
  const sections = {};
  const lines = String(body ?? "").split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const field = line.match(/^###\s+(.+?)\s*$/);
    if (field) {
      current = field[1].trim();
      sections[current] = "";
      continue;
    }
    if (isGroupHeading(line)) {
      current = null; // group separator — end the current field
      continue;
    }
    if (current !== null) sections[current] += line + "\n";
  }
  return sections;
}

/** Unanswered optional form fields render as "_No response_" — treat as absent. */
export function cleanField(sections, label) {
  const v = sections[label] ?? "";
  return v.replace(/_No response_/g, "").replace(/_Unknown_/g, "").trim();
}

/** The new template's OS field is free text — fold it into windows/linux/macos. */
export const OS_ALIASES = [
  [/win(?:dows)?(?: ?10| ?11| server)?|microsoft|^ms/i, "windows"],
  [/mac|os ?x|osx|darwin|apple/i, "macos"],
  [/linux|ubuntu|debian|arch|fedora|linux mint|mint|pop.?os|manjaro|opensuse|steamos|steam ?deck/i, "linux"],
];

export function normalizeOs(os) {
  const v = String(os ?? "").trim().toLowerCase();
  for (const [re, canonical] of OS_ALIASES) if (re.test(v)) return canonical;
  return undefined;
}

export const STATUSES = ["doesnt-boot", "logo", "main-menu", "in-game"];

const TEMPLATE_STATUS = {
  "doesn't boot": "doesnt-boot",
  "doesnt boot": "doesnt-boot",
  "does not boot": "doesnt-boot",
  logo: "logo",
  "main menu": "main-menu",
  "in game": "in-game",
  playable: "in-game",
  perfect: "in-game",
  nothing: "doesnt-boot",
  boots: "logo",
  menus: "main-menu",
  ingame: "in-game",
  "playable-low-fps": "in-game",
};

/**
 * Fold free-text or template status options onto the canonical status ladder:
 *   doesnt-boot → logo → main-menu → in-game
 */
export function normalizeStatus(status) {
  const v = String(status ?? "").trim().toLowerCase();
  if (!v) return undefined;
  if (STATUSES.includes(v)) return v;
  if (TEMPLATE_STATUS[v]) return TEMPLATE_STATUS[v];

  // Regex fallback for manual edits / free-form text (e.g. "Demons souls in Main menu")
  if (/\b(?:doesn'?t\s*boot|does\s*not\s*boot|not\s*boot(?:ing)?|nothing|no\s*boot)\b/i.test(v)) return "doesnt-boot";
  if (/\b(?:in[- ]?game|playable|perfect)\b/i.test(v)) return "in-game";
  if (/\b(?:main[- ]?menu|menus?)\b/i.test(v)) return "main-menu";
  if (/\b(?:logo|splash|boots?)\b/i.test(v)) return "logo";

  return undefined;
}

