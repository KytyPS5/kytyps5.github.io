/**
 * Compatibility database — the source of truth for report parsing, status
 * One Markdown report per tested game lives in `src/content/compat/` with
 * frontmatter matching `CompatFrontmatter` below. Reports are parsed at build
 * time (no runtime API calls); the build fails on invalid reports
 * (see `scripts/validate-compat.mjs`).
 *
 * A game has one report per (game, OS), set from a verified compatibility
 * issue via the conversion workflow (issue template → maintainer verification
 * → merged PR). A game's status on "Any" is the BEST result across its per-OS
 * tests; within an OS it is that OS's report status
 * (see `displayStatus` / `aggregateStatus`).
 */

export const STATUSES = ["nothing", "boots", "playable", "perfect"] as const;
export type Status = (typeof STATUSES)[number];
export type DisplayStatus = Status | "untested";

export const OSES = ["windows", "linux", "macos"] as const;
export type Os = (typeof OSES)[number];

/** Title IDs look like PPSA12345 (dash optional). */
export const TITLE_ID_REGEX = /^PPSA-?\d{5}$/i;

/** Frontmatter schema for a compatibility report. */
export interface CompatFrontmatter {
  /** Human-readable game title. */
  title: string;
  /** PS5 title ID (PPSA-XXXXX) — required. */
  titleId: string;
  status: Status;
  /** KytyPS5 build the game was tested on (commit or release). */
  testedVersion: string;
  testedDate: string;
  /** OS this test ran on — required: every stored game has one report per OS. */
  os: Os;
  hardware?: string;
  /** Optional 1–5 score. */
  score?: number;
  /** Optional tested game version (e.g. "1.004"). */
  gameVersion?: string;
  /** Optional screenshot shown on the homepage carousel — a path relative to
      public/screenshots/ (e.g. "screenshots/ps5-01.png") or an absolute URL. */
  screenshot?: string;
  /**
   * True when a maintainer attached the screenshot via /getss to a report
   * that already carries a community status. A screenshot NEVER implies a
   * status by itself — the validator requires this flag (plus a linked
   * community source) on any report with a screenshot, so the old
   * "inferred from screenshots" reports can't come back.
   */
  screenshotVerified?: boolean;
}

/** Provenance of a report — issue link when community-filed. */
export interface ReportSource {
  label: string;
  url?: string;
}

export interface CompatReport extends CompatFrontmatter {
  slug: string;
  /** Markdown body after the frontmatter (source line stripped). */
  notes: string;
  /** Where the report came from (issue link, repository screenshots, …). */
  source?: ReportSource;
}

/** Canonical per-game page key: title ID when known, else the report slug. */
export function gamePageKey(report: Pick<CompatReport, "titleId" | "slug">, game?: { titleId?: string }): string {
  return game?.titleId ?? report.titleId ?? report.slug;
}

/**
 * Status ladder (4 tiers) with the community-convention colors:
 *   grey   — Nothing:  doesn't boot, or boots to a black screen
 *   red    — Boots:    splash screen or main menu, then crashes
 *   orange — Playable: mostly playable with graphical/audio issues, random
 *                      crashes and/or low frame rates
 *   green  — Perfect:  plays start to finish with no issues
 */
export const STATUS_META: Record<DisplayStatus, { label: string; color: string; description: string }> = {
  nothing: {
    label: "Nothing",
    color: "#9ca3af",
    description: "Game doesn't boot or only boots to a black screen.",
  },
  boots: {
    label: "Boots",
    color: "#f87171",
    description: "Game boots to either a Splash Screen or Main Menu then crashes.",
  },
  playable: {
    label: "Playable",
    color: "#fb923c",
    description: "Mostly playable with graphical/audio issues, random crashes and/or low frame rates.",
  },
  perfect: {
    label: "Perfect",
    color: "#4ade80",
    description: "Game plays from start to finish with no issues.",
  },
  untested: {
    label: "Not tested",
    color: "#64748b",
    description: "No compatibility report yet.",
  },
};

type OsReport = Pick<CompatReport, "status" | "os">;

/** Reports that apply within an OS scope (`"all"` = every report). */
export function reportsForOs(reports: readonly OsReport[], os: Os | "all"): readonly OsReport[] {
  return os === "all" ? reports : reports.filter((r) => r.os === os);
}

