import { describe, expect, it } from "vitest";
import { dedupeByConcept, mergeExisting } from "./transform.mjs";
import { buildSiteData } from "./site-data.mjs";
import { gameKeyFor } from "./status-issues.mjs";

const rows = [
  ["PPSA01556", "Resident Evil Village", "UP"],
  ["PPSA01557", "Resident Evil Village", "EP"],
  ["PPSA01558", "BIOHAZARD VILLAGE", "JP"],
  ["PPSA01856", "MAIDEN", "JP"],
  ["PPSA01857", "MAIDEN", "HP"],
  ["PPSA01858", "MAIDEN", "UP"],
  ["PPSA01859", "MAIDEN", "EP"],
  ["PPSA03152", "Resident Evil Village Gameplay Demo", "UP"],
].map(([titleId, name, region]) => ({
  titleId: `${titleId}_00`,
  name,
  region,
  conceptId: 235235,
}));

describe("MAIDEN-only catalog exception", () => {
  it("separates all four MAIDEN PPSAs while retaining the other concept members together", () => {
    const games = dedupeByConcept(rows);
    expect(games).toHaveLength(2);
    const maiden = games.find((game) => game.titleId === "PPSA01858");
    expect(maiden).toMatchObject({
      conceptId: 235235,
      name: "MAIDEN",
      region: "UP",
    });
    expect(maiden.allTitleIds).toEqual([
      "PPSA01856",
      "PPSA01857",
      "PPSA01858",
      "PPSA01859",
    ]);
    expect(
      games.find((game) => game.titleId === "PPSA01556").allTitleIds,
    ).toEqual(["PPSA01556", "PPSA01557", "PPSA01558", "PPSA03152"]);
    expect(games.flatMap((game) => game.allTitleIds).sort()).toEqual(
      rows.map((row) => row.titleId.slice(0, -3)).sort(),
    );
    expect(gameKeyFor("PPSA01859", games)).toBe("PPSA01858");
    expect(gameKeyFor("PPSA03152", games)).toBe("PPSA01556");
  });

  it("does not split other localized names or another game called MAIDEN", () => {
    const games = dedupeByConcept([
      { titleId: "PPSA11111_00", conceptId: 77, name: "MAIDEN", region: "UP" },
      {
        titleId: "PPSA11112_00",
        conceptId: 77,
        name: "Different localized name",
        region: "JP",
      },
    ]);
    expect(games).toHaveLength(1);
    expect(games[0].allTitleIds).toEqual(["PPSA11111", "PPSA11112"]);
  });

  it("preserves each group's own enrichment and manual flags through weekly refresh", () => {
    const fresh = dedupeByConcept(rows);
    const existing = [
      {
        conceptId: 235235,
        titleId: "PPSA01556",
        name: "Village metadata",
        cover: "village.png",
        enriched: true,
        commentsDisabled: true,
      },
      {
        conceptId: 235235,
        titleId: "PPSA01858",
        name: "MAIDEN",
        cover: "maiden.png",
        enriched: true,
        commentsDisabled: false,
      },
    ];
    const merged = mergeExisting(fresh, existing);
    expect(merged.find((game) => game.titleId === "PPSA01556")).toMatchObject({
      name: "Village metadata",
      cover: "village.png",
      commentsDisabled: true,
    });
    expect(merged.find((game) => game.titleId === "PPSA01858")).toMatchObject({
      name: "MAIDEN",
      cover: "maiden.png",
      commentsDisabled: false,
    });
    expect(mergeExisting(dedupeByConcept(rows), merged)).toEqual(merged);
  });

  it("allows simultaneous Village and MAIDEN reports on the same OS and keeps their aliases/statuses independent", () => {
    const reports = [
      {
        slug: "village-windows",
        title: "Village",
        titleId: "PPSA01556",
        os: "windows",
        status: "in-game",
        testedDate: "2026-10-20",
        testedVersion: "build",
        notes: "Village evidence",
      },
      {
        slug: "maiden-windows",
        title: "MAIDEN",
        titleId: "PPSA01859",
        os: "windows",
        status: "logo",
        testedDate: "2026-10-21",
        testedVersion: "build",
        notes: "MAIDEN evidence",
      },
    ];
    const data = buildSiteData(dedupeByConcept(rows), reports);
    expect(data.games).toHaveLength(2);
    expect(data.aliases.PPSA01859).toBe("PPSA01858");
    expect(data.aliases.PPSA01557).toBe("PPSA01556");
    expect(data.details.PPSA01858.reports).toEqual([reports[1]]);
    expect(data.details.PPSA01556.reports).toEqual([reports[0]]);
    expect(data.games.find((game) => game.key === "PPSA01858").overall).toBe(
      "logo",
    );
    expect(data.games.find((game) => game.key === "PPSA01556").overall).toBe(
      "in-game",
    );
  });
});
