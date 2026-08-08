/**
 * Homepage carousel slides — data-driven from the compatibility reports that
 * carry a `screenshot`, newest first. Adding a report with a screenshot
 * automatically adds a slide; no hardcoded image list to maintain.
 */
import { gamePageKey, type CompatReport } from "@/lib/compat";
import { siteAssetUrl } from "@/lib/utils";

export interface CarouselSlide {
  src: string;
  title: string;
  to: string;
}

/** Derive carousel slides from a report list (bundle seed or runtime JSON). */
export function buildCarouselSlides(reports: readonly CompatReport[]): CarouselSlide[] {
  return reports
    .filter((r): r is CompatReport & { screenshot: string } => Boolean(r.screenshot))
    .slice()
    .sort((a, b) => (a.testedDate < b.testedDate ? 1 : -1))
    .map((r) => ({
      src: siteAssetUrl(r.screenshot),
      title: r.title,
      to: `/game/${gamePageKey(r)}`,
    }));
}