/** Group reports by OS for per-OS aggregation (unknown OS gets its own bucket). */
function groupByOs(reports: readonly OsReport[]): Map<string, OsReport[]> {
  const groups = new Map<string, OsReport[]>();
  for (const r of reports) {
    const key = r.os ?? "unknown";
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  }
  return groups;
}

/**
 * A game's status on "Any": the BEST result across its per-OS tests (each
 * OS's reports aggregate first — one verified report per OS). A game that is
 * playable on Windows but only boots on macOS shows Playable overall — the
 * best of any test done.
 */
export function displayStatus(reports: readonly OsReport[]): DisplayStatus {
  let best: Status | null = null;
  for (const group of groupByOs(reports).values()) {
    const status = aggregateStatus(group);
    if (best === null || STATUSES.indexOf(status) > STATUSES.indexOf(best)) best = status;
  }
  return best ?? "untested";
}

/**
 * A game's status within an OS scope: "all" = best across tested OSes (same
 * as `displayStatus`); a specific OS = that OS's report status, or `untested`
 * when none exist. This is what makes OS + status filter combinations behave
 * predictably.
 */
export function displayStatusForOs(reports: readonly OsReport[], os: Os | "all"): DisplayStatus {
  if (os === "all") return displayStatus(reports);
  const scoped = reportsForOs(reports, os);
  return scoped.length > 0 ? aggregateStatus(scoped) : "untested";
}

/** Per-OS status breakdown for a game (drives the game page's OS slots). */
export function perOsStatuses(reports: readonly OsReport[]): Record<Os, DisplayStatus> {
  return {
    windows: displayStatusForOs(reports, "windows"),
    linux: displayStatusForOs(reports, "linux"),
    macos: displayStatusForOs(reports, "macos"),
  };
}

/** One row of the full compatibility index (a database game + its reports). */
export interface GameIndexEntry {
  /** Canonical route key (the game's title ID, else the report's). */
  key: string;
  /** Display name (database name, else the report's title). */
  title: string;
  titleId?: string;
  cover?: string;
  reports: CompatReport[];
}

/**
 * Build the full compatibility index: EVERY game in the database merged with
 * its reports (matched by title ID, any region variant). Games with reports
 * come first; everything else is "not tested". Pure + testable — the page only
 * renders the result, and nothing here is hardcoded.
 */
