---
title: "Gran Turismo 7"
titleId: "PPSA01317"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-18-1d2f59d"
testedDate: "2026-09-18"
os: "windows"
hardware: "AMD Ryzen 9 9950X3D / NVIDIA GeForce RTX 5080, driver 616.92 / 32GB DDR5 / 16GB VRAM"
---

Game instantly crashes.

## Steps to reproduce

1. Open KytyPS5.
2. Boot the game.

## Expected behavior

Game should boot

## Extra notes

Initialized: Config
Initialized: Log
Initialized: Timer
Initialized: Pthread
Initialized: Profiler
Initialized: Network
Initialized: Memory
Initialized: FileSystem
Initialized: Controller
Initialized: Audio
Vulkan pipeline cache: initializing _PipelineCache\PPSA01317.bin
Vulkan pipeline cache: initialized empty
Initialized: Graphics
Title ID: PPSA01317
--- Build ---
Official build KytyPS5-2026-09-18-1d2f59d
--- Error ---
elf is not valid: G:/Games/GT7/PPSA01317-app\pdiWheel_0.prx
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:1383

> Source: [KytyPS5 issue #694](https://github.com/KytyPS5/KytyPS5/issues/694)
