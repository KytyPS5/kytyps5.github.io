/**
 * Homepage carousel slides — data-driven from the slim compat index, whose
 * `screenshots` entries carry every report with an attached screenshot,
 * newest first. Adding a report with a screenshot automatically adds a slide;
 * no hardcoded image list to maintain.
 */
import { type CompatIndexGame } from "@/lib/compat";
import { siteAssetUrl } from "@/lib/utils";

export interface CarouselSlide {
  src: string;
  title: string;
  to: string;
}

/** Derive carousel slides from the slim index (build-time seed or runtime JSON). */
export function buildCarouselSlides(games: readonly CompatIndexGame[]): CarouselSlide[] {
  return games
    .flatMap((g) => (g.screenshots ?? []).map((s) => ({ ...s, key: g.key })))
    .sort((a, b) => ((a.testedDate ?? "") < (b.testedDate ?? "") ? 1 : -1))
    .map(({ title, screenshot, key }) => ({
      src: siteAssetUrl(screenshot),
      title,
      to: `/game/${key}`,
    }));
}
