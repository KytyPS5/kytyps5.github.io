---
title: "TopSpin 2K25"
titleId: "PPSA06899"
status: "logo"
testedVersion: "7b7f9a7"
testedDate: "2026-10-20"
os: "windows"
hardware: "AMD Ryzen AI Max 395 / AMD Radeon 8060s / 128GB"
---

Game crashes with topspin start logo right when entering the main menu:

Vulkan pipeline cache: initializing _PipelineCache\PPSA06899.bin
Vulkan pipeline cache: initialized empty
Initialized: Graphics
Title ID: PPSA06899
version = 13
Shaders: VS 0 | PS 0 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
Shader: emitted zero-position clip guard
Shaders: VS 1 | PS 0 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
AJM codec=1, name=ATRAC9 decoder
Shaders: VS 1 | PS 1 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 1 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 2 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 2 | CS 2 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 2 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 2 | PS 3 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 3 | PS 3 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 3 | PS 4 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 4 | PS 4 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 4 | PS 5 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 5 | PS 5 | CS 3 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 5 | PS 5 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 5 | PS 6 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 6 | PS 6 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 6 | PS 7 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 7 | PS 7 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 7 | PS 8 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 8 | PS 8 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 8 | PS 9 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 9 | PS 9 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 9 | PS 10 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 10 | PS 10 | CS 4 | GS 0 | LS 0 | HS 0 | TES 0
Unresolved import stub called: rMyh97BU5pY[Net_v1][Net_v1.1][Func]
Unresolved import stub called: -PoIzr3PEk0[Ssl_v1][Ssl_v2.1][Func]
Unresolved import stub called: 16sMmVuOvgU[Http_v1][Http_v1.1][Func]
Shaders: VS 10 | PS 10 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 10 | PS 11 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Shaders: VS 11 | PS 11 | CS 5 | GS 0 | LS 0 | HS 0 | TES 0
Depth target fatal: unsupported depth register state
--- Build ---
Official build KytyPS5-2026-10-20-7b7f9a7
--- Error ---
unsupported render state; details were printed above
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\depthRenderTarget.cpp:39

## Steps to reproduce

Simply start the game from Kyty main menu. Default settings.

## Expected behavior

Game should arrive to start menu

> Source: [KytyPS5 issue #1778](https://github.com/KytyPS5/KytyPS5/issues/1778)
