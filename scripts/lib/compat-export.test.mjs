import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  aggregateStatuses,
  buildCompatibilityDb,
  buildSiteIndex,
  mapStatus,
  parseFrontmatter,
  parseReport,
  titleKey,
} from "./compat-export.mjs";

/**
 * Faithful replica of the KytyPS5 GUI launcher's parser
 * (src/launcher/src/compatibilityDatabase.cpp). Each function maps 1:1 to the
 * C++ — if our exported public/data/compatibility.json passes this, the GUI
 * (which downloads and parses that file on every launch) renders it correctly.
 *
 * Reference (fetched 2026-08-07, KytyPS5/KytyPS5 @ main):
 *   QString TitleKey(const QString& title_id) { return title_id.trimmed().toUpper(); }
 *   Configuration::GameStatus StatusFromText(const QString& text) { ... }
 *   LoadResult Parse(const QByteArray& data) { ... }
 */

const GUI_STATUSES = ["InGame", "MainMenu", "Logo", "DoesntBoot", "Unknown"];

/** Mirrors TitleKey(): trim + uppercase — note: NO dash stripping. */
function guiTitleKey(raw) {
  return String(raw).trim().toUpperCase();
}

/** Mirrors StatusFromText(): exact matches after trimming, else Unknown. */
function guiStatusFromText(text) {
  const value = String(text).trim();
  if (value === "InGame" || value === "In game") return "InGame";
  if (value === "MainMenu" || value === "Main menu") return "MainMenu";
  if (value === "Logo") return "Logo";
  if (value === "DoesntBoot" || value === "Doesn't boot") return "DoesntBoot";
  return "Unknown";
}

/**
 * Mirrors Parse(): require a JSON object, then for each key compute
 * TitleKey(key), skip empty keys or empty value objects, and read `status`
 * (via StatusFromText) + `comment` (string).
 */
function guiParse(data) {
  const doc = JSON.parse(data);
  const entries = {};
  for (const [rawKey, value] of Object.entries(doc)) {
    const titleId = guiTitleKey(rawKey);
    if (!titleId || Object.keys(value).length === 0) continue;
    entries[titleId] = {
      status: guiStatusFromText(value.status),
      comment: String(value.comment ?? ""),
    };
  }
  return entries;
}

