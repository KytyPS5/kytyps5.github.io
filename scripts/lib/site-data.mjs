import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import {
  buildSiteIndex,
  buildCompatibilityDb,
  parseReport,
  siteGameKey,
} from "./compat-export.mjs";
import {
  buildPreviousBests,
  loadPeakLedger,
  peakReports,
} from "./report-history.mjs";

/** Original ingestion/parser contracts, enriched for the redesigned frontend. */
export function buildSiteData(catalog, reports, history = []) {
  const previousBests = buildPreviousBests(catalog, reports, history);
  const metadata = new Map(
    catalog.flatMap((game) =>
      [game.titleId, ...(game.allTitleIds ?? [])].map((id) => [
        siteGameKey(id),
        game,
      ]),
    ),
  );
  const aliases = {},
    details = {};
  const games = buildSiteIndex(catalog, reports).map((entry) => {
    const { reports: tests, ...base } = entry;
    const game = metadata.get(siteGameKey(entry.titleId));
    const detail = {
      version: 2,
      key: entry.key,
      title: entry.title,
      titleId: entry.titleId,
      reports: tests,
      ...(previousBests[entry.key]
        ? { previousBest: previousBests[entry.key] }
        : {}),
    };
    details[entry.key] = detail;
    const allTitleIds = game?.allTitleIds ?? [entry.titleId];
    for (const id of [entry.titleId, ...allTitleIds])
      aliases[siteGameKey(id)] = entry.key;
    for (const report of tests) {
      aliases[report.slug] = entry.key;
      aliases[siteGameKey(report.titleId)] = entry.key;
    }
    return {
      ...base,
      allTitleIds,
      publisher: game?.publisher,
      releaseDate: game?.releaseDate,
      genres: game?.genres,
      aliases: tests.map((report) => report.slug),
      reportRevision: createHash("sha256")
        .update(JSON.stringify(detail))
        .digest("hex")
        .slice(0, 16),
      latestReport: { os: tests[0].os, testedDate: tests[0].testedDate },
      screenshots: tests.flatMap((report) =>
        (report.screenshots?.length
          ? report.screenshots
          : report.screenshot
            ? [report.screenshot]
            : []
        ).map((screenshot) => ({
          title: entry.title,
          screenshot,
          testedDate: report.testedDate,
          os: report.os,
        })),
      ),
    };
  });
  return { games, aliases, details, gui: buildCompatibilityDb(reports) };
}

export async function loadSiteData({ backfillHistory = false } = {}) {
  const catalog = JSON.parse(await readFile("src/data/games.json", "utf8"));
  const files = (await readdir("src/content/compat"))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const reports = await Promise.all(
    files.map(async (file) =>
      parseReport(
        await readFile(`src/content/compat/${file}`, "utf8"),
        file.slice(0, -3),
      ),
    ),
  );
  const peakLedger = await loadPeakLedger(catalog, reports, {
    backfill: backfillHistory,
  });
  return {
    ...buildSiteData(catalog, reports, peakReports(peakLedger)),
    peakLedger,
    catalog,
    reports,
  };
}

export function buildSitemap(games) {
  const routes = [
    ["/", "weekly", "1.0"],
    ["/download", "daily", "0.9"],
    ["/compatibility", "weekly", "0.8"],
    ["/patches", "weekly", "0.7"],
    ["/cheats", "weekly", "0.7"],
    ["/configs", "weekly", "0.7"],
    ["/forks", "weekly", "0.7"],
    ["/docs", "weekly", "0.8"],
    ["/faq", "monthly", "0.7"],
    ["/contributing", "monthly", "0.6"],
    ["/about", "monthly", "0.6"],
    ...games.map((game) => [
      `/game/${encodeURIComponent(game.key)}`,
      "weekly",
      "0.7",
    ]),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(([route, frequency, priority]) => `<url><loc>https://kytyps5.github.io${route}</loc><changefreq>${frequency}</changefreq><priority>${priority}</priority></url>`).join("")}</urlset>\n`;
}
