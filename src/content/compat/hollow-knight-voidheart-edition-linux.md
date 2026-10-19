---
title: "Hollow Knight: Voidheart Edition"
titleId: "PPSA34971"
status: "in-game"
testedVersion: "Linux build from source — commit c2173801"
testedDate: "2026-10-17"
os: "linux"
hardware: "Intel Core i5-10400F @ 2.90 GHz / NVIDIA GeForce RTX 5060 Ti — NVIDIA driver 615.78.08 (KMD) / 46 GiB system RAM / 8 GiB VRAM"
---

Hollow Knight: Voidheart Edition successfully boots and reaches controllable gameplay on Arch Linux.

The game was tested for approximately 10 minutes and appeared stable during this session. No crashes or obvious graphical glitches were observed.
-
The game reaches the main menu and gameplay is functional. The DualSense controller works over USB with a USB-C data cable.

An intermittent audio crackling issue was observed when the DualSense controller was connected during an earlier test. The issue was not reproduced during the latest test, including gameplay with the controller connected. The cause remains unknown.


The game was observed running at approximately 60 FPS on a 60 Hz display. Full-game compatibility has not been verified.

## Steps to reproduce

1. Build KytyPS5 on Linux using commit c2173801.
2. Launch KytyPS5 with the Hollow Knight: Voidheart Edition game directory.
3. Wait for the game to reach the main menu.
4. Start playing and test the controls, graphics and audio.

## Expected behavior

The game should boot successfully and provide playable gameplay with functional controls, graphics and audio.

## Extra notes

Tested on Linux using a 60 Hz display. The audio issue appears associated with connecting the DualSense controller, but its cause has not been confirmed. The test lasted approximately 10 minutes.

> Source: [KytyPS5 issue #1597](https://github.com/KytyPS5/KytyPS5/issues/1597)
