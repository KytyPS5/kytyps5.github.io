---
title: "Red Matter"
titleId: "PPSA16509"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-12-d3d7bd3"
testedDate: "2026-09-13"
os: "windows"
hardware: "AMD Ryzen 7 7700X 8-Core Processor / NVIDIA GeForce RTX 5070 Ti, driver 616.92 / 64 GB DDR5 RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/21741fa8-1e0a-4e2b-bf3a-05d4a3d1709b"]
---

Initialized: Config
Initialized: Log
Initialized: Timer
Initialized: Pthread
Tracy profiler enabled: client 0.14.1, protocol 82, broadcast 3, connect to 127.0.0.1:8086
Initialized: Profiler
Initialized: Network
Initialized: Memory
Initialized: FileSystem
Initialized: Controller
Initialized: Audio
Vulkan pipeline cache: initializing _PipelineCache\PPSA16509.bin
Vulkan pipeline cache: initialized empty
Initialized: Graphics
version = 10
Unresolved import stub called: c812oYs7Vsc[Hmd2_v1][Hmd2_v1.1][Func]
Unresolved import stub called: bIi4YUfSRys[Hmd2_v1][Hmd2_v1.1][Func]
warning: executing wave64 compute shader cs=0x0000002004940000
Shaders: VS 0 | PS 0 | CS 1 | GS 0
Shaders: VS 0 | PS 0 | CS 2 | GS 0
Shaders: VS 0 | PS 0 | CS 3 | GS 0
Shaders: VS 0 | PS 0 | CS 4 | GS 0
Shaders: VS 0 | PS 0 | CS 5 | GS 0
Shaders: VS 0 | PS 0 | CS 6 | GS 0
Shaders: VS 0 | PS 0 | CS 7 | GS 0
Shaders: VS 0 | PS 0 | CS 8 | GS 0
Unresolved import stub called: U-CnbmeyYaA[Hmd2_v1][Hmd2_v1.1][Func]
--- Build ---
Source build 1d28d3a
--- Error ---
Guest abort()
 in KytyPS5\KytyPS5\src\libs\libC.cpp:254

## Steps to reproduce

1. Open Kyty PS5
2. Launch the game

## Expected behavior

Open game with intro and audio

> Source: [KytyPS5 issue #608](https://github.com/KytyPS5/KytyPS5/issues/608)
