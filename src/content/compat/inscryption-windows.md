---
title: "Inscryption"
titleId: "PPSA07023"
status: "doesnt-boot"
testedVersion: "v1.00"
testedDate: "2026-11-07"
os: "windows"
hardware: "AMD Ryzen 7 8840U / AMD Radeon 780M Graphics (512 MB) / 16 GB RAM / 512 MB VRAM"
---

When starting the game the folowing lines appear in the terminal:
Initialized: Config
Initialized: Log
Initialized: Pthread
Initialized: Profiler
Initialized: Network
Initialized: Memory
Initialized: FileSystem
Initialized: Controller
Initialized: Audio
Initialized: Graphics
--- Build ---
Official build KytyPS5-2026-11-07-589bd14
--- Fatal Error ---
Not implemented (!is_shared && !is_next_gen) in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:1676

## Steps to reproduce

1. open kytyPS5 launcher
2. Open Inscryption

## Expected behavior

The game should open

> Source: [KytyPS5 issue #2160](https://github.com/KytyPS5/KytyPS5/issues/2160)
