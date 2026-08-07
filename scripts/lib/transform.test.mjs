import { describe, expect, it } from "vitest";
import { dedupeByConcept, isJunk, regionRank, stripSuffix } from "./transform.mjs";

describe("stripSuffix", () => {
  it("strips the regional suffix", () => {
    expect(stripSuffix("PPSA01284_00")).toBe("PPSA01284");
  });
  it("leaves clean IDs alone", () => {
    expect(stripSuffix("PPSA01284")).toBe("PPSA01284");
  });
});

describe("regionRank", () => {
  it("prefers US over EU over JP", () => {
    expect(regionRank("UP")).toBeLessThan(regionRank("EP"));
    expect(regionRank("EP")).toBeLessThan(regionRank("JP"));
    expect(regionRank("XX")).toBe(3);
  });
});

describe("isJunk", () => {
  it("flags entitlement and dev/prod rows", () => {
    expect(isJunk({ name: "Test (Prod) Entitlement" })).toBe(true);
    expect(isJunk({ name: "" })).toBe(true);
  });
  it("keeps real games", () => {
    expect(isJunk({ name: "Returnal" })).toBe(false);
  });
});

describe("dedupeByConcept", () => {
  it("dedupes by concept, prefers UP region, strips suffixes", () => {
    const rows = [
      { titleId: "PPSA01284_00", conceptId: 1, name: "Returnal", region: "JP" },
      { titleId: "PPSA01284_01", conceptId: 1, name: "Returnal", region: "UP" },
      { titleId: "PPSA01285_00", conceptId: 2, name: "Junk (Dev) Entitlement", region: "UP" },
    ];
    const games = dedupeByConcept(rows);
    expect(games).toHaveLength(1);
    expect(games[0].titleId).toBe("PPSA01284");
    expect(games[0].allTitleIds).toEqual(["PPSA01284"]);
  });
});
