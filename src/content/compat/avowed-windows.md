---
title: "Avowed"
titleId: "PPSA26136"
status: "main-menu"
testedVersion: "0.3.0 1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/09195234-873f-444e-8547-794a95c8f4d3","https://github.com/user-attachments/assets/49420f0f-2876-4dfd-8c71-565b0b9d3dc9"]
---

Game boots to the main menu. Start a new game, it reaches a loading screen, then crashes.

vkQueueSubmit failed: ErrorDeviceLost, tick=206415
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:341

## Steps to reproduce

1. Open Translator
2. Boot Game
3. Start New Game

## Expected behavior

Game would proceed past loading screen and go in game.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2333](https://github.com/KytyPS5/KytyPS5/issues/2333)
