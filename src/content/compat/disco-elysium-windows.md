---
title: "Disco Elysium"
titleId: "PPSA03329"
status: "doesnt-boot"
testedVersion: "93cce66"
testedDate: "2026-11-26"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game crashes on startup with the following error:
```
[libil2cpp] ERROR: Could not open /app0/Media/Metadata/global-metadata.dat
version = 8
--- Guest fault context ---
thread: MainThread
rax=0000000000000000 rbx=0000000000000004 rcx=0000000910003ea7 rdx=00000000656e6f4e
rsi=00000007efdee290 rdi=00000007efdee1e0 rbp=00000007efdee280 rsp=00000007efdee1a0
r8 =0000000210c00000 r9 =00000000003ef000 r10=00000000005f0000 r11=00007ff80aaf1d44
r12=00000007efdee290 r13=0000000142847398 r14=0000000210816410 r15=00000007efdee1e0
code (pc-48 .. pc+48, fault at byte 48):
 0f 45 f8 eb 02 31 db 4c 89 ff 4c 89 e6 48 89 da
 e8 7b 28 df 00 41 c6 04 1f 00 c5 f8 10 05 3e f8
 df 00 48 89 9d 70 ff ff ff 48 8b 05 70 95 26 01
 8b 88 98 00 00 00 48 c7 85 38 ff ff ff 00 00 00
 00 89 8d 40 ff ff ff c5 f8 11 85 48 ff ff ff 4c
 8b a0 a0 00 00 00 4d 85 e4 0f 84 da 01 00 00 4c
stack:
  000000000000001c 0000000000000100 0000000210c00000 0000000000000080
  000000000000004b 0000000901b84150 000000000000004b 0000000000000000
  00000000656e6f4e 0000000000000010 0000000000000004 0000000900000049
  0000000901a73da8 0000000901b84150 000000000000004b 000000000000004b
  0000000000000010 0000000901b3b270 00000007efdee5e0 0000000900b015a3
  00000002000040a0 0000000000000000 deadbeef00000007 0000000000000004
  00000009017787f3 0000000142847398 0000000210816410 00000007efdee600
  00000007efdee990 000000090090c299 00000000656e6f4e 0000000000000000
--- Build ---
Source build 93cce66-dirty
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x000000090091c820 access=1 address=0x0000000000000098
 in D:\Progetti\KytyPS5\src\loader\runtimeLinker.cpp:702
```

## Steps to reproduce

Open the game

## Expected behavior

May the game reach the logos.

> Source: [KytyPS5 issue #2561](https://github.com/KytyPS5/KytyPS5/issues/2561)
