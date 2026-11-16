---
title: "Ratchet & Clank: Rift Apart"
titleId: "PPSA01474"
status: "logo"
testedVersion: "v0.3.0"
testedDate: "2026-11-15"
os: "windows"
hardware: "Intel Core I7-12700H / NVIDIA GeForce RTX 3060 Mobile / 32GB DDR4 RAM / 6GB VRAM"
---

The game starts up, the developer logos (Insomnia, PS Studios) come up after a static image of the game cover, but crashes after the PS Studio animation ends.

## Steps to reproduce

1. Open KytyPS5
2. Boot game
3. Wait ~10-15 seconds
4. Crash happens

## Expected behavior

The game should probably start loading the main menu after the developer animations end.

## Extra notes

Graphics settings:
-Screen resolution: 1920x1080
-Present mode: Mailbox
-Vblank frequency: 60
-GPU: NVIDIA GeForce RTX 3060 Laptop GPU
-Checkboxes enabled: Cache shaders

General settings (checkboxes ticked in):
-Run in fullscreen
-Show performance panel

Tried different combinations of the Compatibility checkboxes, with the following results:
-When everything is off, game crashes
-When "Windows SysV red zone crash protection (experimental)" is on, game crashes (console output of crashing while this setting is on is the one attached in the log section above)
-When Intel CPU compatibility (experimental)" and "PS5 TSC rate (experimental)" is on, game doesn't crash, but freezes at the same place, with the stats dialogue box on the top right saying "no frame for x seconds". I waited around 2 minutes, and nothing changed. Console is empty in the meantime.

> Source: [KytyPS5 issue #2286](https://github.com/KytyPS5/KytyPS5/issues/2286)
