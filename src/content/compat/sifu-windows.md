---
title: "Sifu"
titleId: "PPSA03001"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-20-fe4f942"
testedDate: "2026-09-20"
os: "windows"
hardware: "Ryzen 7 5800x / RTX 5070ti / 32GB / 16GB VRAM"
---

Sifu starts loading and KytyPS5 successfully initializes graphics, compiles multiple compute, vertex and pixel shaders, and starts/stops several AvPlayer videos.

ATRAC9 audio decoding is also initialized.

After compiling additional shaders, the emulator crashes on RenderThread 1 with an unhandled host exception / access violation.

The final error is:

Unhandled host exception: type=1 code=3221225477 pc=0x00000009050191b5 access=2 address=0x000000207d332400

Reported from:

src/loader/runtimeLinker.cpp:843

At the time of the crash, the shader counters were:

VS 11 | PS 11 | CS 37 | GS 0 | LS 0 | HS 0 | TES 0

## Steps to reproduce

Steps to reproduce the result
Launch KytyPS5.
Boot Sifu (PPSA03001).
Wait for the game to initialize.
Several videos/shaders are processed.
Emulator crashes on RenderThread 1 with an unhandled host exception.

## Expected behavior

The game should continue booting instead of crashing on the render thread.

## Last working build / first broken build

No known working build.

> Source: [KytyPS5 issue #739](https://github.com/KytyPS5/KytyPS5/issues/739)
