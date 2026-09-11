---
title: "Still Wakes the Deep"
titleId: "PPSA07906"
status: "logo"
testedVersion: "679adbf"
testedDate: "2026-09-09"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon 9070 XT / 32 GB DDR5 RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/25c4fa0b-93ea-4d82-8736-e7a567fa306c","https://github.com/user-attachments/assets/7bb5c4af-cb0b-46e3-9c03-3d11215249b1"]
---

Boots to splash screen, then produces missing OPCODE error:

shader CFG build failed: unsupported decoded instruction in CFG at pc 0x000001c8: 0x000001c8: unsupported family=SOP1 opcode=0x40 raw=[0xbeea407e] reason=SOP1 opcode is not implemented in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\frontend\cfg\ShaderCFG.cpp:40

## Steps to reproduce

Open Emulator
Boot Game

## Expected behavior

Game would progress to either a cutscene or main menu.

## Extra notes

Default settings

> Source: [KytyPS5 issue #538](https://github.com/KytyPS5/KytyPS5/issues/538)
