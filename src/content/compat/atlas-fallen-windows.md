---
title: "Atlas Fallen"
titleId: "PPSA03388"
status: "doesnt-boot"
testedVersion: "0.3.0 1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
---

Attempted to boot game, but crashes immediately.

Could not initialize PS4 PlayGO (streaming installation) feature - Package does not support PlayGo.
Could not initialize play go library.
--- Guest fault context ---
thread: MainThread
rax=0000000000000000 rbx=00000007efdeed50 rcx=00000000efdeeceb rdx=0000000000000001
rsi=0000000000000000 rdi=0000000905053b98 rbp=00000007efdf2db0 rsp=00000007efdeed00
r8 =7ffffffffffffffc r9 =00000000000105c0 r10=000000000000001a r11=000000000000000a
r12=000001407295fd20 r13=00000002395c3840 r14=0000000906218c18 r15=0000000239502f80
Could not initialize PS4PlatformContext ('Unknown failure - use API functions to access error codes.')
code (pc-48 .. pc+48, fault at byte 48):
 05 76 8c e0 04 48 8b 05 75 8b e0 04 48 2b 05 66
 8b e0 04 48 c1 e8 03 69 f0 cd cc cc cc e8 27 35
 b3 03 48 8b 05 38 2f e1 04 4c 8d 35 e1 db fc 05
 48 8b 48 10 48 39 48 08 48 8d 51 f8 49 0f 44 d6
 48 8b 02 48 85 c0 74 47 48 bb 00 00 00 00 ff ff
 0f 00 0f 1f 80 00 00 00 00 48 21 d8 48 39 d8 74
stack:
  0000000000000000 0000000000000000 0000000000000000 0000000000000000
  0000000000000000 0000000000000000 0000000000000000 0000000000000000
  0000000000000001 0000000000000000 0000000000000000 0000000000000000
  0000000000000001 0000000000000000 0000000000000000 0000000000000000
  0000000000000000 0000000000000000 0000000000000000 0000000000000000
  0000000000000000 0000000000000000 0000000000000000 0000000000000000
  0000000000000000 0000000000000000 0000000000000000 0000000000000000
  0000000000000000 0000000000000000 0000000000000000 0000000000000000
--- Build ---
Official build KytyPS5-2026-11-16-1e87171
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x000000090024b037 access=1 address=0x0000000000000010
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:719

## Steps to reproduce

1. Open Translator
2. Boot Game

## Expected behavior

Game would boot to logo screens, then to cutscene and/or main menu.

## Extra notes

Default Settings.

> Source: [KytyPS5 issue #2328](https://github.com/KytyPS5/KytyPS5/issues/2328)
