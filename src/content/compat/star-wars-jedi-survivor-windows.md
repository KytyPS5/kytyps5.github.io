---
title: "Star Wars Jedi Survivor"
titleId: "PPSA07783"
status: "logo"
testedVersion: "0.3.0 893b035"
testedDate: "2026-11-01"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/2b9ba77c-30be-4a73-8e52-885ae11d9370","https://github.com/user-attachments/assets/2a432089-6359-4fae-9cec-4635922ee2c9"]
---

Game Boots to the game logo screens, then crashes when trying to render the main menu.

shader CFG build failed: unsupported decoded instruction in CFG at pc 0x000000e8: 0x000000e8: unsupported family=VOP2 opcode=0x12 raw=[0x241620f9 0x06861480] reason=VOP2 SDWA destination selector is not supported in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\frontend\cfg\ShaderCFG.cpp:42

## Steps to reproduce

Open Translator
Boot Game.

## Expected behavior

Main Menu would render.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2056](https://github.com/KytyPS5/KytyPS5/issues/2056)
