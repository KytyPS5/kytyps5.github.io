---
title: "Ghostwire: Tokyo"
titleId: "PPSA01337"
status: "main-menu"
testedVersion: "KytyPS5-2026-09-12-d3d7bd3-Linux"
testedDate: "2026-09-12"
os: "linux"
hardware: "AMD Ryzen 9 6900HX / NVIDIA GeForce RTX 3070 Ti Laptop GPU / 32 GB DDR5 / 8GB Vram"
screenshots: ["https://github.com/user-attachments/assets/bfdcbdcf-8ebe-4a6e-884a-df1eeb0e010c","https://github.com/user-attachments/assets/52c5baea-bf1b-44d1-bb27-e199ecef125d","https://github.com/user-attachments/assets/f6344d9c-79ab-49f7-a922-a71602ae8201"]
---

The game boots successfully and reaches the main menu and settings.
Menu rendering appears correct, with no obvious visual corruption observed during testing.
Attempting to start the game causes a crash during loading, before controllable gameplay is reached.

## Steps to reproduce

1. sudo ./launcher
2. boot the game
3. start the game
4. During the loading sequence, performance degrades significantly, with the loading animation showing severe FPS drops.
5. The game either remains in this extremely slow loading state for an unusually long time or the KytyPS5 process crashes entirely.

## Expected behavior

Loading should complete and the game should proceed into controllable gameplay instead of crashing.

> Source: [KytyPS5 issue #587](https://github.com/KytyPS5/KytyPS5/issues/587)
