---
title: "Beyond a Steel Sky"
titleId: "PPSA03979"
status: "in-game"
testedVersion: "0.3.0 1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/5c8f9043-332e-4fb7-baa9-202c5a34aa41","https://github.com/user-attachments/assets/0e2b9ace-a747-4a6c-9c31-cfd35414d360","https://github.com/user-attachments/assets/4ed50d19-12cb-4ba3-b265-0901011f8261"]
---

Game boots to the main menu, goes in game and can be played until entering Union City cutscene, then crashes with:

mesh draw exceeds host workgroup limits: 173400x1
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\renderDraw.cpp:1081

## Steps to reproduce

1. Open Translator
2. Boot Game
3. Start a New Game.

## Expected behavior

Game would continue on after entering city cutscene.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2338](https://github.com/KytyPS5/KytyPS5/issues/2338)
