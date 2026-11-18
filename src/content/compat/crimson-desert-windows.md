---
title: "Crimson Desert"
titleId: "PPSA25286"
status: "doesnt-boot"
testedVersion: "0.3.0 1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/4721cc00-3243-4571-9ed1-ef9a4028093f"]
---

Attempt to boot game, but crashes with:

Shaders: VS 0 | PS 0 | CS 28 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-11-16-1e87171
--- Error ---
shader resource tracking: hash=0xfc0aa7b2901ca28e stage=compute pc=0x00000074 buffer descriptor is not a valid runtime value; GPU-selected access requires a scalar, raw 8/16-bit, raw DWORD x1/x2/x3/x4, or formatted X load in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:646

## Steps to reproduce

1. Open Translator
2. Boot Game

## Expected behavior

Logos would appear, then onto main menu.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2321](https://github.com/KytyPS5/KytyPS5/issues/2321)
