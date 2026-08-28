---
title: "Construction Simulator Gold Edition"
titleId: "PPSA04379"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-27-ade32e7"
testedDate: "2026-08-28"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
---

loads to character creator then crashes

## Steps to reproduce

1. start Kytyps5
2. boot the game
3. start a new game

## Expected behavior

loads to character creator then crashes with following error
--- Error ---
ShaderRecompiler PS failed hash=0x00000000aa6b499c: unsupported decoded instruction in CFG at pc 0x000010bc: 0x000010bc: unsupported family=VOP3 opcode=0xe2 raw=[0xd4e2006a 0x0000d47e] reason=VOP3 opcode is not implemented
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162

> Source: [KytyPS5 issue #328](https://github.com/KytyPS5/KytyPS5/issues/328)
