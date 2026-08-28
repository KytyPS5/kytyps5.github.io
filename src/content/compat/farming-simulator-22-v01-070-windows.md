---
title: "Farming Simulator 22 (v01.070)"
titleId: "PPSA02385"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-27-ade32e7"
testedDate: "2026-08-28"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/ace56baf-6fe4-4357-bc11-c93682644507"]
---

boots to main menu when you select save and location it crashes after loading 25% with the following error. --- Error ---
ShaderRecompiler VS failed hash=0x000000003cb53f7f: unsupported decoded instruction in CFG at pc 0x000001a4: 0x000001a4: unsupported family=VOP2 opcode=0x18 raw=[0x300608f9 0x06010602] reason=VOP2 SDWA source selector is not supported
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162

## Steps to reproduce

open kytyps5
boot game
click play game

## Expected behavior

boots to main menu when you select save and location it crashes after loading 25% with the following error. --- Error ---
ShaderRecompiler VS failed hash=0x000000003cb53f7f: unsupported decoded instruction in CFG at pc 0x000001a4: 0x000001a4: unsupported family=VOP2 opcode=0x18 raw=[0x300608f9 0x06010602] reason=VOP2 SDWA source selector is not supported
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162

> Source: [KytyPS5 issue #339](https://github.com/KytyPS5/KytyPS5/issues/339)
