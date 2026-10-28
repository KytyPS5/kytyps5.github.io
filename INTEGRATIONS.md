# Functional parity with the original website

Baseline: upstream commit `8adc056` (2026-10-19). The redesign changes the presentation and navigation. The existing GitHub/static-data architecture remains in use.

## Retained without source changes

- `.github/workflows/compat-issues.yml`: half-hourly upstream status-issue mirroring and lifecycle tracking.
- `compat-convert.yml`: authorized `/compat` conversion, validation, report PRs and mirror handling.
- `compat-set-fields.yml`: authorized report-field overrides.
- `refresh-data.yml`: half-hourly GitHub snapshot comparison and conditional deployment.
- `deploy.yml`: full Pages builds and dependency-free content overlays with cached-build ancestry guards.
- Original catalog importer, issue-form parsing, authorization, override command handler, report validator, compatibility parser/status aggregation and launcher update-feed builder.
- Full imported catalog at `src/data/games.json` and all authoritative Markdown reports under `src/content/compat/`.

## Small adapters and added checks

- Report trust is now scoped to the original source issue. The converter, poller and status-issues helper intentionally correct the original game/OS trust inheritance; the existing command workflows and authorization checks are unchanged. New reports need their own `/trusted` approval, while updates to the same approved source retain it. Upstream answer text cannot act as a maintainer trust override. See [report trust](docs/REPORT_TRUST.md).
- CI retains its original triggers, permissions, report-only gate, failure handling and auto-deploy flow. Unit checks use `test:unit`; full builds additionally install Chromium and run frontend/browser/offline checks.
- Weekly catalog imports retain their existing source, schedule, shrink guard and automated PR process. Generated regional aliases are included in that PR alongside the existing catalog and compatibility seed.
- The catalog transform has one deliberate product exception: MAIDEN's four regional PPSAs form their own group under `PPSA01858`. Its Sony concept ID remains `235235`; refresh merging distinguishes this group from Village so enrichment and manual flags cannot cross between them. All other concept grouping is retained. The parity guard allows only these explicit transform hooks beyond the original source.
- `export-site-compat-json.mjs` delegates to the redesigned export. It uses the original parser/index builder and preserves version-2 fields and canonical title IDs. Additive fields supply report revisions, metadata, regional aliases and latest-report details; all screenshot arrays are retained. Markdown changes feed both public JSON and the bundled fallback. The original launcher compatibility exporter remains unchanged.
- `fetch-github-data.mjs` delegates to the GitHub snapshot refresh. It retains the original endpoints and public snapshot shape, adds a bundled fallback and preserves previous valid data on request failures. Token-shaped repository properties and asset download counters are excluded. The original tested update-feed builder produces the launcher update feed.
- Sitemap generation reads the same authoritative reports/catalog. Original canonical game routes, social previews, structured data and noindex rules for untested/unknown games are retained.
- Browser caching, theme switching, report refresh, richer screenshot browsing, accurate contributor totals and compatibility-history restoration are additions.

## Public contracts

Compatibility regression notices use the stored `src/data/compatibility-peaks.json` registry plus incremental report commits after its saved checkpoint. Site detail JSON adds optional per-platform `previousBest` evidence and includes it in the detail revision. Current status aggregation and launcher/API contracts are unchanged; original report ingestion and Pages workflows remain intact. The weekly catalog PR also saves the refreshed peak registry, with a full-history checkout. See [compatibility history](docs/COMPATIBILITY_HISTORY.md) for persistence, version tie-breaking and missing-version behavior.

The added community-resource system has its own sources: `src/data/forks.json` and `patches/`. It exports `/data/community.json` and content-versioned ZIP downloads under `/patch-files/`. Neither report conversion nor report deletion writes these sources. Regional IDs resolve through the existing catalog. The original report and launcher schemas are unaffected.

`community-forks.yml` accepts collaborator commands on the issue identified by `FORKS_ISSUE_NUMBER`, validates repository write access and fork lineage, and opens/updates `data/community-forks`. An explicit `/force <URL> [game IDs]` command can bypass lineage for a public standalone mirror; authorization, URL/ID validation, PR checks and publication remain the same, and the registry records the override. It enables auto-merge after required checks pass and fails visibly if auto-merge cannot be enabled. The existing deployment flow publishes its merged result. The new branch is included in CI's existing auto-deploy fallback. All original operational workflows other than that additive CI condition remain unchanged. See [community maintenance](docs/COMMUNITY_RESOURCES.md) for setup and command semantics.

| Resource | Contract |
| --- | --- |
| `/data/github.json` | `generatedAt`, `repo`, `latestRelease`, `contributors`, `contributorsCount`, `commits` |
| `/data/updates.json` | Original launcher update-feed builder and asset mapping |
| `/data/compatibility.json` | Original title-ID keys, launcher status enums, comments, report counts and OS blocks |
| `/data/compat-index.json` | Version 2, original tested-game fields plus additive frontend metadata |
| `/data/compat/<KEY>.json` | Version 2, canonical key/title/title ID and full original report payloads |
| `/data/catalog.json` | Full imported catalog for untested regional-title routes |

Original best-across-platforms status aggregation is unchanged. Homepage latest-report badges explicitly identify that report's platform and test date.

## Verification

`npm run test:unit` covers original import, transformation, mirroring, update-feed and compatibility contracts plus the frontend export adapter. Source-scoped trust tests execute the actual poller and converter in isolated temporary repositories with mocked GitHub responses; fork workflow tests exercise its actual merge step with a stubbed GitHub CLI. `node scripts/verify-parity.mjs` compares retained operational sources against the baseline (excluding the three deliberately corrected trust scripts), checks every report/index/feed export and exercises metadata and community destinations in the browser. `npm run test:ci` starts dev/production servers and runs the browser suites after a production build; Chromium must be installed (`npx playwright install --with-deps chromium` on Linux).

Tests do not create or edit real upstream issues, publish report PRs, download emulator binaries or run games. Those remote mutations remain the responsibility of the original authorized workflows and existing repository secrets.
