---
title: "Madden NFL 26"
titleId: "PPSA26127"
status: "logo"
testedVersion: "KYTYPS5 VERSION KytyPS5-2026-10-22-f5f4e7d (official Linux build)"
testedDate: "2026-10-22"
os: "linux"
hardware: "Intel Core i7-6700 @ 3.40 GHz / ntel Core i7-6700 @ 3.40 GHz / 32gb DDr4 /12gb vram"
---

The game boots, compiles ~129 shaders (VS 14 | PS 18 | CS 97) and shows its startup screen, then freezes there indefinitely (tested 10+ minutes).

While frozen the emulator is not crashed: it keeps using ~1.5 CPU cores and ~25–50% GPU, and the "HalPs5 submit" thread stays active, but the image never changes and game file reads drop to zero. No error is printed and no "Press any key" appears.

The last notable lines before the hang are, in order:

!!! TEMPORARY COMPUTE DISPATCH SKIP !!! shader=0xb6b57a0d673b3255 pc=0x000004e8 reason=unsupported GPU-selected callable target; rendering is incomplete
Unresolved import stub called: eDXKe9FndlE[NpEntitlementAccessPft_v1][NpEntitlementAccess_v1.1][Func]

followed only by repeated "Unresolved import stub called: ZzzC3ZGVAkc[libkernel_module_info_v1]" lines. My guess is that the game is waiting on the output of the skipped dispatch, or on the entitlement call, but I can't tell which.

## Steps to reproduce

Open KytyPS5 (kyty_launcher).
Boot Madden NFL 26 (PPSA26127) with default settings.
Wait for the startup screen – it appears and never advances.

## Expected behavior

The startup screen should advance to the EA/Madden intro and then the main menu.

## Last working build / first broken build

Never fully worked. Builds 2026-10-07-c86c8b4 through 2026-10-18-099de8d exited during boot with "scalar resource reads overlap a shader buffer write" (descriptors.cpp). 2026-10-20-7b7f9a7 was the first build to get past that and reach the startup screen; the hang described here is the same on 2026-10-20-7b7f9a7 and 2026-10-22-f5f4e7d.

## Extra notes

Game files are a complete local copy on an ext4 drive. Vulkan/shader validation disabled. Happy to test any build or PR that targets GPU-selected callable shaders or NpEntitlementAccess.

> Source: [KytyPS5 issue #1834](https://github.com/KytyPS5/KytyPS5/issues/1834)
