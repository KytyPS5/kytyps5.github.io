/* Typed GitHub REST client for the KytyPS5 repository.
   No hardcoded stats — everything is fetched live. */

export const REPO_URL = "https://github.com/KytyPS5/KytyPS5";
export const REPO = "KytyPS5/KytyPS5";
/** This website's own repository — compat mirror issues live here. */
export const SITE_REPO_URL = "https://github.com/KytyPS5/kytyps5.github.io";
const API = "https://api.github.com/repos/" + REPO;

/* ---------- Types (subset of the GitHub API) ---------- */

export interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count: number;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  pushed_at: string;
  created_at: string;
  html_url: string;
}

export interface GitHubAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  body: string;
  html_url: string;
  assets: GitHubAsset[];
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string; name: string };
  };
  author: { login: string; avatar_url: string } | null;
}

/* ---------- Client (with in-flight dedup + TTL cache) ---------- */

/** Deduplicate concurrent requests and cache results to respect the
    unauthenticated GitHub API rate limit (60 requests/hour/IP). */
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 20;
const cache = new Map<string, { promise?: Promise<unknown>; value?: unknown; ts: number }>();

/** Evict the oldest entry when the cache grows beyond its bound. */
function pruneCache() {
  if (cache.size <= MAX_CACHE_ENTRIES) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
  if (oldest) cache.delete(oldest[0]);
}

/* Second cache layer: localStorage, so returning visitors don't re-fetch
   within the TTL window (cuts per-visitor API usage when deployed). */
const STORAGE_PREFIX = "kytyps5:gh:";
const STORAGE_TTL_MS = 30 * 60 * 1000;

function storageGet<T>(url: string): T | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + url);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; value: T };
    if (Date.now() - parsed.ts > STORAGE_TTL_MS) {
      window.localStorage.removeItem(STORAGE_PREFIX + url);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function storageSet(url: string, value: unknown) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + url, JSON.stringify({ ts: Date.now(), value }));
  } catch {
    /* storage unavailable or full */
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const entry = cache.get(url);
  if (entry?.value && Date.now() - entry.ts < CACHE_TTL_MS) return entry.value as T;
  if (entry?.promise) return entry.promise as Promise<T>;

  // Second layer: cross-visit localStorage cache.
  const stored = storageGet<T>(url);
  if (stored) {
    cache.set(url, { value: stored, ts: Date.now() });
    return stored;
  }

  const promise = (async () => {
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`GitHub API request failed (${res.status})`);
    const data = (await res.json()) as T;
    cache.set(url, { value: data, ts: Date.now() });
    storageSet(url, data);
    pruneCache();
    return data;
  })();
  cache.set(url, { promise, ts: Date.now() });
  pruneCache();

  try {
    return (await promise) as T;
  } catch (error) {
    cache.delete(url);
    throw error;
  }
}

async function fetchContributorCount(): Promise<number | null> {
  const url = `${API}/contributors?per_page=1&anon=true`;
  const entry = cache.get(url);
  if (entry?.value !== undefined && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.value as number | null;
  }
  if (entry?.promise) return entry.promise as Promise<number | null>;

  const stored = storageGet<number>(url);
  if (stored != null) {
    cache.set(url, { value: stored, ts: Date.now() });
    return stored;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const link = res.headers.get("link") || "";
      const match = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
      let count: number | null = null;
      if (match) {
        count = Number(match[1]);
      } else {
        const data = await res.json();
        count = Array.isArray(data) ? data.length : null;
      }
      if (count != null) {
        cache.set(url, { value: count, ts: Date.now() });
        storageSet(url, count);
      }
      pruneCache();
      return count;
    } catch {
      cache.delete(url);
      return null;
    }
  })();
  cache.set(url, { promise, ts: Date.now() });
  pruneCache();

  return promise;
}

export const githubApi = {
  repo: () => fetchJson<GitHubRepo>(API),
  latestRelease: () => fetchJson<GitHubRelease>(`${API}/releases/latest`),
  contributors: (perPage = 14) =>
    fetchJson<GitHubContributor[]>(`${API}/contributors?per_page=${perPage}`),
  contributorCount: () => fetchContributorCount(),
  recentCommits: (perPage = 6) => fetchJson<GitHubCommit[]>(`${API}/commits?per_page=${perPage}`),
};

/* ---------- Build-time snapshot (no runtime API calls) ---------- */

/** Shape of public/data/github.json, written by scripts/fetch-github-data.mjs. */
export interface GithubSnapshot {
  generatedAt: string | null;
  repo: GitHubRepo | null;
  latestRelease: GitHubRelease | null;
  contributors: GitHubContributor[] | null;
  contributorsCount?: number | null;
  commits: GitHubCommit[] | null;
}

let snapshotPromise: Promise<GithubSnapshot | null> | null = null;

/** Load the build-time snapshot once. Returns null in dev if it wasn't generated. */
export function githubSnapshot(): Promise<GithubSnapshot | null> {
  if (!snapshotPromise) {
    snapshotPromise = fetch(`${import.meta.env.BASE_URL}data/github.json`)
      .then((res) => (res.ok ? (res.json() as Promise<GithubSnapshot>) : null))
      .catch(() => null);
  }
  return snapshotPromise;
}

/* ---------- Updates feed (/data/updates.json) ---------- */

export interface UpdateAsset {
  name: string;
  url: string;
  size: number;
}

/** Shape of public/data/updates.json, consumed by the KytyPS5 desktop launcher. */
export interface UpdateFeed {
  generated_at: string;
  tag: string;
  commit: string;
  published_at: string;
  html_url: string;
  changelog: string[];
  assets: {
    windows: UpdateAsset | null;
    linux: UpdateAsset | null;
    macos: UpdateAsset | null;
  };
}

let updatesPromise: Promise<UpdateFeed | null> | null = null;

/** Fetch the static update feed. Returns null if unreachable. */
export function updatesFeed(): Promise<UpdateFeed | null> {
  if (!updatesPromise) {
    updatesPromise = fetch(`${import.meta.env.BASE_URL}data/updates.json`)
      .then((res) => (res.ok ? (res.json() as Promise<UpdateFeed>) : null))
      .catch(() => null);
  }
  return updatesPromise;
}

/* ---------- Media ---------- */

// Screenshots are now data-driven: the homepage carousel derives its slides
// from compatibility reports that carry a `screenshot` field (see src/lib/slides.ts).
