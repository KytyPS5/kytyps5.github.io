import { useCallback, useEffect, useRef, useState } from "react";
import { githubSnapshot, type GithubSnapshot } from "@/lib/github";

interface GithubDataState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Data hook mirroring 's "build renders + browser re-fetches"
 * model: the build-time snapshot (public/data/github.json) is applied the
 * moment it loads — zero API calls, immune to rate limits — then the live
 * GitHub API refreshes it for freshness. If the live fetch fails but a
 * snapshot exists, the snapshot stays (visitors never see a blank state).
 *
 * A request-id ref guarantees an older in-flight request can never overwrite
 * a newer one (e.g. after a manual retry).
 */
export function useGithubData<T>(
  fetcher: () => Promise<T>,
  snapshotKey?: keyof GithubSnapshot,
): GithubDataState<T> & { retry: () => void } {
  const [state, setState] = useState<GithubDataState<T>>({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = useRef(0);

  const load = useCallback(() => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    // Layer 1: build-time snapshot (fast, never rate-limited).
    if (snapshotKey) {
      githubSnapshot()
        .then((snap) => {
          if (requestId.current !== id) return;
          const value = snap?.[snapshotKey];
          if (value != null) {
            setState((s) => (s.data === null ? { data: value as T, error: null, loading: false } : s));
          }
        })
        .catch(() => {
          /* snapshot unavailable — live fetch below covers it */
        });
    }

    // Layer 2: live GitHub API (fresh), with memory + localStorage caching.
    fetcherRef
      .current()
      .then((data) => {
        if (requestId.current === id) setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (requestId.current === id) {
          setState((s) =>
            s.data !== null
              ? s // keep snapshot data instead of showing an error
              : { data: null, error: err instanceof Error ? err.message : "Failed to load data", loading: false },
          );
        }
      });
  }, [snapshotKey]);

  useEffect(() => load(), [load]);

  return { ...state, retry: load };
}
