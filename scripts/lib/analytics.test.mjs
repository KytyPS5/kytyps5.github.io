import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("analytics module", () => {
  let analytics;

  beforeEach(async () => {
    vi.resetModules();
  });

  afterEach(() => {
    delete globalThis.window;
    delete globalThis.document;
  });

  it("handles non-browser environments gracefully without throwing", async () => {
    delete globalThis.window;
    delete globalThis.document;

    const mod = await import("../../src/lib/analytics.ts");
    expect(() => mod.initAnalytics("G-1234567890")).not.toThrow();
    expect(() => mod.trackPageView("/test")).not.toThrow();
    expect(() => mod.trackEvent("test_event")).not.toThrow();
  });

  it("rejects invalid measurement IDs", async () => {
    const appendedElements = [];
    globalThis.document = {
      getElementById: () => null,
      head: {
        appendChild: (el) => appendedElements.push(el),
      },
      createElement: () => ({}),
      title: "KytyPS5",
    };
    globalThis.window = {
      location: { origin: "https://kytyps5.github.io" },
    };

    const mod = await import("../../src/lib/analytics.ts");
    mod.initAnalytics("invalid-id");
    expect(appendedElements).toHaveLength(0);
    expect(globalThis.window.gtag).toBeUndefined();
  });

  it("initializes dataLayer and injects script with valid G- ID", async () => {
    const appendedElements = [];
    globalThis.document = {
      getElementById: () => null,
      head: {
        appendChild: (el) => appendedElements.push(el),
      },
      createElement: (tag) => ({ tag }),
      title: "KytyPS5",
    };
    globalThis.window = {
      location: { origin: "https://kytyps5.github.io" },
    };

    const mod = await import("../../src/lib/analytics.ts");
    mod.initAnalytics("G-TEST123456");

    expect(globalThis.window.dataLayer).toBeDefined();
    expect(typeof globalThis.window.gtag).toBe("function");
    expect(appendedElements).toHaveLength(1);
    expect(appendedElements[0].id).toBe("ga-gtag");
    expect(appendedElements[0].src).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-TEST123456",
    );
  });

  it("dispatches page_view events and prevents duplicate consecutive calls", async () => {
    const calls = [];
    globalThis.document = {
      getElementById: () => null,
      head: { appendChild: () => {} },
      createElement: () => ({}),
      title: "Default Title",
    };
    globalThis.window = {
      location: { origin: "https://kytyps5.github.io" },
    };

    const mod = await import("../../src/lib/analytics.ts");
    mod.initAnalytics("G-TEST123456");

    // Replace gtag with our spy
    globalThis.window.gtag = (...args) => calls.push(args);

    mod.trackPageView(
      "/compatibility",
      "KytyPS5 — Game compatibility",
      "G-TEST123456",
    );
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1]).toBe("page_view");
    expect(calls[0][2]).toEqual({
      page_title: "KytyPS5 — Game compatibility",
      page_location: "https://kytyps5.github.io/compatibility",
      page_path: "/compatibility",
      send_to: "G-TEST123456",
    });

    // Duplicate call should be ignored
    mod.trackPageView(
      "/compatibility",
      "KytyPS5 — Game compatibility",
      "G-TEST123456",
    );
    expect(calls).toHaveLength(1);

    // Navigation to a new page should be tracked
    mod.trackPageView("/download", "KytyPS5 — Download", "G-TEST123456");
    expect(calls).toHaveLength(2);
    expect(calls[1][2].page_path).toBe("/download");
  });

  it("dispatches custom events via trackEvent", async () => {
    const calls = [];
    globalThis.window = {
      gtag: (...args) => calls.push(args),
    };

    const mod = await import("../../src/lib/analytics.ts");
    mod.trackEvent("download_click", { platform: "windows" });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([
      "event",
      "download_click",
      { platform: "windows" },
    ]);
  });
});
