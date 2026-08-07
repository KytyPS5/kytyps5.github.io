import { describe, expect, it } from "vitest";
import { dedupeByConcept, isJunk, mergeExisting, regionRank, stripSuffix } from "./transform.mjs";
import { applyEnrichment } from "./enrich.mjs";

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

describe("mergeExisting (refreshes must not lose enrichment or manual flags)", () => {
  it("preserves enriched metadata (cover, publisher, genres) across a refresh", () => {
    const fresh = [{ conceptId: 1, titleId: "PPSA00001", name: "Alpha", region: "UP" }];
    const existing = [
      {
        conceptId: 1,
        titleId: "PPSA00001",
        name: "Alpha",
        region: "UP",
        enriched: true,
        cover: "https://image.api.playstation.com/x.jpg",
        publisher: "Pub",
        genres: ["Action"],
      },
    ];
    const merged = mergeExisting(fresh, existing);
    expect(merged[0].cover).toBe("https://image.api.playstation.com/x.jpg");
    expect(merged[0].publisher).toBe("Pub");
    expect(merged[0].enriched).toBe(true);
  });

  it("preserves manual flags on unenriched entries (the hand-completed Neptunia case)", () => {
    const fresh = [{ conceptId: 2, titleId: "PPSA00002", name: "Beta", region: "UP" }];
    const existing = [
      { conceptId: 2, titleId: "PPSA00002", name: "Beta", region: "UP", noStore: true },
    ];
    const merged = mergeExisting(fresh, existing);
    expect(merged[0].noStore).toBe(true);
    expect(merged[0].enriched).toBeUndefined();
  });

  it("keeps entries without an existing concept untouched", () => {
    const fresh = [{ conceptId: 3, titleId: "PPSA00003", name: "Gamma", region: "UP" }];
    expect(mergeExisting(fresh, []).length).toBe(1);
  });
});

describe("applyEnrichment (stale concepts must stay retriable)", () => {
  it("a null concept marks noStore but NOT enriched, so it is retried later", () => {
    const out = applyEnrichment({ titleId: "PPSA00001" }, null);
    expect(out.noStore).toBe(true);
    expect(out.enriched).toBeUndefined();
  });

  it("a real concept fills cover, publisher, release date and genres", () => {
    const concept = {
      invariantName: "Alpha",
      publisherName: "Pub",
      releaseDate: { value: "2026-01-01T00:00:00Z" },
      combinedLocalizedGenres: [{ value: "Action" }],
      media: [{ role: "GAMEHUB_COVER_ART", url: "https://image.api.playstation.com/c.jpg" }],
    };
    const out = applyEnrichment({ titleId: "PPSA00001" }, concept);
    expect(out.cover).toBe("https://image.api.playstation.com/c.jpg");
    expect(out.publisher).toBe("Pub");
    expect(out.genres).toEqual(["Action"]);
    expect(out.enriched).toBe(true);
    expect(out.noStore).toBeUndefined();
  });
});
