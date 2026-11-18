---
title: "Baldur's Gate 3"
titleId: "PPSA18463"
status: "doesnt-boot"
testedVersion: "0.3.0 1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
---

Attempted to boot game, crashed almost immediately with:

Depth target fatal: unsupported depth register state
--- Build ---
Official build KytyPS5-2026-11-16-1e87171
--- Error ---
unsupported render state; details were printed above
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\depthRenderTarget.cpp:39

## Steps to reproduce

1. Open Translator
2. Boot Game.

## Expected behavior

Game splash screens/logos would appear before proceeding to main menu.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2334](https://github.com/KytyPS5/KytyPS5/issues/2334)
