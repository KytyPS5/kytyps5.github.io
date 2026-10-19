---
title: "Minecraft Dungeons II"
titleId: "PPSA16064"
status: "main-menu"
testedVersion: "v0.3.0"
testedDate: "2026-10-18"
os: "windows"
hardware: "Intel Core i5-12400F / NVIDIA GeForce RTX 3060 Ti, Driver Version 610.88 / 16 GB DDR4 RAM / 8 GB VRAM"
---

Minecraft Dungeons II (PPSA16064) boots and renders, then crashes right after the main menu appears: the game has switched to the menu, audio starts playing normally and it renders as if it were about to run, and then the process dies. See the attached video for the exact moment.

See the attached video for the exact moment.

--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x0000000903aa3a10 access=1 address=0x0000000000000006
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:715

Reproduced every run with identical pc/access/address values, on different guest threads (Foreground Worker #1, Background Worker #3 and #8) and with --amd-cpu enabled (the log shows "AMD CPU compatibility: eboot.bin patched"). Full run log attached.

## Steps to reproduce

1. Use a folder dump of PPSA16064 containing eboot.bin, sce_module\, sce_sys\ and prx\ in one folder.
2. From the KytyPS5 folder, run: kyty_emulator.exe --game "<path to the folder>" --screen-width 1280 --screen-height 720 --console-language 1 --amd-cpu
3. Wait through the opening videos and shader compilation until the main menu appears. The crash happens at the moment the menu is up and audio starts playing normally.

## Expected behavior

The game should stay up once the main menu is reached and be playable from there. No known issue; there is no compatibility database entry for PPSA16064 yet.

> Source: [KytyPS5 issue #1670](https://github.com/KytyPS5/KytyPS5/issues/1670)
