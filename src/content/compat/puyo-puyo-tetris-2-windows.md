---
title: "Puyo Puyo Tetris 2"
titleId: "PPSA01530"
status: "doesnt-boot"
testedVersion: "091e6b3"
testedDate: "2026-08-09"
os: "windows"
hardware: "I7 12700k / 4070 Super current drivers / 32gb ddr5 6400"
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
Initialized: Graphics
Initialized: Audio
version = 7
Num compiled 1 shaders
Num compiled 2 shaders
Num compiled 3 shaders
Num compiled 4 shaders
Num compiled 5 shaders
Num compiled 6 shaders
Num compiled 7 shaders
Num compiled 8 shaders
Num compiled 9 shaders
--- Build ---
Official build KytyPS5-2026-08-09-091e6b3
--- Stack Trace ---
[0] 00000001407995ba
[1] 000000014079a59f
[2] 00000001407a9818
[3] 0000000140737450
[4] 000000014071192c
[5] 000000014073521e
[6] 00000001407346fd
[7] 0000000140733339
[8] 000000014073ae1c
[9] 00007ffd6f821bb2
[10] 00007ffd6f947374
[11] 00007ffd7193cc91
--- Error ---
unsupported sampled depth target: resource=0 descriptor=1 encoding=1 format=0 kind=9 dimension=3 mip_mode=0 read=1 written=0 atomic=0 compare=0 guest_format=20 swizzle=0x924 image_format=126 view_format=98 image_layers=1 descriptor_type=9 base_array=0 depth=0 descriptor_pitch=128 target_pitch=128 addr=0x0000000213860000 size=0x0000000000010000 dwords=02138600,c1400000,000fc00f,91800924,00000000,00700000,00000000,00000000
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:342

## Steps to reproduce

Launcher
Double click game
Attempts to boot
Fails

## Expected behavior

Launcher
Double Click Game
Boots to game

## Last working build / first broken build

Has not worked on any version.

## Extra notes

Has not worked under any version to date.

> Source: [KytyPS5 issue #223](https://github.com/KytyPS5/KytyPS5/issues/223)
