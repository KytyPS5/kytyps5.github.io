# Report trust

`/trusted` and `/untrusted` retain their existing collaborator authorization and command behavior. The command handler records approval or revocation in the mirror's `## Overrides` section after its `## Source` footer. `/trusted` on an open mirror still requests conversion; `/compat` can still convert reports without granting trust.

Approval applies to a specific upstream repository and issue, not every report for that game and operating system. A newer report from a different issue starts untrusted, even if the previous published report was trusted. Re-converting or refreshing the same approved source retains approval, including its existing automatic update path. An explicit `/untrusted` override takes precedence over previously stored approval.

Only `trusted: true` in report frontmatter can supply existing approval, and its source footer must identify the same upstream issue. An absent, unknown or different source cannot supply approval. Markdown inside upstream answers, including a section named `Overrides`, is never a maintainer trust decision. Existing manually maintained source-less reports are preserved, but do not grant trust to incoming reports.

The poller reconciles inherited `trusted` labels on mirrors as it visits their source issues, preserving explicit approvals and revocations. Closed mirrors receive label corrections without being reopened solely for that correction. The mirrored reports remain available for normal maintainer review. Existing published report files and their content are not rewritten by this fix.

## Report freshness and PR attribution

Each mirror now uses `compat/<game>-<os>-issue-<mirror number>` for its conversion PR. Re-running `/compat` on the same mirror updates its own pending PR. Different mirrors for the same game/OS get separate PRs, preserving each report's body, source link and mirror marker. This prevents the older MAIDEN mirror #955 from overwriting the pending conversion of mirror #978, as happened in PR #984.

Before replacing or retiring any report files, the converter checks every report for the same canonical game and operating system. It refuses an older test date from a different source. For reports tested on the same date in the same upstream repository, the lower issue number is treated as older. A refusal leaves all existing files intact and uses the existing workflow failure handling; it does not silently publish stale data.

Edits to the same source remain convertible, and a newer source can report a lower compatibility status. Reports for other operating systems do not block conversion. The published storage remains one report per game/OS, and trust still requires approval for that specific source. These safeguards do not change `/compat`, `/trusted` or field-override authorization.
