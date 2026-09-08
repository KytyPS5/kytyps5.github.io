---
title: "Dragon Quest VII Reimagined"
titleId: "PPSA17942"
status: "in-game"
testedVersion: "KytyPS5-2026-09-08-c6f6e30-Windows-x64"
testedDate: "2026-09-08"
os: "windows"
hardware: "Intel I7 14700KF (stock) / NVIDIA RTX 4070 / 32Gb ram ddr5 / 12Gb vram"
screenshots: ["https://github.com/user-attachments/assets/2106728e-6048-403c-a5d8-5406d9a3c9eb"]
---

Work: Now it pass through logo screen and got in game.
Don't work: Graphical glitch turning the screen whitish outside buildings. Crash after 10min in game with error: 
Unhandled host exception: type=1 code=3221225477 pc=0x0000000906392d2e access=2 address=0x0000000000000000
in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:807

## Steps to reproduce

1 Open KytyPS5
2 Run the game

## Expected behavior

Game work without the whitish screen glitch.

## Last working build / first broken build

After 6980e08 the missing shaders were corrected and after #498 the sound works fine too.

## Extra notes

Missing shaders and sound issues were corrected, now i've retested and posted the new results.

> Source: [KytyPS5 issue #412](https://github.com/KytyPS5/KytyPS5/issues/412)
