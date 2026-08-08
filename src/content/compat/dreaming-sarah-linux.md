---
title: "Dreaming Sarah"
titleId: "PPSA02929"
status: "playable"
testedVersion: "KytyPS5-2026-08-07-7907a50"
testedDate: "2026-08-07"
os: "linux"
screenshot: "screenshots/ps5-03.png"
---

This PR fixes a deadlock spotted on Linux, and fixes crashes that can impact other titles as well. With this PR, an UE4 title "The Pathless" successfully reaches the Main Menu. The Pathless, Dreaming Sarah, Subnautica and Minecraft have been tested — no regressions have been spotted with this PR.

Only tested on Linux. Windows and macOS are untested, though no regressions should appear on either.

![Dreaming Sarah running in KytyPS5](screenshots/ps5-03.png)

> Source: [KytyPS5 PR #146 — Fixes for Linux and UE4 games](https://github.com/KytyPS5/KytyPS5/pull/146)
