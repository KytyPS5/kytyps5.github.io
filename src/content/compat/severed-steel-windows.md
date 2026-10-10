---
title: "Severed Steel"
titleId: "PPSA05106"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-10-09-59183db"
testedDate: "2026-10-09"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti (12 GB), Driver 617.42 / 32,0 GB DDR5 RAM / 12 GB VRAM"
---

The game begins loading the first shaders, but shortly thereafter (before any logos or the game menu appear), the following error occurs, causing the game to crash.

Not implemented (source.call.has_value() || options.stage != ShaderType::Compute) in D:/Projects/KytyPS5/src/graphics/shader/recompiler/ShaderRecompiler.cpp:488

## Steps to reproduce

1. Open KytyPS5
2. Start the Game (Whether or not you use the settings to prevent crashes in Windows, or other settings, does not affect the result.)
3. The game crashes and doesn't display any logo or menu.

## Expected behavior

The game should display a logo and load the menu.

## Extra notes

Previously, the game would crash due to the missing opcode family=SOP1 opcode=0x2. This was related to the shader instruction: S_SWAPPC_B64. As of now, the error appears to be different.

> Source: [KytyPS5 issue #1326](https://github.com/KytyPS5/KytyPS5/issues/1326)
