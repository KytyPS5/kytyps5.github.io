---
title: "Alan Wake Remastered"
titleId: "PPSA01924"
status: "main-menu"
testedVersion: "0.3.0 893b035"
testedDate: "2026-11-01"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/f427900a-4fe7-459e-b42f-4b228964e9fc","https://github.com/user-attachments/assets/cdd180b6-a8a6-4015-aaa8-46939819eb6d","https://github.com/user-attachments/assets/555ab193-6391-4081-ab3b-3a89c7b6879f"]
---

Game boots to the main menu. Start a new game and the cutscene plays. When it finishes the game crashes with:

unsupported render-target mip range: current=1 levels=1
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\colorRenderTarget.cpp:91

## Steps to reproduce

Open translator
Boot Game
Start New Game

## Expected behavior

Cutscene would end and the game begins for the player.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2051](https://github.com/KytyPS5/KytyPS5/issues/2051)
