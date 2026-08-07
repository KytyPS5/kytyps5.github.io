/**
 * Compatibility database — mirrors 's `src/lib/compat.ts`.
 * One Markdown report per tested game lives in `src/content/compat/` with
 * frontmatter matching `CompatFrontmatter` below. Reports are parsed at build
 * time (no runtime API calls); the build fails on invalid reports
 * (see `scripts/validate-compat.mjs`).
 *
 * A game may have MULTIPLE reports (one per community submission). The
 * displayed status is the majority vote across its reports
 * (see `aggregateStatus`), with ties broken toward the better status.
 */

export const STATUSES = [
  "nothing",
  "boots",
  "menus",
  "ingame",
  "playable-low-fps",
  "playable",
] as const;
export type Status = (typeof STATUSES)[number];
export type DisplayStatus = Status | "untested";

/** Title IDs look like PPSA12345 (dash optional). Mirrors 's regex. */
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
  os?: "windows" | "linux" | "macos";
  hardware?: string;
  /** Optional 1–5 score. */
  score?: number;
  /** Optional tested game version (e.g. "1.004"). */
  gameVersion?: string;
  /** Optional screenshot URL shown on the homepage carousel. */
  screenshot?: string;
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
 * Status ladder colors (matches the emulator-community convention):
 *   grey    — not tested          blue    — reaches gameplay with major issues
 *   red     — crashes/no output   cyan    — playable at low/unstable FPS
 *   orange  — splash/intro only   green   — completable, minor or no issues
 *   yellow  — reaches menus
 */
export const STATUS_META: Record<DisplayStatus, { label: string; color: string; description: string }> = {
  nothing: {
    label: "Nothing",
    color: "#f87171",
    description: "Crashes or shows no output.",
  },
  boots: {
    label: "Boots",
    color: "#fb923c",
    description: "Shows splash or intro output, no further.",
  },
  menus: {
    label: "Menus",
    color: "#facc15",
    description: "Reaches interactive menus.",
  },
  ingame: {
    label: "Ingame",
    color: "#60a5fa",
    description: "Reaches gameplay with major issues.",
  },
  "playable-low-fps": {
    label: "Playable (low FPS)",
    color: "#22d3ee",
    description: "Playable, but at a low or unstable framerate.",
  },
  playable: {
    label: "Playable",
    color: "#4ade80",
    description: "Completable with minor or no issues.",
  },
  untested: {
    label: "Not tested",
    color: "#7b8496",
    description: "No compatibility report yet.",
  },
};

/** A game's displayed status: its reports' majority vote, or `untested`. */
export function displayStatus(reports: readonly Pick<CompatReport, "status">[]): DisplayStatus {
  return reports.length > 0 ? aggregateStatus(reports) : "untested";
}

export type Os = "windows" | "linux" | "macos";

/** Reports that apply within an OS scope (`"all"` = every report). */
export function reportsForOs(reports: readonly CompatReport[], os: Os | "all"): CompatReport[] {
  return os === "all" ? (reports as CompatReport[]) : reports.filter((r) => r.os === os);
}

/**
 * A game's status within an OS scope: the majority vote of that OS's reports,
 * or `untested` when no report exists for that OS. This is what makes
 * OS + status filter combinations behave predictably.
 */
export function displayStatusForOs(reports: readonly CompatReport[], os: Os | "all"): DisplayStatus {
  const scoped = reportsForOs(reports, os);
  return scoped.length > 0 ? aggregateStatus(scoped) : "untested";
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
 * OS scope, so e.g. `ingame` + `linux` only matches games with a Linux report
 * voting ingame — a game whose only ingame report is OS-less (or Windows) does
 * not match. Pure + testable; the page only renders the result.
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
 * filter-pill counts). A game is "tested" only when it has a report for that
 * OS; everything else counts as not tested there.
 */
export function indexStatsForOs(
  index: readonly GameIndexEntry[],
  os: Os | "all" = "all",
): { total: number; tested: number; untested: number; counts: Record<Status, number> } {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  let tested = 0;
  for (const entry of index) {
    const scoped = reportsForOs(entry.reports, os);
    if (scoped.length === 0) continue;
    tested += 1;
    counts[aggregateStatus(scoped)] += 1;
  }
  return { total: index.length, tested, untested: index.length - tested, counts };
}

/**
 * Decide a game's displayed status from its reports — the MAJORITY vote,
 * with ties broken toward the better status (higher on the ladder). This is
 * the rule the user asked for: status should reflect what most people submit.
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

/** Extract a `> Source: [label](url)` or `> Source: label` line from the body. */
export function extractSource(raw: string): { source?: ReportSource; body: string } {
  const lines = raw.split(/\r?\n/);
  const sourceLine = lines.findIndex((l) => /^>\s*Source:/.test(l));
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
  if (os && !["windows", "linux", "macos"].includes(os)) {
    errors.push(`os must be windows | linux | macos, got "${os}"`);
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
    os,
    hardware,
    score,
    gameVersion,
    screenshot,
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
