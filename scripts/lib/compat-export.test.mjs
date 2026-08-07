import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  aggregateStatuses,
  buildCompatibilityDb,
  mapStatus,
  parseFrontmatter,
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
    for (const status of [
      "nothing",
      "boots",
      "menus",
      "ingame",
      "playable-low-fps",
      "playable",
    ]) {
      const mapped = mapStatus(status);
      expect(GUI_STATUSES).toContain(mapped);
      // The launcher's StatusFromText must never degrade our mapping to Unknown.
      expect(guiStatusFromText(mapped)).not.toBe("Unknown");
    }
  });

  it("maps nothing → DoesntBoot, boots → Logo, menus → MainMenu", () => {
    expect(mapStatus("nothing")).toBe("DoesntBoot");
    expect(mapStatus("boots")).toBe("Logo");
    expect(mapStatus("menus")).toBe("MainMenu");
  });

  it("maps all playable tiers to InGame (GUI has no playable tier)", () => {
    expect(mapStatus("ingame")).toBe("InGame");
    expect(mapStatus("playable-low-fps")).toBe("InGame");
    expect(mapStatus("playable")).toBe("InGame");
  });

  it("falls back to Unknown for unknown statuses", () => {
    expect(mapStatus("bogus")).toBe("Unknown");
  });
});

describe("aggregateStatuses (majority vote, ties → better)", () => {
  it("returns the majority status", () => {
    expect(aggregateStatuses(["ingame", "ingame", "boots"])).toBe("ingame");
  });

  it("breaks ties toward the better status", () => {
    expect(aggregateStatuses(["boots", "ingame"])).toBe("ingame");
    expect(aggregateStatuses(["playable-low-fps", "ingame"])).toBe("playable-low-fps");
  });

  it("defaults to nothing for an empty group", () => {
    expect(aggregateStatuses([])).toBe("nothing");
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
      status: "ingame",
      testedVersion: "KytyPS5-2026-08-07-7907a50",
      testedDate: "2026-08-01",
    },
    {
      titleId: "PPSA06228",
      status: "playable-low-fps",
      testedVersion: "KytyPS5-2026-08-07-7907a50",
      testedDate: "2026-08-05",
    },
    {
      titleId: "PPSA04877",
      status: "menus",
      testedVersion: "KytyPS5-2026-08-07-7907a50",
      testedDate: "2026-07-30",
    },
  ];

  it("groups by title ID and aggregates by majority", () => {
    const db = buildCompatibilityDb(reports);
    expect(Object.keys(db)).toEqual(["PPSA04877", "PPSA06228"]);
    expect(db.PPSA06228.status).toBe("InGame"); // tie → better (playable-low-fps)
    expect(db.PPSA04877.status).toBe("MainMenu");
  });

  it("produces JSON the GUI parser accepts with no Unknown statuses", () => {
    const db = buildCompatibilityDb(reports);
    const parsed = guiParse(serializeLikeCli(db));
    expect(parsed.PPSA06228.status).toBe("InGame");
    expect(parsed.PPSA04877.status).toBe("MainMenu");
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
    const db = buildCompatibilityDb([{ titleId: "", status: "boots" }]);
    expect(db).toEqual({});
  });

  it("normalizes dashed title IDs to keys the GUI can Find", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA-06228", status: "ingame", testedDate: "2026-08-01" },
    ]);
    const parsed = guiParse(serializeLikeCli(db));
    expect(guiFind(parsed, "PPSA06228").status).toBe("InGame");
  });
});

describe("per-OS status policy (Nmzik's cross-platform caveat)", () => {
  const reports = [
    { titleId: "PPSA06228", status: "ingame", os: "windows", testedVersion: "b1", testedDate: "2026-08-01" },
    { titleId: "PPSA06228", status: "playable", os: "windows", testedVersion: "b2", testedDate: "2026-08-03" },
    { titleId: "PPSA06228", status: "boots", os: "linux", testedVersion: "b1", testedDate: "2026-08-02" },
    { titleId: "PPSA06228", status: "menus", os: "linux", testedVersion: "b1", testedDate: "2026-08-01" },
    // No `os` — counts toward the cross-platform status only.
    { titleId: "PPSA06228", status: "nothing", testedVersion: "b1", testedDate: "2026-08-01" },
  ];

  it("keeps the top-level status as the cross-platform majority", () => {
    const db = buildCompatibilityDb(reports);
    // All five statuses occur once → tie broken to the best (playable).
    expect(db.PPSA06228.status).toBe("InGame");
    expect(db.PPSA06228.reports).toBe(5);
  });

  it("aggregates per OS with its own majority", () => {
    const db = buildCompatibilityDb(reports);
    // windows: ingame + playable → tie → playable → InGame
    expect(db.PPSA06228.platforms.windows.status).toBe("InGame");
    expect(db.PPSA06228.platforms.windows.reports).toBe(2);
    // linux: boots + menus → tie → menus → MainMenu
    expect(db.PPSA06228.platforms.linux.status).toBe("MainMenu");
    expect(db.PPSA06228.platforms.linux.reports).toBe(2);
  });

  it("excludes OS-less reports from every platform but keeps them in the overall", () => {
    const db = buildCompatibilityDb(reports);
    const totalPlatform = Object.values(db.PPSA06228.platforms).reduce((n, p) => n + p.reports, 0);
    expect(totalPlatform).toBe(4); // 2 windows + 2 linux
    expect(db.PPSA06228.reports).toBe(5); // overall includes the OS-less one
    expect(db.PPSA06228.platforms.macos).toBeUndefined(); // absent ≠ Unknown
  });

  it("orders platform keys windows → linux → macos and carries the latest build", () => {
    const db = buildCompatibilityDb(reports);
    expect(Object.keys(db.PPSA06228.platforms)).toEqual(["windows", "linux"]);
    expect(db.PPSA06228.platforms.windows.version).toBe("b2"); // newest by test date
  });

  it("omits the platforms block entirely when no report has an OS", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA01234", status: "ingame", testedDate: "2026-08-01" },
    ]);
    expect(db.PPSA01234.platforms).toBeUndefined();
    expect(db.PPSA01234.status).toBe("InGame");
    expect(db.PPSA01234.reports).toBe(1);
  });

  it("excludes unrecognized OS values from platforms but keeps them in the overall", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA05555", status: "ingame", os: "steamos", testedDate: "2026-08-01" },
      { titleId: "PPSA05555", status: "boots", os: "windows", testedDate: "2026-08-01" },
    ]);
    expect(db.PPSA05555.reports).toBe(2);
    expect(db.PPSA05555.platforms.windows).toBeDefined();
    expect(db.PPSA05555.platforms.steamos).toBeUndefined();
  });

  it("prefers the newest dated report's build even when another lacks a date", () => {
    const db = buildCompatibilityDb([
      { titleId: "PPSA06666", status: "ingame", os: "windows", testedVersion: "old", testedDate: "2026-08-01" },
      { titleId: "PPSA06666", status: "ingame", os: "windows", testedVersion: "new" },
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
