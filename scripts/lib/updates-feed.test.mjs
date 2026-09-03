import { describe, expect, it } from "vitest";
import {
  buildUpdatesFeed,
  extractChangelog,
  extractCommit,
  parseAssets,
} from "./updates-feed.mjs";

describe("extractCommit", () => {
  it("extracts 7-char short SHA from 40-char target_commitish", () => {
    const release = {
      target_commitish: "c2189de88f38a34b7ffcf5b755d5631945c63d75",
      tag_name: "KytyPS5-2026-09-03-c2189de",
    };
    expect(extractCommit(release)).toBe("c2189de");
  });

  it("extracts 7-char short SHA from 7-char target_commitish", () => {
    const release = {
      target_commitish: "2fe5c15",
      tag_name: "KytyPS5-2026-09-03-2fe5c15",
    };
    expect(extractCommit(release)).toBe("2fe5c15");
  });

  it("extracts short SHA from tag name when target_commitish is a branch name", () => {
    const release = {
      target_commitish: "main",
      tag_name: "KytyPS5-2026-09-03-2fe5c15",
    };
    expect(extractCommit(release)).toBe("2fe5c15");
  });

  it("extracts short SHA from git-describe formatted tag (with 'g' prefix)", () => {
    const release = {
      target_commitish: "main",
      tag_name: "v0.5.1-g2fe5c15",
    };
    expect(extractCommit(release)).toBe("2fe5c15");
  });

  it("falls back to first commit SHA if target_commitish is branch and tag has no hash", () => {
    const release = {
      target_commitish: "main",
      tag_name: "v1.0.0",
    };
    const commits = [{ sha: "abcdef1234567890" }];
    expect(extractCommit(release, commits)).toBe("abcdef1");
  });

  it("returns raw commitish when non-empty string and no other match", () => {
    const release = {
      target_commitish: "custom-build",
      tag_name: "custom-build",
    };
    expect(extractCommit(release, [])).toBe("custom-build");
  });

  it("returns empty string when release is null or missing", () => {
    expect(extractCommit(null, [])).toBe("");
    expect(extractCommit({}, [])).toBe("");
  });
});

describe("extractChangelog", () => {
  it("extracts bullet points and strips GitHub PR author/URL suffix", () => {
    const body = `
## What's Changed
* controller: give the DualShock 4 the DualSense pad path by @MehmetCambaz in https://github.com/KytyPS5/KytyPS5/pull/453
- graphics: honour DCC fixed clear codes by @brandostrong in https://github.com/KytyPS5/KytyPS5/pull/471
• audio: fix buffer underrun by @contributor

**Full Changelog**: https://github.com/KytyPS5/KytyPS5/compare/KytyPS5-2026-09-03-2fe5c15...KytyPS5-2026-09-03-c2189de
    `;

    const changelog = extractChangelog(body);
    expect(changelog).toEqual([
      "controller: give the DualShock 4 the DualSense pad path",
      "graphics: honour DCC fixed clear codes",
      "audio: fix buffer underrun",
    ]);
  });

  it("falls back to recent commit subjects when release body has no bullet items", () => {
    const body = "**Full Changelog**: https://github.com/KytyPS5/KytyPS5/compare/a...b";
    const commits = [
      { commit: { message: "shader: implement BUFFER_ATOMIC_CMPSWAP (#357)\n\nDetailed message" } },
      { commit: { message: "cross-vendor TLS fix: 0x66 prefixes are forced into 64bit call" } },
    ];

    const changelog = extractChangelog(body, commits);
    expect(changelog).toEqual([
      "shader: implement BUFFER_ATOMIC_CMPSWAP (#357)",
      "cross-vendor TLS fix: 0x66 prefixes are forced into 64bit call",
    ]);
  });

  it("returns empty array when neither body nor commits contain items", () => {
    expect(extractChangelog(null, null)).toEqual([]);
    expect(extractChangelog("", [])).toEqual([]);
    expect(extractChangelog("No bullet items here", [])).toEqual([]);
  });
});

