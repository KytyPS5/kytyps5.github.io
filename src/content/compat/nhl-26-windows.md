---
title: "NHL 26"
titleId: "PPSA26785"
status: "main-menu"
testedVersion: "99044c7"
testedDate: "2026-10-25"
os: "windows"
hardware: "Intel Core i5 11400f / RTX 4060 8GB / 32 GB RAM DDR4"
---

The game reaches the main menu, but starting a match crashes the emulator every time with:

unknown sh reg at 00534: 0x14a
in D:\a\KytyPS5\KytyPS5\src\graphics\guest_gpu\command_processor\pm4Handlers.cpp:1925

Menus render and work. The crash happens when the match (3D gameplay rendering) starts. Not tested on older builds.

## Steps to reproduce

1. Open KytyPS5.
2. Boot NHL 26.
3. Wait for the main menu to load.
4. Start a match (Quick Play / any game mode).
5. The emulator stops with the "unknown sh reg" error.

## Expected behavior

The match should start and gameplay should be rendered and playable.

> Source: [KytyPS5 issue #1901](https://github.com/KytyPS5/KytyPS5/issues/1901)
