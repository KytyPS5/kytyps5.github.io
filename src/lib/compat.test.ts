import { describe, expect, it } from "vitest";
import {
  aggregateStatus,
  buildGameIndex,
  computeStats,
  displayStatus,
  displayStatusForOs,
  filterGameIndex,
  gamePageKey,
  groupReportsByGame,
  indexStatsForOs,
  parseCompatReport,
  reportsForOs,
  STATUSES,
  STATUS_META,
  type Os,
} from "@/lib/compat";

const VALID = `---
titleId: "PPSA01234"
title: "Test Game"
status: "ingame"
testedVersion: "main"
testedDate: "2026-08-07"
os: "windows"
hardware: "Ryzen 9 / RTX 5090"
---

Boots and reaches gameplay.
`;

describe("parseCompatReport", () => {
  it("parses a valid report", () => {
    const report = parseCompatReport(VALID, "test-game");
    expect(report).toMatchObject({
      slug: "test-game",
      title: "Test Game",
      titleId: "PPSA01234",
      status: "ingame",
      testedVersion: "main",
      testedDate: "2026-08-07",
      os: "windows",
      hardware: "Ryzen 9 / RTX 5090",
    });
    expect(report.notes).toBe("Boots and reaches gameplay.");
  });

  it("rejects an unknown status", () => {
    const bad = VALID.replace('status: "ingame"', 'status: "broken"');
    expect(() => parseCompatReport(bad, "x")).toThrow(/status must be one of/);
  });

  it("rejects a missing title", () => {
    const bad = VALID.replace('title: "Test Game"', '');
    expect(() => parseCompatReport(bad, "x")).toThrow(/title/);
  });

  it("rejects a missing titleId", () => {
    const bad = VALID.replace('titleId: "PPSA01234"\n', "");
    expect(() => parseCompatReport(bad, "x")).toThrow(/titleId/);
  });

  it("rejects a malformed titleId", () => {
    const bad = VALID.replace("PPSA01234", "PPSA-12");
    expect(() => parseCompatReport(bad, "x")).toThrow(/PPSA-XXXXX/);
  });

  it("accepts a dashed titleId", () => {
    const dashed = VALID.replace("PPSA01234", "PPSA-01234");
    expect(parseCompatReport(dashed, "x").titleId).toBe("PPSA-01234");
  });

  it("rejects a malformed testedDate", () => {
    const bad = VALID.replace("2026-08-07", "07/08/2026");
    expect(() => parseCompatReport(bad, "x")).toThrow(/YYYY-MM-DD/);
  });

  it("rejects an invalid os", () => {
    const bad = VALID.replace('os: "windows"', 'os: "solaris"');
    expect(() => parseCompatReport(bad, "x")).toThrow(/windows \| linux \| macos/);
  });

  it("rejects a missing os (one report per OS)", () => {
    const bad = VALID.replace('os: "windows"\n', "");
    expect(() => parseCompatReport(bad, "x")).toThrow(/missing required frontmatter field: os/);
  });

  it("extracts a source link from the body", () => {
    const withSource = `${VALID.trim()}

> Source: [GitHub compatibility report #12](https://github.com/org/repo/issues/12)
`;
    const report = parseCompatReport(withSource, "test-game");
    expect(report.source).toEqual({
      label: "GitHub compatibility report #12",
      url: "https://github.com/org/repo/issues/12",
    });
    expect(report.notes).toBe("Boots and reaches gameplay.");
  });

  it("extracts a plain-text source", () => {
    const withSource = `${VALID.trim()}

> Source: KytyPS5 repository screenshots
`;
    const report = parseCompatReport(withSource, "test-game");
    expect(report.source).toEqual({ label: "KytyPS5 repository screenshots" });
    expect(report.source?.url).toBeUndefined();
  });

  it("parses gameVersion, score and screenshot", () => {
    const withExtra = VALID.replace(
      'hardware: "Ryzen 9 / RTX 5090"',
      'hardware: "Ryzen 9 / RTX 5090"\ngameVersion: "1.004"\nscore: 4\nscreenshot: "https://example.com/s.png"',
    );
    const report = parseCompatReport(withExtra, "test-game");
    expect(report.gameVersion).toBe("1.004");
    expect(report.score).toBe(4);
    expect(report.screenshot).toBe("https://example.com/s.png");
  });
});