describe("parseAssets", () => {
  it("correctly identifies Windows, Linux, and macOS release assets", () => {
    const rawAssets = [
      {
        name: "KytyPS5-2026-09-03-2fe5c15-Linux-x86_64.tar.gz",
        browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/linux.tar.gz",
        size: 104719420,
      },
      {
        name: "KytyPS5-2026-09-03-2fe5c15-Windows-x64.zip",
        browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/win.zip",
        size: 20647347,
      },
      {
        name: "KytyPS5-2026-09-03-2fe5c15-macOS-x86_64.zip",
        browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/mac.zip",
        size: 44635420,
      },
      {
        name: "KytyPS5-2026-09-03-2fe5c15-checksums.sha256",
        browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/checksums.sha256",
        size: 256,
      },
      {
        name: "KytyPS5-2026-09-03-2fe5c15-checksums.sha1",
        browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/checksums.sha1",
        size: 160,
      },
      {
        name: "KytyPS5-2026-09-03-2fe5c15-checksums.sha256sum",
        browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/checksums.sha256sum",
        size: 256,
      },
    ];

    const assets = parseAssets(rawAssets);

    expect(assets.windows).toEqual({
      name: "KytyPS5-2026-09-03-2fe5c15-Windows-x64.zip",
      url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/win.zip",
      size: 20647347,
    });
    expect(assets.linux).toEqual({
      name: "KytyPS5-2026-09-03-2fe5c15-Linux-x86_64.tar.gz",
      url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/linux.tar.gz",
      size: 104719420,
    });
    expect(assets.macos).toEqual({
      name: "KytyPS5-2026-09-03-2fe5c15-macOS-x86_64.zip",
      url: "https://github.com/KytyPS5/KytyPS5/releases/download/v1/mac.zip",
      size: 44635420,
    });
  });

  it("handles missing assets by keeping keys null", () => {
    const rawAssets = [
      {
        name: "KytyPS5-setup.exe",
        browser_download_url: "https://example.com/setup.exe",
        size: 12345,
      },
    ];

    const assets = parseAssets(rawAssets);
    expect(assets.windows?.name).toBe("KytyPS5-setup.exe");
    expect(assets.linux).toBeNull();
    expect(assets.macos).toBeNull();
  });

  it("handles non-array or empty input gracefully", () => {
    expect(parseAssets(null)).toEqual({ windows: null, linux: null, macos: null });
    expect(parseAssets([])).toEqual({ windows: null, linux: null, macos: null });
  });
});

describe("buildUpdatesFeed", () => {
  it("builds the target updates schema matching requirements", () => {
    const latestRelease = {
      tag_name: "KytyPS5-2026-09-03-2fe5c15",
      target_commitish: "2fe5c151234567890abcdef1234567890abcdef",
      published_at: "2026-09-03T21:53:30Z",
      html_url: "https://github.com/KytyPS5/KytyPS5/releases/tag/KytyPS5-2026-09-03-2fe5c15",
      body: "* Commit or PR message 1 by @dev1 in https://github.com/KytyPS5/KytyPS5/pull/1\n* Commit or PR message 2",
      assets: [
        {
          name: "KytyPS5-2026-09-03-2fe5c15-Windows-x64.zip",
          browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/KytyPS5-2026-09-03-2fe5c15/KytyPS5-2026-09-03-2fe5c15-Windows-x64.zip",
          size: 20647347,
        },
        {
          name: "KytyPS5-2026-09-03-2fe5c15-Linux-x86_64.tar.gz",
          browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/KytyPS5-2026-09-03-2fe5c15/KytyPS5-2026-09-03-2fe5c15-Linux-x86_64.tar.gz",
          size: 104719420,
        },
        {
          name: "KytyPS5-2026-09-03-2fe5c15-macOS-x86_64.zip",
          browser_download_url: "https://github.com/KytyPS5/KytyPS5/releases/download/KytyPS5-2026-09-03-2fe5c15/KytyPS5-2026-09-03-2fe5c15-macOS-x86_64.zip",
          size: 44635420,
        },
      ],
    };

    const feed = buildUpdatesFeed({
      latestRelease,
      generatedAt: "2026-09-03T21:53:30Z",
    });

    expect(feed).toEqual({
      generated_at: "2026-09-03T21:53:30Z",
      tag: "KytyPS5-2026-09-03-2fe5c15",
      commit: "2fe5c15",
      published_at: "2026-09-03T21:53:30Z",
      html_url: "https://github.com/KytyPS5/KytyPS5/releases/tag/KytyPS5-2026-09-03-2fe5c15",
      changelog: [
        "Commit or PR message 1",
        "Commit or PR message 2",
      ],
      assets: {
        windows: {
          name: "KytyPS5-2026-09-03-2fe5c15-Windows-x64.zip",
          url: "https://github.com/KytyPS5/KytyPS5/releases/download/KytyPS5-2026-09-03-2fe5c15/KytyPS5-2026-09-03-2fe5c15-Windows-x64.zip",
          size: 20647347,
        },
        linux: {
          name: "KytyPS5-2026-09-03-2fe5c15-Linux-x86_64.tar.gz",
          url: "https://github.com/KytyPS5/KytyPS5/releases/download/KytyPS5-2026-09-03-2fe5c15/KytyPS5-2026-09-03-2fe5c15-Linux-x86_64.tar.gz",
          size: 104719420,
        },
        macos: {
          name: "KytyPS5-2026-09-03-2fe5c15-macOS-x86_64.zip",
          url: "https://github.com/KytyPS5/KytyPS5/releases/download/KytyPS5-2026-09-03-2fe5c15/KytyPS5-2026-09-03-2fe5c15-macOS-x86_64.zip",
          size: 44635420,
        },
      },
    });
  });

  it("handles null latestRelease gracefully with fallback empty structure", () => {
    const feed = buildUpdatesFeed({
      latestRelease: null,
      generatedAt: "2026-09-03T21:53:30Z",
    });

    expect(feed).toEqual({
      generated_at: "2026-09-03T21:53:30Z",
      tag: "",
      commit: "",
      published_at: "",
      html_url: "",
      changelog: [],
      assets: {
        windows: null,
        linux: null,
        macos: null,
      },
    });
  });
});
