---
title: "Astro Bot"
titleId: "PPSA21564"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-16-63fb822-Windows-x64"
testedDate: "2026-09-17"
os: "windows"
hardware: "Intel i5-13400F / NVIDIA GeForce RTX 4070 / 32GB Ram DDR4"
screenshots: ["https://github.com/user-attachments/assets/2d20a94a-9528-41de-bfe0-f43689bab786"]
---

When I launch the Game I got a black screen for about 2 seconds then the game crashes and I get this in the Command prompt: 
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
Vulkan pipeline cache: initializing _PipelineCache\PPSA21564.bin
Vulkan pipeline cache: initialized empty
Initialized: Graphics
Title ID: PPSA21564
version = 13
Shaders: VS 0 | PS 0 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 0 | PS 0 | CS 2 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 0 | PS 1 | CS 2 | GS 0 | LS 0 | HS 0 | TES 0
Shader: emitted zero-position clip guard
Shaders: VS 1 | PS 1 | CS 2 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 6 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 7 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 8 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 9 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 10 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 11 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 12 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 1 | PS 1 | CS 13 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 1 | CS 13 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 1 | CS 14 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 1 | CS 15 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 2 | CS 15 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 3 | PS 2 | CS 15 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-09-16-63fb822
--- Error ---
shader CFG build failed: unsupported decoded instruction in CFG at pc 0x00002190: 0x00002190: unsupported family=MIMG opcode=0xe6 raw=[0xf1989f07 0x00040505 0x4442413d 0x4543403e 0x00004746] reason=MIMG opcode is not implemented in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\frontend\cfg\ShaderCFG.cpp:40

## Steps to reproduce

Boot the Game

## Expected behavior

...

## Last working build / first broken build

Didn't Work at all

> Source: [KytyPS5 issue #657](https://github.com/KytyPS5/KytyPS5/issues/657)
