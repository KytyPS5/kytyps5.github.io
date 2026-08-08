import * as React from "react";
import { type CompatIndexGame } from "@/lib/compat";

export interface CompatIndexState {
  /** Slim index (tested games only) — the committed seed until the deployed JSON refreshes it. */
  games: CompatIndexGame[] | null;
  /** True until the runtime JSON resolves (or fails) — pages can gate on this. */
  loading: boolean;
}

let compatIndexPromise: Promise<CompatIndexGame[] | null> | null = null;

/**
 * The deployed slim index, loaded once (module-level cache). Resolves to the
 * committed build-time seed (src/data/compat-index.json) when the fetch fails
 * or the file is missing (dev without a build, offline). The payload carries
 * only tested games with their precomputed statuses — the client never parses
 * report markdown.
 */
export function loadCompatIndex(): Promise<CompatIndexGame[] | null> {
  if (!compatIndexPromise) {
    compatIndexPromise = import("../data/compat-index.json")
      .then((m) => (m.default as CompatIndexGame[]) ?? null)
      .catch(() => null)
      .then(async (seed) => {
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}data/compat-index.json`);
          if (res.ok) {
            const payload = (await res.json()) as { games?: CompatIndexGame[] };
            if (payload?.games?.length) return payload.games;
          }
        } catch {
          /* keep the seed */
        }
        return seed;
      });
  }
  return compatIndexPromise;
}

/**
 * Slim compatibility index for the current page: the committed seed renders
 * immediately as a first-paint snapshot, then the deployed data/compat-index.json
 * refreshes it (a report merged through a content-only deploy goes live without
 * a rebuild). Falls back to the seed when the fetch fails.
 */
export function useCompatIndex(): CompatIndexState {
  const [state, setState] = React.useState<CompatIndexState>({ games: null, loading: true });

  React.useEffect(() => {
    let alive = true;
    // Seed first — instant first paint, no network wait.
    import("../data/compat-index.json")
      .then((m) => {
        if (alive) setState({ games: (m.default as CompatIndexGame[]) ?? null, loading: true });
      })
      .catch(() => {});
    // Then refresh from the deployed JSON (module-cached, fetched once).
    loadCompatIndex().then((games) => {
      if (alive) setState({ games, loading: false });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
