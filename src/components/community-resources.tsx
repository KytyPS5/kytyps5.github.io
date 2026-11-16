import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { date, External, GameImage } from "./shared";
import { Reveal } from "./primitives";
import { LoadingState } from "./loading-state";
import { useCommunityResources } from "../hooks/use-community-resources";
import { useGameModules } from "../hooks/use-modules";
import { ModuleCard } from "./module-card";
import { modulesRepo, normalizeTitleId } from "../data/modules-types";
import {
  websiteRepo,
  type CommunityFork,
  type CommunityGame,
  type PatchCollection,
} from "../data/community-types";

function bytes(size: number) {
  return size < 1024
    ? `${size} B`
    : size < 1048576
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / 1048576).toFixed(1)} MB`;
}
function markdownUrl(value: string | undefined, base: string) {
  try {
    return new URL(value || "", base).href;
  } catch {
    return base;
  }
}
function adjacentFilename(href: string | undefined) {
  if (!href || /^[a-z][a-z\d+.-]*:/i.test(href) || /[?#]/.test(href))
    return null;
  try {
    const filename = decodeURIComponent(href.replace(/^\.\//, ""));
    return filename &&
      filename !== "." &&
      filename !== ".." &&
      !/[\/\\\x00-\x1f]/.test(filename)
      ? filename
      : null;
  } catch {
    return null;
  }
}
export function ResourceFeedback({
  data,
  error,
  refresh,
}: {
  data: unknown;
  error: boolean;
  refresh: (force?: boolean) => Promise<void>;
}) {
  if (error)
    return (
      <p className="community-feedback" role="status">
        {data
          ? "The latest update couldn’t load. Showing saved community resources."
          : "Community resources couldn’t load."}{" "}
        <button className="text-link" onClick={() => void refresh(true)}>
          Try again
        </button>
      </p>
    );
  return !data ? <LoadingState label="Loading community resources…" /> : null;
}
export function TargetGames({ games }: { games: CommunityGame[] }) {
  return games.length ? (
    <ul className="community-targets" aria-label="Targeted games">
      {games.map((game) => (
        <li key={game.key}>
          <Link to={`/game/${encodeURIComponent(game.key)}`}>
            {game.title}
            <span>{game.titleId}</span>
            <ArrowUpRight size={14} />
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <p className="community-no-targets">No game targets listed.</p>
  );
}
export function ForkList({
  forks,
  showTargets = true,
}: {
  forks: CommunityFork[];
  showTargets?: boolean;
}) {
  return (
    <div className="community-forks-list">
      {forks.map((fork) => (
        <Reveal
          as="article"
          className="community-fork"
          key={fork.repositoryId}
          distance={14}
        >
          <div className="community-fork-title">
            <h3>
              <External href={fork.url}>
                {fork.repository}
                <ArrowUpRight size={20} />
              </External>
            </h3>
            {fork.archived && (
              <span className="community-archived">Archived</span>
            )}
          </div>
          {fork.description && <p>{fork.description}</p>}
          {showTargets && <TargetGames games={fork.games} />}
          <p className="community-record-date">
            Listing updated{" "}
            <time dateTime={fork.updatedAt}>{date(fork.updatedAt)}</time>
          </p>
        </Reveal>
      ))}
    </div>
  );
}
export function PatchList({ collection }: { collection: PatchCollection }) {
  return (
    <div className="community-patch-list">
      {collection.patches.length ? (
        collection.patches.map((patch) => {
          const source = `${websiteRepo}/blob/main/patches/${encodeURIComponent(collection.titleId)}/${encodeURIComponent(patch.name)}/`;
          return (
            <article
              className="community-patch"
              id={`patch-${encodeURIComponent(patch.id)}`}
              key={patch.id}
            >
              <h3>{patch.name}</h3>
              <div className="markdown community-description">
                <ReactMarkdown
                  skipHtml
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h4>{children}</h4>,
                    h2: ({ children }) => <h4>{children}</h4>,
                    h3: ({ children }) => <h4>{children}</h4>,
                    h4: ({ children }) => <h5>{children}</h5>,
                    h5: ({ children }) => <h6>{children}</h6>,
                    a: ({ children, href }) => {
                      const file = patch.files.find(
                        (file) => file.name === adjacentFilename(href),
                      );
                      return file ? (
                        <a href={file.url} download={file.name}>
                          {children}
                        </a>
                      ) : (
                        <External href={markdownUrl(href, source)}>
                          {children}
                        </External>
                      );
                    },
                    img: ({ src, alt }) => (
                      <GameImage
                        src={markdownUrl(
                          src,
                          source
                            .replace("github.com", "raw.githubusercontent.com")
                            .replace("/blob/", "/"),
                        )}
                        title={alt || patch.name}
                      />
                    ),
                  }}
                >
                  {patch.description}
                </ReactMarkdown>
              </div>
              <ul
                className="community-downloads"
                aria-label={`${patch.name} files`}
              >
                {patch.files.map((file) => (
                  <li key={file.url}>
                    <a href={file.url} download={file.name}>
                      <Download size={18} />
                      <span>{file.name}</span>
                      <span className="community-file-size">
                        {bytes(file.size)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          );
        })
      ) : (
        <p className="community-feedback">
          A patch collection is registered for this game. No ZIP packages have
          been published yet.
        </p>
      )}
    </div>
  );
}
export function PatchCollectionBlock({
  collection,
  showGame = true,
}: {
  collection: PatchCollection;
  showGame?: boolean;
}) {
  return (
    <Reveal as="section" className="community-collection" distance={18}>
      {showGame && (
        <div className="community-game-heading">
          <GameImage
            src={collection.game.cover}
            title={`${collection.game.title} cover`}
          />
          <div>
            <h2>
              <Link to={`/game/${encodeURIComponent(collection.game.key)}`}>
                {collection.game.title}
                <ArrowUpRight size={20} />
              </Link>
            </h2>
            <p>
              {collection.titleId} · {collection.patches.length}{" "}
              {collection.patches.length === 1 ? "patch" : "patches"}
            </p>
          </div>
        </div>
      )}
      <PatchList collection={collection} />
    </Reveal>
  );
}
export function GameCommunityResources({
  gameKey,
  gameTitle,
  titleId,
  allTitleIds,
}: {
  gameKey: string;
  gameTitle?: string;
  titleId?: string;
  allTitleIds?: string[];
}) {
  const resource = useCommunityResources();
  const effectiveIds = useMemo(() => {
    const ids = (allTitleIds?.filter(Boolean) ?? []).map(normalizeTitleId);
    if (ids.length > 0) return ids;
    if (titleId) return [normalizeTitleId(titleId)];
    return [normalizeTitleId(gameKey)];
  }, [allTitleIds, titleId, gameKey]);

  const {
    patches: modularPatches,
    cheats: modularCheats,
    configs: modularConfigs,
    loading: modulesLoading,
    error: modulesError,
    refresh: refreshModules,
  } = useGameModules(effectiveIds);

  const forks = useMemo(() => {
    return (
      resource.data?.forks.filter(
        (fork) =>
          fork.targetTitleIds.length > 0 &&
          fork.games.some(
            (game) =>
              normalizeTitleId(game.key) === normalizeTitleId(gameKey) ||
              effectiveIds.some(
                (id) => id === normalizeTitleId(game.titleId),
              ),
          ),
      ) ?? []
    );
  }, [resource.data, gameKey, effectiveIds]);

  const primaryTitleId = titleId || effectiveIds[0] || gameKey;
  const displayGameTitle = gameTitle || gameKey;

  return (
    <section
      className="game-community-resources"
      aria-labelledby="community-resources-title"
    >
      <div className="community-section-intro">
        <h2 id="community-resources-title">More ways to explore this game.</h2>
        <p>
          Community patches, cheats, configurations, and forks, maintained
          independently of test reports.
        </p>
      </div>
      <ResourceFeedback {...resource} />
      {modulesError && (
        <p className="community-feedback" role="status">
          Live module catalog could not be reached.{" "}
          <button
            className="text-link"
            type="button"
            onClick={() => void refreshModules(true)}
          >
            Try again
          </button>
        </p>
      )}
      <div className="game-community-columns">
        {/* Patches Section */}
        <section aria-labelledby="game-patches-title">
          <div className="community-subheading">
            <h3 id="game-patches-title">Community patches</h3>
            <Link to="/patches">
              All patches
              <ArrowRight size={16} />
            </Link>
          </div>
          {modulesLoading && !modularPatches.length ? (
            <LoadingState label="Loading patches…" />
          ) : modularPatches.length > 0 ? (
            <div className="module-list">
              {modularPatches.map((entry) => (
                <ModuleCard key={entry.path} entry={entry} headingLevel="h4" />
              ))}
            </div>
          ) : modulesError ? (
            <div className="community-empty-module">
              <p>Unable to load patches right now.</p>
            </div>
          ) : (
            <div className="community-empty-module">
              <p>No community patches are listed for this game yet.</p>
              <a
                href={`${modulesRepo}/issues/new?template=01_patch_submission.yml&title_id=${encodeURIComponent(primaryTitleId)}&game_name=${encodeURIComponent(displayGameTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Submit a patch
                <ArrowUpRight size={15} />
              </a>
            </div>
          )}
        </section>

        {/* Cheats Section */}
        <section aria-labelledby="game-cheats-title">
          <div className="community-subheading">
            <h3 id="game-cheats-title">Cheats</h3>
            <Link to="/cheats">
              All cheats
              <ArrowRight size={16} />
            </Link>
          </div>
          {modulesLoading && !modularCheats.length ? (
            <LoadingState label="Loading cheats…" />
          ) : modularCheats.length > 0 ? (
            <div className="module-list">
              {modularCheats.map((entry) => (
                <ModuleCard key={entry.path} entry={entry} headingLevel="h4" />
              ))}
            </div>
          ) : modulesError ? (
            <div className="community-empty-module">
              <p>Unable to load cheats right now.</p>
            </div>
          ) : (
            <div className="community-empty-module">
              <p>No community cheats are listed for this game yet.</p>
              <a
                href={`${modulesRepo}/issues/new?template=02_cheat_submission.yml&title_id=${encodeURIComponent(primaryTitleId)}&game_name=${encodeURIComponent(displayGameTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Submit a cheat
                <ArrowUpRight size={15} />
              </a>
            </div>
          )}
        </section>

        {/* Configuration Presets Section */}
        <section aria-labelledby="game-configs-title">
          <div className="community-subheading">
            <h3 id="game-configs-title">Configuration presets</h3>
            <Link to="/configs">
              All configs
              <ArrowRight size={16} />
            </Link>
          </div>
          {modulesLoading && !modularConfigs.length ? (
            <LoadingState label="Loading configuration presets…" />
          ) : modularConfigs.length > 0 ? (
            <div className="module-list">
              {modularConfigs.map((entry) => (
                <ModuleCard key={entry.path} entry={entry} headingLevel="h4" />
              ))}
            </div>
          ) : modulesError ? (
            <div className="community-empty-module">
              <p>Unable to load configuration presets right now.</p>
            </div>
          ) : (
            <div className="community-empty-module">
              <p>No configuration presets are listed for this game yet.</p>
              <a
                href={`${modulesRepo}/issues/new?template=03_config_submission.yml&title_id=${encodeURIComponent(primaryTitleId)}&game_name=${encodeURIComponent(displayGameTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Submit a config
                <ArrowUpRight size={15} />
              </a>
            </div>
          )}
        </section>

        {/* Targeted Forks Section */}
        <section aria-labelledby="game-forks-title">
          <div className="community-subheading">
            <h3 id="game-forks-title">Targeted forks</h3>
            <Link to="/forks">
              All forks
              <ArrowRight size={16} />
            </Link>
          </div>
          {forks.length ? (
            <ForkList forks={forks} showTargets={false} />
          ) : (
            <p>No listed forks specifically target this game yet.</p>
          )}
        </section>
      </div>
    </section>
  );
}
