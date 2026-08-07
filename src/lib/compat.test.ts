import { describe, expect, it } from "vitest";
import {
  aggregateStatus,
  computeStats,
  gamePageKey,
  groupReportsByGame,
  parseCompatReport,
  STATUSES,
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
