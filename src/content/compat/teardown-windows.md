---
title: "Teardown"
titleId: "PPSA15246"
status: "doesnt-boot"
testedVersion: "v0.3.0"
testedDate: "2026-09-18"
os: "windows"
hardware: "AMD Ryzen 5 5600 / NVIDIA Geforce RTX 5060 / 16 GB DDR4 RAM / 8 GB GDDR7 VRAM"
---

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
Vulkan pipeline cache: initializing _PipelineCache\PPSA15246.bin
Vulkan pipeline cache: initialized empty
Initialized: Graphics
Title ID: PPSA15246
version = 13
Shaders: VS 0 | PS 0 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 0 | PS 0 | CS 2 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 0 | PS 0 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 0 | PS 1 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shader: emitted zero-position clip guard
Shaders: VS 1 | PS 1 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 2 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 2 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 3 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 3 | PS 3 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 3 | PS 3 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 3 | PS 4 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 4 | PS 4 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/splash/logo-animation.png
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/splash/logo-animation.png.tde
Shaders: VS 4 | PS 5 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 5 | PS 5 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/splash/logo-text.png
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/splash/logo-text.png.tde
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/splash/saber_logo.png
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/splash/saber_logo.png.tde
Shaders: VS 5 | PS 6 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 6 | PS 6 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 6 | PS 6 | CS 6 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 6 | PS 6 | CS 7 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-09-18-5b7d334
--- Error ---
storage buffer offset adjustment is unsupported
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:147

## Steps to reproduce

1. boot the game
2. press any key in the last logo
3. the game crash

## Expected behavior

should open the game

> Source: [KytyPS5 issue #707](https://github.com/KytyPS5/KytyPS5/issues/707)
