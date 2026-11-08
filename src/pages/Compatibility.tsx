import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  FileText,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AnimatedTabs,
  Reveal,
  CodeBlock,
  TransitionPanel,
} from "../components/primitives";
import {
  date,
  External,
  GameImage,
  OSIcon,
  PageHeading,
  StatusBadge,
  useGithub,
} from "../components/shared";
import {
  osNames,
  reportUrl,
  repoUrl,
  statuses,
  statusMeta,
  type Game,
  type OS,
  type Report,
  type Status,
} from "../data/types";
import aliases from "../data/aliases.json";
import { CompatibilitySummary } from "../components/compatibility-summary";
import { CompatibilityRegression } from "../components/compatibility-regression";
import { cachedJson } from "../lib/cache";
import { pageMetadata } from "../lib/page-metadata";
import { trackPageView } from "../lib/analytics";
import { LoadingState } from "../components/loading-state";
import { GameCommunityResources } from "../components/community-resources";
import { useGameReports } from "../hooks/use-game-reports";
import { useCommunityResources } from "../hooks/use-community-resources";
import { reportSummary } from "../lib/game-status";
import { useCompatibilityGames } from "../hooks/use-compatibility-games";
import {
  CollectionBackLink,
  saveCollectionPosition,
  useCollectionRestoration,
} from "../components/collection-history";

const PAGE_SIZE = 24;
const osKeys = Object.keys(osNames) as OS[];

function CatalogMetadata({
  game,
}: {
  game: Pick<
    Game,
    "allTitleIds" | "titleId" | "publisher" | "releaseDate" | "genres"
  >;
}) {
  return (
    <dl className="catalog-metadata">
      <div className="catalog-title-ids">
        <dt>Title IDs</dt>
        <dd>{game.allTitleIds?.join(" · ") || game.titleId}</dd>
      </div>
      {game.publisher && (
        <div>
          <dt>Publisher</dt>
          <dd>{game.publisher}</dd>
        </div>
      )}
      {game.releaseDate && (
        <div>
          <dt>Released</dt>
          <dd>{date(game.releaseDate)}</dd>
        </div>
      )}
      {!!game.genres?.length && (
        <div>
          <dt>Genres</dt>
          <dd>{game.genres.join(", ")}</dd>
        </div>
      )}
    </dl>
  );
}

