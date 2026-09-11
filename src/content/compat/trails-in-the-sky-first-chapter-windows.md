---
title: "Trails in the sky: First Chapter"
titleId: "PPSA28465"
status: "in-game"
testedVersion: "KytyPS5-2026-09-09-679adbf-Windows-x64"
testedDate: "2026-08-24"
os: "windows"
hardware: "Intel I7 14700KF (stock) / NVIDIA RTX4070 / 32GB DDR5 / 12GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/0ee475e8-b8f1-46ea-b7dd-e53a8d05ad83","https://github.com/user-attachments/assets/7ddebcfe-ab3b-4290-abfb-3c306180a382"]
trusted: true
---

No audio but now it gets past the main menu and enters the game, sometimes crashes right after the first cutscene and sometimes go in game with very low fps (~3fps), if you enter in the game menu it jumps to 60 fps.
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\masterSemaphore.cpp:53

## Steps to reproduce

1 open kyty
2 boot the game
3 Choose new game
4 Press start while in the first cutscene and choose "skip all cutscenes"

> Source: [KytyPS5 issue #314](https://github.com/KytyPS5/KytyPS5/issues/314)
