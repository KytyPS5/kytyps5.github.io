import { describe, expect, it } from "vitest";
import { siteAssetUrl } from "@/lib/utils";

describe("siteAssetUrl", () => {
  it("passes absolute http(s) URLs through unchanged", () => {
    expect(siteAssetUrl("https://example.com/img.png")).toBe("https://example.com/img.png");
  });

  it("passes data: and blob: URLs through unchanged", () => {
    expect(siteAssetUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    expect(siteAssetUrl("blob:https://example.com/uuid")).toBe("blob:https://example.com/uuid");
  });

  it("passes protocol-relative URLs through unchanged", () => {
    expect(siteAssetUrl("//example.com/img.png")).toBe("//example.com/img.png");
  });

  it("resolves relative paths against BASE_URL", () => {
    expect(siteAssetUrl("screenshots/ps5-01.png")).toBe(`${import.meta.env.BASE_URL}screenshots/ps5-01.png`);
  });

  it("normalizes ./ and leading-slash prefixes against BASE_URL", () => {
    expect(siteAssetUrl("./screenshots/ps5-01.png")).toBe(`${import.meta.env.BASE_URL}screenshots/ps5-01.png`);
    expect(siteAssetUrl("/screenshots/ps5-01.png")).toBe(`${import.meta.env.BASE_URL}screenshots/ps5-01.png`);
  });
});
