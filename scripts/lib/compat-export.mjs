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

/** Our ladder order — best-across-OS aggregation picks the highest. */
export const STATUSES = ["doesnt-boot", "logo", "main-menu", "in-game"];

/** Map a site status to the GUI's accepted status string. */
export function mapStatus(status) {
  return GUI_STATUS[status] ?? "Unknown";
}

/**
 * Statuses within one OS scope — matching the site's aggregateStatus(): the
 * verified-report pipeline keeps EXACTLY ONE report per (game, OS), so its
 * status IS the OS status. Multiple statuses for one OS are a pipeline error
 * and throw loudly instead of being majority-voted (validate-compat.mjs
 * rejects them at build time).
 */
export function aggregateStatuses(statuses) {
  if (statuses.length === 0) return STATUSES[0];
  if (statuses.length > 1) {
    throw new Error(
      `expected one verified report per (game, OS) but found ${statuses.length} statuses — ` +
        "duplicate reports must be resolved (see scripts/validate-compat.mjs)",
    );
  }
  return statuses[0];
}

/**
 * Best-across-OS aggregation matching the site's displayStatus(): each OS's
 * single report aggregates first, then the best (highest on the ladder) of
 * those OS results wins — "the best of any test done". Reports without an OS
 * form their own group. Mirrors the site so the GUI's top-level status means
 * the same thing as the site's "Any" filter.
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

/** Status of a report list — the single verified report's status. */
function singleStatus(list) {
  return aggregateStatuses(list.map((r) => r.status));
}

/**
 * Summarize a report list for one group: status (via the given aggregation
 * function over report objects), report count and the latest tested build (by
 * test date) it applies to. Undated reports sort last so `version` reflects
 * the newest dated test.
 */
function summarize(list, statusFn = singleStatus) {
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
 * - `status`/`comment` are the **best result across the per-OS reports**
 *   (mirrors the site's "Any" filter — the best of any test done).
 * - `platforms.<os>` carries the **per-OS report status** (one verified report
 *   per OS — windows | linux | macos), with the report count and latest
 *   tested build for that OS, so the GUI can show OS-specific results instead
 *   of assuming they're equivalent.
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

/* ------------------------------------------------------------------ */
/* Full report parser + site index builder — the JS twin of the TS     */
/* parser in src/lib/compat.ts (parseCompatReport) and its index       */
/* aggregation. The site export runs in plain Node, so these live here */
/* instead of importing the TS module; compat.test.ts has a sync test  */
/* that compares this parser's output against the TS parser on the     */
/* same fixtures to keep the two implementations honest.               */
/* ------------------------------------------------------------------ */

const SITE_TITLE_ID_REGEX = /^PPSA-?\d{5}$/i;

/** Frontmatter parse returning {data, body} with boolean/number coercion. */
function parseReportFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^\d+$/.test(String(value))) value = Number(value);
    else if (/^\[.*\]$/.test(value)) {
      // Flow-style array frontmatter: screenshots: ["url", …]. URLs never
      // contain commas or quotes, so a simple split is safe.
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    data[key] = value;
  }
  return { data, body: match[2].trim() };
}

/**
 * Extract a `> Source: [label](url)` or `> Source: label` line from the body.
 * The LAST such line wins — same contract as src/lib/compat.ts's extractSource
 * (the report converter appends the real source at the end).
 */
export function extractSource(raw) {
  const lines = String(raw).split(/\r?\n/);
  let sourceLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^>\s*Source:/.test(lines[i])) sourceLine = i;
  }
  if (sourceLine === -1) return { body: raw };
  const text = lines[sourceLine].replace(/^>\s*Source:\s*/i, "").trim();
  const link = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  const source = link ? { label: link[1], url: link[2] } : { label: text };
  const body = lines.filter((_, idx) => idx !== sourceLine).join("\n").trim();
  return { source, body };
}

/**
 * Validate and normalize a raw report file — mirrors parseCompatReport in
 * src/lib/compat.ts (same schema, same error messages). Throws with a readable
 * message including the slug.
 */
