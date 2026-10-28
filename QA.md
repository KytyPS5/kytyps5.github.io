# Verification

## MAIDEN-only grouping exception

MAIDEN's four regional IDs now form one separate compatibility group under `PPSA01858`; every other concept retains its existing grouping. Regression tests first reproduced the combined group, cross-group metadata overwrite during refresh, and rejected same-OS reports. All 233 unit tests pass with the exception, including preservation of unrelated localized titles and Village's other demos. The authenticated production build, report validation, full browser/offline pipeline and original workflow/API parity checks pass. The peak registry retains MAIDEN's historical evidence under its new canonical group; its aliases and runtime exports are regenerated. The Linux report also uses the corrected source #1864 from mirror #978. No general report-conversion workflow or command changes are included.

## Explicit fork-lineage override

All 229 unit tests pass, including 44 community tests. The new `/force <URL> [game IDs]` cases first reproduced the missing command behavior in the actual command CLI and reconciliation pipeline. Tests now verify an authorized standalone listing, rejected ordinary `/fork` submissions, read/triage permission denial, public-repository and metadata validation, malformed URLs/IDs, explicit target retention, no implicit game targets and ordinary removal. The registry records the lineage override with its command provenance. Workflow validation checks that `/force` is admitted only through the existing management-issue/collaborator gate.

The authenticated production build, typecheck, report validation and original-system API/feed/catalog/sitemap parity checks pass. Live publication was separately verified after data PR #938 auto-merged and its Pages deployment succeeded: `/data/community.json` contains `chenxiao07/KytyPS5`, and a fresh real Chrome session renders “1 fork” on the published `/forks` page without runtime errors. The earlier zero count reflected the data PR awaiting checks/merge; no production listing was hard-coded or injected by the tests.

## Source-specific trust and fork auto-merge

All 217 unit tests pass. Regression tests reproduced the original trust inheritance in both the actual poller and converter before the fix. Isolated CLI tests now verify new-source reports start untrusted, explicit approvals/revocations win, same-source updates retain automatic conversion, another repository's issue number cannot supply approval, and closed-mirror label corrections do not reopen issues. Additional tests prevent upstream `Overrides` text and report-body `trusted: true` text from granting approval, and ensure maintainer commands preserve the real source footer.

Fork workflow tests execute the actual Bash merge step with a stubbed GitHub CLI: an existing auto-merge request remains successful, while an unavailable request fails visibly. Read-only GitHub inspection confirmed repository auto-merge is enabled, `main` requires the `test` check, and fork data PR #936 merged after that check passed. Its command was rejected by lineage validation, so the merged change only advanced the command cursor. The authenticated production build, typecheck and report validation pass. The parity baseline explicitly excludes the three corrected trust scripts; their original workflows, authorization handler, data and API contracts retain their existing checks.

Removed the demonstrably inherited `trusted` labels from open mirrors #923 and #832 after checking their source issues and maintainer comments; both remain open. No published report files were changed. These live label corrections are separate from the mocked regression tests.

The complete `npm run test:ci` browser/offline pipeline passes, including report navigation, live GitHub/report updates, compatibility history, community resources, physical hero cards, directional theme ripples, production offline reloads, every original report/index field, launcher feeds, catalog and sitemap. It reused the existing local development server and started a separate production preview; the development server remains available on port 5173.

## Compatibility regression notices

All 203 unit tests pass, including eleven history tests covering regional identities, highest-ever status, platform isolation, recovery, missing versions, numeric game-version tie-breaking, persisted checkpoints, incremental peak/decline processing, cache revisions, renamed reports, merged branches hidden by path simplification, peaks created during merge resolution and local-export-to-commit source-link enrichment. The targeted browser check verifies visible current/previous statuses and game versions, preserved source/build details, OS switching, live recovery and regression, unknown versions, both themes at 1440/768/390px and the four actual historical declines currently found in committed reports. Captures wait for settled opacity. Synthetic UI fixtures do not change production reports. Evidence is in `.impeccable/review/regressions/`.

The authenticated production build and original-system parity checks pass after the persistence change. The complete browser/offline suite also passed before that refinement; targeted regression and parity checks were rerun afterward. The original report ingestion and Pages workflow sources remain unchanged. The catalog workflow adds a full-history checkout and saves the stored peak registry in its existing weekly PR.

Independent review scored the merge-history gap resolved, then verified both persistence fixes: equivalent committed reports enrich stored source links, and the unused public registry endpoint was removed to preserve the existing content-only deployment contract. The scoped final verdict is **ship**. The notice styling and all six settled captures passed the local-extension review.

## Community patches and forks

