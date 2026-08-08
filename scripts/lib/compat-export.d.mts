/**
 * Type declarations for the JS twin parser/index builder that the site export
 * runs in plain Node. scripts/ is outside the main tsconfig's `include`, so
 * this file gives TypeScript the shapes it needs when src/lib/compat.test.ts
 * imports it for the parity suite.
 */

export interface ParsedReport {
  slug: string;
  title: string;
  titleId: string;
  status: "doesnt-boot" | "logo" | "main-menu" | "in-game";
  testedVersion: string;
  testedDate: string;
  os: "windows" | "linux" | "macos";
  hardware?: string;
  score?: number;
  gameVersion?: string;
  screenshot?: string;
  screenshotVerified?: boolean;
  notes: string;
  source?: { label: string; url?: string };
}

export interface SiteIndexEntry {
  key: string;
  title: string;
  titleId?: string;
  cover?: string;
  overall: string;
  os: Partial<Record<"windows" | "linux" | "macos", string>>;
  reportCounts: Partial<Record<"windows" | "linux" | "macos", number>>;
  latestTested?: string;
  screenshots?: { title: string; screenshot: string; testedDate?: string }[];
  reports: ParsedReport[];
}

export function parseReport(raw: string, slug: string): ParsedReport;
export function extractSource(raw: string): { source?: { label: string; url?: string }; body: string };
export function buildSiteIndex(
  games: ReadonlyArray<{ titleId: string; allTitleIds?: string[]; name: string; cover?: string }>,
  reports: readonly ParsedReport[],
): SiteIndexEntry[];
