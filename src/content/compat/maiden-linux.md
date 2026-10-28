---
title: "MAIDEN"
titleId: "PPSA01859"
status: "main-menu"
testedVersion: "KytyPS5-2026-10-23-9dcff95-Linux-x86_64"
testedDate: "2026-10-23"
os: "linux"
hardware: "AMD Ryzen 5 2600 / AMD Radeon RX 6700 XT, Mesa 26.2.2 / 16 GiB RAM / 12 GiB VRAM"
---

The game reaches the main menu and crashes after selecting "Start Game" with error:

radv/amdgpu: The CS has been cancelled because the context is lost. This context is guilty of a hard recovery.
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=30280 debug_op=2 debug_submit=8445 args=1792,3,0,1,0x0000000000000000

## Steps to reproduce

Open KytyPS5
Start Game
Select "Start Game"

## Expected behavior

Game starts normally.

## Extra notes

This is a follow up to https://github.com/KytyPS5/KytyPS5/issues/1784.

It seems to get further now.

> Source: [KytyPS5 issue #1864](https://github.com/KytyPS5/KytyPS5/issues/1864)
