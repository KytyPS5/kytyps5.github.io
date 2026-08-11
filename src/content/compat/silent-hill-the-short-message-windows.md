---
title: "SILENT HILL: The Short Message"
titleId: "PPSA10112"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-09-d7063d0"
testedDate: "2026-08-10"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 / 16 GB RAM"
---

The game successfully boots and reaches the Main Menu. However, upon selecting "New Game" and confirming the warning/disclaimer screen, the entire PC completely freezes (Hard System Freeze / Hang). 

No error messages or crash logs are created because the whole system stops responding and requires a hard manual reboot.

## Steps to reproduce

1. Open KytyPS5.
2. Boot SILENT HILL: The Short Message (PPSA10112).
3. Navigate through the initial screens to the Main Menu.
4. Select "New Game".
5. Confirm the warning screen prompt.
6. Observe complete system freeze (hard reboot required).

## Expected behavior

The game should proceed to load the intro/gameplay level without triggering a GPU/system driver crash or hard system lockup.

## Last working build / first broken build

Unknown

## Extra notes

Tested on official build KytyPS5-2026-08-09-d7063d0. App version: 01.000.001 (FW 8.20).
Note: Probable GPU driver timeout / Vulkan queue deadlock triggering a hard OS hang.

> Source: [KytyPS5 issue #228](https://github.com/KytyPS5/KytyPS5/issues/228)
