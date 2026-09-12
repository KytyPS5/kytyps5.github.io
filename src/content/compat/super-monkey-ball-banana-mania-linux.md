---
title: "Super Monkey Ball Banana Mania"
titleId: "PPSA01669"
status: "in-game"
testedVersion: "KytyPS5-2026-09-10-2e315a3"
testedDate: "2026-09-11"
os: "linux"
hardware: "AMD Ryzen 6900HX / NVIDIA GeForce RTX 3070 Ti Laptop GPU / 32GB DDR5 / 8GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/cd7ed553-6e75-4845-a09e-0327212f9100","https://github.com/user-attachments/assets/908c63fc-2b87-4bc3-a85b-65f813c80de4"]
---

Super Monkey Ball Banana Mania successfully boots, reaches the main menu, and enters controllable gameplay.

No visual or rendering issues were observed during testing. Gameplay appears to function correctly.

Audio is currently completely missing. I have not yet confirmed whether this is a KytyPS5 issue or a host-side audio/configuration issue, so further testing on the host is required before attributing the problem to the emulator.

The game otherwise appears playable.

## Steps to reproduce

- Start KytyPS5 with:
- sudo ./launcher
- Configure the game directory containing the PS5 game dump.
- Select Super Monkey Ball Banana Mania (PPSA01669) from the launcher.
- Start the game.
- Continue through the menus and enter gameplay.
The game consistently reaches playable gameplay, but no audio is produced.

## Expected behavior

The game should boot, reach the main menu, enter gameplay, render correctly, accept input and output game audio.

Keyboard input and a DualSense controller should function normally where supported. Dual sense hasn't been used in this testrun

## Last working build / first broken build

Unknown / not tested on previous builds.

## Extra notes

The game initially runs at approximately 60 FPS. I observed occasional frame-rate dips during gameplay.

I have not yet determined whether these drops originate from KytyPS5 or from host-side power management / GPU performance behavior, so I would not currently consider them a confirmed emulator regression.

Apart from the missing audio and occasional frame-rate drops, I did not encounter any obvious graphical corruption, crashes, or gameplay-blocking issues during testing.

> Source: [KytyPS5 issue #574](https://github.com/KytyPS5/KytyPS5/issues/574)