export function parseReport(raw, slug) {
  const { data: fm, body: rawBody } = parseReportFrontmatter(raw);
  const { source, body } = extractSource(rawBody);

  const errors = [];
  const title = typeof fm.title === "string" && fm.title.trim() ? fm.title : "";
  const status = fm.status;
  const testedVersion = typeof fm.testedVersion === "string" ? fm.testedVersion : "";
  const testedDate = typeof fm.testedDate === "string" ? fm.testedDate : "";
  const titleId = typeof fm.titleId === "string" && fm.titleId.trim() ? fm.titleId : "";
  const os = fm.os;
  const hardware = typeof fm.hardware === "string" ? fm.hardware : undefined;
  const score = typeof fm.score === "number" ? fm.score : undefined;
  const gameVersion =
    typeof fm.gameVersion === "string" && fm.gameVersion.trim() ? fm.gameVersion : undefined;
  const screenshot =
    typeof fm.screenshot === "string" && fm.screenshot.trim() ? fm.screenshot : undefined;
  const screenshotVerified = typeof fm.screenshotVerified === "boolean" ? fm.screenshotVerified : undefined;
  const screenshots = Array.isArray(fm.screenshots) ? fm.screenshots.filter((s) => typeof s === "string") : undefined;

  if (!title) errors.push("missing required frontmatter field: title");
  if (!titleId) errors.push("missing required frontmatter field: titleId");
  else if (!SITE_TITLE_ID_REGEX.test(titleId))
    errors.push(`titleId must look like PPSA-XXXXX, got "${titleId}"`);
  if (!STATUSES.includes(status)) {
    errors.push(`status must be one of ${STATUSES.join(" | ")}, got "${String(status)}"`);
  }
  if (!testedVersion) errors.push("missing required frontmatter field: testedVersion");
  if (!testedDate) errors.push("missing required frontmatter field: testedDate");
  if (testedDate && !/^\d{4}-\d{2}-\d{2}$/.test(testedDate)) {
    errors.push(`testedDate must be YYYY-MM-DD, got "${testedDate}"`);
  }
  if (!os) errors.push("missing required frontmatter field: os (windows | linux | macos)");
  else if (!PLATFORMS.includes(os)) {
    errors.push(`os must be windows | linux | macos, got "${String(os)}"`);
  }
  if (score !== undefined && (score < 1 || score > 5)) errors.push("score must be 1–5");

  if (errors.length) throw new Error(`${slug}: ${errors.join("; ")}`);

  return {
    slug,
    title,
    titleId,
    status,
    testedVersion,
    testedDate,
    os: os,
    hardware,
    score,
    gameVersion,
    screenshot,
    screenshotVerified,
    screenshots,
    notes: body,
    source,
  };
}

/** Canonical game-page key: uppercase, dash-stripped title ID. */
export function siteGameKey(titleId) {
  return String(titleId ?? "").replace(/-/g, "").toUpperCase();
}

/**
 * Build the site's slim compatibility index — mirrors src/lib/compat.ts's
 * buildGameIndex (games from src/data/games.json merged with their reports,
 * matched by any region variant; report-only games appended) and precomputes
 * every aggregate the pages render:
 *
 *   overall      best across per-OS majorities (the "Any" status)
 *   os           per-OS status (present = tested on that OS)
 *   reportCounts per-OS report counts (row "N reports" text)
 *   latestTested newest testedDate across the game's reports
 *   screenshots  reports carrying a screenshot (homepage carousel)
 *
 * Entries with no reports are dropped — the compatibility page hides untested
 * titles, so the index only carries tested games. Each entry ALSO keeps the
 * full `reports` list for the per-game detail files (the CLI strips it from
 * the slim payload).
 */
export function buildSiteIndex(games, reports) {
  const norm = siteGameKey;
  const byId = new Map();
  for (const r of reports) {
    const key = norm(r.titleId);
    if (!key) continue;
    const list = byId.get(key);
    if (list) list.push(r);
    else byId.set(key, [r]);
  }

  const consumed = new Set();
  const entries = (games ?? []).map((g) => {
    const ids = new Set((g.allTitleIds ?? []).map(norm));
    const gameReports = [];
    for (const id of ids) {
      if (consumed.has(id)) continue;
      const found = byId.get(id);
      if (found) {
        gameReports.push(...found);
        consumed.add(id);
      }
    }
    return {
      key: norm(g.titleId),
      title: g.name,
      titleId: g.titleId,
      cover: g.cover,
      reports: gameReports,
    };
  });

  // Reports whose title ID isn't in the database yet — keep them visible.
  for (const [id, list] of byId) {
    if (consumed.has(id)) continue;
    entries.push({ key: id, title: list[0].title, titleId: list[0].titleId, reports: list });
  }

  return entries
    .filter((e) => e.reports.length > 0) // untested titles aren't listed
    .map((e) => {
      const sorted = e.reports.slice().sort((a, b) => (a.testedDate < b.testedDate ? 1 : -1));
      const os = {};
      const reportCounts = {};
      for (const osName of PLATFORMS) {
        const onOs = sorted.filter((r) => r.os === osName);
        if (onOs.length > 0) {
          os[osName] = aggregateStatuses(onOs.map((r) => r.status));
          reportCounts[osName] = onOs.length;
        }
      }
      const screenshots = sorted
        .filter((r) => r.screenshot)
        .map((r) => ({ title: r.title, screenshot: r.screenshot, testedDate: r.testedDate }));
      return {
        key: e.key,
        title: e.title,
        titleId: e.titleId,
        cover: e.cover,
        overall: bestStatuses(sorted),
        os,
        reportCounts,
        // Reports are already sorted newest-first, so the first one is the latest.
        latestTested: sorted[0]?.testedDate,
        screenshots: screenshots.length > 0 ? screenshots : undefined,
        reports: sorted,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
