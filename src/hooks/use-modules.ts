import { useMemo } from "react";
import { cachedJson } from "../lib/cache";
import { useRefreshingData } from "./use-refreshing-data";
import {
  type ModulesCatalog,
  type ModuleEntry,
  modulesPagesUrl,
  modulesCdnBase,
  normalizeTitleId,
} from "../data/modules-types";

function isValidModuleEntry(item: unknown): item is ModuleEntry {
  if (!item || typeof item !== "object") return false;
  const e = item as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.version === "string" &&
    typeof e.title === "string" &&
    typeof e.path === "string"
  );
}

function isValidCatalog(data: unknown): data is ModulesCatalog {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const cat = data as Record<string, unknown>;
  const isCategoryRecord = (val: unknown) =>
    typeof val === "object" &&
    val !== null &&
    !Array.isArray(val) &&
    Object.values(val as Record<string, unknown>).every(
      (arr) => Array.isArray(arr) && arr.every(isValidModuleEntry),
    );
  return (
    isCategoryRecord(cat.patches) &&
    isCategoryRecord(cat.cheats) &&
    isCategoryRecord(cat.configs)
  );
}

let primaryFailsUntil = 0;

async function loadModulesCatalog(force = false): Promise<ModulesCatalog> {
  const primaryUrl = `${modulesPagesUrl}/index.min.json`;
  const fallbackUrl = `${modulesCdnBase}/index.min.json`;

  const parseCatalog = async (response: Response): Promise<ModulesCatalog> => {
    const data = await response.json();
    if (!isValidCatalog(data)) {
      throw new Error("Invalid modules catalog format");
    }
    return data;
  };

  const now = Date.now();
  if (!force && now < primaryFailsUntil) {
    return await cachedJson<ModulesCatalog>(fallbackUrl, {
      maxAge: 120_000,
      force,
      allowStale: true,
      parse: parseCatalog,
    });
  }

  try {
    const catalog = await cachedJson<ModulesCatalog>(primaryUrl, {
      maxAge: 120_000,
      force,
      allowStale: false,
      parse: parseCatalog,
    });
    primaryFailsUntil = 0;
    return catalog;
  } catch {
    primaryFailsUntil = Date.now() + 5 * 60 * 1000;
    return await cachedJson<ModulesCatalog>(fallbackUrl, {
      maxAge: 120_000,
      force,
      allowStale: true,
      parse: parseCatalog,
    });
  }
}

export function useModulesCatalog() {
  return useRefreshingData<ModulesCatalog | null>(null, loadModulesCatalog);
}

const EMPTY_IDS: string[] = [];

/**
 * Filter modules for a specific game across all its grouped regional Title IDs (PPSAs).
 */
export function useGameModules(allTitleIds: string[] = EMPTY_IDS) {
  const { data, loading, error, refresh } = useModulesCatalog();

  const titleIdSet = useMemo(() => {
    return new Set(allTitleIds.map(normalizeTitleId).filter(Boolean));
  }, [allTitleIds]);

  const matches = useMemo(() => {
    if (!data) {
      return { patches: [], cheats: [], configs: [] };
    }

    const filterCategory = (record?: Record<string, ModuleEntry[]>) => {
      if (!record || typeof record !== "object") return [];
      const results: ModuleEntry[] = [];
      for (const [id, entries] of Object.entries(record)) {
        if (Array.isArray(entries) && titleIdSet.has(normalizeTitleId(id))) {
          results.push(...entries);
        }
      }
      return results;
    };

    const sortEntries = (entries: ModuleEntry[]) =>
      [...entries].sort((a, b) => {
        const verCmp = b.version.localeCompare(a.version, "en", { numeric: true });
        if (verCmp !== 0) return verCmp;
        if (a.index !== b.index) return a.index - b.index;
        return a.path.localeCompare(b.path, "en");
      });

    return {
      patches: sortEntries(filterCategory(data.patches)),
      cheats: sortEntries(filterCategory(data.cheats)),
      configs: sortEntries(filterCategory(data.configs)),
    };
  }, [data, titleIdSet]);

  return {
    ...matches,
    loading,
    error,
    refresh,
  };
}