describe("gamePageKey", () => {
  it("prefers the game title ID, then report titleId, then slug", () => {
    const report = { titleId: "PPSA01234", slug: "game-slug" };
    expect(gamePageKey(report, { titleId: "PPSA09999" })).toBe("PPSA09999");
    expect(gamePageKey(report)).toBe("PPSA01234");
  });
});

describe("computeStats", () => {
  it("counts each status", () => {
    const stats = computeStats(["ingame", "boots", "ingame", "playable"]);
    expect(stats.tested).toBe(4);
    expect(stats.counts.ingame).toBe(2);
    expect(stats.counts.boots).toBe(1);
    expect(stats.counts.playable).toBe(1);
    expect(stats.counts.nothing).toBe(0);
    expect(stats.counts["playable-low-fps"]).toBe(0);
  });

  it("has the full ladder in order", () => {
    expect(STATUSES).toEqual([
      "nothing",
      "boots",
      "menus",
      "ingame",
      "playable-low-fps",
      "playable",
    ]);
  });
});

describe("aggregateStatus", () => {
  const r = (status: (typeof STATUSES)[number]) => ({ status });

  it("returns the majority vote", () => {
    expect(aggregateStatus([r("ingame"), r("ingame"), r("playable")])).toBe("ingame");
    expect(aggregateStatus([r("playable"), r("playable"), r("boots")])).toBe("playable");
  });

  it("breaks ties toward the better status", () => {
    expect(aggregateStatus([r("ingame"), r("playable")])).toBe("playable");
    expect(aggregateStatus([r("boots"), r("menus")])).toBe("menus");
  });

  it("handles a single report", () => {
    expect(aggregateStatus([r("boots")])).toBe("boots");
  });

  it("handles the playable-low-fps status", () => {
    expect(aggregateStatus([r("playable-low-fps")])).toBe("playable-low-fps");
    // ingame + playable-low-fps -> playable-low-fps wins the tie (better)
    expect(aggregateStatus([r("ingame"), r("playable-low-fps")])).toBe("playable-low-fps");
  });
});

describe("groupReportsByGame", () => {
  it("groups reports by normalized title ID", () => {
    const reports = [
      { ...parseCompatReport(VALID, "a"), slug: "a" },
      { ...parseCompatReport(VALID.replace("PPSA01234", "PPSA-01234"), "b"), slug: "b" },
      { ...parseCompatReport(VALID.replace("PPSA01234", "PPSA99999"), "c"), slug: "c" },
    ];
    const groups = groupReportsByGame(reports);
    expect(groups.size).toBe(2);
    expect(groups.get("PPSA01234")?.length).toBe(2);
    expect(groups.get("PPSA99999")?.length).toBe(1);
  });
});

describe("STATUS_META colors (status ladder palette)", () => {
  const meta = (s: string) => STATUS_META[s as keyof typeof STATUS_META].color;

  it("uses the requested red/orange/yellow/blue/cyan/green/grey palette", () => {
    expect(meta("nothing")).toBe("#f87171"); // red
    expect(meta("boots")).toBe("#fb923c"); // orange
    expect(meta("menus")).toBe("#facc15"); // yellow
    expect(meta("ingame")).toBe("#60a5fa"); // blue
    expect(meta("playable-low-fps")).toBe("#22d3ee"); // cyan
    expect(meta("playable")).toBe("#4ade80"); // green
    expect(meta("untested")).toBe("#7b8496"); // grey
  });
});

