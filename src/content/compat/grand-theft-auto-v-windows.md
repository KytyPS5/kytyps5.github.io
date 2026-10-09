---
title: "Grand Theft Auto V"
titleId: "PPSA04264"
status: "in-game"
testedVersion: "KytyPS5-2026-10-06-6ef4065-Windows-x64"
testedDate: "2026-10-06"
os: "windows"
hardware: "Intel Core i5-13600K / Intel Arc B580 / 32 GB DDR4 RAM/ 12 GB GDDR6"
trusted: true
---

The game runs and enters gameplay successfully, with generally good performance after initial shader stutter, but some cutscenes cause Kyty to crash.

Kyty reports:

`Vulkan depth feedback support: false`

Crash:

`depth attachment feedback loop is not supported by the host`

`in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\renderDraw.cpp:536`

- Performance mode allows the game to reach gameplay.
- Gameplay can run smoothly before the crash.
- The crash is reproducible during certain cutscenes.
- The game dump was re-downloaded after an earlier corrupted archive issue, and the current copy successfully boots and reaches gameplay.
- Latest Arc driver is installed
- This appears to be related to depth attachment feedback loop support on Intel Arc B580 rather than general game compatibility.

## Steps to reproduce

1. Launch GTA V in KytyPS5.
2. Set the in-game graphics mode to Performance.
3. Start Story Mode.
4. Play through the North Yankton prologue.
5. Continue until a cutscene triggers the crash.

## Expected behavior

The cutscene should render normally and gameplay should continue.

> Source: [KytyPS5 issue #1123](https://github.com/KytyPS5/KytyPS5/issues/1123)
