---
title: "Neptunia ReVerse"
titleId: "PPSA02721"
status: "in-game"
testedVersion: "KytyPS5-2026-09-29-59a1760"
testedDate: "2026-09-29"
os: "windows"
hardware: "AMD Ryzen 7 5800X3D / NVIDIA GeForce RTX 5070, driver 610.88 / 64 GB DDR4 RAM / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/5bb17ad8-c4d3-4480-bbfd-fb93a5c42a4c","https://github.com/user-attachments/assets/2dbfff08-5fdc-4e05-8166-1ea45782f5ae"]
---

Gameplay is now stable without visual issues. Still suffers a consistent crash exiting the character view on the equipment screen caused by a BufferCache download exceeding the 64 MiB staging buffer capacity.

## Steps to reproduce

1. Open the game's pause menu whenever possible, usually after prologue.
2. Enter Equipment.
3. Select a character.
4. Leave the equipment screen after the character model loads.

## Expected behavior

The equipment screen should exit gracefully with no crash.

> Source: [KytyPS5 issue #929](https://github.com/KytyPS5/KytyPS5/issues/929)
