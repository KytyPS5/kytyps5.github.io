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

/** Mirrors 's STATUS_META (labels, colors, descriptions). */
export const STATUS_META: Record<DisplayStatus, { label: string; color: string; description: string }> = {
  nothing: {
    label: "Nothing",
    color: "#f87171",
    description: "Crashes or shows no output.",
  },
  boots: {
    label: "Boots",
    color: "#fbbf24",
    description: "Shows splash or intro output, no further.",
  },
  menus: {
    label: "Menus",
    color: "#5b8cff",
    description: "Reaches interactive menus.",
  },
  ingame: {
    label: "Ingame",
    color: "#4fa3ff",
    description: "Reaches gameplay with major issues.",
  },
  "playable-low-fps": {
    label: "Playable (low FPS)",
    color: "#34d399",
    description: "Playable, but at a low or unstable framerate.",
  },
  playable: {
    label: "Playable",
    color: "#2dd4bf",
    description: "Completable with minor or no issues.",
  },
  untested: {
    label: "Not tested",
    color: "#7b8496",
    description: "No compatibility report yet.",
  },
};

/** Aggregate a list of statuses into per-status counts. */
export function computeStats(statuses: readonly Status[]) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const s of statuses) counts[s] += 1;
  return { tested: statuses.length, counts };
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
