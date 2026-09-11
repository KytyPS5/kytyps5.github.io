---
title: "Octopath Traveler II"
titleId: "PPSA09809"
status: "in-game"
testedVersion: "KytyPS5-2026-09-09-679adbf-Windows-x64"
testedDate: "2026-08-26"
os: "windows"
hardware: "Intel I7 14700KF (stock) / NVIDIA RTX4070 / 32GB DDR5 / 12GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/cfc759ec-ffc1-49cc-aa26-63c75c6952ba","https://github.com/user-attachments/assets/1e8fb704-e28e-48cb-9499-6b370b9bffca"]
trusted: true
---

What is working: 
User Interface (HUD); Game Logic; Audio seems normal.
What is NOT working: 
All 3D/2D models, including characters, enemies, and the entire environmental background, are completely missing and replaced by a black screen; The game is struggling at just 20 FPS.

## Steps to reproduce

1 Open kyty
2 Boot the game
3 Choose new game
4 Choose the protagonist
5 Load screen and crash

## Expected behavior

The expected behavior for Octopath Traveler II during this specific encounter is a highly detailed, stylized HD-2D battle scene.

## Last working build / first broken build

With 7012634, the game would launch, but only the HUD appeared; the characters and environment were just a black screen. Now, with 679adbf, the game's world map appears and renders correctly, but the game crashes after selecting a character.

## Extra notes

Unhandled host exception: type=1 code=3221225477 pc=0x0000000905237208 access=1 address=0x0000000000000d6c
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:807

> Source: [KytyPS5 issue #320](https://github.com/KytyPS5/KytyPS5/issues/320)
