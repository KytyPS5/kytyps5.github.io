---
title: "Treasures of the Aegean"
titleId: "PPSA04906"
status: "in-game"
testedVersion: "KytyPS5-2026-10-17-763d3be"
testedDate: "2026-10-17"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti (12 GB), 617.42 / 32 GB DDR5 RAM / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/5d07c558-feb9-4e66-890f-7c0731153e06","https://github.com/user-attachments/assets/b44d7505-5ce3-42c2-87ae-526ad9a6578d","https://github.com/user-attachments/assets/c6d73447-5f04-4511-9e44-436437fcc2aa"]
---

At one point, it got stuck in an infinite loading loop (without any errors appearing in the terminal, etc.).

However, in the performance panel, I noticed a Page Table Overflow, specifically: CPU 3803 / 2048, GPU 3536 / 2048.

## Steps to reproduce

1. Open KytyOS5
2. Run the Game
3. Play 1, and complite the first level.

## Expected behavior

The game causes a page table overflow and uses 3803 / 2048 CPU and 3536 / 2048 GPU, exceeding the arbitrarily set maximum limit of 2 MB. Possible solution: Set the maximum to 4096 or 8192 instead of 2048.

> Source: [KytyPS5 issue #1615](https://github.com/KytyPS5/KytyPS5/issues/1615)
