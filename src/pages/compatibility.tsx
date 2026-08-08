import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Gamepad2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@/config";
import { Seo } from "@/lib/seo";
import {
  STATUSES,
  STATUS_META,
  buildGameIndex,
  displayStatusForOs,
  filterGameIndex,
  indexStatsForOs,
  reportsForOs,
  type DisplayStatus,
  type Os,
} from "@/lib/compat";
import { loadGames, type Game } from "@/lib/games";
import { useCompatReports } from "@/hooks/use-compat-reports";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { StatusBadge } from "@/components/compat/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 300;

const OSES: Os[] = ["windows", "linux", "macos"];

export function CompatibilityPage() {
  const [statusFilter, setStatusFilter] = React.useState<"all" | DisplayStatus>("all");
  const [osFilter, setOsFilter] = React.useState<Os | "all">("all");
  const [query, setQuery] = React.useState("");
  const [visible, setVisible] = React.useState(PAGE_SIZE);

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

  // Full index: every game in the database + its verified reports.
  // Nothing here is hardcoded — reports come from src/content/compat/*.md and
  // the game list from src/data/games.json (andshrew/PlayStation-Titles).
  // Reports start as the build-time bundle and refresh from the runtime JSON.
  const { reports, loading: reportsLoading } = useCompatReports();
  const index = React.useMemo(
    () => (games ? buildGameIndex(games, reports) : []),
    [games, reports],
  );

  // Only tested games are listed — untested titles are hidden entirely instead
  // of showing up grey. With an OS filter active, only games with a report for
  // that OS are listed (a Windows-only game disappears under the Linux filter
  // instead of showing "Not tested").
  const visibleIndex = React.useMemo(
    () => index.filter((e) => displayStatusForOs(e.reports, osFilter) !== "untested"),
    [index, osFilter],
  );

  // Stats and filtering are evaluated inside the active OS scope: with an OS
  // selected, a game's status is scoped to THAT OS's reports only, so status +
  // OS combinations filter predictably.
  const stats = React.useMemo(() => indexStatsForOs(visibleIndex, osFilter), [visibleIndex, osFilter]);

  const filtered = React.useMemo(
    () => filterGameIndex(visibleIndex, { status: statusFilter, os: osFilter, query }),
    [visibleIndex, statusFilter, osFilter, query],
  );

  // Reset pagination whenever the filters change.
  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [statusFilter, osFilter, query]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <Seo
        title="Compatibility"
        description="Community-tracked game compatibility for KytyPS5 — tested games, from nothing to perfect."
        path="/compatibility"
      />
      <PageHeader
        eyebrow="Compatibility"
        title="Game compatibility"
        description="Tested games from the same title list the emulator community uses, showing the best result across their per-OS reports. Untested titles aren't listed until a report lands."
      />

      {games === null || reportsLoading ? (
        <Section className="!pt-4">
          <div
            className="flex min-h-[50vh] items-center justify-center"
            role="status"
            aria-label="Loading compatibility database"
          >
            <span className="size-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          </div>
        </Section>
      ) : (
        <>
          {/* Stats strip */}
          <Section className="!pt-4">
        <motion.div
          initial={{ opacity: 0, x: -56 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-px overflow-hidden rounded-panel border border-border bg-border shadow-card sm:grid-cols-5 lg:grid-cols-6"
        >
          <div className="flex flex-col items-center gap-1 bg-surface px-4 py-5">
            <span className="font-display text-2xl font-semibold tabular-nums text-text-primary">
              {stats.total.toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-wider text-text-muted">Tested games</span>
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
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => (
            <div key={status} className="flex items-start gap-3 rounded-card border border-border bg-surface p-4">
              <StatusBadge status={status} className="mt-0.5 shrink-0" />
              <p className="text-sm text-text-secondary">{STATUS_META[status].description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Full list */}
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
              All ({stats.total.toLocaleString()})
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
              {(["all", ...OSES] as const).map((os) => (
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
              {osFilter !== "all" && (
                <span className="ml-1 text-xs text-text-muted">
                  statuses below are for <span className="font-medium text-text-secondary">{osFilter}</span> reports only
                </span>
              )}
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
        {shown.length > 0 ? (
          <>
            <ul className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface shadow-card">
              {shown.map((e) => {
                // "Any" shows the best across tested OSes; with an OS filter
                // active the row status is that OS's report status (untested =
                // no report for that OS yet).
                const scoped = reportsForOs(e.reports, osFilter);
                const status = displayStatusForOs(e.reports, osFilter);
                const tested = scoped.length > 0;
                // OS pills follow the active filter: with "windows" selected a
                // game's row shows only its Windows reports — a linux/macos
                // pill would be noise under a Windows-only filter.
                const oses = [...new Set(scoped.flatMap((r) => (r.os ? [r.os] : [])))];
                return (
                  <li key={e.key}>
                    <Link
                      to={`/game/${e.key}`}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-accent sm:px-6"
                    >
                      {e.cover ? (
                        <img
                          src={e.cover}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="size-11 shrink-0 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-elevated font-display text-base font-semibold text-text-muted"
                        >
                          {e.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-sm font-medium"
                          style={{ color: STATUS_META[status].color }}
                        >
                          {e.title}
                        </span>
                        <span className="block font-mono text-xs text-text-muted">
                          {e.titleId ?? e.key}
                        </span>
                      </span>
                      {oses.length > 0 && (
                        <span className="hidden shrink-0 gap-1.5 sm:flex">
                          {oses.map((os) => (
                            <span
                              key={os}
                              className="rounded-full border border-border bg-elevated px-2 py-0.5 font-mono text-[11px] text-text-secondary"
                            >
                              {os}
                            </span>
                          ))}
                        </span>
                      )}
                      <span className="flex shrink-0 items-center gap-3">
                        {tested && (
                          <span className="hidden font-mono text-xs text-text-muted md:inline">
                            {scoped.length} report{scoped.length === 1 ? "" : "s"}
                          </span>
                        )}
                        <StatusBadge status={status} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-col items-center gap-4">
              <p className="text-sm text-text-muted">
                Showing {shown.length.toLocaleString()} of {filtered.length.toLocaleString()} game
                {filtered.length === 1 ? "" : "s"}
                {statusFilter === "all" && ` · ${stats.total.toLocaleString()} in the database`}
              </p>
              {filtered.length > visible && (
                <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  <Gamepad2 className="size-4" aria-hidden="true" />
                  Load more ({Math.min(PAGE_SIZE, filtered.length - visible).toLocaleString()} more)
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-panel border border-dashed border-border-strong bg-surface p-12 text-center">
            <p className="text-text-secondary">No games match your filters.</p>
          </div>
        )}

          <p className="mt-6 text-center text-sm text-text-muted">
            {stats.tested} tested game{stats.tested === 1 ? "" : "s"} · statuses are per operating system, and the
            overall badge is the best result across tested OSes. Untested titles aren't listed until
            a report lands.
          </p>
          </Section>
        </>
      )}

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
            through the template become per-OS database reports automatically: a maintainer
            verifies the issue and the report — with its status for that OS — is merged as a PR.
            The overall badge is the best result across tested OSes.
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
