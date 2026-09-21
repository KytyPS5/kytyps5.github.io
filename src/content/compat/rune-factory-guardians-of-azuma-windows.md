---
title: "Rune Factory: Guardians of Azuma"
titleId: "PPSA21165"
status: "logo"
testedVersion: "KytyPS5-2026-09-17-104530e-Windows-x64"
testedDate: "2026-09-17"
os: "windows"
hardware: "Intel I7 14700KF (stock) / NVIDIA RTX4070 / 32gb ram ddr5 / 12gb vram"
screenshots: ["https://github.com/user-attachments/assets/b376ff6b-e54c-4680-b590-b72a0de99d4f","https://github.com/user-attachments/assets/7d14dd96-3e6b-4526-8b6e-4457a9fec6ca"]
---

Now it doesnt show opcode errors anymore but crashes right after the Logo screens shows up.

## Steps to reproduce

Open kytyps5
Boot the game

## Expected behavior

It should pass the Logo screen and get to the game menu.

## Extra notes

--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x00000009039aee83 access=1 address=0x0000000000000740
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:843

> Source: [KytyPS5 issue #686](https://github.com/KytyPS5/KytyPS5/issues/686)
