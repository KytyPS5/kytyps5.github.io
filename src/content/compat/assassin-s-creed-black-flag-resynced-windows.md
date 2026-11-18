---
title: "Assassin's Creed: Black Flag Resynced"
titleId: "PPSA28183"
status: "main-menu"
testedVersion: "0.3.0 d45b086"
testedDate: "2026-11-16"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/65937ab4-4f2a-4edd-a0f4-8f7f3bb67058","https://github.com/user-attachments/assets/86aa5db3-52a6-42c8-a3f2-aec3e5fb7de4"]
---

Game boots to the main menu.
Start New Game, then it loads. Crashes before entering the game:

shader info collection failed: packed pixel ancillary input has an unsupported live use in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ShaderInfoCollection.cpp:14

## Steps to reproduce

1. Open translator
2. Boot Game
3. Start a new game.

## Expected behavior

Game would either go in game and/or play cutscene.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2307](https://github.com/KytyPS5/KytyPS5/issues/2307)
