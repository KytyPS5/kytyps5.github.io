---
title: "Trails in the sky: First Chapter"
titleId: "PPSA28465"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-24-0b3302a-Windows-x64"
testedDate: "2026-08-24"
os: "windows"
hardware: "Intel I7 14700KF (stock) / NVIDIA RTX4070 / 32GB DDR5 / 12GB VRAM"
---

It runs almost perfect 'till the main menu, no audio at all.
--- Error ---
ShaderRecompiler PS failed hash=0x0000000034348712: shader resource tracking: hash=0x0000000034348712 stage=pixel pc=0x000001e4 GetBufferResource dword 0 contains a  control-dependent phi
in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:248

## Steps to reproduce

1 open kyty
2 boot the game

## Expected behavior

It should have áudio ^^

## Last working build / first broken build

Since 7022afa in the same state.

## Extra notes

--- Error ---
ShaderRecompiler PS failed hash=0x0000000034348712: shader resource tracking: hash=0x0000000034348712 stage=pixel pc=0x000001e4 GetBufferResource dword 0 contains a  control-dependent phi
in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:248

> Source: [KytyPS5 issue #314](https://github.com/KytyPS5/KytyPS5/issues/314)