Added independent patch/fork directories and per-game resources without changing report storage, status aggregation, launcher feed schemas or existing report commands. The fork workflow restricts changes to write/maintain/admin collaborators on one configured issue, replays queued commands in order and preserves changes already waiting in its data PR. Forks with no game targets never appear on game pages. Patch folders, descriptions and ZIPs are validated and exported during the normal build.

All 192 unit tests pass, including 30 community export/command/workflow tests. The complete `npm run test:ci` pipeline passes with the new community browser checks alongside every existing journey, data, animation, offline and original-system parity check. The final production build and typecheck pass; the existing bundle-size advisory remains. Browser fixtures exercise populated data without adding fictional production listings.

The requested independent review found two edge cases, both fixed and verified: resources for an uncataloged title survive removal of its final report and subsequent reload; adjacent Markdown ZIP links support `./` and encoded filenames while excluding traversal/nested-path matches. The targeted browser rerun also verifies actual ZIP bytes, all packages, regional game associations, platform/report changes, search/filter controls, error recovery, documentation and 1440/768/390px layouts in both themes. The reviewer's targeted verdict is **ship**, with both findings resolved. Captures are in `.impeccable/review/community/`.

## Original-system parity

Compared against upstream `8adc056`. The original issue-mirroring, report-conversion, override, scheduled GitHub refresh and Pages deployment workflows and their operational helpers are retained unchanged. CI adds browser coverage; weekly catalog PRs also include generated aliases. The full catalog and all Markdown reports remain authoritative. The frontend export uses the original parser and status aggregation, with additive freshness, metadata and screenshot fields.

All 162 unit tests pass, including the original import/transformation, mirror lifecycle, launcher-update and compatibility contracts. The parity check compares every original index/detail field and report, verifies both launcher feeds and the full catalog, checks retained operational sources against the baseline, and exercises regional canonical links, structured metadata, noindex rules and restored community/report destinations. The production build passes with an authenticated GitHub refresh; report validation reports no errors. A JavaScript bundle-size advisory remains.

Read-only GitHub inspection confirms all seven original workflows are active, the existing bot secret is configured and Pages still uses workflow deployment. Recent refresh, mirroring and deployment runs succeeded. Verification does not mutate remote issues or execute emulator binaries. See [INTEGRATIONS.md](INTEGRATIONS.md) for exact adapter scope. Earlier sections below describe local-preview stages before this parity restoration.

The extended theme/navigation regression exposed an exit-animation wait that could retain the previous route during rapid navigation. Routes now replace their content immediately and retain a short entrance fade, with immediate reduced-motion rendering. The targeted regression passes. Browser assertions wait for rendered filter state as well as the updated URL. Offline tests use a controlled cross-origin image to verify opaque-response caching without depending on an external artwork host's availability.

The complete `npm run test:ci` rerun passes: eight general journey groups, live API/history/Quick Start checks, report/cache/scroll regressions, featured selection, both themes, the physical hero deck, production offline caching and original-system parity. The local run reused the existing development server using `KYTY_REUSE_DEV_SERVER=true`; CI starts its own servers. Synthetic latest-report fixtures advance relative to the exported data so future real reports do not make the tests stale.

## Latest featured reports

Featured selection now excludes missing and blank cover-art URLs before taking nine titles. The featured browser regression injects newer titles without artwork and verifies they are absent while both the hero and featured carousel still contain nine games in date order. Captures continue to use their independent screenshot/report ordering.

Replaced the fixed featured-title/screenshot selection with date-sorted runtime data. Hero and collection show the nine newest tested titles; captures use the newest screenshot reports with three distinct-game quick selectors. Exported game metadata identifies the latest report's platform/date, so a recent macOS failure is shown accurately even when an older Windows report reached gameplay. Test dates and platforms are visible; overall compatibility totals retain their existing best-across-platforms policy.

`npm run test:featured` passes: exact newest-first title order, first active title, visible dates, live index refresh moving a previously unfeatured game to the front of all three sections, latest-platform status differing from overall status, correct capture selector associations, no browser errors and desktop/light/phone/dark layout checks. Existing interaction tests now select actual visible titles rather than assuming the old curated games. Source selection and screenshot preferences were removed with `src/data/showcase.json`.

Production build, the eight general browser journey groups, hero deck checks and the updated audit regressions pass. The mechanical detector reports no findings on the changed UI targets. Inspected real mobile hero rendering and the dark phone featured-card layout; frames are in `.impeccable/review/featured/` and the normal review captures.

## Audit fixes and status/scroll verification

Resolved the six findings in the whole-site audit: Pages deep-link fallback, screenshot failure recovery, open-report refresh, complete homepage configure/build/install commands, cache response/write ordering, and stale image fallback for inspectable transient HTTP failures.

