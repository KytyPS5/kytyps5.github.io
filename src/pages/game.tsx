import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, FileQuestion } from "lucide-react";
import { Seo } from "@/lib/seo";
import {
  COMPAT_REPORTS,
  OSES,
  STATUS_META,
  displayStatus,
  gamePageKey,
  perOsStatuses,
  reportsForOs,
  type CompatReport,
} from "@/lib/compat";
import { loadGames, type Game } from "@/lib/games";
import { SITE, SITE_URL } from "@/config";
import { Markdown } from "@/lib/markdown.tsx";
import { StatusBadge } from "@/components/compat/status-badge";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/layout/reveal";
import { formatDate } from "@/lib/utils";

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-text-primary">{value}</dd>
    </div>
  );
}

function ReportBlock({ report, index }: { report: CompatReport; index: number }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-7 shadow-card sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-mono text-xs leading-relaxed text-text-muted">
          {index > 0 && <span className="mr-2 text-text-secondary">Report #{index + 1}</span>}
          Tested on KytyPS5 <span className="font-semibold text-text-primary">{report.testedVersion}</span>
          {report.gameVersion && <> · game {report.gameVersion}</>}
          {report.os && <> · {report.os}</>}
          {" "}· {formatDate(report.testedDate)}
          {report.hardware && <> · {report.hardware}</>}
        </p>
        <StatusBadge status={report.status} className="shrink-0" />
      </div>

      {report.testedVersion !== SITE.currentVersion && (
        <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
          This report was made on an older build — behavior may have changed since.
        </p>
      )}

      <div className="prose prose-slate mt-6 max-w-none">
        <Markdown source={report.notes} />
      </div>

      {report.source && (
        <div className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-sm">
          {report.source.url ? (
            <>
              <ExternalLink className="size-4 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-text-secondary">Source:</span>
              <a
                href={report.source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
              >
                {report.source.label}
              </a>
            </>
          ) : (
            <span className="font-mono text-xs text-text-muted">
              Source: {report.source.label}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export function GamePage() {
  const { key = "" } = useParams<{ key: string }>();
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

  // Resolve the database game first (any region variant of the title ID), then
  // collect every report for it — by exact title ID, slug, or any of the
  // game's region-variant IDs (matches buildGameIndex on the index page).
  const keyNorm = normalize(key);
  const game = games
    ? games.find((g) => g.allTitleIds.some((id) => normalize(id) === keyNorm))
    : undefined;
  const reports = COMPAT_REPORTS.filter((r) => {
    const rKey = r.titleId ? normalize(r.titleId) : "";
    return (
      r.slug === key ||
      rKey === keyNorm ||
      (game ? game.allTitleIds.some((id) => normalize(id) === rKey) : false)
    );
  }).sort((a, b) => (a.testedDate < b.testedDate ? 1 : -1));
  const report = reports[0];

  // Wait for the games database before resolving content states, so the
  // not-found / no-report pages never flash with misleading content.
  if (games === null) {
    return (
      <>
        <Seo title="Loading…" description="" path={`/game/${encodeURIComponent(key)}`} noindex />
        <Container className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading game">
          <span className="size-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
        </Container>
      </>
    );
  }

  // Not found: neither a report nor a database game matches the URL.
  if (reports.length === 0 && !game) {
    return (
      <>
        <Seo
          title="Game not found"
          description="No compatibility data found for this game."
          path={`/game/${encodeURIComponent(key)}`}
          noindex
        />
        <Container className="flex min-h-[50vh] flex-col items-center justify-center py-24 text-center">
          <FileQuestion className="size-10 text-text-muted" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">Game not found</h1>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            There's no compatibility report or database entry for “{key}”. It may not be listed yet —
            try the compatibility index.
          </p>
          <Link
            to="/compatibility"
            className="mt-6 inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to compatibility
          </Link>
        </Container>
      </>
    );
  }

  const title = game?.name ?? report?.title ?? key;
  const canonicalKey = report ? gamePageKey(report, game) : key;
  // The overall badge is the BEST result across the game's per-OS tests; each
  // OS below carries its own majority vote.
  const aggregate = displayStatus(reports);
  const perOs = perOsStatuses(reports);
  const latest = reports[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    ...(game?.publisher ? { publisher: { "@type": "Organization", name: game.publisher } } : {}),
    ...(game?.releaseDate ? { datePublished: game.releaseDate } : {}),
    ...(game?.genres?.length ? { genre: game.genres } : {}),
    applicationCategory: "Game",
    operatingSystem: "Windows 10+, Linux, macOS",
    description: `KytyPS5 compatibility report: ${STATUS_META[aggregate].label.toLowerCase()} (best across ${reports.length} report${reports.length === 1 ? "" : "s"}).`,
    url: `${SITE_URL}/game/${encodeURIComponent(canonicalKey)}`,
  };

  return (
    <>
      <Seo
        title={`${title} — compatibility`}
        description={
          reports.length > 0
            ? `${title} is ${STATUS_META[aggregate].label.toLowerCase()} on KytyPS5 — the best result across ${reports.length} report${reports.length === 1 ? "" : "s"} (latest tested on ${latest.testedVersion}). Read the full report.`
            : `${title} has no compatibility report on KytyPS5 yet. Track progress and test it yourself.`
        }
        path={`/game/${encodeURIComponent(canonicalKey)}`}
        image={game?.cover}
        jsonLd={jsonLd}
        noindex={reports.length === 0}
      />

      <Container className="pt-28 sm:pt-32">
        {/* Breadcrumb */}
        <Reveal from="up">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Link
              to="/compatibility"
              className="transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
            >
              Compatibility
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-text-secondary">{canonicalKey}</span>
          </nav>
        </Reveal>

        {/* Header: cover + title + metadata */}
        <Reveal from="left" className="mt-8">
          <div className="flex flex-col gap-10 md:flex-row">
            {game?.cover ? (
              <img
                src={game.cover}
                alt={`${title} cover art`}
                width={256}
                height={256}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-56 w-56 shrink-0 self-center rounded-3xl border border-border object-cover shadow-glow-soft md:self-auto md:h-64 md:w-64"
              />
            ) : (
              <div
                className="flex h-56 w-56 shrink-0 items-center justify-center self-center rounded-3xl border border-border bg-surface p-6 text-center font-display font-semibold text-text-muted md:h-64 md:w-64 md:self-auto"
                aria-hidden="true"
              >
                {title}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="break-words font-display text-4xl font-bold tracking-tight text-text-primary">
                {title}
              </h1>
              <div className="mt-4">
                <StatusBadge status={aggregate} size="lg" />
                {reports.length > 1 && (
                  <span className="ml-3 align-middle font-mono text-xs text-text-muted">
                    {reports.length} reports · best across tested OSes
                  </span>
                )}
              </div>
              <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2.5 text-sm">
                <Meta label="Title IDs" value={game?.allTitleIds.join(" · ") ?? report?.titleId} />
                {game?.publisher && <Meta label="Publisher" value={game.publisher} />}
                {game?.releaseDate && <Meta label="Released" value={formatDate(game.releaseDate)} />}
                {game?.genres && game.genres.length > 0 && (
                  <Meta label="Genre" value={game.genres.join(", ")} />
                )}
              </dl>
            </div>
          </div>
        </Reveal>

        {/* Per-OS status slots */}
        <Reveal from="up" className="mt-12">
          <section aria-labelledby="os-status-heading">
            <h2
              id="os-status-heading"
              className="font-display text-xl font-bold tracking-tight text-text-primary"
            >
              Status by operating system
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
              Each OS shows the majority vote of the reports tested on it. The badge above is the
              best result across tested OSes — an untested OS stays grey until a report for it
              lands.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {OSES.map((os) => {
                const osReports = reportsForOs(reports, os);
                return (
                  <div
                    key={os}
                    className="rounded-card border border-border bg-surface p-5 shadow-card"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
                        {os}
                      </p>
                      {osReports.length > 0 && (
                        <span className="font-mono text-[11px] text-text-muted">
                          {osReports.length} report{osReports.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <StatusBadge status={perOs[os]} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* Reports */}
        <Reveal from="right" className="mt-16 pb-24">
          <section aria-labelledby="report-heading">
            <h2 id="report-heading" className="font-display text-2xl font-bold tracking-tight text-text-primary">
              Compatibility reports
            </h2>

            {reports.length > 0 ? (
              <div className="mt-5 space-y-6">
                {reports.map((r, i) => (
                  <ReportBlock key={r.slug} report={r} index={i} />
                ))}
                <p className="text-sm text-text-muted">
                  Statuses are per operating system; the overall badge shows the best result across
                  tested OSes. Community data, reflecting the builds they were tested on.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
                <CheckCircle2 className="mx-auto size-8 text-text-muted" aria-hidden="true" />
                <p className="mt-4 text-text-secondary">
                  Not tested yet — no compatibility reports for this game.
                </p>
                <Link
                  to="/compatibility"
                  className="mt-3 inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  File a report
                </Link>
              </div>
            )}
          </section>
        </Reveal>
      </Container>
    </>
  );
}
