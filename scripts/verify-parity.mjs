import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { parse as parseYaml } from "yaml";
import { chromium } from "playwright";
import { loadSiteData, buildSitemap } from "./lib/site-data.mjs";
import { buildSiteIndex } from "./lib/compat-export.mjs";
import { buildUpdatesFeed } from "./lib/updates-feed.mjs";

const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const data = await loadSiteData();
const exported = await json("public/data/compat-index.json");
assert.equal(exported.version, 2);
assert.deepEqual(exported.games, JSON.parse(JSON.stringify(data.games)));
assert.deepEqual(await json("public/data/catalog.json"), data.catalog);
assert.deepEqual(await json("public/data/compatibility.json"), data.gui);
for (const old of buildSiteIndex(data.catalog, data.reports)) {
  const { reports, screenshots, ...fields } = old;
  const current = exported.games.find((game) => game.key === old.key);
  for (const [key, value] of Object.entries(fields))
    assert.deepEqual(current[key], value, `${old.key}.${key}`);
  assert.deepEqual(
    (await json(`public/data/compat/${old.key}.json`)).reports,
    JSON.parse(JSON.stringify(reports)),
  );
  for (const image of screenshots ?? [])
    assert(
      current.screenshots.some((item) => item.screenshot === image.screenshot),
    );
}
assert.equal(
  await readFile("public/sitemap.xml", "utf8"),
  buildSitemap(data.games),
);
const snapshot = await json("public/data/github.json");
assert.deepEqual(
  await json("public/data/updates.json"),
  buildUpdatesFeed(snapshot),
);
assert(!("temp_clone_token" in snapshot.repo));
assert(!("permissions" in snapshot.repo));
assert(
  snapshot.latestRelease.assets.every((asset) => !("download_count" in asset)),
);
console.log(
  `PASS original v2 index/detail fields, ${data.reports.length} reports, full catalog, launcher feeds and sitemap`,
);

// These operational workflows/scripts must remain byte-identical to the original
// migration baseline. CI and catalog-PR gates have separate, additive UI checks.
// The converter, poller and status-issues helper intentionally differ only for
// source-scoped trust. trust-pipeline.test.mjs exercises both actual CLIs;
// status-issues.test.mjs covers maintainer overrides and the trust boundary.
const unchanged = [
  ".github/workflows/compat-issues.yml",
  ".github/workflows/compat-convert.yml",
  ".github/workflows/compat-set-fields.yml",
  ".github/workflows/refresh-data.yml",
  ".github/workflows/deploy.yml",
  "scripts/import-games.mjs",
  "scripts/set-compat-override.mjs",
  "scripts/validate-compat.mjs",
  "scripts/export-compat-json.mjs",
  "scripts/lib/compat-export.mjs",
  "scripts/lib/updates-feed.mjs",
];
for (const file of unchanged) {
  const baseline = execFileSync("git", ["show", `8adc056:${file}`], {
    encoding: "utf8",
  });
  assert.equal(
    (await readFile(file, "utf8")).replace(/\r\n/g, "\n"),
    baseline.replace(/\r\n/g, "\n"),
    file,
  );
}
// Only MAIDEN's explicit group identity and product metadata may differ from
// the original catalog transform; other import/refresh behavior stays exact.
const transformPath = "scripts/lib/transform.mjs";
const expectedTransform = execFileSync(
  "git",
  ["show", `8adc056:${transformPath}`],
  { encoding: "utf8" },
)
  .replace(
    "// deduplication, and refresh-merging that preserves enrichment + overrides.\n",
    '// deduplication, and refresh-merging that preserves enrichment + overrides.\nimport { catalogGroupKey, withGroupMetadata } from "./game-group-exceptions.mjs";\n',
  )
  .replace(
    "if (!byConcept.has(row.conceptId)) byConcept.set(row.conceptId, []);\n    byConcept.get(row.conceptId).push(row);",
    "const key = catalogGroupKey(row);\n    if (!byConcept.has(key)) byConcept.set(key, []);\n    byConcept.get(key).push(row);",
  )
  .replace(
    "for (const [conceptId, list] of byConcept)",
    "for (const list of byConcept.values())",
  )
  .replace(
    "games.push({\n      conceptId,",
    "games.push(withGroupMetadata({\n      conceptId: primary.conceptId,",
  )
  .replace(
    "region: primary.region,\n    });",
    "region: primary.region,\n    }));",
  )
  .replace(
    "existing.map((g) => [g.conceptId, g])",
    "existing.map((g) => [catalogGroupKey(g), g])",
  )
  .replace("prev.get(g.conceptId)", "prev.get(catalogGroupKey(g))");
assert.equal(
  (await readFile(transformPath, "utf8")).replace(/\r\n/g, "\n"),
  expectedTransform.replace(/\r\n/g, "\n"),
  "catalog transform differs beyond the MAIDEN-only exception",
);
for (const file of await readdir(".github/workflows")) {
  const workflow = parseYaml(
    await readFile(`.github/workflows/${file}`, "utf8"),
  );
  assert(workflow.on && workflow.jobs, file);
}
console.log(
  "PASS original operational workflows, authorization, imports and Pages deployment retained; source-scoped trust covered by CLI regression tests",
);

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
});
try {
  const context = await browser.newContext({
    serviceWorkers: "block",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(
    () =>
      JSON.parse(document.getElementById("seo-jsonld")?.textContent || "{}")[
        "@type"
      ] === "SoftwareApplication",
  );
  assert.equal(
    await page.locator('meta[name="twitter:card"]').getAttribute("content"),
    "summary_large_image",
  );
  assert(
    await page.locator('meta[property="og:image"]').getAttribute("content"),
  );
  await page.goto(`${base}/faq`);
  await page.getByRole("link", { name: /Ask the community/ }).waitFor();
  assert.equal(
    await page
      .getByRole("link", { name: /Ask the community/ })
      .getAttribute("href"),
    "https://github.com/KytyPS5/KytyPS5/discussions",
  );
  await page.goto(`${base}/compatibility`);
  assert(
    (
      await page
        .getByRole("link", { name: /Open status reports/ })
        .getAttribute("href")
    ).includes("%5BGAME%20STATUS%5D"),
  );
  await page.goto(`${base}/game/PPSA21567`);
  await page.locator(".report").waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector('link[rel="canonical"]')?.href ===
      "https://kytyps5.github.io/game/PPSA21564",
  );
  assert.equal(
    JSON.parse(await page.locator("#seo-jsonld").textContent())["@type"],
    "VideoGame",
  );
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "index,follow",
  );
  const untested = data.catalog.find(
    (entry) =>
      !data.games.some((game) => game.allTitleIds.includes(entry.titleId)),
  );
  assert(untested, "untested catalog fixture");
  await page.goto(`${base}/game/${untested.titleId}`);
  await page
    .getByRole("heading", { name: untested.name, exact: true })
    .waitFor();
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "noindex,follow",
  );
  await page.goto(`${base}/game/NOT-A-GAME`);
  await page.getByRole("heading", { name: "Game not found." }).waitFor();
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "noindex,follow",
  );
  assert.equal(await page.locator("#seo-jsonld").count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
  console.log(
    "PASS original community/report destinations, structured data, regional canonical URLs and untested/not-found indexing rules",
  );
} finally {
  await browser.close();
}