Reproduced the homepage scroll pause at 1440/768/390px: the first 120px wheel gesture moved the carousel's hidden vertical scroll by 22px while document scroll stayed unchanged. Translated offscreen cards created the extra range. The carousel now hides vertical overflow and uses centered card entrances; its scroll height matches its client height, and the first wheel gesture moves the document by 120px at each width. Horizontal controls remain usable. Capture screenshots are in `.impeccable/review/audit-fixes/`.

`npm run test:audit-fixes` passes: all 347 games and 372 platform reports agree with the exported index; curated featured data contains only IDs/screenshot preferences. Browser tests change statuses and notes, add a platform, remove a featured title, preserve selection, and verify live hero/card/capture badges. New content revisions invalidate fresh report caches; the independent five-minute report refresh also works for publishers without new revision metadata. Header/sidebar/report statuses use one detail payload, avoiding contradictory states during refresh. These are latest published test results, not live emulator telemetry; offline fallback can retain older reports, and new upstream reports still require export/publication.

Regressions also exercise a failed image followed by a successful one, reversed request completion, slow persistent cache writes, versioned-cache invalidation, HTTP 429/500/503 image recovery, storage-blocked direct links preserving queries/hashes, safe redirect origins and complete platform build commands. General browser journeys and the functionality suite pass. Production cache/offline checks also pass after the changes, including both theme ripples, request deduplication, persistent saved responses, offline report reload and lazy-route navigation. Production build passes; GitHub returned HTTP 403 during its data refresh, so the build retained the existing valid GitHub snapshot as designed. The mechanical detector's existing typography/radius/dark-token advisories remain; no new design palette or typography was introduced. No remote workflow, publication or emulator execution was performed.

## Running kitten loader

The replacement loader uses original generated artwork with smooth, solid-color contours: a 13,467-byte transparent GIF, twelve distinct frames at 80ms each, and a static reduced-motion PNG. Inspected the frame sheet and real startup/route/report states at desktop and phone sizes in both themes.

Targeted production browser checks pass for pre-JavaScript startup, delayed route chunks, pending community reports, release refresh feedback, removal after completion, correct reduced-motion image selection and absence of runtime errors. Chrome's image decoder verifies frame count, timing, changing poses and transparent background. Both GIF and static PNG load offline from the precached shell, including an alternative that has never appeared on screen. The production build passes. The detector's dark-paper/dark-muted advisories correspond to the existing dark-theme token values; the loading text uses the documented body font.

## Functionality and Quick Start follow-up

Reproduced and fixed compatibility return links losing search/filter state, browser Back losing loaded pages and scroll, static homepage contributor previews/totals, and ignored runtime compatibility updates. Search, OS/status, sorting and loaded page count now stay in the URL; browser history and in-page return links restore the selected row and scroll. Rapid filter changes preserve one another.

Restored complete homepage screenshot browsing, automatic playback, pause and a larger viewer. GitHub totals use pagination headers, release asset selection rejects checksums, and reduced-motion counters update when new data arrives. Build scripts again generate launcher update/compatibility feeds, the public compatibility index, aliases, sitemap and robots file. Actual GitHub fetch/export ran successfully for 347 games and 372 reports.

`npm run test:functionality`: all seven browser groups and the public-feed contract assertions pass. Tests cover Back/Forward and reload, changing GitHub stats/contributors/releases, timed visible-tab refresh, saved responses when GitHub is unavailable, newly served compatibility entries, all six Quick Start steps and navigation/deep links at 1440/768/390px, capture controls/autoplay, directional entrances and reduced motion. Browser mocks exercise changing upstream responses without modifying remote data. Inspected desktop and phone Quick Start screenshots for reading hierarchy and overflow.

Final production build and cache/offline tests pass. Both ripple directions also pass 64 Chrome compositing checks with the new entrance animations. The general eight-group browser suite passed after the functionality additions. Vite retains its advisory about the main JavaScript chunk exceeding 500 kB. The mechanical detector reported three advisory typography sizes; these intentional guide-heading, step-heading and selector roles are now documented in DESIGN.md.

Browser refresh works against GitHub APIs and the compatibility JSON served by this site. New report files must still be exported and published. Upstream scheduled GitHub Actions and remote deployment have not been activated or changed in this local preview.

## Follow-up enhancements

`npm run test:cache` checks both 600ms ripple origins, transform-only keyframes, constant-speed timing, interrupted toggles, persisted theme and immediate reduced-motion/unsupported-browser behavior. Frame timing is measured separately from screenshots to avoid capture overhead. JSON checks verify concurrent-request deduplication, persistent hits after reload, explicit refresh, stale fallback and error exclusion. A separate production context verifies the cached shell and fonts, offline reload of a visited ASTRO BOT report, cached cross-origin artwork loading and navigation to a previously unvisited lazy documentation route. Asset matching handles `Vary` headers between precache/warm-up requests and ordinary browser requests. Transition captures are in `.impeccable/review/cache-ripple/`.

