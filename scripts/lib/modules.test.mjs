import { describe, expect, it } from "vitest";
import { normalizeTitleId } from "../../src/data/modules-types";
import { buildSitemap } from "./site-data.mjs";

describe("modules normalization and sitemap", () => {
  it("normalizes PS5 Title IDs cleanly across hyphens, underscores, and lowercase", () => {
    expect(normalizeTitleId("PPSA01325")).toBe("PPSA01325");
    expect(normalizeTitleId("ppsa01325")).toBe("PPSA01325");
    expect(normalizeTitleId("PPSA-01325")).toBe("PPSA01325");
    expect(normalizeTitleId("ppsa_01325")).toBe("PPSA01325");
    expect(normalizeTitleId("  PPSA 01325  ")).toBe("PPSA01325");
  });

  it("includes /patches, /cheats, /configs, and /forks in the generated sitemap", () => {
    const sitemap = buildSitemap([]);
    expect(sitemap).toContain("<loc>https://kytyps5.github.io/patches</loc>");
    expect(sitemap).toContain("<loc>https://kytyps5.github.io/cheats</loc>");
    expect(sitemap).toContain("<loc>https://kytyps5.github.io/configs</loc>");
    expect(sitemap).toContain("<loc>https://kytyps5.github.io/forks</loc>");
  });
});
