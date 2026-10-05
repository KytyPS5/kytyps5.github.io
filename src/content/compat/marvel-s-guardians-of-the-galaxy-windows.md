---
title: "Marvel's Guardians of the Galaxy"
titleId: "PPSA01748"
status: "logo"
testedVersion: "KytyPS5-2026-10-03-f53e5d2"
testedDate: "2026-10-03"
os: "windows"
hardware: "AMD Ryzen 5 5600X 6-Core / AMD Radeon RX 7600 / 32 GB DDR4 RAM / 8 GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/ea31f609-cb46-4fec-9dcb-e9a1721b251e"]
---

The game boots and displays the initial loading screen, but crashes before reaching the main menu.
During startup, the log repeatedly reports unresolved `PlayGoDialog_v1` imports:
`Unresolved import stub called: Yb60K7BST48[PlayGoDialog_v1][PlayGoDialog_v1.1][Func]`

The crash is reproducible across multiple launches, both with and without existing save data.
The reproducible fatal error is:
`unsupported sampled depth image: resource=1 encoding=0 view=1 class=1 numeric=1 dimension=3 mip_mode=0 read=1 written=0 atomic=0 compare=0 guest_format=22 swizzle=0x204 image_format=130 view_format=100 image_layers=1 descriptor_type=9 base_array=0 depth=0 descriptor_pitch=1920 target_pitch=1920 ...
in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:209`

## Steps to reproduce

1. Open KytyPS5.
2. Launch Marvel’s Guardians of the Galaxy.
3. Wait for the initial loading screen to appear.
4. KytyPS5 crashes before reaching the main menu.

## Expected behavior

The game should progress beyond the loading screen and continue to the main menu without crashing.

## Last working build / first broken build

No known working build. First tested on KytyPS5-2026-10-03-f53e5d2.

## Extra notes

The issue has been reproduced on multiple launches.
The same unsupported sampled depth image error in descriptors.cpp:209 occurs repeatedly.
The main menu is not reached.
The issue occurs both with a fresh save state and with existing save data.

> Source: [KytyPS5 issue #1004](https://github.com/KytyPS5/KytyPS5/issues/1004)
