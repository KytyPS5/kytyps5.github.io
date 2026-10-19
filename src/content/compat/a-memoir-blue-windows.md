---
title: "A Memoir Blue"
titleId: "PPSA05265"
status: "in-game"
testedVersion: "KytyPS5-2026-10-17-6aa3846"
testedDate: "2026-10-17"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti (12 GB), 617.42 / 32 GB DDR5 RAM / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/356970a4-6e03-44db-ac15-0e4b300b1bf3","https://github.com/user-attachments/assets/972944e4-1119-446a-a990-60e4934da0c5"]
---

The game starts up, and you can interact with it, but it freezes and crashes after about 1 minute of gameplay during certain compilation scenes. Shaders take a long time to load, which can cause the Unreal Engine to crash.

Error:
> Unhandled host exception: type=1 code=3221225477 pc=0x00000009013c77a5 access=1 address=0x0000000000000000
>  in D:/Progetti/KytyPS5/src/loader/runtimeLinker.cpp:715

## Steps to reproduce

1. Open KytyOS5
2. Run the Game
3. Play for 1 minute.

## Expected behavior

Play without interruptions.

## Extra notes

Possible cause: The presence of instructions such as S_SWAPP_B64, which take a long time to execute.

> Source: [KytyPS5 issue #1605](https://github.com/KytyPS5/KytyPS5/issues/1605)