/** Mirrors Find(title_id): TitleKey the query, then look up the map. */
function guiFind(entries, titleId) {
  return entries[guiTitleKey(titleId)];
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");

/** Reads the real seed reports and builds the DB exactly like the CLI does. */
async function buildFromRealReports() {
  const reports = [];
  for (const file of (await readdir(COMPAT_DIR)).filter((f) => f.endsWith(".md"))) {
    const data = parseFrontmatter(await readFile(path.join(COMPAT_DIR, file), "utf8"));
    if (!data.titleId) continue;
    reports.push({
      titleId: data.titleId,
      status: data.status,
      testedVersion: data.testedVersion,
      testedDate: data.testedDate,
      os: data.os,
    });
  }
  return buildCompatibilityDb(reports);
}

/** Serializes exactly as the CLI does (minified + trailing newline). */
function serializeLikeCli(db) {
  return JSON.stringify(db, null, 0) + "\n";
}

describe("status mapping (site ladder → GUI enum)", () => {
  it("maps every ladder status to an accepted GUI string", () => {
    for (const status of ["doesnt-boot", "logo", "main-menu", "in-game"]) {
      const mapped = mapStatus(status);
      expect(GUI_STATUSES).toContain(mapped);
      // The launcher's StatusFromText must never degrade our mapping to Unknown.
      expect(guiStatusFromText(mapped)).not.toBe("Unknown");
    }
  });

  it("maps 1:1 onto the GUI enum (ladders are now identical)", () => {
    expect(mapStatus("doesnt-boot")).toBe("DoesntBoot");
    expect(mapStatus("logo")).toBe("Logo");
    expect(mapStatus("main-menu")).toBe("MainMenu");
    expect(mapStatus("in-game")).toBe("InGame");
  });

  it("falls back to Unknown for unknown statuses", () => {
    expect(mapStatus("bogus")).toBe("Unknown");
  });
});

describe("aggregateStatuses (majority vote, ties → better)", () => {
  it("returns the majority status", () => {
    expect(aggregateStatuses(["main-menu", "main-menu", "logo"])).toBe("main-menu");
  });

  it("breaks ties toward the better status", () => {
    expect(aggregateStatuses(["logo", "main-menu"])).toBe("main-menu");
    expect(aggregateStatuses(["main-menu", "in-game"])).toBe("in-game");
  });

  it("defaults to nothing for an empty group", () => {
    expect(aggregateStatuses([])).toBe("doesnt-boot");
  });
});

describe("titleKey (emitter normalization)", () => {
  it("emits canonical bare uppercase keys", () => {
    expect(titleKey("ppsa06228")).toBe("PPSA06228");
    expect(titleKey(" PPSA06228 ")).toBe("PPSA06228");
  });

  it("strips dashes so keys always match GUI lookups of bare store IDs", () => {
    // validate-compat tolerates PPSA-06228; the emitter normalizes it to the
    // bare form the GUI's Find("PPSA06228") expects.
    expect(titleKey("PPSA-06228")).toBe("PPSA06228");
  });
});

describe("GUI contract (faithful C++ replica on our export)", () => {
  it("every emitted key is already canonical under TitleKey", async () => {
    const db = await buildFromRealReports();
    const keys = Object.keys(db);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(guiTitleKey(key)).toBe(key);
    }
  });

  it("serialized export survives the launcher's Parse with zero Unknown statuses", async () => {
    const db = await buildFromRealReports();
    const parsed = guiParse(serializeLikeCli(db));
    expect(Object.keys(parsed).length).toBeGreaterThan(0); // never vacuous
    for (const [key, entry] of Object.entries(parsed)) {
      expect(GUI_STATUSES).toContain(entry.status);
      expect(entry.status).not.toBe("Unknown");
      expect(typeof entry.comment).toBe("string");
      expect(key).toBe(key.trim().toUpperCase());
    }
  });

  it("the GUI's Find() resolves a bare store title ID against the parsed DB", async () => {
    const db = await buildFromRealReports();
    const parsed = guiParse(serializeLikeCli(db));
    const keys = Object.keys(parsed);
    expect(keys.length).toBeGreaterThan(0);
    // The GUI queries with the store's bare ID (e.g. "PPSA06228"): TitleKey
    // uppercases it, and the emitter guarantees that exact key exists.
    for (const key of keys) {
      expect(guiFind(parsed, key)).toBeDefined();
      expect(guiFind(parsed, key.toLowerCase())).toBeDefined();
    }
  });

  it("comments are non-empty and mention the aggregated status", async () => {
    const db = await buildFromRealReports();
    const parsed = guiParse(serializeLikeCli(db));
    for (const entry of Object.values(parsed)) {
      expect(entry.comment.length).toBeGreaterThan(0);
    }
  });

  it("the literal public/data/compatibility.json file matches a fresh build and parses", async () => {
    const file = path.join(ROOT, "public", "data", "compatibility.json");
    if (!existsSync(file)) return; // generated by prebuild; skip on fresh checkout
    // Catch CLI drift: the committed/generated file must equal what the exporter
    // produces today, then still parse cleanly through the launcher's Parse.
    const fresh = await buildFromRealReports();
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(fresh);
    const parsed = guiParse(readFileSync(file, "utf8"));
    expect(Object.keys(parsed).length).toBeGreaterThan(0);
    for (const entry of Object.values(parsed)) {
      expect(GUI_STATUSES).toContain(entry.status);
    }
  });
});

describe("buildCompatibilityDb → GUI parse round-trip", () => {
  const reports = [
    {
      titleId: "PPSA06228",
      status: "main-menu",
      testedVersion: "KytyPS5-2026-08-07-7907a50",
      testedDate: "2026-08-01",
    },
    {
      titleId: "PPSA06228",
      status: "in-game",
      testedVersion: "KytyPS5-2026-08-07-7907a50",
      testedDate: "2026-08-05",
    },
    {
      titleId: "PPSA04877",
      status: "logo",
      testedVersion: "KytyPS5-2026-08-07-7907a50",
      testedDate: "2026-07-30",
    },
  ];

  it("groups by title ID and aggregates by majority", () => {
    const db = buildCompatibilityDb(reports);
    expect(Object.keys(db)).toEqual(["PPSA04877", "PPSA06228"]);
    expect(db.PPSA06228.status).toBe("InGame"); // tie → better (perfect)
    expect(db.PPSA04877.status).toBe("Logo");
  });

  it("produces JSON the GUI parser accepts with no Unknown statuses", () => {
    const db = buildCompatibilityDb(reports);
    const parsed = guiParse(serializeLikeCli(db));
    expect(parsed.PPSA06228.status).toBe("InGame");
    expect(parsed.PPSA04877.status).toBe("Logo");
    for (const v of Object.values(parsed)) {
      expect(v.status).not.toBe("Unknown");
      expect(typeof v.comment).toBe("string");
    }
  });

  it("sorts keys deterministically", () => {
    const db = buildCompatibilityDb(reports);
    const keys = Object.keys(db);
    expect(keys).toEqual([...keys].sort());
  });

  it("skips reports without a title ID", () => {
    const db = buildCompatibilityDb([{ titleId: "", status: "logo" }]);
    expect(db).toEqual({});
  });

  it("normalizes dashed title IDs to keys the GUI can Find", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA-06228", status: "main-menu", testedDate: "2026-08-01" },
    ]);
    const parsed = guiParse(serializeLikeCli(db));
    expect(guiFind(parsed, "PPSA06228").status).toBe("MainMenu");
  });
});

