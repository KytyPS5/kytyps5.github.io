---
title: "Grand Theft Auto V"
titleId: "PPSA04264"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-09-d7063d0"
testedDate: "2026-08-10"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 / 16 GB RAM / 8 GB VRAM"
---

The game successfully reaches the Main Menu. However, upon selecting Story Mode and starting the loading screen, it crashes during shader/image view creation with an unsupported resource error:

Error: unsupported storage color image resource: kind=11 dimension=3 mip=1 read=0 written=1 atomic=0 depth_compare=0 in imageView.h:137

## Steps to reproduce

1. Open KytyPS5.
2. Boot Grand Theft Auto V (PPSA04264).
3. Navigate to the Main Menu.
4. Select "Story Mode".
5. Observe crash during the loading screen in imageView.h:137.

## Expected behavior

The image view subsystem should support 3D storage color image resources (kind=11) to allow the loading screen and gameplay post-processing to initialize properly.

## Last working build / first broken build

Unknown

## Extra notes

Tested on official build KytyPS5-2026-08-09-d7063d0. App version: 01.005.000 (FW 7.20).

> Source: [KytyPS5 issue #229](https://github.com/KytyPS5/KytyPS5/issues/229)
