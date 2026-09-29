---
title: "Demon's Souls"
titleId: "PPSA01342"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-28-539c0f7"
testedDate: "2026-09-29"
os: "windows"
hardware: "i9 12900 / RADEON RX 9070 XT 16GB / 16GB"
---

Game is not starting:
Shaders: VS 2 | PS 8 | CS 117 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 8 | CS 118 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-09-28-539c0f7
--- Error ---
depth attachment feedback loop is not supported by the host
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\renderDraw.cpp:532

## Steps to reproduce

1. Open KytyPS5
2. Start the game
3.

## Expected behavior

Game should start.

> Source: [KytyPS5 issue #904](https://github.com/KytyPS5/KytyPS5/issues/904)
