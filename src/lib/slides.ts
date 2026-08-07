/**
 * Homepage carousel slides — data-driven, like 's homepage "latest
 * reports" cards. Slides are derived from the compatibility reports that carry
 * a `screenshot`, newest first. Adding a report with a screenshot automatically
 * adds a slide; no hardcoded image list to maintain.
 */
import { COMPAT_REPORTS, gamePageKey, type CompatReport } from "@/lib/compat";

export interface CarouselSlide {
  src: string;
  title: string;
  to: string;
}

export const CAROUSEL_SLIDES: CarouselSlide[] = COMPAT_REPORTS.filter(
  (r): r is CompatReport & { screenshot: string } => Boolean(r.screenshot),
)
  .slice()
  .sort((a, b) => (a.testedDate < b.testedDate ? 1 : -1))
  .map((r) => ({
    src: r.screenshot,
    title: r.title,
    to: `/game/${gamePageKey(r)}`,
  }));
