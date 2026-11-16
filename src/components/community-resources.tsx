import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { date, External, GameImage } from "./shared";
import { Reveal } from "./primitives";
import { LoadingState } from "./loading-state";
import { useCommunityResources } from "../hooks/use-community-resources";
import { useGameModules } from "../hooks/use-modules";
import { ModuleCard } from "./module-card";
import { modulesRepo, normalizeTitleId } from "../data/modules-types";
import {
  type CommunityFork,
  type CommunityGame,
} from "../data/community-types";

export function ResourceFeedback({
  data,
  loading,
  error,
  refresh,
  label = "Community resources",
}: {
  data: unknown;
  loading: boolean;
  error: boolean;
  refresh: () => void;
  label?: string;
}) {
  if (error && !data)
    return (
      <div className="community-feedback">
        {label} couldn’t load.
        <button className="text-link" onClick={refresh}>
          Try again
        </button>
      </div>
    );
  if (loading && !data) return <LoadingState label={`Loading ${label}…`} />;
  return null;
}

export function ForkList({
  forks,
  scope,
}: {
  forks: CommunityFork[];
  scope?: "all" | "targeted" | "unassigned";
}) {
  return (
    <div className="community-fork-list">
      {forks.map((fork) => (
        <Reveal
          as="article"
          className="community-fork"
          distance={18}
          id={`fork-${fork.repository.replace("/", "-")}`}
          key={fork.repositoryId}
        >
          <div className="community-fork-title">
            <h3>
              <External href={fork.url}>
                {fork.repository}
                <ArrowUpRight size={18} />
              </External>
            </h3>
            {fork.archived && (
              <span className="community-archived">Archived</span>
            )}
          </div>
          <p>{fork.description}</p>
          {fork.targetTitleIds.length > 0 ? (
            <ul
              className="community-targets"
              aria-label={`${fork.repository} game targets`}
            >
              {fork.games.map((game: CommunityGame) => (
                <li key={game.titleId}>
                  <Link to={`/game/${encodeURIComponent(game.key)}`}>
                    {game.title}
                    <span>{game.titleId}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="community-no-targets">
              {scope === "all"
                ? "No game targets listed; works on general KytyPS5 development."
                : "No specific game targets listed."}
            </p>
          )}
          <p className="community-record-date">
            Listed {date(fork.addedAt)}
            {fork.updatedAt !== fork.addedAt &&
              ` · updated ${date(fork.updatedAt)}`}
          </p>
        </Reveal>
      ))}
    </div>
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
          {modularPatches.length > 0 ? (
            <div className="module-list">
              {modularPatches.map((entry) => (
                <ModuleCard key={entry.path} entry={entry} headingLevel="h4" />
              ))}
            </div>
          ) : modulesLoading ? (
            <LoadingState label="Loading patches…" />
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
            <h3 id="game-cheats-title">Community cheats</h3>
            <Link to="/cheats">
              All cheats
              <ArrowRight size={16} />
            </Link>
          </div>
          {modularCheats.length > 0 ? (
            <div className="module-list">
              {modularCheats.map((entry) => (
                <ModuleCard key={entry.path} entry={entry} headingLevel="h4" />
              ))}
            </div>
          ) : modulesLoading ? (
            <LoadingState label="Loading cheats…" />
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
          {modularConfigs.length > 0 ? (
            <div className="module-list">
              {modularConfigs.map((entry) => (
                <ModuleCard key={entry.path} entry={entry} headingLevel="h4" />
              ))}
            </div>
          ) : modulesLoading ? (
            <LoadingState label="Loading configs…" />
          ) : modulesError ? (
            <div className="community-empty-module">
              <p>Unable to load configurations right now.</p>
            </div>
          ) : (
            <div className="community-empty-module">
              <p>No configuration presets listed for this game yet.</p>
              <a
                href={`${modulesRepo}/issues/new?template=03_config_submission.yml&title_id=${encodeURIComponent(primaryTitleId)}&game_name=${encodeURIComponent(displayGameTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Submit a configuration
                <ArrowUpRight size={15} />
              </a>
            </div>
          )}
        </section>

        {/* Forks Section */}
        <section aria-labelledby="game-forks-title">
          <div className="community-subheading">
            <h3 id="game-forks-title">Targeted community forks</h3>
            <Link to="/forks">
              All forks
              <ArrowRight size={16} />
            </Link>
          </div>
          {forks.length ? (
            <ForkList forks={forks} />
          ) : (
            <p className="community-no-targets">
              No community forks are currently targeting this game.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
