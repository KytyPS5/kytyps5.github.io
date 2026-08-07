import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Search } from "lucide-react";
import { SITE } from "@/config";
import { Seo } from "@/lib/seo";
import {
  COMPAT_REPORTS,
  STATUSES,
  STATUS_META,
  aggregateStatus,
  computeStats,
  groupReportsByGame,
  type Status,
} from "@/lib/compat";
import { loadGames, type Game } from "@/lib/games";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { ReportCard } from "@/components/compat/report-card";
import { StatusBadge } from "@/components/compat/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Look up store metadata for a report — by title ID, then normalized name. */
function matchGame(games: Game[], report: (typeof COMPAT_REPORTS)[number]): Game | undefined {
  if (report.titleId) {
    const byId = games.find((g) => g.allTitleIds.includes(report.titleId!));
    if (byId) return byId;
  }
  const key = normalize(report.title);
  return games.find((g) => normalize(g.name) === key);
}

const OSES = ["windows", "linux", "macos"] as const;

export function CompatibilityPage() {
  const [statusFilter, setStatusFilter] = React.useState<Status | "all">("all");
  const [osFilter, setOsFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const [games, setGames] = React.useState<Game[] | null>(null);
  React.useEffect(() => {
    let alive = true;
    loadGames()
      .then((g) => alive && setGames(g))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // One entry per game: the group's status is the majority vote of its reports.
  // Within each group the newest report comes first, so card metadata (build,
  // date, OS) reflects the freshest submission.
  const groups = [...groupReportsByGame(COMPAT_REPORTS).values()]
    .map((group) => group.sort((a, b) => (a.testedDate < b.testedDate ? 1 : -1)))
    .sort((a, b) => a[0].title.localeCompare(b[0].title));
  const stats = computeStats(groups.map((group) => aggregateStatus(group)));

  const filtered = groups.filter((group) => {
    const status = aggregateStatus(group);
    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (osFilter !== "all" && !group.some((r) => r.os === osFilter)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !group[0].title.toLowerCase().includes(q) &&
        !(group[0].titleId ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <Seo
        title="Compatibility"
        description="Community-tracked game compatibility for KytyPS5 — statuses from nothing to playable, with per-game test reports."
        path="/compatibility"
      />
      <PageHeader
        eyebrow="Compatibility"
        title="Game compatibility"
        description="Community-tracked reports for tested games, following the same status ladder the emulator community uses: nothing → boots → menus → ingame → playable (low FPS) → playable. A game's status is the majority vote of its reports."
      />

      {/* Stats strip */}
      <Section className="!pt-4">
        <motion.div
          initial={{ opacity: 0, x: -56 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-px overflow-hidden rounded-panel border border-border bg-border shadow-card sm:grid-cols-4 lg:grid-cols-7"
        >
          <div className="flex flex-col items-center gap-1 bg-surface px-4 py-5">
            <span className="font-display text-2xl font-semibold tabular-nums text-text-primary">
              {stats.tested}
            </span>
            <span className="text-xs uppercase tracking-wider text-text-muted">Tested</span>
          </div>
          {STATUSES.map((status) => (
            <div key={status} className="flex flex-col items-center gap-1 bg-surface px-4 py-5">
              <span
                className="font-display text-2xl font-semibold tabular-nums"
                style={{ color: STATUS_META[status].color }}
              >
                {stats.counts[status]}
              </span>
              <span className="text-xs uppercase tracking-wider text-text-muted">
                {STATUS_META[status].label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Legend */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATUSES.map((status) => (
            <div key={status} className="flex items-start gap-3 rounded-card border border-border bg-surface p-4">
              <StatusBadge status={status} className="mt-0.5 shrink-0" />
              <p className="text-sm text-text-secondary">{STATUS_META[status].description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Reports */}
      <Section className="bg-surface/40">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              aria-pressed={statusFilter === "all"}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent",
                statusFilter === "all"
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
              )}
            >
              All ({stats.tested})
            </button>
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent",
                  statusFilter === status
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
                )}
              >
                {STATUS_META[status].label} ({stats.counts[status]})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">OS</span>
              {["all", ...OSES].map((os) => (
                <button
                  key={os}
                  type="button"
                  onClick={() => setOsFilter(os)}
                  aria-pressed={osFilter === os}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent",
                    osFilter === os
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
                  )}
                >
                  {os === "all" ? "Any" : os}
                </button>
              ))}
            </div>
            <label className="relative block sm:w-72">
              <span className="sr-only">Search games</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search games…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </label>
          </div>
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((group, i) => (
              <motion.div
                key={group[0].titleId}
                initial={{ opacity: 0, x: i % 2 === 0 ? -48 : 48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ReportCard
                  report={group[0]}
                  game={games ? matchGame(games, group[0]) : undefined}
                  status={aggregateStatus(group)}
                  reportCount={group.length}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-panel border border-dashed border-border-strong bg-surface p-12 text-center">
            <p className="text-text-secondary">No reports match your filters.</p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          {stats.tested} tested game{stats.tested === 1 ? "" : "s"} · statuses are the majority vote of
          community reports and reflect the build they were tested on.
        </p>
      </Section>

      {/* Submit a report */}
      <Section
        eyebrow="Submit"
        title="Tested a game? File a report"
        description="Reports start as GitHub issues through the compatibility template — a maintainer converts verified submissions into the database, and every report links back to its source issue."
        className="bg-surface/40"
      >
        <div className="flex flex-col items-center gap-5 rounded-window border border-border bg-surface p-10 text-center sm:p-14">
          <span className="grid size-12 place-items-center rounded-control bg-iris text-white shadow-glow-soft">
            <FileText className="size-6" aria-hidden="true" />
          </span>
          <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            The template asks for everything we need
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            Title ID, status, KytyPS5 build, OS, hardware and what works or breaks. Issues filed
            through the template convert into database reports automatically — a game's status
            stays the majority vote of the reports behind it.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <a
                href={`${SITE.reportRepoUrl}/issues/new?template=compatibility_report.yml`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <FileText className="size-5" aria-hidden="true" />
                File a compatibility report
              </a>
            </Button>
            <a
              href={`${SITE.reportRepoUrl}/issues?q=is%3Aissue%20label%3Acompat-report`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Open reports
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
