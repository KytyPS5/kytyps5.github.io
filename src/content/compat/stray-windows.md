---
title: "Stray"
titleId: "PPSA02100"
status: "in-game"
testedVersion: "KytyPS5-2026-09-18-5b7d334"
testedDate: "2026-09-18"
os: "windows"
hardware: "AMD Ryzen 7 7700 / NVIDIA GeForce RTX 4070 Ti Super, driver 616.92 (Studio) / 32GB DDR5 RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/08311051-300d-4c20-88ab-eff24eec2459","https://github.com/user-attachments/assets/f73ab0aa-6dda-4d79-8b19-0d8173891038"]
---

The game loads successfully.
The working version of the emulator uses standard textures. They are missing in the current version, appearing as black (which might be affecting the lighting).
Issues with the black screen appearing (from the previous Stray game status) - none.

## Steps to reproduce

1. Open Kyty PS5.
2. Enable AMD CPU patch.
3. Open the game.
4. Adjust the brightness (on first launch).
5. Start a new game.

## Expected behavior

Textures should render correctly as they did in build 1d2f59d, without turning black or breaking the lighting.

## Last working build / first broken build

Last worked in KytyPS5-2026-09-18-1d2f59d, First broke in KytyPS5-2026-09-18-394e638

## Extra notes

The AMD CPU patch has no effect on this issue.

> Source: [KytyPS5 issue #698](https://github.com/KytyPS5/KytyPS5/issues/698)
