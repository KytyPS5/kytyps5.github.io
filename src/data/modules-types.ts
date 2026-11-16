export const modulesRepo = "https://github.com/KytyPS5/KytyPS5-Modules";
export const modulesPagesUrl = "https://kytyps5.github.io/KytyPS5-Modules";
export const modulesCdnBase = "https://cdn.jsdelivr.net/gh/KytyPS5/KytyPS5-Modules@main";

export interface ModuleEntry {
  id: string;
  version: string;
  gameName?: string;
  index: number;
  title: string;
  description?: string;
  author?: string;
  path: string;
  sha256?: string;
  size?: number;
}

export type ModuleCategory = "patches" | "cheats" | "configs";

export interface ModulesCatalog {
  version: number;
  catalogHash: string;
  updatedAt: string;
  patches: Record<string, ModuleEntry[]>;
  cheats: Record<string, ModuleEntry[]>;
  configs: Record<string, ModuleEntry[]>;
}

export function normalizeTitleId(id?: string | null): string {
  if (typeof id !== "string") return "";
  return id.trim().toUpperCase().replace(/[-_\s]/g, "");
}
