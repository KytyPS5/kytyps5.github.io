---
title: "Trackmania"
titleId: "PPSA02195"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-11-12-58ca8d1"
testedDate: "2026-11-13"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game tries to start. 
But it crashes. 

**Error:**
`unsupported mastering control: 0x30000002 in src/libs/ngs2.cpp:3006`

Trackmania calls a function from libSceNgs2 (probably sceNgs2MasteringRackSetControl or something similar) to configure a mastering rack—that is, the final effects chain of the audio mixer (limiter, compressor, equalizer, etc.). Control parameter 0x30000002 is not among those implemented in the emulator, so the code reaches a default branch that triggers a fatal error.

## Steps to reproduce

Open the game.

## Expected behavior

May the game reach the logos

> Source: [KytyPS5 issue #2252](https://github.com/KytyPS5/KytyPS5/issues/2252)
