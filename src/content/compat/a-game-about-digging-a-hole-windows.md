---
title: "A Game About Digging A Hole"
titleId: "PPSA30552"
status: "in-game"
testedVersion: "source build 3acafb3"
testedDate: "2026-11-16"
os: "windows"
hardware: "Intel I5 12400f / AMD Radeon RX 6600 / 16GB DDR4 RAM / 8GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/e23a03fd-757e-4a61-851a-9541cfd0fcff","https://github.com/user-attachments/assets/1e5b7f16-f537-471d-9157-04f50e233436"]
---

During the intro and the opening cutscene, black  128x128 px squares cover the
image in a staggered grid. The menu and gameplay are clean.

What I found with a frame dump:
- The scene and the temporal upscale output (3840x1648) are clean.
- The squares first appear in the output of the motion blur filter, compute shader
  `53836e63250f2ba3`, run as an indirect dispatch over tile lists (24720 groups).
- The tile lists are built by compute shader `2d655c161662f167` (16x16 threads, 15x7 groups),
  which hands out list slots with atomic counters in LDS. Whole 8x8-tile blocks, one quarter of
  a thread group, are missing from the image.
- Moving LDS into a storage buffer for that shader did not change anything.

## Steps to reproduce

1. Open KytyPS5
2. Launch A game about digging a hole
3. Click new game in main menu
4. There issue will be visible in intro

## Expected behavior

The game should normaly works but intro will be fully of black squares

> Source: [KytyPS5 issue #2303](https://github.com/KytyPS5/KytyPS5/issues/2303)
