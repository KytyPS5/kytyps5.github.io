---
title: "Monster Hunter Stories 3"
titleId: "PPSA26873"
status: "doesnt-boot"
testedVersion: "v0.3.0, git = 11d834d"
testedDate: "2026-11-14"
os: "linux"
hardware: "AMD Ryzen 7 5800X / NVIDIA GeForce RTX 5070 TI / 64 GB DDR4 RAM / 16 GB VRAM"
---

KytyPS5 successfully recognizes MONSTER HUNTER STORIES 3: TWISTED REFLECTION (PPSA26873) and initializes the required systems, including Vulkan graphics.

The game's executable and libc.prx are loaded, and the emulator begins executing the game's initialization code. However, the game crashes almost immediately with a segmentation fault before reaching the title screen.

The emulator reports:

Unhandled host exception: type=1 code=11
pc=0x0000000000000000
access=3 address=0x0000000000000000
in src/loader/runtimeLinker.cpp:719

The log also contains numerous messages about unresolved PLT imports being patched to fallback stubs.

The crash was reproduced on both Linux and Windows, using game files extracted from both an exFAT image and a PKG package. (Windows crash log was not checked and windows did not test the PKG version)

No in-game graphics or audio are displayed or played before the crash.

## Steps to reproduce

1. Launch KytyPS5.
2. Select MONSTER HUNTER STORIES 3: TWISTED REFLECTION (PPSA26873) from the game list.
3. Start the game using the default GUI launch settings.
4. KytyPS5 initializes Vulkan, recognizes the title ID, and begins loading the executable.
5. The game crashes almost immediately with a null-address access (pc=0x0), before reaching the title screen.

The crash is reproducible on both Linux and Windows.

## Expected behavior

The game should complete its initial startup and display the opening splash screens, logos, or title screen instead of crashing.

The player should be able to proceed to the main menu and start or continue a game.

## Extra notes

Tested 2 game installs on Linux with same crash point. Same game version of 01.000.002 but 2 different firmware Versions of 11.00 and 12.70

> Source: [KytyPS5 issue #2275](https://github.com/KytyPS5/KytyPS5/issues/2275)
