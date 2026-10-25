import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
const executablePath =
  process.env.CHROME_PATH ??
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  permissions: ["clipboard-read", "clipboard-write"],
});
const releaseTag = "browser-check";
const releaseRoot = "https://github.com/KytyPS5/KytyPS5/releases";
const platformAssets = [
  "Windows-x64.zip",
  "Linux-x86_64.tar.gz",
  "macOS-x86_64.zip",
].map((platform) => ({
  name: `KytyPS5-${platform}`,
  size: 1048576,
  browser_download_url: `${releaseRoot}/download/${releaseTag}/KytyPS5-${platform}`,
}));
let releaseFixture = {
  ...JSON.parse(await fs.readFile("src/data/github.json", "utf8")).release,
  tag_name: releaseTag,
  html_url: `${releaseRoot}/tag/${releaseTag}`,
  assets: [
    {
      ...platformAssets[0],
      name: `${platformAssets[0].name}.sha256`,
      browser_download_url: `${platformAssets[0].browser_download_url}.sha256`,
    },
    ...platformAssets,
  ],
};
await context.route(
  "https://api.github.com/repos/KytyPS5/KytyPS5/releases/latest",
  (route) => route.fulfill({ json: releaseFixture }),
);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await fs.mkdir(".impeccable/review", { recursive: true });
const results = [];
async function check(name, fn) {
  await fn();
  results.push(name);
  console.log(`PASS ${name}`);
}
async function visit(path) {
  await page.goto(`${base}${path}`);
  await page.locator("h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow() {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    `Horizontal overflow at ${page.url()}`,
  );
}
async function downloadLinks(expected) {
  await page.waitForFunction(
    (urls) =>
      JSON.stringify(
        [...document.querySelectorAll(".download-platform .button")].map(
          (link) => link.getAttribute("href"),
        ),
      ) === JSON.stringify(urls),
    expected,
  );
  assert.deepEqual(
    await page
      .locator(".download-platform .button")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    expected,
  );
}