export function buildGameIndex(
  games: ReadonlyArray<{ titleId: string; allTitleIds: string[]; name: string; cover?: string }>,
  reports: readonly CompatReport[],
): GameIndexEntry[] {
  const norm = (s: string) => s.replace(/-/g, "").toUpperCase();
  const byId = new Map<string, CompatReport[]>();
  for (const r of reports) {
    const key = norm(r.titleId);
    const list = byId.get(key);
    if (list) list.push(r);
    else byId.set(key, [r]);
  }

  const consumed = new Set<string>();
  const entries: GameIndexEntry[] = games.map((g) => {
    const ids = new Set(g.allTitleIds.map(norm));
    const gameReports: CompatReport[] = [];
    for (const id of ids) {
      if (consumed.has(id)) continue; // never attribute a report to two games
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
    .map((e) => ({ ...e, reports: e.reports.slice().sort((a, b) => (a.testedDate < b.testedDate ? 1 : -1)) }))
    .sort(
      (a, b) =>
        (a.reports.length === 0 ? 1 : 0) - (b.reports.length === 0 ? 1 : 0) ||
        a.title.localeCompare(b.title),
    );
}

/** Aggregate a list of statuses into per-status counts. */
export function computeStats(statuses: readonly Status[]) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const s of statuses) counts[s] += 1;
  return { tested: statuses.length, counts };
}

export interface IndexFilters {
  status?: "all" | DisplayStatus;
  os?: Os | "all";
  query?: string;
}

/**
 * Filter the compatibility index. Status is always evaluated inside the active
 * OS scope, so e.g. `playable` + `linux` only matches games with a Linux
 * report voting playable — a game whose only playable report is OS-less (or
 * Windows) does not match. Pure + testable; the page only renders the result.
 */
export function filterGameIndex(
  index: readonly GameIndexEntry[],
  { status = "all", os = "all", query = "" }: IndexFilters = {},
): GameIndexEntry[] {
  const q = query.trim().toLowerCase();
  return index.filter((entry) => {
    // The OS selection scopes STATUS evaluation — it never drops games itself.
    // That keeps `untested` + an OS meaningful (games with no report on that
    // OS) and makes every pill count match what clicking it would show.
    const scoped = displayStatusForOs(entry.reports, os);
    if (status === "untested" && scoped !== "untested") return false;
    if (status !== "all" && status !== "untested" && scoped !== status) return false;
    if (q && !entry.title.toLowerCase().includes(q) && !(entry.titleId ?? entry.key).toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

/**
 * Aggregate index stats within an OS scope (powers the stats strip and the
 * filter-pill counts). "Any" counts a game's best-across-OS status; a specific
 * OS counts that OS's report status. A game is "tested" only when it has a
 * report for that OS; everything else counts as not tested there.
 */
export function indexStatsForOs(
  index: readonly GameIndexEntry[],
  os: Os | "all" = "all",
): { total: number; tested: number; untested: number; counts: Record<Status, number> } {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  let tested = 0;
  for (const entry of index) {
    const status = displayStatusForOs(entry.reports, os);
    if (status === "untested") continue;
    tested += 1;
    counts[status] += 1;
  }
  return { total: index.length, tested, untested: index.length - tested, counts };
}

/**
 * Aggregate a game's reports within one OS scope — the majority vote, with
 * ties broken toward the better status (higher on the ladder). The intake
 * pipeline keeps one verified report per (game, OS), so in practice this is
 * simply the verified report's status; the majority rule is a safe fallback
 * if multiple reports ever coexist.
 */
export function aggregateStatus(reports: readonly Pick<CompatReport, "status">[]): Status {
  if (reports.length === 0) return STATUSES[0];
  const counts = new Map<Status, number>();
  for (const r of reports) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  let best: Status = reports[0].status;
  let bestCount = 0;
  let bestRank = -1;
  for (const [status, count] of counts) {
    const rank = STATUSES.indexOf(status);
    // More votes wins; on a tie the better status wins.
    if (count > bestCount || (count === bestCount && rank > bestRank)) {
      best = status;
      bestCount = count;
      bestRank = rank;
    }
  }
  return best;
}

/**
 * Group reports by game (normalized title ID). Community reports for the same
 * game share a title ID, so a game's card can show the aggregated status and
 * the game page can list every submission.
 */
export function groupReportsByGame(reports: readonly CompatReport[]): Map<string, CompatReport[]> {
  const groups = new Map<string, CompatReport[]>();
  for (const report of reports) {
    // titleId is required, so every report has a group key.
    const key = report.titleId.replace(/-/g, "").toUpperCase();
    const list = groups.get(key) ?? [];
    list.push(report);
    groups.set(key, list);
  }
  return groups;
}

/* ---------- Tiny frontmatter parser (no runtime deps, build-time only) ---------- */

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value: unknown = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^\d+$/.test(String(value))) value = Number(value);
    data[key] = value;
  }
  return { data, body: match[2].trim() };
}

/**
 * Extract a `> Source: [label](url)` or `> Source: label` line from the body.
 * The LAST such line wins: the report converter always appends the real source
 * at the end, so a `> Source:` blockquote typed inside a report's notes (e.g.
 * an "Extra notes" section quoting its own source) must not be mistaken for
 * the report's provenance.
 */
export function extractSource(raw: string): { source?: ReportSource; body: string } {
  const lines = raw.split(/\r?\n/);
  let sourceLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^>\s*Source:/.test(lines[i])) sourceLine = i;
  }
  if (sourceLine === -1) return { body: raw };
  const text = lines[sourceLine].replace(/^>\s*Source:\s*/i, "").trim();
  const link = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  const source: ReportSource = link
    ? { label: link[1], url: link[2] }
    : { label: text };
  const body = lines.filter((_, idx) => idx !== sourceLine).join("\n").trim();
  return { source, body };
}

