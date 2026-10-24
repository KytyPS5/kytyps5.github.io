---
title: "MAIDEN"
titleId: "PPSA01859"
status: "main-menu"
testedVersion: "KytyPS5-2026-10-22-c5016d9-Linux-x86_64"
testedDate: "2026-10-21"
os: "linux"
hardware: "AMD Ryzen 5 2600 / AMD Radeon RX 6700 XT / 16 GiB RAM / 12 GiB VRAM"
---

The game reaches the main menu and crashes after selecting "Start Game" with error: 

"Error: condition (!Allocate(layout, fresh_batch)) is true in /home/runner/work/KytyPS5/KytyPS5/src/graphics/host_gpu/renderer/pipeline/descriptorHeap.cpp:57"

## Steps to reproduce

1. Open KytyPS5
2. Start Game
3. Select "Start Game"

## Expected behavior

Game starts normally.

> Source: [KytyPS5 issue #1784](https://github.com/KytyPS5/KytyPS5/issues/1784)