function BuildAgeNotice({
  testedVersion,
  releaseTag,
  publishedAt,
}: {
  testedVersion: string;
  releaseTag: string;
  publishedAt: string;
}) {
  if (testedVersion.includes(releaseTag)) return null;
  const testedDate = testedVersion.match(/KytyPS5-(\d{4}-\d{2}-\d{2})/)?.[1];
  const older = testedDate && testedDate < publishedAt.slice(0, 10);
  return (
    <div className="build-age-notice">
      <strong>
        {older ? "Tested on an older build." : "Tested on a different build."}
      </strong>{" "}
      Compatibility may have changed since this report.{" "}
      <Link to="/download">
        Latest release: {releaseTag}
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}

type CatalogEntry = {
  titleId: string;
  allTitleIds: string[];
  name: string;
  cover?: string;
  publisher?: string;
  releaseDate?: string;
  genres?: string[];
};
function CatalogGamePage({ titleKey }: { titleKey: string }) {
  const resources = useCommunityResources();
  const [catalogGame, setCatalogGame] = useState<CatalogEntry | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(false);
    cachedJson<CatalogEntry[]>("/data/catalog.json", {
      maxAge: 86_400_000,
      force: attempt > 0,
    })
      .then((entries) => {
        if (!current) return;
        const match = entries.find(
          (g) =>
            g.titleId.toLowerCase() === titleKey.toLowerCase() ||
            g.allTitleIds?.some(
              (id) => id.toLowerCase() === titleKey.toLowerCase(),
            ),
        );
        setCatalogGame(match ?? null);
        setLoading(false);
        if (match) {
          pageMetadata(
            `/game/${encodeURIComponent(titleKey)}`,
            `${match.name} compatibility`,
            `Catalog information and reporting options for ${match.name}.`,
            {
              noindex: true,
              image: match.cover,
              canonicalPath: `/game/${encodeURIComponent(match.titleId)}`,
            },
          );
          trackPageView(
            `/game/${encodeURIComponent(titleKey)}`,
            `KytyPS5 — ${match.name} compatibility`,
          );
        }
      })
      .catch(() => {
        if (current) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      current = false;
    };
  }, [titleKey, attempt]);
  const normalizedKey = titleKey.toUpperCase().replaceAll("-", "");
  const resourceGame = [
    ...(resources.data?.patchCollections.map((collection) => collection.game) ??
      []),
    ...(resources.data?.forks
      .filter((fork) => fork.targetTitleIds.length > 0)
      .flatMap((fork) => fork.games) ?? []),
  ].find(
    (game) => game.key === normalizedKey || game.titleId === normalizedKey,
  );
  const entry =
    catalogGame ??
    (resourceGame
      ? {
          titleId: resourceGame.key,
          allTitleIds: [...new Set([resourceGame.key, resourceGame.titleId])],
          name: resourceGame.title,
          cover: resourceGame.cover,
        }
      : null);
  useEffect(() => {
    if (!catalogGame && resourceGame) {
      pageMetadata(
        `/game/${encodeURIComponent(titleKey)}`,
        `${resourceGame.title} compatibility`,
        `Community resources and reporting options for ${resourceGame.title}.`,
        {
          noindex: true,
          image: resourceGame.cover,
          canonicalPath: `/game/${encodeURIComponent(resourceGame.key)}`,
        },
      );
      trackPageView(
        `/game/${encodeURIComponent(titleKey)}`,
        `KytyPS5 — ${resourceGame.title} compatibility`,
      );
    }
  }, [catalogGame, resourceGame, titleKey]);
  useEffect(() => {
    if (!loading && !entry && (resources.data || resources.error)) {
      trackPageView(
        `/game/${encodeURIComponent(titleKey)}`,
        "KytyPS5 — Game not found",
      );
    }
  }, [loading, entry, resources.data, resources.error, titleKey]);
  if (loading || (!entry && !resources.data && !resources.error))
    return <LoadingState label="Looking up this title…" route />;
  if (!entry)
    return (
      <section className="wrap empty-state route-empty">
        <FileText size={40} />
        <h1>
          {error || resources.error
            ? "Title lookup couldn’t load."
            : "Game not found."}
        </h1>
        <p>
          {error || resources.error
            ? "The title database or community resources are temporarily unavailable. Try loading them again."
            : "This title ID is not in the game catalog or community resources."}
        </p>
        {(error || resources.error) && (
          <button
            className="button"
            onClick={() => {
              setAttempt((n) => n + 1);
              void resources.refresh(true);
            }}
          >
            Try again
          </button>
        )}
        <CollectionBackLink>
          <ArrowLeft size={18} />
          Back to compatibility
        </CollectionBackLink>
      </section>
    );
  return (
    <section className="wrap game-detail">
      <CollectionBackLink>
        <ArrowLeft size={18} />
        The compatibility collection
      </CollectionBackLink>
      <div className="game-detail-heading">
        <GameImage src={entry.cover} title={entry.name} eager />
        <div>
          <span className="status status-doesnt-boot">Untested</span>
          <h1>{entry.name}</h1>
          <CatalogMetadata game={entry} />
          <External
            href={`${reportUrl}&title=${encodeURIComponent(`Game Emulation Status Report: ${entry.name}`)}`}
            className="button"
          >
            Submit the first report
            <ArrowUpRight size={17} />
          </External>
        </div>
      </div>
      <div className="report-callout">
        <FileText size={28} />
        <div>
          <h2>A new title to explore.</h2>
          <p>
            No community report has been published for this game yet. Its
            compatibility is unknown. Testing it and sharing a report is a
            useful way to help.
          </p>
        </div>
      </div>
      <GameCommunityResources gameKey={entry.titleId} />
    </section>
  );
}

