import * as React from "react";
import { type CompatReport } from "@/lib/compat";

export interface CompatGameState {
  /**
   * The game's full reports from the deployed per-game detail file
   * (public/data/compat/<KEY>.json), or null while loading / when the file is
   * missing (untested game, legacy slug link, dev without a build). Callers
   * fall back to the bundle seed (src/lib/compat-seed.ts) on null.
   */
  detail: CompatReport[] | null;
  /** True until the detail fetch settles (404 included). */
  loading: boolean;
}

const detailPromises = new Map<string, Promise<CompatReport[] | null>>();

/**
 * Fetch one game's detail payload once per canonical key. The per-game files
 * are small (~1–2 KB) and fetched only by the game page, so visitors never
 * download the whole report corpus for a single game.
 */
export function loadCompatGame(key: string): Promise<CompatReport[] | null> {
  const cached = detailPromises.get(key);
  if (cached) return cached;
  const promise = fetch(`${import.meta.env.BASE_URL}data/compat/${encodeURIComponent(key)}.json`)
    .then((res) => (res.ok ? (res.json() as Promise<{ reports?: CompatReport[] }>) : null))
    .then((payload) => (payload?.reports?.length ? payload.reports : null))
    .catch(() => null);
  detailPromises.set(key, promise);
  return promise;
}

/**
 * Full compatibility reports for one game (all its per-OS reports), fetched
 * only when a game page is open. Resolves to null on 404/failure — the page
 * then falls back to the build-time bundle snapshot, so legacy slug links and
 * dev-without-build keep working.
 */
export function useCompatGame(key: string): CompatGameState {
  const [state, setState] = React.useState<CompatGameState>({ detail: null, loading: true });

  React.useEffect(() => {
    let alive = true;
    setState({ detail: null, loading: true });
    loadCompatGame(key).then((detail) => {
      if (alive) setState({ detail, loading: false });
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return state;
}
