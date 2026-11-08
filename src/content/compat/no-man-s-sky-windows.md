---
title: "No Man's Sky"
titleId: "PPSA02110"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-11-07-589bd14"
testedDate: "2026-11-07"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game crashes immediately upon startup, before the logo appears.

```

--- Guest fault context ---
thread: MainThread
rax=0000000000000000 rbx=0000000902cb7848 rcx=fffffffffffffff9 rdx=00000000000107c0
rsi=000000000000002e rdi=0000000903effeb8 rbp=00000007efdf2bb0 rsp=00000007efdf2b80
r8 =7ffffffffffffffc r9 =00000000000107c0 r10=000000000000000e r11=000000022ecd0f50
r12=0000000000000000 r13=00000009031ef7a8 r14=000000022ecd2400 r15=0000000000000000
code (pc-48 .. pc+48, fault at byte 48):
 91 b4 00 00 00 8b 40 78 48 8b 0b 89 81 ac 00 00
 00 48 8b 3d ee f2 91 00 ba 01 00 00 00 b9 01 00
 00 00 31 f6 e8 f5 01 00 00 48 89 83 08 02 00 00
 83 78 20 00 75 07 c7 40 20 03 00 00 00 48 8b 3d
 ba f2 91 00 ba 01 00 00 00 b9 01 00 00 00 31 f6
 e8 29 ce d4 fd 48 89 83 d8 01 00 00 48 8d 43 08
stack:
  0000000000000000 0000000902cb7848 0000000000000000 00000009031ef7a8
  0000000000000000 0000000000000000 00000007efdf2e40 00000009004798d2
  0000010000000021 0000010047528598 0000010047528588 000000014006d0bb
  0000010047528588 00000007efdf2cb0 00000007efdf2c98 0000000140625882
  0000010047528588 00000001400663e6 2e676f4c6c6c7546 0000010000747874
  00000100475285e8 00000100475285e0 00000007efdf2cc8 00000001406199bb
  0000000000000000 0000000047528b28 0000010047528b28 ffffffffffffff01
  000033086a216b2d 0000000040616c3c 00000000101a6790 00000100475285e0
--- Build ---
Source build 589bd14-dirty
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x00000009022d7d92 access=1 address=0x0000000000000020
 in D:/Progetti/KytyPS5/src/loader/runtimeLinker.cpp:718
```

## Steps to reproduce

1. Open KytyPS5
2. Start the game

## Expected behavior

Launch the game and get to the main menu without it crashing

> Source: [KytyPS5 issue #2149](https://github.com/KytyPS5/KytyPS5/issues/2149)
