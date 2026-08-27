---
title: "DRAGON QUEST VII Reimagined"
titleId: "PPSA17942"
status: "logo"
testedVersion: "KytyPS5-2026-08-26-8072718-Windows-x64"
testedDate: "2026-08-26"
os: "windows"
hardware: "I7 14700KF / NVIDIA RTX4070 / 32GB RAM DDR5 / 12GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/cd017cf9-973d-4fd9-b52c-f426601bf6ef","https://github.com/user-attachments/assets/60333e2e-f883-4ef9-bf6e-588819396862"]
---

The game opens and then, on the first loading screen, crashes.

## Steps to reproduce

1 Open kyty
2 Open the game

## Expected behavior

Not crash.

## Last working build / first broken build

Still the same since 7022afa, before this idk.

## Extra notes

--- Error ---
ShaderRecompiler CS failed hash=0x000000201af20000: unsupported decoded instruction in CFG at pc 0x000007fc: 0x000007fc: unsupported family=VOP1 opcode=0x61 raw=[0x7e08c2f9] reason=VOP1 opcode is not implemented
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:211

> Source: [KytyPS5 issue #321](https://github.com/KytyPS5/KytyPS5/issues/321)