describe("displayStatus (best across per-OS majorities)", () => {
  const r = (status: (typeof STATUSES)[number], os: Os) => ({ status, os });

  it("returns untested with no reports", () => {
    expect(displayStatus([])).toBe("untested");
  });

  it("shows the best result across per-OS tests (the user's example)", () => {
    // ingame on macOS but playable on Windows → Any = playable, and each OS
    // filter shows its own status.
    const reports = [r("playable", "windows"), r("ingame", "macos")];
    expect(displayStatus(reports)).toBe("playable");
    expect(displayStatusForOs(reports, "windows")).toBe("playable");
    expect(displayStatusForOs(reports, "macos")).toBe("ingame");
    expect(displayStatusForOs(reports, "linux")).toBe("untested");
  });

  it("majority-votes within an OS before comparing across OSes", () => {
    // Windows: ingame twice; Linux: playable once → Any = playable (best), not
    // the cross-platform majority (ingame).
    const reports = [r("ingame", "windows"), r("ingame", "windows"), r("playable", "linux")];
    expect(displayStatusForOs(reports, "windows")).toBe("ingame");
    expect(displayStatus(reports)).toBe("playable");
  });

  it("a single-OS game's overall status equals that OS's status", () => {
    const reports = [r("ingame", "linux")];
    expect(displayStatus(reports)).toBe("ingame");
    expect(displayStatusForOs(reports, "all")).toBe("ingame");
  });
});

describe("buildGameIndex", () => {
  const report = (titleId: string, status: (typeof STATUSES)[number], title = "Game") =>
    ({ ...parseCompatReport(VALID.replace("PPSA01234", titleId).replace('title: "Test Game"', `title: "${title}"`).replace('status: "ingame"', `status: "${status}"`), "x"), slug: "x" });

  const games = [
    { titleId: "PPSA00001", allTitleIds: ["PPSA00001", "PPSA00001_00"], name: "Alpha Game", cover: "https://c/a.png" },
    { titleId: "PPSA00002", allTitleIds: ["PPSA00002"], name: "Beta Game" },
  ];

  it("includes every database game (untested ones included)", () => {
    const index = buildGameIndex(games, []);
    expect(index).toHaveLength(2);
    expect(index.every((e) => e.reports.length === 0)).toBe(true);
    expect(displayStatus(index[0].reports)).toBe("untested");
  });

  it("merges reports into their game and surfaces tested games first", () => {
    const index = buildGameIndex(games, [
      report("PPSA00002", "ingame", "Beta Game"),
      report("PPSA00001", "playable", "Alpha Game"),
    ]);
    expect(index).toHaveLength(2);
    expect(index[0].key).toBe("PPSA00001");
    expect(index[0].reports).toHaveLength(1);
    expect(displayStatus(index[0].reports)).toBe("playable");
    expect(index[1].key).toBe("PPSA00002");
    expect(index[1].cover).toBeUndefined();
  });

  it("matches a report whose title ID is a region variant of the game", () => {
    // The game's primary ID is PPSA00001 but another region shares the concept.
    const variants = [
      { titleId: "PPSA00001", allTitleIds: ["PPSA00001", "PPSA00003"], name: "Alpha Game" },
    ];
    const index = buildGameIndex(variants, [report("PPSA00003", "menus", "Alpha Game")]);
    expect(index[0].reports).toHaveLength(1);
    expect(displayStatus(index[0].reports)).toBe("menus");
  });

  it("keeps report-only games (title ID not in the database)", () => {
    const index = buildGameIndex(games, [report("PPSA09999", "boots", "Mystery Game")]);
    expect(index).toHaveLength(3);
    const extra = index.find((e) => e.key === "PPSA09999");
    expect(extra?.title).toBe("Mystery Game");
    expect(extra?.reports).toHaveLength(1);
  });

  it("aggregates multiple reports per game", () => {
    const index = buildGameIndex(games, [
      report("PPSA00001", "ingame", "Alpha Game"),
      report("PPSA00001", "playable", "Alpha Game"),
    ]);
    expect(index[0].reports).toHaveLength(2);
    expect(displayStatus(index[0].reports)).toBe("playable"); // tie -> better
  });
});

