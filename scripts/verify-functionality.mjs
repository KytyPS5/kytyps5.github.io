import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
const seed = JSON.parse(await fs.readFile("src/data/github.json", "utf8"));
const index = JSON.parse(
  await fs.readFile("public/data/compat-index.json", "utf8"),
);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
});
let failed = 0;
await fs.mkdir(".impeccable/review/functionality", { recursive: true });
async function check(name, run) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  try {
    await run(context, await context.newPage());
    console.log(`PASS ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}: ${error.message}`);
  } finally {
    await context.close();
  }
}
async function waitForValue(page, selector, value) {
  await page
    .waitForFunction(
      ({ selector, value }) =>
        document.querySelector(selector)?.textContent?.includes(value),
      { selector, value },
      { timeout: 8000 },
    )
    .catch(async () => {
      throw new Error(
        `Expected ${value} in ${selector}; got ${await page.locator(selector).allTextContents()}`,
      );
    });
}
try {
  await check(
    "Compatibility return link preserves search, OS, category and sort",
    async (_context, page) => {
      await page.goto(`${base}/compatibility`);
      await page
        .getByRole("searchbox", { name: "Search games or title IDs" })
        .fill("astro");
      await page
        .getByLabel("Operating system", { exact: true })
        .selectOption("macos");
      await page.getByRole("button", { name: /^Doesn’t boot/ }).click();
      await page
        .getByLabel("Sort games", { exact: true })
        .selectOption("recent");
      const resultsUrl = page.url();
      assert.equal(new URL(resultsUrl).searchParams.get("q"), "astro");
      assert.equal(
        new URL(resultsUrl).searchParams.get("status"),
        "doesnt-boot",
      );
      const titles = await page.locator(".game-table-row h2").allTextContents();
      assert(titles.length);
      await page.locator(".game-table-row").first().click();
      await page.waitForURL("**/game/**");
      await page
        .getByRole("link", {
          name: "The compatibility collection",
          exact: true,
        })
        .click();
      await page.waitForURL("**/compatibility**");
      assert.equal(page.url(), resultsUrl);
      assert.equal(
        await page
          .getByRole("searchbox", { name: "Search games or title IDs" })
          .inputValue(),
        "astro",
      );
      assert.deepEqual(
        await page.locator(".game-table-row h2").allTextContents(),
        titles,
      );
      assert.equal(
        await page.getByLabel("Operating system", { exact: true }).inputValue(),
        "macos",
      );
      assert.equal(
        await page.getByLabel("Sort games", { exact: true }).inputValue(),
        "recent",
      );
      await page.locator(".game-table-row").first().click();
      await page.waitForURL("**/game/**");
      await page.goBack();
      await page.waitForURL(resultsUrl);
      assert.equal(
        await page
          .getByRole("searchbox", { name: "Search games or title IDs" })
          .inputValue(),
        "astro",
      );
    },
  );
  await check(
    "Browser Back/Forward restores loaded results and scroll position",
    async (_context, page) => {
      await page.goto(`${base}/compatibility?status=in-game&sort=recent`);
      await page.locator(".game-table-row").nth(23).waitFor();
      await page.getByRole("button", { name: "Load more games" }).click();
      await page.locator(".game-table-row").nth(47).waitFor();
      const row = page.locator(".game-table-row").nth(35);
      await row.scrollIntoViewIfNeeded();
      const savedY = await page.evaluate(() => scrollY);
      const savedUrl = page.url();
      const href = await row.getAttribute("href");
      await row.click();
      await page.waitForURL(`**${href}`);
      await page.goBack();
      await page.waitForURL("**/compatibility**");
      await page.locator(".game-table-row").nth(47).waitFor({ timeout: 4000 });
      assert.equal(page.url(), savedUrl);
      await page.waitForFunction((y) => Math.abs(scrollY - y) < 8, savedY, {
        timeout: 4000,
      });
      await page.goForward();
      await page.waitForURL(`**${href}`);
      await page
        .getByRole("link", {
          name: "The compatibility collection",
          exact: true,
        })
        .click();
      await page.waitForFunction((y) => Math.abs(scrollY - y) < 8, savedY, {
        timeout: 4000,
      });
      await page.reload();
      await page.locator(".game-table-row").nth(47).waitFor();
      await page
        .getByRole("searchbox", { name: "Search games or title IDs" })
        .fill("astro");
      await page.waitForURL(
        (url) =>
          url.searchParams.get("q") === "astro" &&
          !url.searchParams.has("page"),
      );
    },
  );
  await check(
    "Live GitHub updates reach stats, all contributor previews and downloads",
    async (context, page) => {
      let version = 1;
      let offlineApi = false;
      const requests = [];
      await context.route(
        "https://api.github.com/repos/KytyPS5/KytyPS5**",
        async (route) => {
          if (offlineApi) return route.abort();
          const url = new URL(route.request().url());
          requests.push(url.href);
          if (url.pathname.endsWith("/contributors")) {
            if (url.searchParams.get("per_page") === "1")
              return route.fulfill({
                json: [seed.contributors[0]],
                headers: {
                  "access-control-expose-headers": "link",
                  link: '<https://api.github.com/repos/KytyPS5/KytyPS5/contributors?per_page=1&anon=true&page=237>; rel="last"',
                },
              });
            return route.fulfill({
              json: [
                {
                  ...seed.contributors[0],
                  login: `fresh-kitty-${version}`,
                  html_url: `https://github.com/fresh-kitty-${version}`,
                },
              ],
            });
          }
          if (url.pathname.endsWith("/releases/latest"))
            return route.fulfill({
              json: {
                ...seed.release,
                tag_name: `audit-v${version}`,
                assets: [
                  {
                    name: "KytyPS5-Windows.sha256",
                    browser_download_url: "https://example.com/windows.sha256",
                    size: 10,
                  },
                  ...["Windows", "Linux", "macOS"].map((os) => ({
                    name: `KytyPS5-${os}.zip`,
                    browser_download_url: `https://github.com/KytyPS5/KytyPS5/releases/download/audit-v${version}/${os}.zip`,
                    size: 1048576,
                  })),
                ],
              },
            });
          return route.fulfill({
            json: {
              ...seed.repo,
              stargazers_count: 42424 + version,
              forks_count: 777,
              open_issues_count: 88,
            },
          });
        },
      );
      await page.goto(`${base}/about`);
      await waitForValue(page, ".repo-stats", "42,425");
      await waitForValue(page, ".repo-stats", "237");
      await waitForValue(page, ".contributor-grid", "fresh-kitty-1");
      await page
        .getByRole("link", { name: "KytyPS5 home", exact: true })
        .first()
        .click();
      await page
        .locator('.community-avatar[href="https://github.com/fresh-kitty-1"]')
        .waitFor();
      await page
        .getByRole("link", { name: "Get KytyPS5", exact: true })
        .first()
        .click();
      await page.waitForURL("**/download");
      await waitForValue(page, ".release-info", "audit-v1");
      assert(
        (
          await page
            .locator(".download-platform .button")
            .evaluateAll((links) => links.map((a) => a.href))
        ).every((url) => url.endsWith(".zip")),
      );
      version = 2;
      await page
        .getByRole("button", { name: "Refresh latest release", exact: true })
        .click();
      await waitForValue(page, ".release-info", "audit-v2");
      version = 3;
      await page.evaluate(() => {
        const now = Date.now();
        Date.now = () => now + 300_001;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await waitForValue(page, ".release-info", "audit-v3");
      // Expire saved responses, then simulate returning to the still-open tab.
      await page.evaluate(() => {
        const now = Date.now();
        Date.now = () => now + 3_600_001;
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page
        .getByRole("link", { name: "About", exact: true })
        .first()
        .click();
      await waitForValue(page, ".repo-stats", "42,427");
      await waitForValue(page, ".contributor-grid", "fresh-kitty-3");
      assert(requests.some((url) => url.includes("per_page=1&anon=true")));
      offlineApi = true;
      await page.reload();
      await waitForValue(page, ".repo-stats", "42,427");
    },
  );
  await check(
    "Runtime compatibility data refreshes totals and supports new game reports",
    async (context, page) => {
      const game = {
        key: "PPSA99999",
        title: "Audit New Arrival",
        titleId: "PPSA99999",
        overall: "in-game",
        os: { windows: "in-game" },
        reportCounts: { windows: 1 },
        latestTested: "2026-10-20",
      };
      await context.route("**/data/compat-index.json", (route) =>
        route.fulfill({ json: { version: 2, games: [...index.games, game] } }),
      );
      await context.route("**/data/compat/PPSA99999.json", (route) =>
        route.fulfill({
          json: {
            version: 2,
            ...game,
            reports: [
              {
                slug: "audit-new-arrival",
                title: game.title,
                titleId: game.titleId,
                status: "in-game",
                os: "windows",
                testedVersion: seed.release.tag_name,
                testedDate: "2026-10-20",
                notes: "Fresh report available without a frontend rebuild.",
              },
            ],
          },
        }),
      );
      await page.goto(`${base}/`);
      await page
        .locator(
          `.compatibility-summary[data-total="${index.games.length + 1}"]`,
        )
        .waitFor({ timeout: 4000 });
      await waitForValue(
        page,
        ".project-strip",
        String(index.games.length + 1),
      );
      await page
        .getByRole("link", { name: "Compatibility", exact: true })
        .first()
        .click();
      await page
        .getByRole("searchbox", { name: "Search games or title IDs" })
        .fill("Audit New Arrival");
      await page
        .locator(".game-table-row")
        .filter({ hasText: game.title })
        .click();
      await page
        .getByRole("heading", { name: game.title, exact: true })
        .waitFor();
      await page
        .getByText("Fresh report available without a frontend rebuild.")
        .waitFor();
      await page
        .getByRole("link", {
          name: "The compatibility collection",
          exact: true,
        })
        .click();
      assert.equal(
        await page
          .getByRole("searchbox", { name: "Search games or title IDs" })
          .inputValue(),
        game.title,
      );
    },
  );
  await check(
    "Quick Start is first, complete, linkable and readable on phone/tablet/desktop",
    async (_context, page) => {
      await page.goto(`${base}/docs`);
      assert.equal(
        await page.locator(".docs-body > section").first().getAttribute("id"),
        "quick-start",
      );
      assert.equal(
        await page.locator(".docs-nav nav a").first().textContent(),
        "Quick Start",
      );
      assert.deepEqual(
        await page.locator(".quick-start-steps > li > h4").allTextContents(),
        [
          "Download",
          "Extract",
          "Add your games",
          "Game settings",
          "Patches",
          "Play",
        ],
      );
      const text = await page.locator("#quick-start").innerText();
      for (const value of [
        "Vulkan 1.3",
        "launcher.exe",
        "Windows SysV red zone",
        "AMD CPU patch",
        "Intel CPU",
        "Cheats (experimental)",
        "Edit input mapping",
        "_Patches\\PPSA21567.json",
      ])
        assert(text.includes(value), value);
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.locator("#quick-start h3").scrollIntoViewIfNeeded();
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
        await page.screenshot({
          path: `.impeccable/review/functionality/quick-start-${width}.png`,
        });
      }
      await page.goto(`${base}/docs#quick-start`);
      await page.locator("#quick-start h2").waitFor();
      await page.waitForFunction(
        () =>
          document.querySelector("#quick-start").getBoundingClientRect().top <
          300,
      );
      await page
        .locator(".docs-nav")
        .getByRole("link", { name: "Installation", exact: true })
        .click();
      await page.waitForURL("**/docs#install");
      await page.waitForFunction(
        () =>
          document.querySelector("#install").getBoundingClientRect().top < 300,
      );
    },
  );
  await check(
    "Home captures retain every image, viewer navigation, autoplay and pause",
    async (_context, page) => {
      await page.goto(`${base}/`);
      await page.locator(".capture-section").scrollIntoViewIfNeeded();
      const select = page.getByLabel("Browse community captures", {
        exact: true,
      });
      assert((await select.locator("option").count()) > 3);
      const first = await select.inputValue();
      await page
        .getByRole("button", { name: "Next capture", exact: true })
        .click();
      await page.waitForFunction(
        () => document.querySelector(".capture-browse select").value === "1",
      );
      await page
        .getByRole("button", { name: "Previous capture", exact: true })
        .click();
      assert.equal(await select.inputValue(), first);
      await page.getByRole("button", { name: /^Expand .* capture$/ }).click();
      await page.getByRole("dialog").waitFor();
      await page.keyboard.press("ArrowRight");
      await page
        .getByRole("dialog")
        .getByText(/Capture 2 of/)
        .waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
      await page.clock.install();
      await page
        .getByRole("button", { name: "Play capture slideshow", exact: true })
        .click();
      await page.mouse.move(0, 0);
      await page.clock.fastForward(5100);
      await page.waitForFunction(
        () => document.querySelector(".capture-browse select").value === "2",
      );
      await page
        .getByRole("button", { name: "Pause capture slideshow", exact: true })
        .click();
      await page.mouse.move(0, 0);
      const paused = await select.inputValue();
      await page.clock.fastForward(5100);
      assert.equal(await select.inputValue(), paused);
    },
  );
  await check(
    "Directional entrances animate into place and respect reduced motion",
    async (_context, page) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(`${base}/`);
      const left = page.locator('.community-art[data-reveal="left"]');
      await left.waitFor({ state: "attached" });
      assert(
        await left.evaluate(
          (element) =>
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m41 < 0,
        ),
      );
      await left.scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () =>
          Math.abs(
            new DOMMatrixReadOnly(
              getComputedStyle(document.querySelector(".community-art"))
                .transform,
            ).m41,
          ) < 0.1,
      );
      await page.screenshot({
        path: ".impeccable/review/functionality/home-motion.png",
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await left.waitFor({ state: "attached" });
      assert.equal(
        await left.evaluate(
          (element) =>
            new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
        ),
        0,
      );
    },
  );
  const updates = JSON.parse(
    await fs.readFile("public/data/updates.json", "utf8"),
  );
  const launcher = JSON.parse(
    await fs.readFile("public/data/compatibility.json", "utf8"),
  );
  assert.equal(updates.tag, seed.release.tag_name);
  const availableAssets = Object.values(updates.assets).filter(Boolean);
  assert(availableAssets.length > 0);
  assert(
    availableAssets.every((asset) => asset.url.includes("/releases/download/")),
  );
  assert.equal(launcher.PPSA21567.status, "InGame");
  assert.equal(launcher.PPSA21567.platforms.macos.status, "DoesntBoot");
  assert(
    (await fs.readFile("public/sitemap.xml", "utf8")).includes(
      "/game/PPSA21564",
    ),
  );
  console.log(
    "PASS launcher update/compatibility feeds and sitemap preserve their public contracts",
  );
} finally {
  await browser.close();
}
if (failed) process.exitCode = 1;
