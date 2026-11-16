import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
const index = JSON.parse(
  await readFile("public/data/compat-index.json", "utf8"),
);
const catalog = JSON.parse(await readFile("public/data/catalog.json", "utf8"));
const report = JSON.parse(
  await readFile("public/data/compat/PPSA21564.json", "utf8"),
);
const astro = index.games.find((game) => game.key === "PPSA21564");
const game = {
  key: astro.key,
  titleId: "PPSA21567",
  title: astro.title,
  cover: astro.cover,
};

const fork = {
  repositoryId: 1,
  repository: "fixture/game-fork",
  url: "https://github.com/fixture/game-fork",
  description: "A focused community build.",
  targetTitleIds: ["PPSA21567"],
  games: [game],
  archived: false,
  addedAt: "2026-10-20",
  updatedAt: "2026-10-20",
  addedBy: "fixture",
  sourceUrl: "https://github.com/fixture/site/issues/1",
};

const resources = {
  version: 1,
  forks: [
    fork,
    {
      ...fork,
      repositoryId: 2,
      repository: "fixture/no-targets",
      url: "https://github.com/fixture/no-targets",
      targetTitleIds: [],
      games: [],
    },
  ],
  patchCollections: [],
};

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
});
const evidence = ".impeccable/review/community";
await mkdir(evidence, { recursive: true });

