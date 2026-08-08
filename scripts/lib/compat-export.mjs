// Export the compatibility database for the KytyPS5 GUI launcher
// (src/launcher/src/compatibilityDatabase.cpp):
//   { "<TITLE_ID>": { "status": "<InGame|MainMenu|Logo|DoesntBoot|Unknown>", "comment": "..." } }
// The launcher's Parse() reads only `status` + `comment` and ignores any extra
// fields, so the per-OS `platforms` block and `reports` count are additive:
// current GUI builds stay compatible while future ones can render OS-specific
// results (Nmzik's cross-platform caveat on #177).
// Title keys are trimmed + uppercased (mirrors the GUI's TitleKey()).
// Pure functions + a thin CLI wrapper (kept dependency-free for the build).

/**
 * Map our status ladder to the GUI's GameStatus enum strings. The site ladder
 * now matches the Game Emulation Status Report template 1:1, so this is a
 * direct translation (previously playable + perfect both collapsed to InGame).
 */
const GUI_STATUS = {
  "doesnt-boot": "DoesntBoot",
  logo: "Logo",
  "main-menu": "MainMenu",
  "in-game": "InGame",
};

/** Our ladder order — used for majority aggregation (ties to the better status). */
export const STATUSES = ["doesnt-boot", "logo", "main-menu", "in-game"];

/** Map a site status to the GUI's accepted status string. */
export function mapStatus(status) {
  return GUI_STATUS[status] ?? "Unknown";
}

/**
 * Majority-vote aggregation matching the site's aggregateStatus(): the status
 * most reports submitted wins; ties break toward the better status.
 */
export function aggregateStatuses(statuses) {
  if (statuses.length === 0) return STATUSES[0];
  const counts = new Map();
  for (const s of statuses) counts.set(s, (counts.get(s) ?? 0) + 1);
  let best = statuses[0];
  let bestCount = 0;
  let bestRank = -1;
  for (const [status, count] of counts) {
    const rank = STATUSES.indexOf(status);
    if (count > bestCount || (count === bestCount && rank > bestRank)) {
      best = status;
      bestCount = count;
      bestRank = rank;
    }
  }
  return best;
}

/**
 * Best-across-OS aggregation matching the site's displayStatus(): each OS's
 * reports majority-vote first, then the best (highest on the ladder) of those
 * OS results wins — "the best of any test done". Reports without an OS form
 * their own group. Mirrors the site so the GUI's top-level status means the
 * same thing as the site's "Any" filter.
 */
export function bestStatuses(reports) {
  const groups = new Map();
  for (const r of reports) {
    const key = r.os ?? "unknown";
    const list = groups.get(key) ?? [];
    list.push(r.status);
    groups.set(key, list);
  }
  let best = null;
  for (const statuses of groups.values()) {
    const s = aggregateStatuses(statuses);
    if (best === null || STATUSES.indexOf(s) > STATUSES.indexOf(best)) best = s;
  }
  return best ?? STATUSES[0];
}

/**
 * Normalize a title ID to the bare uppercase key the GUI stores entries under
 * (trim, strip dashes, uppercase). The launcher's TitleKey() does trim +
 * uppercase; the dash-strip is a no-op on valid data (the schema requires
 * PPSAXXXXX) and only guards against a dashed ID slipping through.
 */
export function titleKey(titleId) {
  return String(titleId).trim().replace(/-/g, "").toUpperCase();
}

/** OSes a report may be tagged with (matches the site schema + validator). */
const PLATFORMS = ["windows", "linux", "macos"];

/** Majority-vote status of a report list (aggregates their status strings). */
function majorityOf(list) {
  return aggregateStatuses(list.map((r) => r.status));
}

/**
 * Summarize a report list for one group: status (via the given aggregation
 * function over report objects), report count and the latest tested build (by
 * test date) it applies to. Undated reports sort last so `version` reflects
 * the newest dated test.
 */
function summarize(list, statusFn = majorityOf) {
  const status = statusFn(list);
  const latest = list
    .slice()
    .sort((a, b) => ((a.testedDate ?? "0") < (b.testedDate ?? "0") ? 1 : -1))[0];
  return { status, reports: list.length, version: latest?.testedVersion ?? "main" };
}

/**
 * Build the GUI-shaped database from parsed reports. One entry per game
 * (reports grouped by title ID). Per the per-OS status policy:
 *
 * - `status`/`comment` are the **best result across the per-OS majorities**
 *   (mirrors the site's "Any" filter — the best of any test done).
 * - `platforms.<os>` carries the **majority per OS** (windows | linux | macos),
 *   with the report count and latest tested build for that OS, so the GUI can
 *   show OS-specific results instead of assuming they're equivalent.
 * - Reports **without an `os` field** form their own group in the top-level
 *   aggregation only — never a platform (their OS is unknown).
 * - A platform key is omitted when that OS has no reports (absence = untested),
 *   so `Unknown` can't be confused with "no data".
 *
 * Keys are sorted for deterministic output; platform keys follow PLATFORMS
 * order.
 */
export function buildCompatibilityDb(reports) {
  const groups = new Map();
  for (const report of reports) {
    const key = titleKey(report.titleId ?? "");
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(report);
    groups.set(key, list);
  }

  const db = {};
  for (const key of [...groups.keys()].sort()) {
    const list = groups.get(key);
    const overall = summarize(list, bestStatuses);

    const platforms = {};
    for (const platform of PLATFORMS) {
      const onOs = list.filter((r) => r.os === platform);
      if (onOs.length === 0) continue;
      const s = summarize(onOs);
      platforms[platform] = {
        status: mapStatus(s.status),
        reports: s.reports,
        comment: `${s.reports} report${s.reports === 1 ? "" : "s"} · status: ${s.status}`,
        version: s.version,
      };
    }

    db[key] = {
      status: mapStatus(overall.status),
      reports: overall.reports,
      comment:
        `${overall.reports} report${overall.reports === 1 ? "" : "s"} · ` +
        `status: ${overall.status} · tested on ${overall.version}`,
      ...(Object.keys(platforms).length > 0 ? { platforms } : {}),
    };
  }
  return db;
}

/** Tiny frontmatter parser (same contract as scripts/validate-compat.mjs). */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    data[key] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  }
  return data;
}