export function Compatibility() {
  const games = useCompatibilityGames();
  const location = useLocation();
  useCollectionRestoration();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const status = statuses.includes(params.get("status") as Status)
    ? (params.get("status") as Status)
    : "all";
  const os = osKeys.includes(params.get("os") as OS)
    ? (params.get("os") as OS)
    : "all";
  const sort = params.get("sort") === "recent" ? "recent" : "title";
  const page = Math.max(
    1,
    Math.min(
      Math.ceil(games.length / PAGE_SIZE) || 1,
      Number(params.get("page")) || 1,
    ),
  );
  const visible = Math.floor(page) * PAGE_SIZE;
  function setFilter(key: string, value: string) {
    // Read the actual history URL so quick successive controls cannot discard
    // a previous change while React Router is still rendering its transition.
    const next = new URLSearchParams(window.location.search);
    next.delete("page");
    if (!value || value === "all" || (key === "sort" && value === "title"))
      next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }
  const counts = useMemo(
    () =>
      Object.fromEntries(
        statuses.map((s) => [
          s,
          games.filter((g) => (os === "all" ? g.overall : g.os[os]) === s)
            .length,
        ]),
      ),
    [games, os],
  );
  const filtered = useMemo(
    () =>
      games
        .filter((g) => {
          const result = os === "all" ? g.overall : g.os[os];
          return (
            result &&
            (status === "all" || result === status) &&
            `${g.title} ${g.titleId} ${g.allTitleIds?.join(" ") ?? ""}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          );
        })
        .sort((a, b) =>
          sort === "recent"
            ? (b.latestTested ?? "").localeCompare(a.latestTested ?? "") ||
              a.title.localeCompare(b.title)
            : a.title.localeCompare(b.title),
        ),
    [games, query, os, status, sort],
  );
  return (
    <>
      <PageHeading
        title="THE COMPATIBILITY COLLECTION."
        description="Every tested title. Every small breakthrough. Find a game and explore the community reports behind its status."
      >
        <External href={reportUrl} className="button">
          Submit a report
          <ArrowUpRight size={18} />
        </External>
      </PageHeading>
      <section className="wrap database-section">
        <CompatibilitySummary games={games} os={os} />
        <details className="status-explainer">
          <summary>What do the compatibility statuses mean?</summary>
          <div>
            {statuses.map((s) => (
              <div key={s}>
                <StatusBadge status={s} />
                <p>{statusMeta[s].description}</p>
              </div>
            ))}
          </div>
        </details>
        <Reveal className="database-filters" distance={18}>
          <div className="search-box">
            <Search size={21} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setFilter("q", e.target.value)}
              placeholder="Find a game or title ID…"
              aria-label="Search games or title IDs"
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => setFilter("q", "")}
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="filter-bottom">
            <div className="status-filters">
              <button
                className={status === "all" ? "selected" : ""}
                onClick={() => setFilter("status", "all")}
                aria-pressed={status === "all"}
              >
                All games
              </button>
              {statuses.map((s) => (
                <button
                  key={s}
                  className={status === s ? "selected" : ""}
                  onClick={() => setFilter("status", s)}
                  aria-pressed={status === s}
                >
                  {statusMeta[s].label}
                  <span>{counts[s]}</span>
                </button>
              ))}
            </div>
            <div className="select-filters">
              <label>
                <SlidersHorizontal size={16} />
                <span className="sr-only">Operating system</span>
                <select
                  value={os}
                  onChange={(e) => setFilter("os", e.target.value)}
                  aria-label="Operating system"
                >
                  <option value="all">All platforms</option>
                  {osKeys.map((o) => (
                    <option key={o} value={o}>
                      {osNames[o]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Sort games</span>
                <select
                  value={sort}
                  onChange={(e) => setFilter("sort", e.target.value)}
                  aria-label="Sort games"
                >
                  <option value="title">A–Z</option>
                  <option value="recent">Recently tested</option>
                </select>
              </label>
            </div>
          </div>
        </Reveal>
        <div className="results-heading" aria-live="polite">
          <span>
            {filtered.length} {filtered.length === 1 ? "game" : "games"} found
            {query && ` for “${query}”`}
          </span>
          {(query || status !== "all" || os !== "all" || sort !== "title") && (
            <button onClick={() => setParams({}, { replace: true })}>
              Reset filters
              <X size={14} />
            </button>
          )}
        </div>
        {filtered.length ? (
          <div className="game-table">
            <div className="game-table-head">
              <span>Game</span>
              <span>Status</span>
              <span>Platforms tested</span>
              <span>Last tested</span>
              <span />
            </div>
            {filtered.slice(0, visible).map((game) => (
              <Link
                to={`/game/${game.key}`}
                state={{
                  compatibility: {
                    href: `${location.pathname}${location.search}`,
                    key: location.key,
                  },
                }}
                onClick={() => saveCollectionPosition(location.key, game.key)}
                data-game-key={game.key}
                className="game-table-row"
                key={game.key}
              >
                <div className="table-game">
                  <GameImage src={game.cover} title={`${game.title} cover`} />
                  <div>
                    <h2>{game.title}</h2>
                    <span>{game.titleId}</span>
                  </div>
                </div>
                <div>
                  <StatusBadge
                    status={(os === "all" ? game.overall : game.os[os])!}
                  />
                </div>
                <div className="table-platforms">
                  {osKeys
                    .filter((o) => game.os[o])
                    .map((o) => (
                      <span
                        key={o}
                        title={`${osNames[o]}: ${statusMeta[game.os[o]!].label}`}
                      >
                        <OSIcon os={o} size={16} />
                        <span>{osNames[o]}</span>
                      </span>
                    ))}
                </div>
                <time className="table-date">{date(game.latestTested)}</time>
                <ArrowUpRight className="table-arrow" size={19} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={38} />
            <h2>No match this time.</h2>
            <p>
              Try another title or title ID, or clear the filters to explore all
              tested games.
            </p>
            <button
              className="button"
              onClick={() => setParams({}, { replace: true })}
            >
              Show all games
            </button>
          </div>
        )}
        {visible < filtered.length && (
          <div className="load-more">
            <p>
              Showing {Math.min(visible, filtered.length)} of {filtered.length}{" "}
              games
            </p>
            <button
              className="button secondary"
              onClick={() => {
                const next = new URLSearchParams(window.location.search);
                next.set("page", String(page + 1));
                setParams(next, { replace: true });
              }}
            >
              Load more games
              <ArrowRight size={17} />
            </button>
          </div>
        )}
        <div className="report-callout">
          <FileText size={30} />
          <div>
            <h2>Not seeing your game?</h2>
            <p>
              Untested games join the collection when a community report lands.
            </p>
          </div>
          <External href={reportUrl} className="text-link">
            Be the first to test it
            <ArrowUpRight size={18} />
          </External>
          <External
            href={`${repoUrl}/issues?q=is%3Aissue%20%22%5BGAME%20STATUS%5D%22%20in%3Atitle`}
            className="text-link"
          >
            Open status reports
            <ArrowUpRight size={18} />
          </External>
        </div>
      </section>
    </>
  );
}

function ScreenshotGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setSelected((n) => (n! - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setSelected((n) => (n! + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, images.length]);
  return (
    <div className="report-gallery">
      <h3>Community captures</h3>
      <div>
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            onClick={() => setSelected(i)}
            aria-label={`Expand ${title} screenshot ${i + 1}`}
          >
            <GameImage src={src} title={`${title} screenshot ${i + 1}`} />
            <Expand size={21} />
          </button>
        ))}
      </div>
      <Dialog.Root
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="lightbox-overlay" />
          <Dialog.Content className="lightbox">
            <Dialog.Title>
              {title} · Screenshot {(selected ?? 0) + 1} of {images.length}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Community-provided emulator capture. Use arrow keys to navigate
              screenshots.
            </Dialog.Description>
            <Dialog.Close
              aria-label="Close screenshot"
              className="icon-button lightbox-close"
            >
              <X size={25} />
            </Dialog.Close>
            {selected !== null && (
              <GameImage
                src={images[selected]}
                title={`${title} screenshot ${selected + 1}`}
                eager
              />
            )}
            {images.length > 1 && (
              <div className="lightbox-controls">
                <button
                  className="icon-button"
                  aria-label="Previous screenshot"
                  onClick={() =>
                    setSelected((n) => (n! - 1 + images.length) % images.length)
                  }
                >
                  <ChevronLeft />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next screenshot"
                  onClick={() => setSelected((n) => (n! + 1) % images.length)}
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export function GamePage() {
  const games = useCompatibilityGames();
  const { key } = useParams();
  const { release } = useGithub();
  const [os, setOs] = useState<OS>("windows");
  const alias = (aliases as Record<string, string>)[key ?? ""];
  const indexedGame = games.find(
    (g) =>
      g.key === alias ||
      g.allTitleIds?.some((id) => id.toLowerCase() === key?.toLowerCase()) ||
      g.aliases?.some((slug) => slug.toLowerCase() === key?.toLowerCase()) ||
      g.key.toLowerCase() === key?.toLowerCase() ||
      g.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-$/, "") === key?.toLowerCase(),
  );
  const { data, error, refresh } = useGameReports(
    indexedGame?.key,
    indexedGame?.reportRevision,
  );
  const game =
    indexedGame && data
      ? { ...indexedGame, ...reportSummary(data.reports) }
      : indexedGame;
  useEffect(() => {
    if (!data) return;
    setOs((current) =>
      data.reports.some((r) => r.os === current)
        ? current
        : data.reports.some((r) => r.os === "windows")
          ? "windows"
          : data.reports[0].os,
    );
    pageMetadata(
      `/game/${encodeURIComponent(key ?? "")}`,
      `${data.title} compatibility`,
      `Platform compatibility, tested builds, screenshots and community reports for ${data.title}.`,
      {
        noindex: false,
        image: indexedGame?.cover,
        canonicalPath: `/game/${encodeURIComponent(data.key)}`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: data.title,
          applicationCategory: "Game",
          operatingSystem: "Windows 10+, Linux, macOS",
          description: `KytyPS5 compatibility report: ${statusMeta[reportSummary(data.reports).overall].label.toLowerCase()} (best across ${data.reports.length} reports).`,
          url: `https://kytyps5.github.io/game/${encodeURIComponent(data.key)}`,
          ...(indexedGame?.publisher
            ? {
                publisher: {
                  "@type": "Organization",
                  name: indexedGame.publisher,
                },
              }
            : {}),
          ...(indexedGame?.releaseDate
            ? { datePublished: indexedGame.releaseDate }
            : {}),
          ...(indexedGame?.genres?.length ? { genre: indexedGame.genres } : {}),
        },
      },
    );
    trackPageView(
      `/game/${encodeURIComponent(key ?? "")}`,
      `KytyPS5 — ${data.title} compatibility`,
    );
  }, [data, key, indexedGame]);
  if (!game) return <CatalogGamePage titleKey={key ?? ""} />;
  if (error && !data)
    return (
      <section className="wrap empty-state route-empty">
        <FileText size={40} />
        <h1>{game ? "Report couldn’t load." : "Game not found."}</h1>
        <p>
          {game
            ? "The report is temporarily unavailable. Try loading it again."
            : "This title may not have a report yet. Explore the compatibility collection."}
        </p>
        {game && (
          <button className="button" onClick={() => void refresh(true)}>
            Try again
          </button>
        )}
        <CollectionBackLink>
          <ArrowLeft size={17} />
          Back to compatibility
        </CollectionBackLink>
        <GameCommunityResources gameKey={game.key} />
      </section>
    );
  const reports = data?.reports.filter((r) => r.os === os) ?? [];
  return (
    <section className="wrap game-detail">
      <CollectionBackLink>
        <ArrowLeft size={17} />
        The compatibility collection
      </CollectionBackLink>
      <Reveal className="game-detail-heading" distance={20}>
        <GameImage src={game.cover} title={game.title} eager />
        <div>
          <StatusBadge status={game.overall} />
          <h1>{game.title}</h1>
          <p className="game-id">
            {game.titleId} <span>Last tested {date(game.latestTested)}</span>
          </p>
          <CatalogMetadata game={game} />
          <External
            href={`${reportUrl}&title=${encodeURIComponent(`Game Emulation Status Report: ${game.title}`)}`}
            className="button secondary"
          >
            Submit a new report
            <ArrowUpRight size={17} />
          </External>
        </div>
      </Reveal>
      <div className="game-report-layout">
        <aside>
          <h2>Platform reports</h2>
          {osKeys.map((o) => (
            <button
              key={o}
              disabled={!game.os[o]}
              className={os === o ? "active" : ""}
              onClick={() => setOs(o)}
            >
              <span>
                <OSIcon os={o} />
                {osNames[o]}
              </span>
              {game.os[o] ? (
                <StatusBadge status={game.os[o]!} />
              ) : (
                <span>Untested</span>
              )}
            </button>
          ))}
          <p>
            Status varies by platform and build. “In game” does not guarantee a
            fully playable experience.
          </p>
        </aside>
        <div>
          {error && data && (
            <p className="fetch-notice" role="status">
              The report couldn’t refresh. Showing the last loaded report.{" "}
              <button onClick={() => void refresh(true)}>Try again</button>
            </p>
          )}
          {!data ? (
            <LoadingState label="Loading community reports…" />
          ) : (
            <>
              <AnimatedTabs
                items={osKeys
                  .filter((o) => game.os[o])
                  .map((o) => ({ value: o, label: osNames[o] }))}
                value={os}
                onChange={(o) => setOs(o as OS)}
                label="Report platform"
                id="report-os"
              />
              <TransitionPanel value={os}>
                {reports.map((report) => (
                  <article className="report" key={report.slug}>
                    <div className="report-heading">
                      <h2>{osNames[report.os]} test report</h2>
                      <StatusBadge status={report.status} />
                    </div>
                    <BuildAgeNotice
                      testedVersion={report.testedVersion}
                      releaseTag={release.tag_name}
                      publishedAt={release.published_at}
                    />
                    <CompatibilityRegression
                      report={report}
                      peak={data.previousBest?.[report.os]}
                    />
                    <dl className="report-metadata">
                      <div>
                        <dt>Tested on</dt>
                        <dd>{date(report.testedDate)}</dd>
                      </div>
                      {report.gameVersion && (
                        <div>
                          <dt>Game version</dt>
                          <dd>{report.gameVersion}</dd>
                        </div>
                      )}
                      <div className="full-width">
                        <dt>Emulator build</dt>
                        <dd>
                          <ReactMarkdown>{report.testedVersion}</ReactMarkdown>
                        </dd>
                      </div>
                      {report.hardware && (
                        <div className="full-width">
                          <dt>Hardware</dt>
                          <dd>{report.hardware}</dd>
                        </div>
                      )}
                      {report.score && (
                        <div>
                          <dt>Community score</dt>
                          <dd>{report.score} / 5</dd>
                        </div>
                      )}
                    </dl>
                    {report.notes && (
                      <div className="markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ children, href }) => (
                              <External href={href ?? "#"}>{children}</External>
                            ),
                            pre: ({ children }) => (
                              <div className="markdown-code">{children}</div>
                            ),
                            code: ({ children, className }) =>
                              className ? (
                                <CodeBlock
                                  code={String(children).replace(/\n$/, "")}
                                  title={className.replace("language-", "")}
                                />
                              ) : (
                                <code>{children}</code>
                              ),
                            img: ({ src, alt }) => (
                              <GameImage src={src} title={alt ?? game.title} />
                            ),
                          }}
                        >
                          {report.notes}
                        </ReactMarkdown>
                      </div>
                    )}
                    {(report.screenshots?.length || report.screenshot) && (
                      <ScreenshotGallery
                        images={
                          report.screenshots?.length
                            ? report.screenshots
                            : [report.screenshot!]
                        }
                        title={game.title}
                      />
                    )}
                    {report.source?.url && (
                      <External
                        href={report.source.url}
                        className="report-source"
                      >
                        {report.source.label || "Original community report"}
                        <ArrowUpRight size={17} />
                      </External>
                    )}
                    {report.source?.label && !report.source.url && (
                      <p className="report-source">
                        Source: {report.source.label}
                      </p>
                    )}
                  </article>
                ))}
              </TransitionPanel>
            </>
          )}
        </div>
      </div>
      <GameCommunityResources gameKey={game.key} />
    </section>
  );
}
