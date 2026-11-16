# Community patches and forks

The website has `/patches` and `/forks` directories. Each game page also displays the patches and explicitly targeted forks associated with that game's catalog identity, including its regional title IDs. These associations live separately from `src/content/compat/` and survive report replacement, report renaming, removal and platform updates. A game can have resources before it has a compatibility report or a catalog entry; an unknown valid game ID has its own resource page until catalog metadata is available.

## Manage forks through the dedicated issue

Use [the dedicated fork-management issue (#932)](https://github.com/KytyPS5/kytyps5.github.io/issues/932) in this website repository. The repository variable `FORKS_ISSUE_NUMBER` identifies that one issue; commands elsewhere are ignored. Only collaborators with repository **write**, **maintain** or **admin** access may manage listings. Report-submission permissions do not grant fork-management access.

Comment with a public GitHub fork URL and optional game IDs:

```text
/fork https://github.com/OWNER/REPOSITORY PPSA21564 PPSA21567
```

Bracketed IDs are accepted too:

```text
/fork https://github.com/OWNER/REPOSITORY [PPSA21564] [PPSA21567]
```

By default, each URL must link to a repository in the GitHub fork network of `KytyPS5/KytyPS5`. Branch/release links, private repositories, other projects and invalid serials are rejected. The stored URL is the canonical repository URL. IDs normalize to bare uppercase `PPSA12345`; duplicates are removed. Unknown valid IDs can be recorded before the catalog knows them.

### Approve a standalone mirror

If GitHub does not identify a community build as part of that fork network, a collaborator with write, maintain or admin access can explicitly bypass the lineage restriction:

```text
/force https://github.com/OWNER/REPOSITORY PPSA21564 PPSA21567
```

Post this as a **new comment on the management issue**, with the repository URL and its complete game target list. GitHub issue comments do not identify a reply target, so `/force` alone does not select an error or retry an earlier command. Copy the original `/fork` command and replace `/fork` with `/force`.

This bypasses only GitHub fork lineage. The repository must still be public and exist, the URL and game IDs must be valid, and the main KytyPS5 repository itself cannot be listed. The registry records `lineageOverride: true` with the command's date and source comment; `addedBy` retains the listing's original author. Forced listings use the same checked, auto-merging data PR and Pages publication flow as ordinary listings. Use `/force` again when updating a standalone mirror; ordinary `/fork` continues to enforce lineage. `/unfork` removes either kind normally.

### Game targets and removal

An omitted game list means **no game targets**:

```text
/fork https://github.com/OWNER/REPOSITORY
```

That fork appears in the forks directory and on **no game pages**. It never means “all games.” Repeating `/fork` for an existing repository updates its metadata and **replaces** its target list. Consequently, repeating it without IDs clears previous game targets. Repository metadata is refreshed when you repeat the command; it is not live emulator telemetry.

Remove a listing with:

```text
/unfork https://github.com/OWNER/REPOSITORY
```

Use one command per comment, on the first line. To correct a command, post a new comment; editing a previous comment does not replay it. Successfully processed listings remain in the registry if their old comments are later deleted.

The `Manage community forks` workflow rechecks repository write access, validates the fork, and updates `src/data/forks.json` through the `data/community-forks` PR. Like `/compat`, it enables auto-merge so the data PR merges automatically after the required CI checks pass. It never bypasses those checks. If GitHub cannot enable auto-merge, the workflow fails with an error instead of silently requiring a manual merge; correct the repository setting or bot token and rerun the workflow. The existing Pages deployment publishes the merged registry. Bot replies link the data PR or explain validation errors. Queued commands are replayed in order, including changes already waiting in the open data PR, so rapid comments do not replace each other's target lists.

`ACTIONS_BOT_TOKEN` is used when configured, as with the existing catalog/report workflows. It needs repository/workflow access for PR checks and auto-publication. Workflow permissions include contents, pull requests, issues and actions. Do not place tokens in comments, URLs or source files.

After installing the workflow on `main`, set the `FORKS_ISSUE_NUMBER` repository variable to the management issue's number. The initial workflow push and manual workflow dispatch can reconcile existing commands, including commands posted while this feature was awaiting merge.

## Submit patches, cheats, and configs

Community patches, cheats, and configuration presets are maintained in the [KytyPS5-Modules](https://github.com/KytyPS5/KytyPS5-Modules) registry repository. Contributions are submitted via structured GitHub issue templates (Patch, Cheat, Configuration), verified through automated CI validation workflows, and published directly to the live catalog.

## Data and verification

`scripts/export-community.mjs` builds `/data/community.json` using the catalog and fork registry. The main export/build pipeline calls it automatically. The browser refreshes community listings on the normal five-minute data lifetime and can use previously cached JSON offline.

```sh
npm run export:community
npm run test:community
npm run typecheck
```

Report status aggregation, launcher update/compatibility feed schemas and all existing report commands remain unchanged.