`npm run test:ripple` checks the replacement compositor reveal at 1440, 768 and 390px, plus a scrolled viewport with 4× CPU throttling. It pauses both directions halfway to verify the circular window and inverse page scale, verifies scroll preservation, and checks Chrome animation traces for compositing failures associated with the two ripple layers. Frame captures and traces are in `.impeccable/review/compositor-ripple/`. These checks run in installed Chrome; device-specific rendering can still differ.

`npm run test:hero` verifies persistent card identities and the requested left → behind, center → left, right → center and behind → right cycle. It measures actual animated movement into the foreground, checks pause/resume and selection, and verifies stack/control placement at 1440, 1024, 768, 390 and 320px. Frame captures are in `.impeccable/review/deck/`.

`npm run test:enhancements` covers the reproduced reduced-motion autoplay regression, pause/resume, persistent dark mode across reload/navigation, first-visit system preference, exact status proportions and clickable filters, untested platform counts, and both themes at desktop/tablet/phone widths. Captures are in `.impeccable/review/enhancements/`.

## Lightswind circle-spread comparison

Reviewed Lightswind’s published `registry/toggle-theme.tsx` on 2026-10-20. Its circle-spread uses the View Transition API and a circular clip-path on `::view-transition-new(root)`, originating at the button with a default 400ms ease-in-out animation. Source: https://github.com/codewithMUHILAN/Lightswind-UI-Library/blob/Master/registry/toggle-theme.tsx.

A temporary browser-only adapter compared those mechanics with the current reveal on the same 1440×1000 page, four toggles per method at normal and 4× CPU throttling. A third variant matched our corner origins, 600ms linear timing and suppression of theme-color transitions. Both clip-path and transform methods passed Chrome compositing checks. In the steady animation windows (excluding the first 80ms and last 10ms), current/matched clip-path recorded 2/2 Paint events at normal CPU and 0/0 at 4× throttling. The default-mechanics variant, leaving the page’s color transitions active, recorded 247/117 Paint events respectively. These are local rendering samples rather than FPS guarantees or a benchmark of the Lightswind website itself.

The evidence does not support treating circular clip-path as inherently main-thread-bound: this Chrome version composites it successfully. Suppressing concurrent color transitions produced the clearest measured reduction in repaint work. Lightswind offers simpler animation code, but no measured rendering advantage over the now-stable implementation; the interface was kept unchanged. Reproduction script and results are in `.impeccable/review/compare-theme-methods.mjs` and `.impeccable/review/theme-method-comparison.json`.

## Automated checks

- `npm run build`: TypeScript and Vite production build pass.
- `npm test`: 8 browser journey groups pass without browser runtime errors. Covers nine routes at 1440/768/390px, game/title search, OS/status filters, reset, load more, no-results state, independent report tabs, screenshot lightbox/navigation/Escape, download asset targets, build tabs, real clipboard contents, FAQ search/keyboard operation, carousel/capture selector and mobile navigation.
- All route widths are measured for document-level horizontal overflow.
- Impeccable mechanical detector: no findings.
- Taste source lint: zero failures; warnings retained for functional control outlines and original factual text punctuation.
- Taste browser inspector: zero failures at 1440, 768 and 390px. Its eyebrow classifier is allowed because it mistakes functional links from previous sections for ornamental labels. The page contains no decorative eyebrow labels.

## Visual review

Inspected the home page at desktop, tablet and phone widths and all resource/detail routes at desktop and phone widths. A separate finish review found two original detail features missing: catalog metadata and a build-age notice. Both were restored. The tablet game-sleeve layout was adjusted to keep the full cover, report link and slideshow controls available. The reviewer’s final targeted verdict was **ship**, with all three fixes scored resolved.

## Intentional choices and verification limits

- The game carousel scrolls sideways with visible controls and native touch scrolling. This is an intentional collection interaction.
- Code uses an installed monospace face; the display and reading faces are bundled locally. The font-count warning therefore includes actual code, not a third display font.
- The page uses still community screenshots. No gameplay video was supplied in the source; artwork is explicitly separated from emulator captures.
- External download links point to actual current GitHub release assets. Browser checks verify the URLs and interactions; they do not download or execute emulator archives.
- Browser fallback behavior uses saved compatibility/GitHub data. Remote artwork, captures and full reports require a successful first fetch before they are available offline. Cache entries expire or are evicted within bounded storage; missing images retain a readable fallback. Emulator archives are not cached.
- This is a local preview. No remote deployment or upstream repository modification was performed.
