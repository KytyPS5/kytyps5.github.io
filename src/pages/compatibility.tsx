import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Gamepad2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE } from "@/config";
import { Seo } from "@/lib/seo";
import {
  COMPAT_REPORTS,
  STATUSES,
  STATUS_META,
  aggregateStatus,
  buildGameIndex,
  displayStatus,
  type DisplayStatus,
} from "@/lib/compat";
import { loadGames, type Game } from "@/lib/games";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { StatusBadge } from "@/components/compat/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 300;

const OSES = ["windows", "linux", "macos"] as const;

export function CompatibilityPage() {
  const [statusFilter, setStatusFilter] = React.useState<"all" | DisplayStatus>("all");
  const [osFilter, setOsFilter] = React.useState<string>("all");
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

  // Full index: every game in the database + its reports (majority vote).
  // Nothing here is hardcoded — reports come from src/content/compat/*.md and
  // the game list from src/data/games.json (andshrew/PlayStation-Titles).
  const index = React.useMemo(
    () => (games ? buildGameIndex(games, COMPAT_REPORTS) : []),
    [games],
  );

  const stats = React.useMemo(() => {
    const tested = index.filter((e) => e.reports.length > 0);
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<(typeof STATUSES)[number], number>;
    for (const e of tested) counts[aggregateStatus(e.reports)] += 1;
    return {
      total: index.length,
      tested: tested.length,
      untested: index.length - tested.length,
      counts,
    };
  }, [index]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return index.filter((e) => {
      const status = displayStatus(e.reports);
      if (statusFilter === "untested" && status !== "untested") return false;
      if (statusFilter !== "all" && statusFilter !== "untested" && status !== statusFilter) return false;
      if (osFilter !== "all" && !e.reports.some((r) => r.os === osFilter)) return false;
      if (q) {
        if (!e.title.toLowerCase().includes(q) && !(e.titleId ?? e.key).toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [index, statusFilter, osFilter, query]);

  // Reset pagination whenever the filters change.
  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [statusFilter, osFilter, query]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <Seo
        title="Compatibility"
        description="Community-tracked game compatibility for KytyPS5 — every PS5 title, with statuses from not tested to playable."
        path="/compatibility"
      />
      <PageHeader
        eyebrow="Compatibility"
        title="Game compatibility"
        description="Every game in the database, from the same title list the emulator community uses. Tested games show the majority vote of their reports; everything else is not tested."
      />

      {games === null ? (
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
          className="grid grid-cols-3 gap-px overflow-hidden rounded-panel border border-border bg-border shadow-card sm:grid-cols-5 lg:grid-cols-9"
        >
          <div className="flex flex-col items-center gap-1 bg-surface px-4 py-5">
            <span className="font-display text-2xl font-semibold tabular-nums text-text-primary">
              {stats.total.toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-wider text-text-muted">Total games</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-surface px-4 py-5">
            <span className="font-display text-2xl font-semibold tabular-nums text-text-primary">
              {stats.tested}
            </span>
            <span className="text-xs uppercase tracking-wider text-text-muted">Tested</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-surface px-4 py-5">
            <span className="font-display text-2xl font-semibold tabular-nums" style={{ color: STATUS_META.untested.color }}>
              {stats.untested.toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-wider text-text-muted">Not tested</span>
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
          {([...STATUSES, "untested"] as const).map((status) => (
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
            <button
              type="button"
              onClick={() => setStatusFilter("untested")}
              aria-pressed={statusFilter === "untested"}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent",
                statusFilter === "untested"
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary",
              )}
            >
              Not tested ({stats.untested.toLocaleString()})
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
        {shown.length > 0 ? (
          <>
            <ul className="divide-y divide-border overflow-hidden rounded-panel border border-border bg-surface shadow-card">
              {shown.map((e) => {
                const status = displayStatus(e.reports);
                const tested = e.reports.length > 0;
                const oses = [...new Set(e.reports.flatMap((r) => (r.os ? [r.os] : [])))];
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
                        <span className="block truncate text-sm font-medium text-text-primary">
                          {e.title}
                        </span>
                        <span className="block font-mono text-xs text-text-muted">
                          {e.titleId ?? e.key}
                        </span>
                      </span>
                      {tested && oses.length > 0 && (
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
                            {e.reports.length} report{e.reports.length === 1 ? "" : "s"}
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
            {stats.tested} tested game{stats.tested === 1 ? "" : "s"} · statuses are the majority vote of
            community reports and reflect the build they were tested on. Untested titles are grey until a
            report lands.
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
