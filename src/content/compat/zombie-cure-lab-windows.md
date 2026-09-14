---
title: "Zombie Cure Lab"
titleId: "PPSA22623"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-12-d3d7bd3"
testedDate: "2026-09-13"
os: "windows"
hardware: "AMD Ryzen 7 7700X 8-Core Processor / NVIDIA GeForce RTX 5070 Ti, driver 616.92 / 64 GB DDR5 RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/1435c822-f494-40cc-acab-88d17052aae4"]
---

Initialized: Config
Initialized: Log
Initialized: Timer
Initialized: Pthread
Initialized: Profiler
Initialized: Network
--- Build ---
Source build 1d28d3a
--- Error ---
could not reserve 13824 MB for guest direct memory. Windows commits
this up front, so the paging file is usually what needs to be larger.
KytyPS5\KytyPS5\src\kernel\memoryAddressSpace.inc:666

## Steps to reproduce

1. Open KytyPS5.
2. Boot the game.
3. If open normally then close it and try to re launch the game.

## Expected behavior

When you launch the game, then the intro cinematic begins. and show main menu.

> Source: [KytyPS5 issue #604](https://github.com/KytyPS5/KytyPS5/issues/604)
