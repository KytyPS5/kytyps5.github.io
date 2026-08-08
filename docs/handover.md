# KytyPS5 Website — Ownership Handover Checklist

Checklist for transferring `DistantMyth/KytyPS5-site` to the KytyPS5 project
(target: the **`KytyPS5` organization**). Work through the sections in order;
tick every item before/after the transfer.

**Targets after transfer**

| Item | Value |
| --- | --- |
| Repo | `https://github.com/KytyPS5/KytyPS5-site` |
| Pages URL | `https://kytyps5.github.io/KytyPS5-site/` |
| Old Pages URL (stops serving) | `https://distantmyth.github.io/KytyPS5-site/` |
| Site config | `src/config.ts` (`SITE_URL`, `siteRepoUrl`, `reportRepoUrl`) — already updated |

---

## 0. Commit state (before transfer)

Make sure `main` is clean and green **before** initiating the transfer.

- [x] Working tree committed — the org-pointed config, canonical/og URLs, the Pages setup
      comment, the GPL-2.0 `LICENSE`, the minimal README and the maintainer docs all landed
      on `main` (commits `e72abd6`, `b6d72d3`, `2c88e4b`, plus any docs-only follow-ups).
- [ ] Re-check that `CI / test` passes on the latest push before transferring.
- [ ] Confirm the deployed site at `distantmyth.github.io/KytyPS5-site/` still works
      (last build under the old owner).

> Note: `public/data/` and `public/sitemap.xml` are gitignored and regenerated at
> build time — nothing generated needs committing.

---

## 1. Agree the destination (before transfer)

- [ ] Confirm with Nmzik whether the repo should land in his personal account first
      or directly in the `KytyPS5` org.
  - **Personal account** is the smoothest path — DistantMyth may not have
    repo-creation rights in the org. Nmzik can move it into the org afterward
    with one transfer.
  - **Direct to org** requires permission to create repositories in the org;
    an org owner may need to grant that first.
- [ ] Confirm Nmzik will accept the transfer invitation **within 1 day** (it
      expires otherwise).

---

## 2. Transfer (owner action)

Only the current owner can initiate the transfer.

- [ ] Repo **Settings → General → Danger Zone → Transfer ownership**.
- [ ] Enter the new owner (`Nmzik` for the personal-account path, or the
      `KytyPS5` org for the direct path).
- [ ] Keep the repository name `KytyPS5-site`.
- [ ] Read the warnings and confirm by typing the repo name.
- [ ] Nmzik accepts via the confirmation email.

What transfers automatically: issues, PRs, wiki, stars, watchers, secrets,
deploy keys, branches, webhooks. The original owner is kept on as a collaborator,
so the report workflows keep running.

What does **not** transfer / redirect:
- **GitHub Pages does not redirect** — the old `distantmyth.github.io` URL stops
  serving; the site moves to `kytyps5.github.io/KytyPS5-site`.
- If a new repo is created at the old `DistantMyth/KytyPS5-site` location, the
  redirects to the transferred repo are permanently deleted.

---

## 3. Re-enable GitHub Pages (new owner, post-transfer)

Pages must be configured for **Source = "GitHub Actions"** on the new repo.
One-time setup (also documented in `.github/workflows/deploy.yml`):

```bash
gh api --method POST repos/KytyPS5/KytyPS5-site/pages -f build_type=workflow
```

Or via the UI: repo **Settings → Pages → Source → GitHub Actions**.

- [ ] Run the command (or click through the UI).
- [ ] Trigger a deploy and verify the site is live at
      `https://kytyps5.github.io/KytyPS5-site/`.
- [ ] Check `public/sitemap.xml` (regenerated at build) lists the new URL, and
      that `robots.txt` points at the new sitemap.

---

## 4. Verify branch protection (new owner, post-transfer)

- [ ] `main` should require the `CI / test` status check before merges — this is
      what makes the weekly games-database PR auto-merge. Org-level rules/settings
      apply after a transfer, so re-verify or re-create:
      repo **Settings → Branches → Add branch protection rule** (or the org's
      ruleset) — require status checks to pass, including `CI / test`.
- [ ] Confirm the `data/games-refresh` auto-merge flow still works
      (see `.github/workflows/import-games.yml`).

---

## 5. Update the local clone (original owner)

Git itself redirects, but the local remote should point at the new home:

```bash
git remote set-url origin https://github.com/KytyPS5/KytyPS5-site.git
git fetch origin && git branch --set-upstream-to=origin/main main
```

- [ ] Update the remote and pull to confirm access under the new owner.

---

## 6. Update the emulator repo's README (Nmzik)

Nmzik already offered to do this. The main repo should link the site once the
transfer is complete:

- [ ] Add the site link to `KytyPS5/KytyPS5`'s README:
      `https://kytyps5.github.io/KytyPS5-site/`
- [ ] Game-status issues are filed on the emulator repo (Game Emulation Status
      Report template) and converted here by the `compat-report.yml` sync
      workflow — if the template's fields or status options change on the
      emulator repo, update `scripts/issue-to-compat.mjs` to match
      (see `src/config.ts` → `reportRepoUrl`).

---

## 7. Post-transfer smoke test (both owners)

- [ ] Site loads at the new URL (home, /download, /compatibility, a game page).
- [ ] GitHub stats / latest release render (build-time snapshot + live fetch).
- [ ] `data/compat.json` and `data/compatibility.json` are served.
- [ ] Deep links work (404 fallback restores the route).
- [ ] File a test game-status issue on the emulator repo → `compat-report.yml`
      sync converts it → merged PR → status updates on the site.
- [ ] Old `distantmyth.github.io/KytyPS5-site` URL no longer serves (expected).

