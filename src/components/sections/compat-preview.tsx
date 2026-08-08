import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  STATUSES,
  STATUS_META,
  computeStats,
  displayStatus,
  groupReportsByGame,
  type Status,
} from "@/lib/compat";
import { useCompatReports } from "@/hooks/use-compat-reports";
import { Reveal } from "@/components/layout/reveal";

export function CompatPreview() {
  // One game per entry — status is the best result across its per-OS tests.
  // Groups always hold ≥1 report, so the per-game status is never "untested".
  // Reports start as the bundle seed and refresh from the runtime JSON.
  const { reports } = useCompatReports();
  const stats = computeStats(
    [...groupReportsByGame(reports).values()]
      .map((group) => displayStatus(group))
      .filter((s): s is Status => s !== "untested"),
  );
  const segments = STATUSES.map((status) => ({
    status,
    count: stats.counts[status],
    width: stats.tested > 0 ? (stats.counts[status] / stats.tested) * 100 : 0,
  }));

  return (
    <Reveal from="left">
      <div className="rounded-panel border border-border bg-surface p-8 shadow-card sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Compatibility</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {stats.tested} game{stats.tested === 1 ? "" : "s"} tested so far
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
              Community-tracked statuses, from nothing to perfect — with a report behind every
              entry.
            </p>
          </div>
          <Link
            to="/compatibility"
            className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Browse compatibility
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Segmented status bar */}
        <div
          className="mt-7 flex h-2.5 w-full overflow-hidden rounded-full bg-elevated"
          role="img"
          aria-label={`${stats.tested} tested games: ${segments
            .map((s) => `${s.count} ${STATUS_META[s.status].label}`)
            .join(", ")}`}
        >
          {segments.map(
            (s) =>
              s.count > 0 && (
                <div
                  key={s.status}
                  style={{ width: `${s.width}%`, backgroundColor: STATUS_META[s.status].color }}
                  className="transition-all duration-500"
                />
              ),
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {segments.map((s) => (
            <span key={s.status} className="flex items-center gap-2 text-xs text-text-secondary">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: STATUS_META[s.status].color }}
                aria-hidden="true"
              />
              {STATUS_META[s.status].label} · {s.count}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
