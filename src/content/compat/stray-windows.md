---
title: "Stray"
titleId: "PPSA02100"
status: "in-game"
testedVersion: "KytyPS5-2026-08-09-d7063d0"
testedDate: "2026-08-10"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 / 16 GB RAM"
---

The game boots and reaches in-game state (~21 FPS, frame 1766, 590+ shaders compiled), but renders a black screen. Shortly after, it crashes with a memory tracker assertion error:

Error: memory tracker re-entered from upload callback in memoryTracker.h:139

## Steps to reproduce

1. Open KytyPS5.
2. Boot Stray (PPSA02100).
3. Wait through initial shader compilation (~590 shaders) and start a New Game.
4. On the black screen, intuitively move around towards the interactive circles/prompts.
5. Press the triangle button on the prompts to interact with the environment.
6. Observe the crash in memoryTracker.h:139 shortly after interacting.

## Expected behavior

Graphics should render properly without a black screen, and the memory tracker should handle asynchronous texture/buffer uploads safely without re-entrancy crashes.

## Last working build / first broken build

Unknown

## Extra notes

Tested on official build KytyPS5-2026-08-09-d7063d0. App version: 01.002.000.

> Source: [KytyPS5 issue #227](https://github.com/KytyPS5/KytyPS5/issues/227)
