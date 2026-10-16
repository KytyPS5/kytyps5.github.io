---
title: "Grand Theft Auto: Vice City – The Definitive Edition"
titleId: "PPSA03530"
status: "in-game"
testedVersion: "https://github.com/KytyPS5/KytyPS5/commit/c6b8210d7cdc3e04307081436f48ba3b0d6320ed"
testedDate: "2026-10-16"
os: "linux"
hardware: "Intel Core i5-12400F / NVIDIA GeForce RTX 3050 8GB - 595.104.02 / 16 GB DDR4-3200 RAM - 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/629fefa7-59f8-4a88-84e6-95bec436df11","https://github.com/user-attachments/assets/cef634a6-5fd4-4fba-aa5b-55a40370387b","https://github.com/user-attachments/assets/7ade220a-af1e-4826-8976-a72303e48554","https://github.com/user-attachments/assets/1b66f6e7-2c71-49c6-828c-40d93ddbfca1"]
---

Reaches menu, game can be started/loaded/deleted, settings are reachable, can be set.
Gameplay is **slow**, in performance mode - 15 fps in cutscenes and interiors, and outside only around 6 fps, with major framedrops(or even freezing for almost 20 seconds).
In fidelity mode, fps/3 seems to be the case.

Seems to freak out when menu is triggered from ingame, and crashes trying to load an image?

(failed to create image: extent=7680x4320x1 format=97 layers=1 levels=1
 in /home/wakarimasen/Games/KytyPS5/src/graphics/host_gpu/renderer/image/image.cpp:727)

Other than that, game seems _"playable"_, didn't have any other crashes beside the menu/image one.

## Steps to reproduce

1. Open emulator
2. Start game
3. Get control of Tommy
4. Enter pause menu
5. Exit pause menu -> crash

## Expected behavior

Pause menu should exit, and gameplay should resume normally.

> Source: [KytyPS5 issue #1544](https://github.com/KytyPS5/KytyPS5/issues/1544)
