import * as React from "react";
import { type CompatIndexGame } from "@/lib/compat";

export interface CompatIndexState {
  /** Slim index (tested games only) — the committed seed until the deployed JSON refreshes it. */
  games: CompatIndexGame[] | null;
  /** True until the runtime JSON resolves (or fails) — pages can gate on this. */
  loading: boolean;
}

/** Resolved value + in-flight promise, cached at module scope so the index is fetched once and shared. */
let cache: CompatIndexGame[] | null = null;
let promise: Promise<CompatIndexGame[] | null> | null = null;

/**
 * The deployed slim index, loaded once (module-level cache). Resolves to the
 * committed build-time seed (src/data/compat-index.json) when the fetch fails
 * or the file is missing (dev without a build, offline). The payload carries
 * only tested games with their precomputed statuses — the client never parses
 * report markdown.
 */
function loadCompatIndex(): Promise<CompatIndexGame[] | null> {
  promise ??= (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/compat-index.json`);
      if (res.ok) {
        const payload = (await res.json()) as { games?: CompatIndexGame[] };
        if (payload?.games?.length) return (cache = payload.games);
      }
    } catch {
      /* fall back to the committed seed below */
    }
    return (cache = ((await import("../data/compat-index.json")).default as CompatIndexGame[]) ?? null);
  })();
  return promise;
}

/**
 * Slim compatibility index for the current page: loaded from the deployed
 * data/compat-index.json (a report merged through a content-only deploy goes
 * live without a rebuild), falling back to the committed seed when the fetch
 * fails. The first mount kicks off the load; later mounts read the module cache
 * synchronously — no loading flash, no refetch.
 */
export function useCompatIndex(): CompatIndexState {
  const [games, setGames] = React.useState(cache);

  React.useEffect(() => {
    if (cache) return; // already resolved — nothing to do
    let alive = true;
    loadCompatIndex().then((resolved) => {
      if (alive) setGames(resolved);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { games, loading: games === null };
}
