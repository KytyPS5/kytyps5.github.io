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

/**
 * Parse a GitHub-issue-form body into its `### Section label` → value pairs.
 * The form renders each answer under its heading (with a blank line), so
 * multi-line textarea answers are captured whole. `## ` lines are the
 * template's group separators ("## Game and build", "## Test result", …) —
 * they close the current field without opening a new one, so "## Evidence"
 * doesn't leak into the RAM/VRAM answer. Everything after a `## ` group
 * heading (e.g. a mirror issue's own "## Source" footer) is ignored.
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
    if (/^##\s+/.test(line)) {
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
