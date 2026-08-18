import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolve a site-relative asset path (e.g. "screenshots/ps5-01.png") against
 * BASE_URL so it works under any deployment subpath (GitHub Pages project
 * sites include the repo name). Absolute http(s)/data/blob URLs and
 * protocol-relative URLs pass through unchanged.
 */
export function siteAssetUrl(src: string): string {
  if (/^(?:https?:|data:|blob:)/i.test(src) || src.startsWith("//")) return src;
  const clean = src.replace(/^\.\//, "").replace(/^\//, "");
  return import.meta.env.BASE_URL + clean;
}

/** Format a byte count as a human-readable size (e.g. "20.5 MB"). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Format an ISO date as a readable date string. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}
