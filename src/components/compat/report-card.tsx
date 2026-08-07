import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { gamePageKey, type CompatReport } from "@/lib/compat";
import type { Game } from "@/lib/games";
import { markdownToText } from "@/lib/markdown";
import { StatusBadge } from "@/components/compat/status-badge";

function Meta({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <span className="text-xs text-text-muted">
      {label} <span className="text-text-secondary">{value}</span>
    </span>
  );
}

export function ReportCard({
  report,
  game,
  status,
  reportCount,
}: {
  report: CompatReport;
  game?: Game;
  /** Displayed (aggregated) status — defaults to the report's own. */
  status?: CompatReport["status"];
  /** Number of reports behind this entry (shows on cards when > 1). */
  reportCount?: number;
}) {
  const title = game?.name ?? report.title;
  const cover = game?.cover;
  const to = `/game/${gamePageKey(report, game)}`;
  const badge = status ?? report.status;

  return (
    <article className="group flex h-full flex-col gap-4 rounded-panel border border-border bg-surface p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            <Link
              to={to}
              className="rounded-sm transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {game?.titleId && <span className="font-mono text-xs text-accent">{game.titleId}</span>}
            <Meta label="Build" value={report.testedVersion} />
            <Meta label="Tested" value={report.testedDate} />
            {report.os && <Meta label="OS" value={report.os} />}
            {report.hardware && <Meta label="HW" value={report.hardware} />}
          </p>
        </div>
        <StatusBadge status={badge} className="shrink-0" />
      </div>

      {cover ? (
        <Link to={to} tabIndex={-1} aria-label={`${title} — view compatibility report`} className="relative block">
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-card border border-border">
            <img
              src={cover}
              alt={`${title} cover art`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              width={640}
              height={280}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>
      ) : null}

      {(game?.publisher || game?.releaseDate || game?.genres?.length) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          {game.publisher && <span className="text-text-secondary">{game.publisher}</span>}
          {game.releaseDate && <span>{new Date(game.releaseDate).getFullYear()}</span>}
          {game.genres?.map((genre) => (
            <span key={genre} className="rounded-full border border-border px-2 py-0.5">
              {genre}
            </span>
          ))}
        </div>
      )}

      {report.notes && (
        <p className="mt-auto line-clamp-3 text-sm leading-relaxed text-text-secondary">
          {markdownToText(report.notes)}
        </p>
      )}

      {(reportCount ?? 0) > 1 && (
        <p className="text-xs text-text-muted">
          {reportCount} community report{reportCount === 1 ? "" : "s"} — status by majority vote
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        {report.source?.url ? (
          <a
            href={report.source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            {report.source.label}
          </a>
        ) : report.source ? (
          <span className="text-xs text-text-muted">Source: {report.source.label}</span>
        ) : (
          <span />
        )}
        <Link
          to={to}
          className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
        >
          Full report
          <ArrowRight className="size-4 transition-transform duration-150 group-hover/link:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
