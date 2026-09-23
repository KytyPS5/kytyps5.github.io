---
title: "PAW Patrol: Grand Prix"
titleId: "PPSA05521"
status: "main-menu"
testedVersion: "Source build of KytyPS5-2026-09-20-ba55ba5 (upstream `main`, unmodified)"
testedDate: "2026-09-22"
os: "windows"
hardware: "AMD Ryzen 7 9800X3D 8-Core / AMD Radeon RX 9070 XT, driver 26.8.1 / 32 GB DDR5 RAM / 16 GB VRAM"
---

Boots without patches and reaches the title screen with correct rendering.
- ~60 s after launch a full 3D race-track scene renders with the tip "You can take a look at all the items you earn within the Collection menu!" (looks like a loading-tip scene).
- ~120 s: the "PAW Patrol Grand Prix" key art screen renders correctly at 60 fps.
- Two AvPlayer intro videos start/stop; stderr shows `st: 0 edit list: 1 Missing key frame while searching for timestamp: 0` and `Cannot find an index entry before timestamp: 0.` (cosmetic so far).
- Log warning: "game uses occlusion queries, which are currently treated as always visible; GPU usage may be higher and FPS may be lower."
- With an empty pipeline cache the first minute is slow: the frame counter stalls for a while and drops to single-digit fps during bursts of new shaders (ends at 35 VS / 54 PS / 27 CS / 4 GS compiled by 120 s).
- Working set grows to ~3.6 GB by 90 s and stays flat.

Screenshots of the race-track and title-art scenes exist locally; happy to attach them in a comment if useful (not postable through this tool).

## Steps to reproduce

1. Start KytyPS5 with an empty `_PipelineCache`.
2. `kyty_emulator.exe --game "...\PPSA05521-app0"`.
3. Wait ~2 minutes without giving input.

## Expected behavior

Intro videos, then the main menu. No known issue beyond the cold-start compile stalls.

## Extra notes

Built with clang-cl from source (upstream `main`).

*AI disclosure: I used Claude Code to help run the game and collect the log; I reviewed the results myself.*

> Source: [KytyPS5 issue #777](https://github.com/KytyPS5/KytyPS5/issues/777)