describe("per-OS status policy (Nmzik's cross-platform caveat)", () => {
  const reports = [
    { titleId: "PPSA06228", status: "main-menu", os: "windows", testedVersion: "b1", testedDate: "2026-08-01" },
    { titleId: "PPSA06228", status: "in-game", os: "windows", testedVersion: "b2", testedDate: "2026-08-03" },
    { titleId: "PPSA06228", status: "logo", os: "linux", testedVersion: "b1", testedDate: "2026-08-02" },
    { titleId: "PPSA06228", status: "doesnt-boot", os: "linux", testedVersion: "b1", testedDate: "2026-08-01" },
    // No `os` — counts toward the cross-platform status only.
    { titleId: "PPSA06228", status: "doesnt-boot", testedVersion: "b1", testedDate: "2026-08-01" },
  ];

  it("keeps the top-level status as the best across per-OS majorities", () => {
    const db = buildCompatibilityDb(reports);
    // windows → perfect, linux → boots, unknown-OS group → nothing.
    // Best of those = perfect.
    expect(db.PPSA06228.status).toBe("InGame");
    expect(db.PPSA06228.reports).toBe(5);
  });

  it("top-level best-of-OS can beat a cross-platform majority", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA06228", status: "main-menu", os: "windows", testedVersion: "b1", testedDate: "2026-08-01" },
      { titleId: "PPSA06228", status: "main-menu", os: "windows", testedVersion: "b2", testedDate: "2026-08-02" },
      // Windows majority says main-menu, but Linux says in-game → Any = in-game.
      { titleId: "PPSA06228", status: "in-game", os: "linux", testedVersion: "b1", testedDate: "2026-08-03" },
    ]);
    expect(db.PPSA06228.platforms.windows.status).toBe("MainMenu"); // majority of the OS
    expect(db.PPSA06228.platforms.linux.status).toBe("InGame");
    expect(db.PPSA06228.status).toBe("InGame"); // best = in-game → InGame
    expect(db.PPSA06228.comment).toContain("in-game");
  });

  it("aggregates per OS with its own majority", () => {
    const db = buildCompatibilityDb(reports);
    // windows: playable + perfect → tie → perfect → InGame
    expect(db.PPSA06228.platforms.windows.status).toBe("InGame");
    expect(db.PPSA06228.platforms.windows.reports).toBe(2);
    // linux: boots + nothing → tie → boots → Logo
    expect(db.PPSA06228.platforms.linux.status).toBe("Logo");
    expect(db.PPSA06228.platforms.linux.reports).toBe(2);
  });

  it("excludes OS-less reports from every platform but keeps them in the overall", () => {
    const db = buildCompatibilityDb(reports);
    const totalPlatform = Object.values(db.PPSA06228.platforms).reduce((n, p) => n + p.reports, 0);
    expect(totalPlatform).toBe(4); // 2 windows + 2 linux
    expect(db.PPSA06228.reports).toBe(5); // overall includes the OS-less one
    expect(db.PPSA06228.platforms.macos).toBeUndefined(); // absent ≠ Unknown
  });

  it("a single-OS game's top-level status equals that OS's status", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA06228", status: "main-menu", os: "windows", testedVersion: "b1", testedDate: "2026-08-01" },
    ]);
    expect(db.PPSA06228.status).toBe("MainMenu");
    expect(Object.keys(db.PPSA06228.platforms)).toEqual(["windows"]);
    expect(db.PPSA06228.platforms.windows.status).toBe("MainMenu");
  });

  it("orders platform keys windows → linux → macos and carries the latest build", () => {
    const db = buildCompatibilityDb(reports);
    expect(Object.keys(db.PPSA06228.platforms)).toEqual(["windows", "linux"]);
    expect(db.PPSA06228.platforms.windows.version).toBe("b2"); // newest by test date
  });

  it("omits the platforms block entirely when no report has an OS", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA01234", status: "main-menu", testedDate: "2026-08-01" },
    ]);
    expect(db.PPSA01234.platforms).toBeUndefined();
    expect(db.PPSA01234.status).toBe("MainMenu");
    expect(db.PPSA01234.reports).toBe(1);
  });

  it("excludes unrecognized OS values from platforms but keeps them in the overall", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA05555", status: "main-menu", os: "steamos", testedDate: "2026-08-01" },
      { titleId: "PPSA05555", status: "logo", os: "windows", testedDate: "2026-08-01" },
    ]);
    expect(db.PPSA05555.reports).toBe(2);
    expect(db.PPSA05555.platforms.windows).toBeDefined();
    expect(db.PPSA05555.platforms.steamos).toBeUndefined();
  });

  it("prefers the newest dated report's build even when another lacks a date", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA06666", status: "main-menu", os: "windows", testedVersion: "old", testedDate: "2026-08-01" },
      { titleId: "PPSA06666", status: "main-menu", os: "windows", testedVersion: "new" },
    ]);
    // The undated report must not win "latest" over the dated one.
    expect(db.PPSA06666.platforms.windows.version).toBe("old");
  });

  it("is backward compatible: the launcher's Parse ignores platforms/reports", () => {
    const db = buildCompatibilityDb(reports);
    const parsed = guiParse(serializeLikeCli(db));
    // guiParse mirrors compatibilityDatabase.cpp: it only reads status/comment,
    // so current GUI builds render the same as before the policy shipped.
    expect(parsed.PPSA06228.status).toBe("InGame");
    expect(typeof parsed.PPSA06228.comment).toBe("string");
    expect(parsed.PPSA06228.platforms).toBeUndefined();
  });
});

