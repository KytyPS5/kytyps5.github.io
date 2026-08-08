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

- [ ] Commit the pending working-tree changes. Current state (uncommitted):
  - `src/config.ts` — URLs pointed at the org
  - `index.html`, `public/robots.txt`, `vite.config.ts` — canonical / og / sitemap URLs
  - `.github/workflows/deploy.yml` — Pages setup comment now uses `KytyPS5/KytyPS5-site`
  - `README.md`, `docs/design-plan.md` — license + domain notes
  - `LICENSE` — new, GPL-2.0 (matches the emulator project)
  - `scripts/fetch-github-data.mjs` — pre-existing tweak (reuse release fetch)
- [ ] Push to `main` and confirm the `CI / test` status check passes on the pushed commit.
- [ ] Confirm the deployed site at `distantmyth.github.io/KytyPS5-site/` still works
      after the push (last build under the old owner).

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

## Notes / gotchas

- **Secrets:** the workflows only use `secrets.GITHUB_TOKEN` (auto-provided), so
  no secret reconfiguration is needed after the transfer.
- **`currentVersion` in `src/config.ts`** is a maintainer-set value ("set on each
  release") — the new owner should update it per release.
- **Screenshots** are hosted in this repo (`public/screenshots/`) and attached via
  the `/getss` workflow; an empty folder is fine (carousel hides until a report
  carries a screenshot).
- **License:** `LICENSE` is GPL-2.0 (site code); the KytyPS5 name, screenshots
  and project facts belong to the KytyPS5 project.
