/**
 * Central site configuration — URLs, repo links and site metadata.
 */
export const SITE = {
  name: "KytyPS5",
  tagline: "A free and open-source PlayStation 5 emulator for Windows, Linux and macOS.",
  description:
    "KytyPS5 is a free and open-source PlayStation 5 emulator written in C++ for Windows, Linux and macOS. Track game compatibility, read reports, and follow development.",
  repoUrl: "https://github.com/KytyPS5/KytyPS5",
  // Where visitors file game-status reports: the KytyPS5 repo owns the Game
  // Emulation Status Report issue template (kytyps5-game-emulation.yaml), and
  // the site repo's sync workflow polls those issues and turns them into
  // report PRs.
  reportRepoUrl: "https://github.com/KytyPS5/KytyPS5",
  // The repository that hosts this website.
  siteRepoUrl: "https://github.com/KytyPS5/KytyPS5-site",
  // Latest known KytyPS5 build; reports tested on other builds get an
  // "older build" note. [maintainer input — set on each release]
  currentVersion: "KytyPS5-2026-08-07-7907a50",
} as const;

/** Origin used for canonical URLs / sitemap (GitHub Pages project site). */
export const SITE_URL = "https://kytyps5.github.io/KytyPS5-site";