describe("parseReport (JS twin of the site parser — src/lib/compat.ts)", () => {
  const VALID = `---
titleId: "PPSA01234"
title: "Test Game"
status: "main-menu"
testedVersion: "main"
testedDate: "2026-08-07"
os: "windows"
hardware: "Ryzen 9 / RTX 5090"
---

Boots and reaches gameplay.
`;

  it("parses a valid report with every field", () => {
    const report = parseReport(VALID, "test-game");
    expect(report).toMatchObject({
      slug: "test-game",
      title: "Test Game",
      titleId: "PPSA01234",
      status: "main-menu",
      testedVersion: "main",
      testedDate: "2026-08-07",
      os: "windows",
      hardware: "Ryzen 9 / RTX 5090",
    });
    expect(report.notes).toBe("Boots and reaches gameplay.");
  });

  it("coerces score, gameVersion, screenshot and screenshotVerified", () => {
    const withExtra = VALID.replace(
      'hardware: "Ryzen 9 / RTX 5090"',
      'hardware: "Ryzen 9 / RTX 5090"\ngameVersion: "1.004"\nscore: 4\nscreenshot: "https://example.com/s.png"\nscreenshotVerified: true',
    );
    const report = parseReport(withExtra, "test-game");
    expect(report.score).toBe(4);
    expect(report.gameVersion).toBe("1.004");
    expect(report.screenshot).toBe("https://example.com/s.png");
    expect(report.screenshotVerified).toBe(true);
  });

  it("extracts the LAST source line (a quote inside the notes isn't the provenance)", () => {
    const withSource = `${VALID.trim()}

## Extra notes

> Source: mentioned inside the notes, not the provenance

> Source: [KytyPS5 issue #12](https://github.com/KytyPS5/KytyPS5/issues/12)
`;
    const report = parseReport(withSource, "test-game");
    expect(report.source).toEqual({
      label: "KytyPS5 issue #12",
      url: "https://github.com/KytyPS5/KytyPS5/issues/12",
    });
    expect(report.notes).toContain("mentioned inside the notes, not the provenance");
  });

  it("rejects invalid reports with the site's error contract", () => {
    expect(() => parseReport(VALID.replace('status: "main-menu"', 'status: "broken"'), "x")).toThrow(
      /status must be one of/,
    );
    expect(() => parseReport(VALID.replace('os: "windows"\n', ""), "x")).toThrow(
      /missing required frontmatter field: os/,
    );
    expect(() => parseReport(VALID.replace("PPSA01234", "PPSA-12"), "x")).toThrow(/PPSA-XXXXX/);
  });
});

