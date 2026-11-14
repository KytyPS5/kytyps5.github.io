---
title: "CoffeeTalk"
titleId: "PPSA07057"
status: "main-menu"
testedVersion: "KytyPS5-2026-11-12-58ca8d1"
testedDate: "2026-11-13"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game launches, you enter the game, and sometimes the following crash occurs:
```
--- Guest fault context ---
thread: (host thread)
rax=0000000000000001 rbx=0000000000000000 rcx=0000000000000000 rdx=0000000080000022
rsi=0000000000000000 rdi=0000000000000000 rbp=000001004fa4ee80 rsp=000001004fa4ed50
r8 =7ffffffffffffffc r9 =000001007d1348a0 r10=0000000000570000 r11=000001004fa47680
r12=0000000000000000 r13=0000000000000000 r14=0000000000000000 r15=0000000000000000
code (pc-48 .. pc+48, fault at byte 48):
 48 89 48 20 48 8d 15 8f f7 b4 01 48 8b 05 20 5e
 f7 01 31 c9 41 89 c9 b9 02 00 00 00 41 b8 5a 05
 00 00 ff d0 89 c1 b8 01 00 00 00 39 c8 75 01 cc
 0f 0b 48 8b 44 24 30 48 8b 40 10 48 8b 4c 24 40
 48 2b 41 10 48 83 c4 48 c3 cc cc cc cc cc cc cc
 cc cc 48 83 ec 28 48 89 4c 24 20 48 8b 4c 24 20
stack:
  0000000000000002 0000000141dfc668 000001000000055a 0000000000000000
  0000000141dfc3da 0000000141e8b8f3 000001004fa4eec0 000001004fa4eec0
  000001004fa4eea8 00000001402ac76e 0000000000000000 0000000140010729
  ffffffffffffffff 00000001402ac66d 000001004fa4eee8 000001004fa4eec0
  000001004fa4eea8 000001004fa4eed8 000001004fa4eed8 000001004fa4eea8
  000001004fa4eec0 000000014029bc7c 000001004fa4ef10 000001005868aaf0
  000001007d1434e0 000001007c36fd10 000001004fa4ef1f 000001004fa4f418
  000001004fa4f40c 00000001400aae07 000001004fa4f440 00007fff9c032048
--- Build ---
Source build 58ca8d1-dirty
--- Error ---
Unhandled host exception: type=2 code=3221225501 pc=0x00000001402acefe access=0 address=0x0000000000000000
 in D:/Progetti/KytyPS5/src/loader/runtimeLinker.cpp:719
```

## Steps to reproduce

Open the game
Start a new game.

## Expected behavior

Let's hope there are no crashes.

> Source: [KytyPS5 issue #2253](https://github.com/KytyPS5/KytyPS5/issues/2253)
