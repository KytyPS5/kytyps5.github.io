---
title: "Grand Theft Auto V"
titleId: "PPSA04264"
status: "in-game"
testedVersion: "KytyPS5-2026-09-25-7e1c2d1"
testedDate: "2026-09-25"
os: "windows"
hardware: "Intel(R) Core(TM) Ultra 7 265K (3.90 GHz) / NVIDIA GeForce RTX 5050, driver Game Ready 616.92 / 32 GB DDR5 RAM, 8GB VRAM"
---

Game boots, letters are missing from the menu and the settings but does not prevent going further into the game. When starting a new save, the games crashes at a specific moment in the Prologue. After killing the guard and crouching, a robber goes to put a bomb and the game crashes.

## Steps to reproduce

1. Open KytyPS5,
2. Edit game configuration,
3. Enable all compatibility options, readback and tesselation support, disable all debug and log options (even VK Validation and shaders).
4. Run the game,
5. Get past the guard killing scene,
6. Crouch near the robber,
7. Game crashes

## Expected behavior

The robber should put the bomb on the door and bomb it, but the game crashes.

> Source: [KytyPS5 issue #829](https://github.com/KytyPS5/KytyPS5/issues/829)
