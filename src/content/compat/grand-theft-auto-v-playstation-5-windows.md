---
title: "Grand Theft Auto V (PlayStation®5)"
titleId: "PPSA01721"
status: "in-game"
testedVersion: "2026-11-20-a1fc5ae"
testedDate: "2026-11-20"
os: "windows"
hardware: "AMD Ryzen 5 5600X 6-Core Processor / NVIDIA GeForce RTX 3060 12 GB / 16 GB RAM / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/60a97b87-dc98-4417-a3d6-4388c7d9e571"]
---

Grand Theft Auto V successfully starts and reaches gameplay.

Performance is generally good after the initial stutter. However, some cinematics cause KytyPS5 to crash.

Crash message:
`depth attachment feedback loop is not supported by the host`

The crash occurs in:
`rendererDraw.cpp:536`

Gameplay works smoothly before the crash, but the issue is reproducible during certain cinematics.

## Steps to reproduce

1. Open KytyPS5 on Windows.
2. Select Grand Theft Auto V (PlayStation 5).
3. Start the game.
4. Wait for the game to load.
5. Reach the main menu.
6. Start a new game or load a save.
7. Play until the issue occurs.
8. Observe the emulator's behavior and any crashes.

## Expected behavior

The game should start correctly, reach the main menu and allow the player to play normally. Gameplay and cinematics should work without emulator crashes.

> Source: [KytyPS5 issue #2464](https://github.com/KytyPS5/KytyPS5/issues/2464)
