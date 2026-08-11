---
title: "Stray"
titleId: "PPSA02100"
status: "main-menu"
testedVersion: "v0.2.2 (source build 091e6b3-dirty)"
testedDate: "2026-08-09"
os: "windows"
hardware: "AMD Ryzen 5 5500 / NVIDIA GeForce RTX 5060 Ti / 24GB RAM DDR4 - 16GB VRAM"
---

The game reaches the main menu but has a green background almost everywhere. Crashes when going in game with :
```
--- Stack Trace ---
[0] 00000001404a3a09
[1] 000000014046cbbe
[2] 00000001404a800f
[3] 00007ffa67026896
[4] 00007ffa67025c66
[5] 00007ffa671440de
[6] 0000000904a4fdcc
--- Error ---
Access violation: Write [0000002102052c00]
 in C:\<path-to-source>\src\loader\runtimeLinker.cpp:1031
```

## Steps to reproduce

1. Open KytyPS5
2. Open the game
3. Wait for the main menu
4. Select Start Game
5. Select a save

## Expected behavior

The game should create the save and get into the game

> Source: [KytyPS5 issue #222](https://github.com/KytyPS5/KytyPS5/issues/222)