describe("per-OS status and filtering (reportsForOs / displayStatusForOs / filterGameIndex / indexStatsForOs)", () => {
  // Build a report with a chosen status and OS (os is required in the schema).
  const mk = (titleId: string, status: (typeof STATUSES)[number], os: Os, title = "Game") => {
    const raw = VALID.replace("PPSA01234", titleId)
      .replace('title: "Test Game"', `title: "${title}"`)
      .replace('status: "ingame"', `status: "${status}"`)
      .replace('os: "windows"', `os: "${os}"`);
    return { ...parseCompatReport(raw, "x"), slug: "x" };
  };

  const games = [
    { titleId: "PPSA00001", allTitleIds: ["PPSA00001"], name: "Alpha" },
    { titleId: "PPSA00002", allTitleIds: ["PPSA00002"], name: "Beta" },
  ];

  it("displayStatusForOs is untested when no report exists for that OS", () => {
    const reports = [mk("PPSA00001", "ingame", "linux", "Alpha")];
    expect(displayStatusForOs(reports, "linux")).toBe("ingame");
    expect(displayStatusForOs(reports, "windows")).toBe("untested");
    expect(displayStatusForOs(reports, "all")).toBe("ingame");
  });

  it("reportsForOs scopes reports by OS", () => {
    const reports = [
      mk("PPSA00001", "ingame", "linux", "Alpha"),
      mk("PPSA00001", "boots", "windows", "Alpha"),
    ];
    expect(reportsForOs(reports, "linux")).toHaveLength(1);
    expect(reportsForOs(reports, "all")).toHaveLength(2);
  });

  it("filterGameIndex: OS+status only matches that OS's reports (the regression)", () => {
    const index = buildGameIndex(games, [
      mk("PPSA00001", "ingame", "linux", "Alpha"), // Linux ingame
      mk("PPSA00002", "ingame", "windows", "Beta"), // Windows ingame
    ]);
    expect(filterGameIndex(index, { status: "ingame", os: "linux" }).map((e) => e.key)).toEqual(["PPSA00001"]);
    expect(filterGameIndex(index, { status: "ingame", os: "windows" }).map((e) => e.key)).toEqual(["PPSA00002"]);
    expect(filterGameIndex(index, { status: "ingame", os: "macos" })).toHaveLength(0);
    expect(filterGameIndex(index, { status: "ingame", os: "all" }).map((e) => e.key).sort()).toEqual(["PPSA00001", "PPSA00002"]);
  });

  it("filterGameIndex: OS + not-tested shows games with no report on that OS", () => {
    const index = buildGameIndex(games, [mk("PPSA00001", "ingame", "linux", "Alpha")]);
    // Alpha has no Windows report, Beta has none at all — both are not tested on Windows.
    expect(filterGameIndex(index, { status: "untested", os: "windows" }).map((e) => e.key)).toEqual(["PPSA00001", "PPSA00002"]);
    // On Linux, Alpha's report votes ingame, so only Beta is not tested.
    expect(filterGameIndex(index, { status: "untested", os: "linux" }).map((e) => e.key)).toEqual(["PPSA00002"]);
  });

  it("indexStatsForOs counts only that OS's reports, and 'all' counts best-across-OS", () => {
    const index = buildGameIndex(games, [
      mk("PPSA00001", "ingame", "linux", "Alpha"),
      mk("PPSA00002", "playable", "windows", "Beta"),
    ]);
    const linux = indexStatsForOs(index, "linux");
    expect(linux.total).toBe(2);
    expect(linux.tested).toBe(1);
    expect(linux.untested).toBe(1);
    expect(linux.counts.ingame).toBe(1);

    const any = indexStatsForOs(index, "all");
    expect(any.tested).toBe(2);
    expect(any.counts.ingame).toBe(1);
    expect(any.counts.playable).toBe(1);
  });
});