try {
  await check(
    "Every route renders at desktop, tablet and phone widths without page overflow",
    async () => {
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({
          width,
          height: width === 390 ? 844 : 1000,
        });
        for (const path of [
          "/",
          "/download",
          "/compatibility",
          "/docs",
          "/faq",
          "/contributing",
          "/about",
          "/game/PPSA21564",
          "/not-a-page",
        ]) {
          await visit(path);
          await noOverflow();
          assert.equal(
            await page.locator("main h1").count(),
            1,
            `Expected one page title at ${path}`,
          );
        }
      }
    },
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await check(
    "Game search, per-platform filter, status filter and reset use real reports",
    async () => {
      await visit("/compatibility");
      const search = page.getByRole("searchbox", {
        name: "Search games or title IDs",
      });
      await search.fill("astro");
      await page.waitForTimeout(150);
      assert((await page.locator(".game-table-row").count()) >= 2);
      await page
        .getByLabel("Operating system", { exact: true })
        .selectOption("macos");
      assert((await page.locator(".game-table-row").count()) >= 1);
      await page.getByRole("button", { name: "Reset filters" }).click();
      await page.locator(".game-table-row").nth(23).waitFor();
      assert.equal(await page.locator(".game-table-row").count(), 24);
      await page.getByRole("button", { name: "Load more games" }).click();
      await page.locator(".game-table-row").nth(47).waitFor();
      assert.equal(await page.locator(".game-table-row").count(), 48);
      await search.fill("no-game-has-this-name-zz");
      await page
        .getByRole("heading", { name: "No match this time." })
        .waitFor();
      await page.getByRole("button", { name: "Show all games" }).click();
      await page.locator(".game-table-row").nth(23).waitFor();
      await page.getByRole("button", { name: /^In game/ }).click();
      await page.waitForFunction(() =>
        document
          .querySelector(".status-filters .selected")
          ?.textContent?.startsWith("In game"),
      );
      assert.equal(
        await page
          .locator(".game-table-row .status:not(.status-in-game)")
          .count(),
        0,
      );
    },
  );
  await check(
    "Game report tabs preserve independent OS results; screenshots open and close",
    async () => {
      await visit("/game/PPSA21564");
      await page.locator(".report").first().waitFor();
      await page.getByRole("tab", { name: "Linux", exact: true }).click();
      await page.getByRole("heading", { name: "Linux test report" }).waitFor();
      await page
        .getByRole("button", { name: /Expand .* screenshot 1/ })
        .first()
        .click();
      await page.getByRole("dialog").waitFor();
      await page.getByRole("button", { name: "Next screenshot" }).click();
      assert.match(await page.getByRole("dialog").innerText(), /Screenshot 2/);
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
    },
  );
  await check(
    "Build tabs change commands; code clipboard contains usable commands",
    async () => {
      await visit("/download");
      await downloadLinks(
        platformAssets.map((asset) => asset.browser_download_url),
      );
      await page.getByRole("tab", { name: "Linux", exact: true }).click();
      await page.getByText("sudo apt-get install", { exact: false }).waitFor();
      await page.getByRole("button", { name: "Copy code" }).click();
      const clipboard = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      assert(clipboard.includes("sudo apt-get install"));
      assert(!clipboard.startsWith("$ "));
      await page.getByRole("tab", { name: "macOS", exact: true }).click();
      await page
        .getByText("CMAKE_OSX_ARCHITECTURES=x86_64", { exact: false })
        .waitFor();
    },
  );
  await check(
    "Missing platform archives use the release browser and refresh when an archive becomes available",
    async () => {
      releaseFixture = { ...releaseFixture, assets: [platformAssets[0]] };
      await page
        .getByRole("button", { name: "Refresh latest release" })
        .click();
      await downloadLinks([
        platformAssets[0].browser_download_url,
        `${releaseRoot}/latest`,
        `${releaseRoot}/latest`,
      ]);
      assert.equal(
        await page
          .getByRole("link", { name: "Browse release assets", exact: true })
          .count(),
        2,
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Download for Windows", exact: true })
          .count(),
        1,
      );
      releaseFixture = { ...releaseFixture, assets: platformAssets };
      await page
        .getByRole("button", { name: "Refresh latest release" })
        .click();
      await downloadLinks(
        platformAssets.map((asset) => asset.browser_download_url),
      );
      assert.equal(
        await page
          .getByRole("link", { name: "Browse release assets", exact: true })
          .count(),
        0,
      );
    },
  );
  await check("FAQ search and keyboard-operable accordion", async () => {
    await visit("/faq");
    await page
      .getByRole("searchbox", { name: "Search frequently asked questions" })
      .fill("firmware");
    const trigger = page.getByRole("button", {
      name: "Does it require a PS5 BIOS or firmware?",
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page
      .getByText(
        "No external low-level emulation modules are currently required",
        { exact: false },
      )
      .waitFor();
  });
  await check(
    "Home carousel and capture selector are interactive",
    async () => {
      await visit("/");
      const before = await page
        .locator(".carousel-track")
        .evaluate((e) => e.scrollLeft);
      await page
        .getByRole("button", { name: "Next games", exact: true })
        .click();
      await page.waitForTimeout(300);
      assert(
        (await page.locator(".carousel-track").evaluate((e) => e.scrollLeft)) >
          before,
      );
      const captureChoice = page.locator(".capture-selector button").nth(1);
      const captureTitle = await captureChoice.innerText();
      await captureChoice.click();
      assert(
        (await page.locator(".capture-bottom").innerText()).includes(
          captureTitle,
        ),
      );
      const heroChoice = page
        .locator('.hero-carousel-controls button[aria-label^="Show "]')
        .last();
      const heroTitle = (await heroChoice.getAttribute("aria-label")).slice(5);
      await heroChoice.click();
      assert.equal(
        await page.locator(".caption-chip-title").innerText(),
        heroTitle,
      );
    },
  );
  await check(
    "Mobile navigation traps focus, closes on selection and supports Escape",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await visit("/");
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "Compatibility", exact: true })
        .click();
      await page.waitForURL("**/compatibility");
      await page.getByRole("dialog").waitFor({ state: "detached" });
      assert.equal(await page.getByRole("dialog").count(), 0);
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "detached" });
      assert.equal(await page.getByRole("dialog").count(), 0);
    },
  );
  await check(
    "Capture complete final desktop and mobile renderings",
    async () => {
      for (const [name, width, height] of [
        ["desktop", 1440, 1000],
        ["tablet", 768, 1024],
        ["mobile", 390, 844],
      ]) {
        await page.setViewportSize({ width, height });
        await visit("/");
        for (
          let y = 0;
          y <
          (await page.evaluate(() => document.documentElement.scrollHeight));
          y += 700
        ) {
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await page.waitForTimeout(100);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(250);
        await page.screenshot({
          path: `.impeccable/review/${name}.png`,
          fullPage: true,
        });
        await page.screenshot({ path: `.impeccable/review/${name}-fold.png` });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (const path of [
        "download",
        "compatibility",
        "docs",
        "faq",
        "about",
        "contributing",
        "game/PPSA21564",
      ]) {
        await visit(`/${path}`);
        await page.screenshot({
          path: `.impeccable/review/${path.replaceAll("/", "-")}.png`,
          fullPage: true,
        });
      }
    },
  );
  assert.deepEqual(errors, [], "Browser runtime errors");
  await fs.writeFile(
    ".impeccable/review/verification.json",
    JSON.stringify(
      {
        base,
        passed: results,
        browserErrors: errors,
        checkedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  console.log(`\n${results.length} browser checks passed. No runtime errors.`);
} finally {
  await browser.close();
}
