---
title: "Resonsnce: A Plague Tale Legacy"
titleId: "PPSA30601"
status: "logo"
testedVersion: "0.0.3 b7012cf"
testedDate: "2026-11-18"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/31ed87c2-3486-4a05-8a41-ee26747972bf"]
---

Game boots to the logo, then crashes with:

Shaders: VS 22 | PS 26 | CS 71 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-11-18-b7012cf
--- Error ---
unsupported texture mip view changes physical layout: base=8 last=8 max=7 extent=512x512x1 tile=5
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:606

## Steps to reproduce

1. Open Translator
2. Boot Game.

## Expected behavior

Game would progress to cutscene and/or main menu.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2374](https://github.com/KytyPS5/KytyPS5/issues/2374)
