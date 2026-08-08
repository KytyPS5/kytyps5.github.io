/**
 * Build-time snapshot of every compatibility report, baked into the bundle.
 *
 * Only the game-page path imports this module: the index and homepage consume
 * the slim compat-index payload instead, so the raw report markdown ships only
 * with game-page chunks — not with the routes that just render statuses.
 *
 * The snapshot is the fallback for the per-game detail fetch (a 404, a failed
 * fetch, dev-without-build, and legacy slug links that have no detail file).
 */
import { parseCompatReport, type CompatReport } from "@/lib/compat";

const modules = import.meta.glob("../content/compat/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const COMPAT_REPORTS: CompatReport[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    try {
      return parseCompatReport(raw as string, slug);
    } catch (error) {
      // Fatal at build time (see scripts/validate-compat.mjs); surface in dev too.
      console.error(`[compat] ${(error as Error).message}`);
      return null;
    }
  })
  .filter((r): r is CompatReport => r !== null)
  .sort((a, b) => a.title.localeCompare(b.title));
