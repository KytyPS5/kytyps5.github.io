---
title: "CarX Street"
titleId: "PPSA25972"
status: "logo"
testedVersion: "KytyPS5-2026-11-25-3057d08"
testedDate: "2026-11-25"
os: "windows"
hardware: "AMD Ryzen 7 7735hs / NVIDIA GeForce RTX 4060 (Laptop GPU) / 16 GB DDR5 RAM , 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/b39ba98a-47bc-42c9-a81f-85c3645881df"]
---

The game boots and reaches the title screen at 100+ FPS with no obvious graphical issues, but gets stuck on a network error screen (E1135-002) and cannot proceed to the main menu.

Toggling "Enable network connection" and "Emulate PSN (compatibility)" in Global Settings (all combinations) does not bypass the error.

Console log continuously repeats these unresolved Http2 import stubs:
Unresolved import stub called: jrVHsKCXA0g[Http2][Http2][Func]
Unresolved import stub called: N4UfjvWJsMw[Http2][Http2][Func]

## Steps to reproduce

1. Start KytyPS5 and launch CarX Street (PPSA25972, v01.000.029).
2. Wait for the title screen to load.
3. Observe network error E1135-002 appearing immediately.
4. Press X to retry (or toggle Network / Emulate PSN settings and restart) — the same error and Http2 stub messages repeat.

## Expected behavior

The game should handle the Http2 requests properly (or allow proceeding past the title screen without getting stuck on error E1135-002) and load into the main menu / gameplay.

> Source: [KytyPS5 issue #2549](https://github.com/KytyPS5/KytyPS5/issues/2549)