try {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    serviceWorkers: "block",
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();

  let response = resources,
    failResources = false,
    replaceReport = false,
    removeReport = false;

  await context.route("**/data/community.json", (route) =>
    failResources
      ? route.fulfill({ status: 503, body: "Unavailable" })
      : route.fulfill({ json: response }),
  );
  await context.route("**/data/compat-index.json", (route) =>
    route.fulfill({
      json: removeReport
        ? {
            ...index,
            games: index.games.filter((game) => game.key !== astro.key),
          }
        : index,
    }),
  );
  await context.route("**/data/compat/PPSA21564.json", (route) =>
    route.fulfill({
      json: replaceReport
        ? {
            ...report,
            reports: [
              {
                ...report.reports[0],
                notes: "REPLACED REPORT CONTENT",
                status: "logo",
              },
            ],
          }
        : report,
    }),
  );

  // 1. Patches directory verification
  await page.goto(`${base}/patches`);
  await page.locator(".module-card").first().waitFor();
  assert.equal(
    await page.locator("h1").count(),
    1,
    "Module directory must have exactly one h1",
  );

  await page
    .getByRole("searchbox", { name: "Search patches" })
    .fill("not-present-serial-xyz");
  await page
    .getByRole("heading", { name: "No patches match that search." })
    .waitFor();
  await page
    .getByRole("button", { name: "Clear search", exact: true })
    .first()
    .click();
  await page.locator(".module-card").first().waitFor();

  console.log(
    "PASS modern modular patches directory, search filtering and safe rendering",
  );

  // 2. Cheats & Configs directories verification
  await page.goto(`${base}/cheats`);
  await page.locator(".module-card").first().waitFor();
  await page.goto(`${base}/configs`);
  await page.locator(".module-card").first().waitFor();

  console.log("PASS community cheats and configuration preset directories");

  // 3. Forks directory verification
  await page.goto(`${base}/forks`);
  await page.locator(".community-fork").nth(1).waitFor();
  await page.getByLabel("Fork game targets", { exact: true }).selectOption("unassigned");
  assert.equal(await page.locator(".community-fork").count(), 1);
  assert(
    (await page.locator(".community-fork").innerText()).includes(
      "fixture/no-targets",
    ),
  );
  await page.getByLabel("Fork game targets", { exact: true }).selectOption("targeted");
  assert.equal(await page.locator(".community-fork").count(), 1);
  assert(
    (await page.locator(".community-fork").innerText()).includes(
      "fixture/game-fork",
    ),
  );

  // 4. Game page community resources (patches, cheats, configs, forks)
  await page.goto(`${base}/game/PPSA21567`);
  const gameResources = page.locator(".game-community-resources");
  await gameResources.locator(".module-card").first().waitFor();
  assert.equal(await gameResources.locator(".community-fork").count(), 1);
  assert(!(await gameResources.innerText()).includes("fixture/no-targets"));
  assert.equal(
    await page.locator(".report .game-community-resources").count(),
    0,
  );
  await page.getByRole("tab", { name: "Linux", exact: true }).click();
  await gameResources.locator(".module-card").first().waitFor();
  assert.equal(await gameResources.locator(".community-fork").count(), 1);
  replaceReport = true;
  await page.clock.fastForward(301000);
  await page.getByText("REPLACED REPORT CONTENT", { exact: true }).waitFor();
  await gameResources.locator(".module-card").first().waitFor();
  assert.equal(await gameResources.locator(".community-fork").count(), 1);
  console.log(
    "PASS only explicitly targeted forks appear on regional game pages; associations survive report replacement and OS changes",
  );

  // 5. Game page with no report
  const noReportContext = await browser.newContext({
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await noReportContext.route("**/data/community.json", (route) =>
    route.fulfill({ json: resources }),
  );
  await noReportContext.route("**/data/compat-index.json", (route) =>
    route.fulfill({
      json: {
        ...index,
        games: index.games.filter((game) => game.key !== astro.key),
      },
    }),
  );
  const noReportPage = await noReportContext.newPage();
  await noReportPage.goto(`${base}/game/PPSA21564`);
  await noReportPage
    .getByRole("link", { name: /Submit the first report/ })
    .waitFor();
  await noReportPage
    .locator(".game-community-resources")
    .waitFor();
  assert.equal(
    await noReportPage
      .locator(".game-community-resources .community-fork")
      .count(),
    1,
  );
  await noReportContext.close();
  console.log(
    "PASS associations remain available when a compatibility report is removed",
  );

  // 6. Uncataloged game page
  const uncatalogedId = "PPSA99998";
  assert(
    !catalog.some(
      (game) =>
        game.titleId === uncatalogedId ||
        game.allTitleIds?.includes(uncatalogedId),
    ),
  );
  assert(!index.games.some((game) => game.key === uncatalogedId));
  const uncatalogedGame = {
    key: uncatalogedId,
    titleId: uncatalogedId,
    title: uncatalogedId,
  };
  const uncatalogedResources = {
    ...resources,
    forks: [
      { ...fork, targetTitleIds: [uncatalogedId], games: [uncatalogedGame] },
    ],
  };
  const uncatalogedContext = await browser.newContext({
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  let finalReportRemoved = false;
  await uncatalogedContext.route("**/data/community.json", (route) =>
    route.fulfill({ json: uncatalogedResources }),
  );
  await uncatalogedContext.route("**/data/compat-index.json", (route) =>
    route.fulfill({
      json: {
        ...index,
        games: finalReportRemoved
          ? index.games
          : [
              ...index.games,
              {
                ...astro,
                key: uncatalogedId,
                titleId: uncatalogedId,
                allTitleIds: [uncatalogedId],
                title: uncatalogedId,
              },
            ],
      },
    }),
  );
  await uncatalogedContext.route(
    `**/data/compat/${uncatalogedId}.json`,
    (route) =>
      route.fulfill({
        json: {
          ...report,
          key: uncatalogedId,
          titleId: uncatalogedId,
          title: uncatalogedId,
          allTitleIds: [uncatalogedId],
        },
      }),
  );
  const uncatalogedPage = await uncatalogedContext.newPage();
  await uncatalogedPage.clock.install();
  await uncatalogedPage.goto(`${base}/game/${uncatalogedId}`);
  await uncatalogedPage.locator(".report").first().waitFor();
  await uncatalogedPage
    .locator(".game-community-resources")
    .waitFor();
  finalReportRemoved = true;
  await uncatalogedPage.clock.fastForward(301000);
  await uncatalogedPage
    .getByRole("link", { name: /Submit the first report/ })
    .waitFor();
  assert.equal(await uncatalogedPage.locator("h1").innerText(), uncatalogedId);
  assert.equal(
    await uncatalogedPage
      .locator(".game-community-resources .community-fork")
      .count(),
    1,
  );
  await uncatalogedPage.screenshot({
    path: `${evidence}/uncataloged-after-report-removal.png`,
    fullPage: true,
  });
  await uncatalogedPage.reload();
  await uncatalogedPage
    .locator(".game-community-resources")
    .waitFor();
  assert.equal(await uncatalogedPage.locator("h1").innerText(), uncatalogedId);
  await uncatalogedContext.close();
  console.log(
    "PASS uncataloged games retain resource and fork pages after their final report is removed, including reload",
  );

  // 7. Responsive layout across viewports and themes
  for (const theme of ["light", "dark"])
    for (const width of [1440, 768, 390]) {
      await context.addInitScript(
        (theme) => localStorage.setItem("kyty-theme", theme),
        theme,
      );
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      for (const route of ["patches", "cheats", "configs", "forks", "game/PPSA21567"]) {
        await page.goto(`${base}/${route}`);
        await page
          .locator(route === "forks" ? ".community-fork" : ".module-card")
          .first()
          .waitFor();
        await page.evaluate(() => document.fonts.ready);
        for (
          let y = 0;
          y <
          (await page.evaluate(() => document.documentElement.scrollHeight));
          y += 650
        ) {
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await page.waitForTimeout(35);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
          `${theme} ${width} ${route}`,
        );
        await page.screenshot({
          path: `${evidence}/${route.replace("/", "-")}-${theme}-${width}.png`,
          fullPage: true,
        });
      }
    }

  // 8. Documentation checks
  await page.goto(`${base}/docs#community-resources`);
  await page
    .getByRole("heading", { name: "Patches and community forks", exact: true })
    .waitFor();
  assert(
    (await page.locator("#community-resources").innerText()).includes("/fork"),
  );
  assert(
    (await page.locator("#community-resources").innerText()).includes(
      "KytyPS5-Modules",
    ),
  );

  // 9. Honest empty states
  response = { version: 1, forks: [], patchCollections: [] };
  const emptyContext = await browser.newContext({
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await emptyContext.route("**/data/community.json", (route) =>
    route.fulfill({ json: response }),
  );
  const emptyPage = await emptyContext.newPage();
  await emptyPage.goto(`${base}/forks`);
  await emptyPage
    .getByRole("heading", { name: "A place for new directions." })
    .waitFor();
  await emptyContext.close();

  // 10. Retry recovery on network failure
  const errorContext = await browser.newContext({
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  let broken = true;
  await errorContext.route("**/data/community.json", (route) =>
    broken
      ? route.fulfill({ status: 503 })
      : route.fulfill({ json: resources }),
  );
  const errorPage = await errorContext.newPage();
  await errorPage.goto(`${base}/forks`);
  await errorPage
    .getByText("Community resources couldn’t load.", { exact: false })
    .waitFor();
  broken = false;
  await errorPage
    .getByRole("button", { name: "Try again", exact: true })
    .click();
  await errorPage.locator(".community-fork").first().waitFor();
  await errorContext.close();

  assert.deepEqual(errors, []);
  console.log(
    "PASS responsive light/dark directories, maintenance documentation, honest empty states and retry recovery",
  );
  await context.close();
} finally {
  await browser.close();
}
