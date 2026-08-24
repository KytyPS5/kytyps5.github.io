---
title: "Castlevania Dominus Collection"
titleId: "PPSA15645"
status: "main-menu"
testedVersion: "Source build b9480fa-dirty (Release)"
testedDate: "2026-08-24"
os: "windows"
hardware: "AMD Ryzen 9 7900X3D (24 threads) / NVIDIA GeForce RTX 4080 / 32 GB RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/c0446b4c-f031-45c6-8c7b-58f76375fa9e","https://github.com/user-attachments/assets/3892bf3b-3edf-4cc4-956a-d93b91a81218"]
---

The collection boots successfully and reaches its game-selection menu at approximately 60 FPS. Menu rendering, audio, and keyboard input work.

Selecting the highlighted game closes Kyty immediately. Windows Application Error records a repeatable execute access violation:

- Exception code: `0xc0000005`
- Fault address/offset: `0x0000000000000000`
- Faulting module: unknown
- Reproduced twice with the same failure

The strict loader log ends during the second dynamic load/relocation of `dra03.prx`. The process terminates before Kyty can flush a crash record to the log. Local minidump inspection confirms `RIP=0`.

## Steps to reproduce

1. Open KytyPS5 Launcher.
2. Boot Castlevania Dominus Collection (PPSA15645, v01.003).
3. Wait for the collection game-selection menu.
4. Press J to select the highlighted game.
5. Kyty closes immediately while loading the selected game.

## Expected behavior

The selected Castlevania game should finish loading and become playable.

## Last working build / first broken build

No known working build

## Extra notes

Game version: 01.003.000
Content ID: JP0101-PPSA15645_00-DOMINUSCOLLECTIO
Default launcher settings. No PSN or official network service was used.
Two Windows crash reports and two local minidumps were produced. The attached ZIP contains the sanitized complete strict log and a crash summary.

> Source: [KytyPS5 issue #307](https://github.com/KytyPS5/KytyPS5/issues/307)
