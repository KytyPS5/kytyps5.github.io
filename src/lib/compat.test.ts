import { describe, expect, it } from "vitest";
import { buildSiteIndex, parseReport as jsParseReport } from "../../scripts/lib/compat-export.mjs";
import {
  aggregateStatus,
  compatIndexStats,
  computeIndexStats,
  displayStatus,
  displayStatusForOs,
  filterCompatIndex,
  gamePageKey,
  osStatus,
  parseCompatReport,
  perOsStatuses,
  reportsForOs,
  STATUSES,
  STATUS_META,
  type CompatIndexGame,
  type Os,
} from "@/lib/compat";

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

describe("parseCompatReport", () => {
  it("parses a valid report", () => {
    const report = parseCompatReport(VALID, "test-game");
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

  it("rejects an unknown status", () => {
    const bad = VALID.replace('status: "main-menu"', 'status: "broken"');
    expect(() => parseCompatReport(bad, "x")).toThrow(/status must be one of/);
  });

  it("rejects a missing title", () => {
    const bad = VALID.replace('title: "Test Game"', "");
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

  it("uses the LAST source line — a blockquote inside the notes isn't the provenance", () => {
    // A report's "Extra notes" section can legitimately quote its own source
    // ("…the upstream issue said > Source: …"). The converter always appends
    // the real source at the end, so the last `> Source:` line must win.
    const withInnerQuote = `${VALID.trim()}

## Extra notes

> Source: mentioned inside the notes, not the report's provenance

> Source: [GitHub compatibility report #12](https://github.com/org/repo/issues/12)
`;
    const report = parseCompatReport(withInnerQuote, "test-game");
    expect(report.source).toEqual({
      label: "GitHub compatibility report #12",
      url: "https://github.com/org/repo/issues/12",
    });
    expect(report.notes).toContain("mentioned inside the notes, not the report's provenance");
    expect(report.notes).toContain("## Extra notes");
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
    expect(report.screenshotVerified).toBeUndefined();
  });

  it("parses the screenshotVerified flag (set by /getss)", () => {
    const withFlag = VALID.replace(
      'hardware: "Ryzen 9 / RTX 5090"',
      'hardware: "Ryzen 9 / RTX 5090"\nscreenshot: "screenshots/deathloop-windows-1.png"\nscreenshotVerified: true',
    );
    const report = parseCompatReport(withFlag, "test-game");
    expect(report.screenshotVerified).toBe(true);
    expect(report.screenshot).toBe("screenshots/deathloop-windows-1.png");
  });
});

describe("JS parser parity (scripts/lib/compat-export.mjs vs src/lib/compat.ts)", () => {
  it("produces byte-identical reports on the same fixture", () => {
    expect(jsParseReport(VALID, "test-game")).toEqual(parseCompatReport(VALID, "test-game"));
  });

  it("agrees on score/boolean coercion, screenshots and source extraction", () => {
    const full = VALID.replace(
      'hardware: "Ryzen 9 / RTX 5090"',
      'hardware: "Ryzen 9 / RTX 5090"\ngameVersion: "1.004"\nscore: 5\nscreenshot: "screenshots/x.png"\nscreenshotVerified: true',
    ).replace(
      "Boots and reaches gameplay.",
      "Boots and reaches gameplay.\n\n> Source: [KytyPS5 issue #12](https://github.com/KytyPS5/KytyPS5/issues/12)",
    );
    expect(jsParseReport(full, "x")).toEqual(parseCompatReport(full, "x"));
  });

  it("throws the same validation error message", () => {
    const bad = VALID.replace('status: "main-menu"', 'status: "broken"');
    expect(() => jsParseReport(bad, "x")).toThrow(/status must be one of/);
    expect(() => parseCompatReport(bad, "x")).toThrow(/status must be one of/);
  });

  it("builds the same merged index as the removed client-side buildGameIndex semantics", () => {
    // The export's buildSiteIndex mirrors what the compatibility page used to
    // compute with buildGameIndex + displayStatus: same game merge, same
    // overall status, same per-OS aggregation.
    const mk = (titleId: string, status: (typeof STATUSES)[number], os: Os, title: string) =>
      jsParseReport(
        VALID.replace("PPSA01234", titleId)
          .replace('title: "Test Game"', `title: "${title}"`)
          .replace('status: "main-menu"', `status: "${status}"`)
          .replace('os: "windows"', `os: "${os}"`),
        "x",
      );
    const games = [
      { titleId: "PPSA00001", allTitleIds: ["PPSA00001", "PPSA00003"], name: "Alpha Game", cover: "https://c/a.png" },
      { titleId: "PPSA00002", allTitleIds: ["PPSA00002"], name: "Beta Game" },
    ];
    const index = buildSiteIndex(games, [
      mk("PPSA00003", "main-menu", "linux", "Alpha Game"), // region variant
      mk("PPSA00002", "in-game", "windows", "Beta Game"),
    ]);
    const alpha = index.find((e) => e.key === "PPSA00001");
    expect(alpha?.title).toBe("Alpha Game");
    expect(alpha?.cover).toBe("https://c/a.png");
    expect(alpha?.overall).toBe("main-menu");
    expect(alpha?.os).toEqual({ linux: "main-menu" });
    expect(displayStatus(alpha!.reports)).toBe("main-menu");
    expect(displayStatusForOs(alpha!.reports, "linux")).toBe("main-menu");
  });
});

describe("gamePageKey", () => {
  it("prefers the game title ID, then report titleId, then slug", () => {
    const report = { titleId: "PPSA01234", slug: "game-slug" };
    expect(gamePageKey(report, { titleId: "PPSA09999" })).toBe("PPSA09999");
    expect(gamePageKey(report)).toBe("PPSA01234");
  });
});

describe("status ladder", () => {
  it("has the full ladder in order", () => {
    expect(STATUSES).toEqual(["doesnt-boot", "logo", "main-menu", "in-game"]);
  });
});

describe("aggregateStatus", () => {
  const r = (status: (typeof STATUSES)[number]) => ({ status });

  it("returns the majority vote", () => {
    expect(aggregateStatus([r("main-menu"), r("main-menu"), r("logo")])).toBe("main-menu");
    expect(aggregateStatus([r("in-game"), r("in-game"), r("main-menu")])).toBe("in-game");
  });

  it("breaks ties toward the better status", () => {
    expect(aggregateStatus([r("main-menu"), r("in-game")])).toBe("in-game");
    expect(aggregateStatus([r("doesnt-boot"), r("logo")])).toBe("logo");
  });

  it("handles a single report", () => {
    expect(aggregateStatus([r("logo")])).toBe("logo");
  });
});

describe("STATUS_META colors (status ladder palette)", () => {
  const meta = (s: string) => STATUS_META[s as keyof typeof STATUS_META].color;

  it("uses the requested grey/red/orange/green palette", () => {
    expect(meta("doesnt-boot")).toBe("#9ca3af"); // grey
    expect(meta("logo")).toBe("#f87171"); // red
    expect(meta("main-menu")).toBe("#fb923c"); // orange
    expect(meta("in-game")).toBe("#4ade80"); // green
    expect(meta("untested")).toBe("#64748b"); // muted slate (hidden from lists)
  });
});

describe("displayStatus / displayStatusForOs / perOsStatuses (game page aggregation)", () => {
  const r = (status: (typeof STATUSES)[number], os: Os) => ({ status, os });

  it("returns untested with no reports", () => {
    expect(displayStatus([])).toBe("untested");
  });

  it("shows the best result across per-OS tests", () => {
    // boots on macOS but playable on Windows → Any = playable, and each OS
    // filter shows its own status.
    const reports = [r("main-menu", "windows"), r("logo", "macos")];
    expect(displayStatus(reports)).toBe("main-menu");
    expect(displayStatusForOs(reports, "windows")).toBe("main-menu");
    expect(displayStatusForOs(reports, "macos")).toBe("logo");
    expect(displayStatusForOs(reports, "linux")).toBe("untested");
  });

  it("majority-votes within an OS before comparing across OSes", () => {
    // Windows: playable twice; Linux: perfect once → Any = perfect (best), not
    // the cross-platform majority (playable).
    const reports = [r("main-menu", "windows"), r("main-menu", "windows"), r("in-game", "linux")];
    expect(displayStatusForOs(reports, "windows")).toBe("main-menu");
    expect(displayStatus(reports)).toBe("in-game");
  });

  it("reportsForOs scopes reports by OS", () => {
    const reports = [r("main-menu", "linux"), r("logo", "windows")];
    expect(reportsForOs(reports, "linux")).toHaveLength(1);
    expect(reportsForOs(reports, "all")).toHaveLength(2);
  });

  it("perOsStatuses fills every OS slot", () => {
    const reports = [r("main-menu", "windows")];
    expect(perOsStatuses(reports)).toEqual({ windows: "main-menu", linux: "untested", macos: "untested" });
  });
});

describe("slim index helpers (compat-index.json payload)", () => {
  const alpha: CompatIndexGame = {
    key: "PPSA00001",
    title: "Alpha",
    titleId: "PPSA00001",
    overall: "in-game",
    os: { windows: "in-game", linux: "logo" },
    reportCounts: { windows: 1, linux: 1 },
    latestTested: "2026-08-07",
  };
  const beta: CompatIndexGame = {
    key: "PPSA00002",
    title: "Beta",
    titleId: "PPSA00002",
    overall: "main-menu",
    os: { windows: "main-menu" },
    reportCounts: { windows: 1 },
  };

  it("osStatus maps any/all scopes onto the precomputed statuses", () => {
    expect(osStatus(alpha, "all")).toBe("in-game");
    expect(osStatus(alpha, "windows")).toBe("in-game");
    expect(osStatus(alpha, "linux")).toBe("logo");
    expect(osStatus(alpha, "macos")).toBe("untested");
  });

  it("compatIndexStats counts within the OS scope", () => {
    const all = compatIndexStats([alpha, beta], "all");
    expect(all.total).toBe(2);
    expect(all.tested).toBe(2);
    expect(all.untested).toBe(0);
    expect(all.counts["in-game"]).toBe(1);
    expect(all.counts["main-menu"]).toBe(1);

    const linux = compatIndexStats([alpha, beta], "linux");
    expect(linux.total).toBe(2);
    expect(linux.tested).toBe(1);
    expect(linux.untested).toBe(1);
    expect(linux.counts["logo"]).toBe(1);
  });

  it("filterCompatIndex scopes status inside the OS (the regression)", () => {
    expect(filterCompatIndex([alpha, beta], { status: "in-game", os: "all" }).map((e) => e.key)).toEqual(["PPSA00001"]);
    expect(filterCompatIndex([alpha, beta], { status: "logo", os: "linux" }).map((e) => e.key)).toEqual(["PPSA00001"]);
    // Alpha's logo report is Linux-only — it must not match a Windows scope.
    expect(filterCompatIndex([alpha, beta], { status: "logo", os: "windows" })).toEqual([]);
    expect(filterCompatIndex([alpha, beta], { status: "in-game", os: "windows" }).map((e) => e.key)).toEqual(["PPSA00001"]);
  });

  it("filterCompatIndex: OS + not-tested shows games with no report on that OS", () => {
    expect(filterCompatIndex([alpha, beta], { status: "untested", os: "macos" }).map((e) => e.key)).toEqual(["PPSA00001", "PPSA00002"]);
    expect(filterCompatIndex([alpha, beta], { status: "untested", os: "linux" }).map((e) => e.key)).toEqual(["PPSA00002"]);
  });

  it("filterCompatIndex searches title and titleId", () => {
    expect(filterCompatIndex([alpha, beta], { query: "beta" }).map((e) => e.key)).toEqual(["PPSA00002"]);
    expect(filterCompatIndex([alpha, beta], { query: "psa00001" }).map((e) => e.key)).toEqual(["PPSA00001"]);
  });

  it("computeIndexStats counts overall statuses for the preview bar", () => {
    const stats = computeIndexStats([alpha, beta]);
    expect(stats.tested).toBe(2);
    expect(stats.counts["in-game"]).toBe(1);
    expect(stats.counts["main-menu"]).toBe(1);
    expect(stats.counts["logo"]).toBe(0);
  });
});