describe("buildSiteIndex (slim website index)", () => {
  const report = (titleId, status, os = "windows", title = "Game", extra = "") =>
    parseReport(
      `---
titleId: "${titleId}"
title: "${title}"
status: "${status}"
testedVersion: "main"
testedDate: "${extra ? "2026-08-07" : "2026-08-01"}"
os: "${os}"
${extra}
---

Notes.
`,
      title.toLowerCase().replace(/\s+/g, "-"),
    );

  const games = [
    { titleId: "PPSA00001", allTitleIds: ["PPSA00001", "PPSA00003"], name: "Alpha Game", cover: "https://c/a.png" },
    { titleId: "PPSA00002", allTitleIds: ["PPSA00002"], name: "Beta Game" },
  ];

  it("drops untested games — the index only lists tested titles", () => {
    expect(buildSiteIndex(games, [])).toEqual([]);
  });

  it("merges reports into their game and precomputes overall + per-OS statuses", () => {
    const index = buildSiteIndex(games, [
      report("PPSA00001", "main-menu", "windows", "Alpha Game"),
      report("PPSA00001", "logo", "linux", "Alpha Game"),
    ]);
    expect(index).toHaveLength(1);
    const entry = index[0];
    expect(entry.key).toBe("PPSA00001");
    expect(entry.title).toBe("Alpha Game");
    expect(entry.cover).toBe("https://c/a.png");
    expect(entry.overall).toBe("main-menu"); // best across per-OS majorities
    expect(entry.os).toEqual({ windows: "main-menu", linux: "logo" });
    expect(entry.reportCounts).toEqual({ windows: 1, linux: 1 });
    expect(entry.latestTested).toBe("2026-08-01"); // newest across both reports
    expect(entry.reports).toHaveLength(2);
  });

  it("precomputes per-OS statuses via majority, ties to the better status", () => {
    const index = buildSiteIndex(games, [
      report("PPSA00001", "main-menu", "windows", "Alpha Game"),
      report("PPSA00001", "in-game", "windows", "Alpha Game"),
    ]);
    expect(index[0].os.windows).toBe("in-game");
    expect(index[0].overall).toBe("in-game");
    expect(index[0].reportCounts.windows).toBe(2);
  });

  it("matches a report whose title ID is a region variant of the game", () => {
    const index = buildSiteIndex(games, [report("PPSA00003", "logo", "windows", "Alpha Game")]);
    expect(index[0].key).toBe("PPSA00001");
    expect(index[0].reports).toHaveLength(1);
  });

  it("keeps report-only games (title ID not in the database)", () => {
    const index = buildSiteIndex(games, [report("PPSA09999", "logo", "windows", "Mystery Game")]);
    expect(index).toHaveLength(1);
    expect(index[0].key).toBe("PPSA09999");
    expect(index[0].title).toBe("Mystery Game");
    expect(index[0].cover).toBeUndefined();
  });

  it("collects screenshot entries (newest first) for the carousel", () => {
    const older = {
      ...report("PPSA00001", "main-menu", "windows", "Alpha Game", 'screenshot: "screenshots/a.png"'),
      testedDate: "2026-08-01",
    };
    const newer = {
      ...report("PPSA00001", "logo", "linux", "Alpha Game", 'screenshot: "screenshots/b.png"'),
      testedDate: "2026-08-05",
    };
    const index = buildSiteIndex(games, [older, newer]);
    expect(index[0].screenshots).toEqual([
      { title: "Alpha Game", screenshot: "screenshots/b.png", testedDate: "2026-08-05" },
      { title: "Alpha Game", screenshot: "screenshots/a.png", testedDate: "2026-08-01" },
    ]);
  });

  it("sorts entries by title", () => {
    const index = buildSiteIndex(games, [
      report("PPSA00002", "main-menu", "windows", "Beta Game"),
      report("PPSA00001", "main-menu", "windows", "Alpha Game"),
    ]);
    expect(index.map((e) => e.key)).toEqual(["PPSA00001", "PPSA00002"]);
  });
});
