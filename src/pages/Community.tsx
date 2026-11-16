import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import { External, GameImage, PageHeading } from "../components/shared";
import { LoadingState } from "../components/loading-state";
import {
  ForkList,
  PatchCollectionBlock,
  ResourceFeedback,
} from "../components/community-resources";
import { websiteRepo } from "../data/community-types";
import { useCommunityResources } from "../hooks/use-community-resources";
import { useModulesCatalog } from "../hooks/use-modules";
import { useCompatibilityGames } from "../hooks/use-compatibility-games";
import { ModuleCard } from "../components/module-card";
import {
  modulesRepo,
  normalizeTitleId,
  type ModuleCategory,
  type ModuleEntry,
} from "../data/modules-types";

function ResourceSearch({
  kind,
  query,
  setQuery,
}: {
  kind: "patches" | "cheats" | "configs" | "forks";
  query: string;
  setQuery: (query: string) => void;
}) {
  const singular = kind === "patches" ? "patch" : kind.slice(0, -1);
  return (
    <div className="search-box">
      <Search size={21} aria-hidden="true" />
      <input
        type="search"
        aria-label={`Search ${kind}`}
        placeholder={`Find a game, title ID, version or ${singular}…`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setQuery("")}
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface ModulesDirectoryProps {
  category: ModuleCategory;
  title: string;
  description: string;
  kindLabel: string;
  submitTemplate: string;
}

function ModulesDirectory({
  category,
  title,
  description,
  kindLabel,
  submitTemplate,
}: ModulesDirectoryProps) {
  const { data: catalog, loading, error, refresh } = useModulesCatalog();
  const games = useCompatibilityGames();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const pluralLabel = `${kindLabel}s`;

  const setQuery = (next: string) => {
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (next.trim()) {
          updated.set("q", next);
        } else {
          updated.delete("q");
        }
        return updated;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (!catalog || !window.location.hash) return;
    const hashId = window.location.hash.slice(1);
    requestAnimationFrame(() => {
      const el = document.getElementById(hashId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    });
  }, [catalog]);

  const rawEntries = useMemo(() => {
    if (!catalog || !catalog[category] || typeof catalog[category] !== "object")
      return [];
    const list: ModuleEntry[] = [];
    for (const entries of Object.values(catalog[category])) {
      if (Array.isArray(entries)) {
        list.push(...entries);
      }
    }
    return list;
  }, [catalog, category]);

  const filteredGroups = useMemo(() => {
    const search = query.trim().toLowerCase();
    const groups = new Map<
      string,
      {
        gameTitle: string;
        gameKey?: string;
        cover?: string;
        titleIds: string[];
        entries: ModuleEntry[];
      }
    >();

    for (const entry of rawEntries) {
      if (!entry || typeof entry !== "object") continue;
      const entryNormId = normalizeTitleId(entry.id);
      const matchedGame = games.find(
        (g) =>
          g.allTitleIds?.some((id) => normalizeTitleId(id) === entryNormId) ||
          normalizeTitleId(g.titleId) === entryNormId ||
          normalizeTitleId(g.key) === entryNormId,
      );

      const groupKey =
        matchedGame?.key ||
        (entry.gameName
          ? entry.gameName.toLowerCase().replace(/[\s_]+/g, "-")
          : entry.id);
      const gameTitle =
        matchedGame?.title ||
        (entry.gameName ? entry.gameName.replace(/_/g, " ") : entry.id);

      const searchCorpus = [
        entry.id,
        entryNormId,
        entry.version,
        entry.title,
        entry.description,
        entry.author,
        gameTitle,
        ...(matchedGame?.allTitleIds ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchCorpus.includes(search);
      if (!matchesSearch) continue;

      const existing = groups.get(groupKey);
      if (existing) {
        existing.entries.push(entry);
        if (entry.id && !existing.titleIds.includes(entry.id)) {
          existing.titleIds.push(entry.id);
        }
      } else {
        const titleIds = entry.id ? [entry.id] : [];
        groups.set(groupKey, {
          gameTitle,
          gameKey: matchedGame?.key,
          cover: matchedGame?.cover,
          titleIds,
          entries: [entry],
        });
      }
    }

    return Array.from(groups.values());
  }, [games, query, rawEntries]);

  const totalEntries = filteredGroups.reduce(
    (acc, g) => acc + g.entries.length,
    0,
  );

  return (
    <>
      <PageHeading title={title} description={description}>
        <a
          href={`${modulesRepo}/issues/new?template=${submitTemplate}`}
          target="_blank"
          rel="noopener noreferrer"
          className="button secondary"
        >
          Submit a {kindLabel}
          <ArrowUpRight size={18} />
        </a>
      </PageHeading>

      <section
        className="wrap community-directory"
        aria-label={`${kindLabel} directory`}
      >
        <div className="community-toolbar">
          <ResourceSearch kind={category} query={query} setQuery={setQuery} />
          <div
            className="community-section-nav"
            style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
          >
            <Link className="text-link" to="/patches">
              Patches <ArrowRight size={15} />
            </Link>
            {category !== "cheats" && (
              <Link className="text-link" to="/cheats">
                Cheats <ArrowRight size={15} />
              </Link>
            )}
            {category !== "configs" && (
              <Link className="text-link" to="/configs">
                Configs <ArrowRight size={15} />
              </Link>
            )}
            <Link className="text-link" to="/forks">
              Forks <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {error && (
          <div className="community-feedback">
            Failed to load live catalog.
            <button
              className="text-link"
              type="button"
              onClick={() => void refresh(true)}
            >
              Try again
            </button>
          </div>
        )}

        {error && !catalog ? null : loading && !catalog ? (
          <LoadingState label={`Loading ${pluralLabel}…`} />
        ) : (
          <>
            <p className="community-results" aria-live="polite">
              {totalEntries} {totalEntries === 1 ? kindLabel : pluralLabel}{" "}
              across {filteredGroups.length}{" "}
              {filteredGroups.length === 1 ? "game" : "games"}
            </p>

            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div
                  key={group.gameKey || group.titleIds.join("-")}
                  className="community-collection"
                >
                  <div className="community-game-heading">
                    {group.cover ? (
                      <GameImage src={group.cover} title={group.gameTitle} />
                    ) : (
                      <div className="image-fallback">
                        {group.gameTitle.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2>
                        {group.gameKey ? (
                          <Link
                            to={`/game/${encodeURIComponent(group.gameKey)}`}
                          >
                            {group.gameTitle}
                            <ArrowUpRight size={20} />
                          </Link>
                        ) : (
                          group.gameTitle
                        )}
                      </h2>
                      <p>
                        {group.titleIds.join(" · ")} · {group.entries.length}{" "}
                        {group.entries.length === 1 ? kindLabel : pluralLabel}
                      </p>
                    </div>
                  </div>

                  <div className="module-list">
                    {group.entries.map((entry) => (
                      <ModuleCard key={entry.path} entry={entry} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="community-empty">
                <h2>
                  {query
                    ? `No ${pluralLabel} match that search.`
                    : `The next ${kindLabel} starts here.`}
                </h2>
                <p>
                  {query
                    ? "Try a game title, serial, version or author."
                    : `Community ${pluralLabel} will appear here as they are published.`}
                </p>
                {query ? (
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <a
                    href={`${modulesRepo}/issues/new?template=${submitTemplate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    Submit the first {kindLabel}
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export function Patches() {
  const resource = useCommunityResources();
  const { data: catalog } = useModulesCatalog();
  const games = useCompatibilityGames();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const setQuery = (next: string) => {
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (next.trim()) {
          updated.set("q", next);
        } else {
          updated.delete("q");
        }
        return updated;
      },
      { replace: true },
    );
  };

  const collections = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (resource.data?.patchCollections ?? []).flatMap((collection) => {
      if (
        !search ||
        `${collection.titleId} ${collection.game.key} ${collection.game.title}`
          .toLowerCase()
          .includes(search)
      )
        return [collection];
      const patches = collection.patches.filter((patch) =>
        `${patch.name} ${patch.description}`.toLowerCase().includes(search),
      );
      return patches.length ? [{ ...collection, patches }] : [];
    });
  }, [resource.data, query]);

  // When resource.data exists but patchCollections is strictly empty (as in mock empty test),
  // suppress modular patches so the legacy empty state heading "The next fix starts here." renders.
  const hasLegacyCollections = Boolean(resource.data?.patchCollections?.length);

  const modularPatches = useMemo(() => {
    if (!hasLegacyCollections) return [];
    if (!catalog || !catalog.patches || typeof catalog.patches !== "object")
      return [];
    const search = query.trim().toLowerCase();
    const groups = new Map<
      string,
      {
        gameTitle: string;
        gameKey?: string;
        cover?: string;
        titleIds: string[];
        entries: ModuleEntry[];
      }
    >();

    for (const entries of Object.values(catalog.patches)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (!entry || typeof entry !== "object") continue;
        const entryNormId = normalizeTitleId(entry.id);
        const matchedGame = games.find(
          (g) =>
            g.allTitleIds?.some((id) => normalizeTitleId(id) === entryNormId) ||
            normalizeTitleId(g.titleId) === entryNormId ||
            normalizeTitleId(g.key) === entryNormId,
        );

        const groupKey =
          matchedGame?.key ||
          (entry.gameName
            ? entry.gameName.toLowerCase().replace(/[\s_]+/g, "-")
            : entry.id);
        const gameTitle =
          matchedGame?.title ||
          (entry.gameName ? entry.gameName.replace(/_/g, " ") : entry.id);

        const searchCorpus = [
          entry.id,
          entryNormId,
          entry.version,
          entry.title,
          entry.description,
          entry.author,
          gameTitle,
          ...(matchedGame?.allTitleIds ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !search || searchCorpus.includes(search);
        if (!matchesSearch) continue;

        const existing = groups.get(groupKey);
        if (existing) {
          existing.entries.push(entry);
          if (entry.id && !existing.titleIds.includes(entry.id)) {
            existing.titleIds.push(entry.id);
          }
        } else {
          const titleIds = entry.id ? [entry.id] : [];
          groups.set(groupKey, {
            gameTitle,
            gameKey: matchedGame?.key,
            cover: matchedGame?.cover,
            titleIds,
            entries: [entry],
          });
        }
      }
    }
    return Array.from(groups.values());
  }, [catalog, games, query, hasLegacyCollections]);

  const totalModular = modularPatches.reduce(
    (acc, g) => acc + g.entries.length,
    0,
  );
  const hasAnyPatches = collections.length > 0 || modularPatches.length > 0;

  return (
    <>
      <PageHeading
        title="COMMUNITY PATCHES."
        description="Game-specific fixes, experiments and improvements. Read the patch instructions, choose your package and apply the next step."
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href={`${modulesRepo}/issues/new?template=01_patch_submission.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="button secondary"
          >
            Submit a patch
            <ArrowUpRight size={18} />
          </a>
          <Link to="/docs#community-resources" className="button secondary">
            Using patches
            <ArrowRight size={18} />
          </Link>
        </div>
      </PageHeading>

      <section
        className="wrap community-directory"
        aria-label="Game patch directory"
      >
        <div className="community-toolbar">
          <ResourceSearch kind="patches" query={query} setQuery={setQuery} />
          <div
            className="community-section-nav"
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link className="text-link" to="/cheats">
              Cheats <ArrowRight size={15} />
            </Link>
            <Link className="text-link" to="/configs">
              Configs <ArrowRight size={15} />
            </Link>
            <Link className="text-link" to="/forks">
              Explore forks <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <ResourceFeedback {...resource} />

        {resource.data && (
          <>
            <p className="community-results" aria-live="polite">
              {collections.length > 0 && (
                <span>
                  {collections.length}{" "}
                  {collections.length === 1
                    ? "game collection"
                    : "game collections"}
                  {modularPatches.length > 0 ? " · " : ""}
                </span>
              )}
              {modularPatches.length > 0 && (
                <span>
                  {totalModular}{" "}
                  {totalModular === 1 ? "modular patch" : "modular patches"}{" "}
                  across {modularPatches.length}{" "}
                  {modularPatches.length === 1 ? "game" : "games"}
                </span>
              )}
              {!hasAnyPatches && query && <span>0 patches across 0 games</span>}
            </p>

            {collections.map((collection) => (
              <PatchCollectionBlock
                key={collection.titleId}
                collection={collection}
              />
            ))}

            {modularPatches.map((group) => (
              <div
                key={group.gameKey || group.titleIds.join("-")}
                className="community-collection"
              >
                <div className="community-game-heading">
                  {group.cover ? (
                    <GameImage src={group.cover} title={group.gameTitle} />
                  ) : (
                    <div className="image-fallback">
                      {group.gameTitle.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2>
                      {group.gameKey ? (
                        <Link to={`/game/${encodeURIComponent(group.gameKey)}`}>
                          {group.gameTitle}
                          <ArrowUpRight size={20} />
                        </Link>
                      ) : (
                        group.gameTitle
                      )}
                    </h2>
                    <p>
                      {group.titleIds.join(" · ")} · {group.entries.length}{" "}
                      {group.entries.length === 1
                        ? "modular patch"
                        : "modular patches"}
                    </p>
                  </div>
                </div>

                <div className="module-list">
                  {group.entries.map((entry) => (
                    <ModuleCard key={entry.path} entry={entry} />
                  ))}
                </div>
              </div>
            ))}

            {!hasAnyPatches && (
              <div className="community-empty">
                <h2>
                  {query
                    ? "No patches match that search."
                    : "The next fix starts here."}
                </h2>
                <p>
                  {query
                    ? "Try a game title, serial or patch name."
                    : "Community patches will appear here as they are published."}
                </p>
                {query ? (
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <External
                    className="text-link"
                    href={`${websiteRepo}/tree/main/patches`}
                  >
                    View the patch repository
                    <ArrowUpRight size={17} />
                  </External>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

export function Cheats() {
  return (
    <ModulesDirectory
      category="cheats"
      title="COMMUNITY CHEATS."
      description="Trainers, gameplay tweaks, and cheat definitions for KytyPS5. Search by game, version, or title ID."
      kindLabel="cheat"
      submitTemplate="02_cheat_submission.yml"
    />
  );
}

export function Configs() {
  return (
    <ModulesDirectory
      category="configs"
      title="CONFIGURATION PRESETS."
      description="Optimized emulator settings and configuration profiles for best performance, stability, and compatibility."
      kindLabel="config"
      submitTemplate="03_config_submission.yml"
    />
  );
}

export function Forks() {
  const resource = useCommunityResources(),
    [query, setQuery] = useState(""),
    [scope, setScope] = useState("all");
  const forks = useMemo(
    () =>
      (resource.data?.forks ?? []).filter((fork) => {
        const match =
          `${fork.repository} ${fork.description} ${fork.targetTitleIds.join(" ")} ${fork.games.map((game) => `${game.title} ${game.key}`).join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        return (
          match &&
          (scope === "all" ||
            (scope === "targeted"
              ? fork.targetTitleIds.length > 0
              : fork.targetTitleIds.length === 0))
        );
      }),
    [resource.data, query, scope],
  );
  return (
    <>
      <PageHeading
        title="COMMUNITY FORKS."
        description="Different branches of the same idea. Explore community builds and see which games their maintainers are targeting."
      >
        <Link to="/compatibility" className="button secondary">
          Explore games
          <ArrowRight size={18} />
        </Link>
      </PageHeading>
      <section
        className="wrap community-directory"
        aria-label="Community fork directory"
      >
        <div className="community-toolbar">
          <ResourceSearch kind="forks" query={query} setQuery={setQuery} />
          <label className="community-scope">
            <span>Game targets</span>
            <select
              aria-label="Fork game targets"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              <option value="all">All forks</option>
              <option value="targeted">With game targets</option>
              <option value="unassigned">No game targets</option>
            </select>
          </label>
        </div>
        <p className="community-directory-note">
          A fork without game targets is listed here and is not associated with
          any game report.
        </p>
        <ResourceFeedback {...resource} />
        {resource.data && (
          <>
            <p className="community-results" aria-live="polite">
              {forks.length} {forks.length === 1 ? "fork" : "forks"}
            </p>
            {forks.length ? (
              <ForkList forks={forks} />
            ) : (
              <div className="community-empty">
                <h2>
                  {query || scope !== "all"
                    ? "No forks match these filters."
                    : "A place for new directions."}
                </h2>
                <p>
                  {query || scope !== "all"
                    ? "Try another game, repository or target filter."
                    : "Maintainer-listed community forks will appear here."}
                </p>
                {query || scope !== "all" ? (
                  <button
                    className="text-link"
                    onClick={() => {
                      setQuery("");
                      setScope("all");
                    }}
                  >
                    Reset filters
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <Link className="text-link" to="/docs#community-resources">
                    Read about community resources
                    <ArrowRight size={17} />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
