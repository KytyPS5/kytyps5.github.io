---
title: "Sifu"
titleId: "PPSA05132"
status: "main-menu"
testedVersion: "KytyPS5-2026-11-02-02b17af"
testedDate: "2026-11-02"
os: "windows"
hardware: "AMD Ryzen 7 5800X / AMD Radeon RX 9070 XT / 16 GB DDR4 RAM / 16 GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/cf7afa62-9c4b-4e1c-a14b-ff79d1995b6f","https://github.com/user-attachments/assets/8148456d-89dd-4016-aadf-e586867afda3","https://github.com/user-attachments/assets/38e22e5e-4129-44f8-b6d6-c2e70a291819","https://github.com/user-attachments/assets/5562b4e8-9b7c-467d-ac20-32a19e5d0aee","https://github.com/user-attachments/assets/0d7228b7-257b-49f7-8042-71257de3be0a"]
---

Sifu boots successfully and progresses through the initial logos, audio configuration, display configuration, and difficulty selection screens before reaching the main menu.

Working:

Game launches.
Initial logos play.
Audio playback works.
Audio and display settings are accessible.
Difficulty selection.
Main menu loads, including NEW GAME, CREDITS, and OPTIONS.

Issues:
Selecting NEW GAME causes the emulator to crash before playable gameplay begins.

Severe graphical overexposure is visible in the background during the difficulty selection and main menu screens. Large portions of the image appear almost completely white, obscuring scene details.

The emulator reports an unhandled access violation on RenderThread 1.

## Steps to reproduce

Launch KytyPS5 build KytyPS5-2026-11-02-02b17af.
Enable Windows SysV red-zone crash protection.
Boot Sifu (PPSA05132, version 01.024.000).
Wait for the startup logos and videos to finish.
Complete the audio and display configuration screens.
Select a difficulty.
Observe the main menu and its heavily overexposed background.
Select NEW GAME.
The emulator crashes before gameplay begins.

## Expected behavior

The game should render the startup and menu backgrounds correctly, without severe overexposure or missing visual detail.

Selecting NEW GAME should load the opening gameplay sequence and allow the player to begin playing without the emulator crashing.

## Extra notes

With Windows SysV red-zone crash protection enabled, the game reaches the main menu.

With the protection disabled in an earlier test, the game crashed after the initial logos, before reaching the main menu.

> Source: [KytyPS5 issue #2073](https://github.com/KytyPS5/KytyPS5/issues/2073)
