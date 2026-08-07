# KytyPS5 Website

The official website for **[KytyPS5](https://github.com/KytyPS5/KytyPS5)** — a free and
open-source PlayStation 5 emulator for Windows, Linux and macOS.

Built with React 19, Vite, TypeScript, Tailwind CSS v4, shadcn-style primitives on Radix UI,
Framer Motion and Lucide icons. Dark-first, premium, accessible, fast.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # typecheck + production build into dist/
npm run preview   # preview the production build
npm run typecheck # type-only check
```

## Project structure

```
src/
  components/
    ui/          # primitives (button, badge, accordion, tabs, dialog, tooltip, code-block…)
    layout/      # navbar, footer, container, section, page-header, wordmark, skip-link
    sections/    # home page sections (hero, features, carousel, install-preview…)
    github/      # live data components (repo stats, latest release, contributors, commits)
  layouts/       # site layout with page transitions
  pages/         # home, download, documentation, faq, contributing, about, not-found
  hooks/         # useGithubData, useCountUp
  lib/           # github client, seo helpers, content data, utils
  styles/        # design tokens (Tailwind v4 @theme) + base styles
public/          # robots.txt, sitemap.xml, favicon.svg
docs/            # design plan (sitemap, design system, component inventory, wireframes)
```

## GitHub integration (mirrors )

GitHub data is handled the same way the  site does it — **build-time rendering plus a
browser re-fetch for freshness**:

1. `npm run prebuild` (runs automatically before `npm run build`) runs
   `scripts/fetch-github-data.mjs`, which fetches repo stats, the latest release, contributors and
   recent commits and writes **`public/data/github.json`**. Set `GITHUB_TOKEN` to raise the limit
   from the anonymous 60 req/hr to 5,000 req/hr.
2. The site renders that snapshot instantly — zero runtime API calls, immune to rate limits, so
   visitors never see a blank state.
3. The browser then re-fetches live for freshness, with in-memory (10 min) and `localStorage`
   (30 min) caching to stay well inside rate limits.

`.github/workflows/refresh-data.yml` regenerates the snapshot weekly and opens a PR when it
changed.

## Compatibility database (mirrors )

One Markdown report per community submission in `src/content/compat/<slug>.md`, with frontmatter
matching the schema in `src/lib/compat.ts` (title, **required titleId**, status, testedVersion,
testedDate, os, hardware, optional score/gameVersion/screenshot). Status ladder:
`nothing → boots → menus → ingame → playable-low-fps → playable`.

**Status is the majority vote.** A game may have multiple reports (one per submission); the
aggregate status shown on cards, stats and game pages is decided by `aggregateStatus()` — the
status most people submitted, with ties broken toward the better status. `groupReportsByGame()`
keeps one card per game.

- `scripts/validate-compat.mjs` validates every report during `prebuild` and **fails the build on
  invalid reports** — same contract as .
- **Per-game pages:** every report has a dedicated page at `/game/<titleId>` (slug also works),
  mirroring 's `[titleId].astro` — cover art, publisher/date/genre metadata, a full
  status badge, the rendered report body (headings, lists, blockquotes, and **screenshots**
  via the hand-rolled safe markdown renderer in `src/lib/markdown.ts(x)`), an older-build
  warning, and a link back to the source issue when present. Games in the database without a
  report get a "No report yet" page (noindexed); unknown keys get a not-found state.
- **Sitemap:** `scripts/generate-sitemap.mjs` regenerates `public/sitemap.xml` during `prebuild`
  with the static routes plus every game page (build-time generation, mirroring 's
  approach). Run `npm run sitemap` to regenerate manually.
- The Compatibility page's "File a compatibility report" CTA links straight to the
  **`.github/ISSUE_TEMPLATE/compatibility_report.yml`** issue template (the  model — no
  intermediate form). **Title ID is required**, and the template captures status, build, date,
  OS, hardware and notes in the exact `### Label` format the conversion workflow parses.
- `.github/workflows/compat-report.yml` converts issues into report PRs via
  `scripts/issue-to-compat.mjs` (passing `--source-url` so per-game pages link back to the
  issue, plus `--game-version`). Because the data lives in this repo, the report file, the
  per-OS export and the site all update together.
- `npm test` runs Vitest coverage of the parser/stats, aggregation, markdown renderer, report
  builder and the import transforms.

The seed reports are inferred from the project's own screenshots and marked as unverified until
community reports land. `disgaea-6-community.md` is a clearly-labeled example of a second report
demonstrating majority-vote aggregation — replace or remove it before launch [maintainer input].

### GUI-compatible status JSON (KytyPS5 launcher)

`scripts/export-compat-json.mjs` emits **`public/data/compatibility.json`** in the exact shape the
KytyPS5 GUI launcher parses (`src/launcher/src/compatibilityDatabase.cpp`):

```json
{
  "PPSA06228": {
    "status": "InGame",
    "reports": 2,
    "comment": "2 reports · status: playable-low-fps · tested on …",
    "platforms": {
      "linux": { "status": "InGame", "reports": 1, "comment": "1 report · status: playable-low-fps", "version": "…" }
    }
  }
}
```

- **Keys** are trimmed + uppercased title IDs (mirrors the launcher's `TitleKey()`); **statuses**
  are the GUI's enum strings `InGame | MainMenu | Logo | DoesntBoot | Unknown` — our ladder maps
  `nothing → DoesntBoot`, `boots → Logo`, `menus → MainMenu`, and every playable tier →
  `InGame` (the GUI has no playable tier).
- **One entry per game**, status = majority vote across its reports (same aggregation the site
  shows), with a short human comment.
- **Per-OS policy (Nmzik's cross-platform caveat on #177):** each entry also carries an optional
  `platforms` block — `windows | linux | macos` — with the **majority per OS**, its report count,
  and the latest tested build for that OS. Reports without an `os` field count toward the
  cross-platform status only (the seed reports are screenshot-inferred, so their OS is unknown).
  A platform key is **omitted when that OS has no reports** — absence means untested, so it can't
  be confused with `Unknown`. The launcher's `Parse()` reads only `status`/`comment` and ignores
  the extra `platforms`/`reports` fields, so current GUI builds are unaffected while future ones
  can render OS-specific results:
- Wired into `prebuild` (after validation), so the GUI can fetch a cheap static file on every
  launch — no API calls, no rate limits. Run `npm run export:compat` for a pretty version.
- `scripts/lib/compat-export.test.mjs` proves compatibility end-to-end: it **replicates the
  launcher's actual parser** from the real `compatibilityDatabase.cpp` source (`TitleKey` =
  trim+uppercase, `StatusFromText` = exact string matches, `Parse` = object map with
  empty-key/empty-object skips, `Find` = `TitleKey`-keyed lookup) and runs it over the real
  seed reports and the emitted file, asserting every status survives as a known GUI string
  (never `Unknown`) and every key resolves via `Find`.

**Verified live (2026-08-07):** the launcher's hardcoded fetch
(`https://github.com/Nmzik/KytyPS5/releases/download/compat-db/compatibility_db.json`) currently
**404s** — `Nmzik/KytyPS5` now redirects to the org repo, and no release carries a `compat-db`
asset yet. The GUI logs a warning and shows no statuses until the maintainer publishes one; the
plan is to have it fetch this site's `/data/compatibility.json` instead.

### Homepage carousel

The rotating screenshots on the homepage are **not hardcoded** — slides are derived from the
compatibility reports that carry a `screenshot` field (`src/lib/slides.ts`), newest first, with
captions linking to each game's page. Adding a report with a screenshot automatically adds a
slide.

### Games database (PSN metadata enrichment)

`src/data/games.json` holds the deduplicated PS5 title database (~8.8k games) plus PlayStation
Store metadata for enriched entries. It is generated, don't hand-edit imported fields:

```bash
npm run import                          # refresh title list (no enrichment)
npm run import -- --enrich 300          # + enrich 300 concepts with covers/metadata
npm run import -- --only PPSA01284      # enrich specific title IDs
npm run import -- --force               # accept a >5% shrink of the list
```

Sources: [andshrew/PlayStation-Titles](https://github.com/andshrew/PlayStation-Titles) (MIT) +
the public PlayStation Store GraphQL endpoint (covers, publisher, release date, genres —
throttled 600 ms/concept, incremental). `.github/workflows/import-games.yml` refreshes the list
and enriches 300 concepts weekly. The compatibility page lazily loads `games.json` and shows
covers/publisher/genres for reports whose game matches by title ID or name.

**Refreshing the PSN query hash:** if the import fails with "persisted-query hash rejected (HTTP
400)", open a PS5 game page on store.playstation.com with devtools → Network, filter
`metGetConceptById`, copy `extensions.persistedQuery.sha256Hash`, and update `PSN_HASH` in
`scripts/lib/enrich.mjs`.

## Design system

The "Iris" design tokens live in `src/styles/index.css` (Tailwind v4 `@theme`). A machine-readable
copy generated by the ui-ux-pro-max skill is at `design-system/kytyps5/MASTER.md`, and the full
rationale (sitemap, tokens, component inventory, wireframes) is in `docs/design-plan.md`.

## Filing compatibility reports (no 404s)

The "File a compatibility report" button and the "Open reports" link use `SITE.reportRepoUrl`
in `src/config.ts`, set to the real **`KytyPS5/KytyPS5`** repo, so links always work (GitHub
safely falls back to its new-issue page when the template name isn't found yet).

Once this website's own repo is published, set `reportRepoUrl` to it so the bundled
`.github/ISSUE_TEMPLATE/compatibility_report.yml` + `compat-report.yml` workflow fully automate
the issue → report → export pipeline (the  model).

## Updating a game's status after you verify an issue

Three ways, all ending in a PR you merge (the site + `compatibility.json` then rebuild with the
new status for that game's OS):

1. **Automatic** — issues filed through the `compatibility_report.yml` template carry the
   `compat-report` label, so a conversion PR opens by itself.
2. **Type a command** — reply **`/compat`** on an issue (collaborator-only; the workflow
   verifies your permission) and it converts immediately. The issue body must follow the
   template's `### Label` format (fill in the template fields if the issue wasn't filed
   through it), since the converter reads those sections.
3. **Click a button** — GitHub Actions → **Convert compatibility report** → **Run workflow** →
   type the issue number. Re-running it after you verify an issue overwrites that game's report
   with the issue's current status + OS (a PR opens only when something changed).

## Requesting a compat template from the KytyPS5 maintainer

KytyPS5's repo currently has only a **Game Emulation Bug Report** template
(`.github/ISSUE_TEMPLATE/kytyps5-game-emulation.yaml`) — there is no compatibility-report
template, which is why the dropdown of available templates won't show one.  solved this
by shipping a `game-compatibility.yml` template in the **emulator repo itself** (see
`/`). To request the same from KytyPS5, open an issue on
`https://github.com/KytyPS5/KytyPS5/issues/new` titled **"Add a Game Compatibility Report
issue template"** and ask for:

1. A `.github/ISSUE_TEMPLATE/game-compatibility.yml` (adapt 's — game name, **required
   title ID**, game version, a status dropdown, description, log file, OS/CPU/GPU/RAM, exact
   commit SHA, renderer).
2. An optional `notify-site` workflow so the website rebuilds on release.

This site's own intake already works with any repo: point `reportRepoUrl` at wherever reports
should land and the pre-filled issue flow + conversion workflow follow.

## Maintainer notes

- **Deployment:** the site is published to GitHub Pages at
  `https://distantmyth.github.io/KytyPS5-site/` via `.github/workflows/deploy.yml` (Vite `base`,
  `SITE_URL`, canonical URLs and the sitemap all use that subpath). BrowserRouter is wired with
  `basename={import.meta.env.BASE_URL}`, and `public/404.html` + the `index.html` restore hook
  make deep links work on Pages. Change `base` in `vite.config.ts` + `SITE_URL` in
  `src/config.ts` together if the site moves to a custom domain.
- **SEO caveat (inherent to Pages):** GitHub Pages serves `404.html` with an HTTP 404 status for
  deep routes, so crawlers see the sitemap'd pages as 404 until a custom domain + host that
  prerenders or rewrites is used. Content is fully reachable in browsers.
- **Fresh checkout + `npm run dev`:** the GitHub snapshot and GUI JSON are generated by
  `prebuild`, so run `npm run build` (or `npm run fetch:data` + `npm run export:compat`) once
  before dev to have `public/data/*.json` on disk.
- **`reportRepoUrl`:** now points at this repo (`DistantMyth/KytyPS5-site`), which owns the
  `compatibility_report.yml` issue template + the conversion workflow — the automated issue →
  report → export pipeline runs here.
- **KytyPS5 README screenshot alt text:** the repo's screenshot table labels the games correctly
  (the `<strong>` captions match this site's reports), but the `alt` attributes are buggy
  copy-paste (e.g. ps5-02 says "Disgaea 6" under the Hellboy cell, ps5-04 says "Minecraft
  Legends" under Neptunia ReVerse). Worth a small PR upstream to fix the alt text; the site
  embeds the screenshots with its own correct captions.
- **Checksums:** KytyPS5 doesn't publish checksum files in releases yet; the client-side
  SHA-256 verifier was removed from the site at the maintainer's request.
- **Content accuracy:** all claims mirror the repository README (2026-08-07). Re-check the README
  before major updates.

## License

Site code is original. All project facts, screenshots and the KytyPS5 name belong to their
respective owners (see the [KytyPS5 repository](https://github.com/KytyPS5/KytyPS5), GPL-2.0).
