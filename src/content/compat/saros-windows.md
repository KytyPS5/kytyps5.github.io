---
title: "Saros"
titleId: "PPSA07631"
status: "main-menu"
testedVersion: "Official build KytyPS5-2026-10-04-719e025"
testedDate: "2026-10-04"
os: "windows"
hardware: "Intel Core 14600KF / RX 9070 OC / 32 GB DDR5 RAM / 16 GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/b536d1e4-cead-49cd-84e5-9c92ccdc9b1a"]
trusted: true
---

Successfully started with logo with initial config for subtitles, but after confirmation it crashes.

Shaders: VS 2 | PS 5 | CS 42 | GS 0 | LS 0 | HS 0 | TES 0
Unresolved import stub called: nNlUtdDDvZ0[Agc_v1][Agc_v1.1][Func]
Unresolved import stub called: nNlUtdDDvZ0[Agc_v1][Agc_v1.1][Func]
Shaders: VS 2 | PS 5 | CS 43 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-10-04-719e025
--- Error ---
shader resource tracking: hash=0xb9da5e64f4c5b10a stage=compute pc=0x00000084 buffer descriptor is not a valid runtime value; GPU-selected access requires a scalar, raw DWORD x1/x2/x3/x4, or formatted X load in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:444

## Steps to reproduce

1. Launch Saros.
2. Allow the startup logos to complete.
3. Confirm subtitles options.
4. Confirm cycle saves info.
5. Game Crashes.

## Expected behavior

It should continue configurations to a gameplay settings menu.

> Source: [KytyPS5 issue #1053](https://github.com/KytyPS5/KytyPS5/issues/1053)
