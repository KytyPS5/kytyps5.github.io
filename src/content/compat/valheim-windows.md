---
title: "Valheim"
titleId: "PPSA28824"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-11-12-58ca8d1"
testedDate: "2026-11-12"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game fails to display the logos because it crashes, interrupting the loading process.

## Steps to reproduce

Open the game.

## Expected behavior

That the game wouldn't crash and would load the menu.

**Log:**

```
Shaders: VS 1 | PS 1 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 6 | GS 0 | LS 0 | HS 0 | TES 0
AMD CPU compatibility: trapping insertq (first at 0x90251388e)
--- Build ---
Source build 58ca8d1-dirty
--- Error ---
unsupported or invalid video-out surface attributes
 in D:/Progetti/KytyPS5/src/graphics/presentation/videoOut.cpp:551
```

> Source: [KytyPS5 issue #2242](https://github.com/KytyPS5/KytyPS5/issues/2242)