---

## Maintainer operations

Reference for day-to-day maintenance (the README links here).

### Compatibility reports

Community game statuses live as one Markdown report per test in
`src/content/compat/<game>-<os>.md` (frontmatter: `title`, `titleId`, `status`,
`testedVersion`, `testedDate`, `os`, optional `hardware` / `gameVersion` / `screenshot`).
Status ladder: `doesnt-boot → logo → main-menu → in-game` — the exact options of the
Game Emulation Status Report template on the KytyPS5 repo. Statuses are per OS; the "Any"
badge is the best result across tested OSes. Status colors: grey = Doesn't boot, red = Logo,
orange = Main menu, green = In game. Untested titles stay hidden.

**Sync workflow** (`compat-report.yml`): polls the KytyPS5 repo's open `[GAME STATUS]`
issues every 30 minutes and opens a PR converting any that lack a report (already-converted
issues are tracked by each report's `> Source:` line — no mirror state). Manual runs
(Actions → **Sync compatibility reports** → type an issue number) always convert,
overwriting that game's report. Issues that can't be converted (e.g. Game ID "Unknown")
fail loudly and retry on the next poll. The report body carries the issue's details verbatim;
steps / expected behavior / extra notes become `## …` sections on the game page.

**Screenshots** (`get-screenshot.yml`, manual): attach screenshots from a KytyPS5 issue to
its game's report — image URLs are read from the issue body (HTML comments stripped),
downloaded into `public/screenshots/` (raster, ≤ 10 MB; non-image URLs are skipped with a
warning), the report's `screenshot` + `screenshotVerified: true` frontmatter is set when
unset (drives the homepage carousel), images are embedded in the report body, and a PR is
opened. A `screenshot` without `screenshotVerified: true` and a linked `> Source:` line
fails the build (`prebuild` runs `scripts/validate-compat.mjs`).

**GUI export** (`scripts/export-compat-json.mjs`): emits `public/data/compatibility.json`
for the KytyPS5 launcher — status maps 1:1 to `InGame | MainMenu | Logo | DoesntBoot |
Unknown`, plus an additive per-OS `platforms` block (status, report count, latest build).

### Derived data

| Output | Generated by | Refreshed by |
| --- | --- | --- |
| `public/data/github.json` | `scripts/fetch-github-data.mjs` | `refresh-data.yml` (every 30 min) |
| `public/data/compatibility.json` | `scripts/export-compat-json.mjs` | every build + content-only deploys |
| `public/data/compat.json` | `scripts/export-site-compat-json.mjs` | every build + content-only deploys |
| `public/sitemap.xml` | `scripts/generate-sitemap.mjs` | every build + content-only deploys |

The site re-fetches `data/compat.json` at runtime, so a merged report goes live without a
rebuild. Set `GITHUB_TOKEN` when building to avoid anonymous rate limits.

### Games database

`src/data/games.json` is generated — don't hand-edit imported fields. `npm run import`
(refresh / enrich; see the script for flags) or `.github/workflows/import-games.yml`
(weekly, opens an auto-merged PR `data/games-refresh` gated by CI). If the import reports
"persisted-query hash rejected (HTTP 400)", copy the current `metGetConceptById` hash from
store.playstation.com and update `PSN_HASH` in `scripts/lib/enrich.mjs`.

### Automation

| Workflow | When | What it does |
| --- | --- | --- |
| `ci.yml` | every push / PR | full gates (typecheck, tests, build); report-only PRs get typecheck + report validation only |
| `deploy.yml` | every push to `main` (except docs-only) | full rebuild on code changes; content-only deploys republish the cached build with fresh data |
| `refresh-data.yml` | every 30 min | regenerate the GitHub snapshot; redeploy when changed |
| `import-games.yml` | weekly | refresh the games database + enrich a batch; auto-merged PR gated by CI |
| `compat-report.yml` | every 30 min / manual | poll KytyPS5 `[GAME STATUS]` issues, convert new ones into report PRs |
| `get-screenshot.yml` | manual | attach screenshots from a KytyPS5 issue body to the game's report as a PR |

### Deployment

GitHub Pages via `deploy.yml` (Source = GitHub Actions). Full build on code/script/data
changes (dist cached); content-only deploy for pushes touching only `src/content/compat/**`,
`public/screenshots/**` or `public/data/**` (restores the cached build, regenerates the
compat JSONs + sitemap, republishes). Pushes touching only `docs/`, the README, LICENSE,
`.gitignore` or `.github/**` skip the deploy. Deep links work through `public/404.html`.
`main` requires the `CI / test` status check (admins exempt) — that's what gates the weekly
games-PR auto-merge. If the site moves to a custom domain, update `base` in
`vite.config.ts` together with `SITE_URL` in `src/config.ts`.

### Config

`src/config.ts`: repo URLs, `SITE_URL`, `reportRepoUrl` (KytyPS5/KytyPS5 owns the
status-report template) and `currentVersion` — a maintainer-set value to update on each
release.

## Notes / gotchas

- **Secrets:** the workflows only use `secrets.GITHUB_TOKEN` (auto-provided), so
  no secret reconfiguration is needed after the transfer.
- **`currentVersion` in `src/config.ts`** is a maintainer-set value ("set on each
  release") — the new owner should update it per release.
- **Screenshots** are hosted in this repo (`public/screenshots/`) and attached via
  the **Attach game screenshot** workflow (`get-screenshot.yml`, run manually from
  Actions with an issue number); an empty folder is fine (carousel hides until a report
  carries a screenshot).
- **License:** `LICENSE` is GPL-2.0 (site code); the KytyPS5 name, screenshots
  and project facts belong to the KytyPS5 project.