/** Validate and normalize a raw report file. Throws with a readable message. */
export function parseCompatReport(raw: string, slug: string): CompatReport {
  const { data, body: rawBody } = parseFrontmatter(raw);
  const { source, body } = extractSource(rawBody);

  const errors: string[] = [];
  const title = typeof data.title === "string" && data.title.trim() ? data.title : "";
  const status = data.status as Status;
  const testedVersion = typeof data.testedVersion === "string" ? data.testedVersion : "";
  const testedDate = typeof data.testedDate === "string" ? data.testedDate : "";
  const titleId = typeof data.titleId === "string" && data.titleId.trim() ? data.titleId : "";
  const os = data.os as CompatFrontmatter["os"] | undefined;
  const hardware = typeof data.hardware === "string" ? data.hardware : undefined;
  const score = typeof data.score === "number" ? data.score : undefined;
  const gameVersion =
    typeof data.gameVersion === "string" && data.gameVersion.trim() ? data.gameVersion : undefined;
  const screenshot =
    typeof data.screenshot === "string" && data.screenshot.trim() ? data.screenshot : undefined;
  const screenshotVerified =
    typeof data.screenshotVerified === "boolean" ? data.screenshotVerified : undefined;

  if (!title) errors.push("missing required frontmatter field: title");
  if (!titleId) errors.push("missing required frontmatter field: titleId");
  else if (!TITLE_ID_REGEX.test(titleId)) errors.push(`titleId must look like PPSA-XXXXX, got "${titleId}"`);
  if (!STATUSES.includes(status)) {
    errors.push(`status must be one of ${STATUSES.join(" | ")}, got "${String(status)}"`);
  }
  if (!testedVersion) errors.push("missing required frontmatter field: testedVersion");
  if (!testedDate) errors.push("missing required frontmatter field: testedDate");
  if (testedDate && !/^\d{4}-\d{2}-\d{2}$/.test(testedDate)) {
    errors.push(`testedDate must be YYYY-MM-DD, got "${testedDate}"`);
  }
  if (!os) errors.push("missing required frontmatter field: os (windows | linux | macos)");
  else if (!OSES.includes(os as Os)) {
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
    os: os as Os,
    hardware,
    score,
    gameVersion,
    screenshot,
    screenshotVerified,
    notes: body,
    source,
  };
}

/* ---------- Loader (Vite glob over the content folder, build-time) ---------- */

const modules = import.meta.glob("../content/compat/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * Reports baked into the bundle at build time — the first-paint seed. The site
 * ALSO fetches the generated public/data/compat.json at runtime (see
 * `loadCompatReports` below), so a report merged through deploy.yml's
 * content-only path goes live without a full rebuild.
 */
export const COMPAT_REPORTS: CompatReport[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    try {
      return parseCompatReport(raw as string, slug);
    } catch (error) {
      // Fatal at build time (see scripts/validate-compat.mjs); surface in dev too.
      console.error(`[compat] ${(error as Error).message}`);
      return null;
    }
  })
  .filter((r): r is CompatReport => r !== null)
  .sort((a, b) => a.title.localeCompare(b.title));

/* ---------- Runtime refresh (fetch the generated compat JSON) ---------- */

/** Shape of public/data/compat.json (written by scripts/export-site-compat-json.mjs). */
interface CompatJsonPayload {
  version: number;
  reports: { slug: string; raw: string }[];
}

let compatJsonPromise: Promise<CompatReport[]> | null = null;

/**
 * Parse a compat.json payload (raw markdown per report) with the same parser
 * as the bundle — one source of truth. Invalid entries are skipped and logged,
 * and the result is sorted by title like COMPAT_REPORTS. Pure, so it's
 * unit-tested in compat.test.ts.
 */
export function parseCompatPayload(payload: CompatJsonPayload | null | undefined): CompatReport[] {
  if (!payload?.reports?.length) return [];
  const parsed: CompatReport[] = [];
  for (const { slug, raw } of payload.reports) {
    try {
      parsed.push(parseCompatReport(raw, slug));
    } catch (error) {
      console.error(`[compat] ${(error as Error).message}`);
    }
  }
  return parsed.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Fetch the deployed compat JSON once (module-level cache, like loadGames).
 * The raw markdown is parsed with the SAME parser as the bundle, so there is a
 * single source of truth. Resolves to [] when the file is missing (dev without
 * a build, content-only deploys before prebuild) — callers keep the bundled
 * COMPAT_REPORTS seed in that case.
 */
export function loadCompatReports(): Promise<CompatReport[]> {
  if (!compatJsonPromise) {
    compatJsonPromise = fetch(`${import.meta.env.BASE_URL}data/compat.json`)
      .then((res) => (res.ok ? (res.json() as Promise<CompatJsonPayload>) : null))
      .then(parseCompatPayload)
      .catch(() => []);
  }
  return compatJsonPromise;
}
