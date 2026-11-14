---
title: "A Game About Digging A Hole"
titleId: "PPSA30552"
status: "in-game"
testedVersion: "KytyPS5-2026-11-12-58ca8d1"
testedDate: "2026-11-13"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/686efafa-2b4b-4bb7-ae4c-8853b5a91911","https://github.com/user-attachments/assets/9ce3b315-a61d-486a-aa32-d407d28edf84"]
---

The game launches and proceeds to the gameplay phase.

Before the actual gameplay begins, the game crashes.

Error log:
```
--- Guest fault context ---
thread: Foreground Worker #1
rax=0000000000000000 rbx=0000000906ebb468 rcx=00000000ffffffde rdx=00000000fffffeff
rsi=00000000fffef0cf rdi=00000000fffeffcf rbp=00000007ef967b00 rsp=00000007ef967ad8
r8 =00000000ffffff00 r9 =00000007ef967ba8 r10=00000016800f6e28 r11=00000007ef967c90
r12=0000000906ebb448 r13=0000000000008001 r14=0000000906ebb2e0 r15=0000000906ebb450
--- Guest fault context ---
thread: Foreground Worker #0
rax=0000000000000000 rbx=0000000906ebb468 rcx=00000000fffffffe rdx=00000000fffffeef
rsi=00000000fffeead9 rdi=00000000fffef1d9 rbp=00000007efaabb00 rsp=00000007efaabad8
r8 =00000000fffffef0 r9 =00000007efaabba8 r10=00000016800f4718 r11=00000007efaabc90
r12=0000000906ebb448 r13=0000000000008001 r14=0000000906ebb2e0 r15=0000000906ebb450
code (pc-48 .. pc+48, fault at byte 48):
 ff 41 c6 42 0b 01 49code (pc-48 .. pc+48, fault at byte 48): 83 3a
 ff 00 0f 41 84 69 fe ff c6 ff 42
 48 8b 0b 45 b0 01 48 49 83 8d 1d 3a 00 36 d1 c7 0f 84 03 4c 8d 35 a7 cf
 c7 03 4c 8d 69 fe ff ff
 48 8b 45 3d 10 b0 48 8d 1d 36 d1 c7 03 4c 8d 35 a7 cf d1 c7 03 4c
 c7 03 4c 8d 8d 25 01 3d 10 d1 d1 c7 c7 03 03 4c
 f0 8d 25 01 48 d1 81 40 c7 40 00 e0 ff ff f0 48 03
 f0 48 81 81 03 00 e0 ff
 ff bb 00 20 00 00 f0 49 81 06 00 e0 ff ff f0 48
 81 80 10 01 00 00 00 20 00 00 49 8b 07 f0 49 40 40 00 e0 ff ff f0 48 81 03 00 e0 ff
 ff bb 00 20 00 0f
 00 f0 49stack:
  00000007ef967c40 0000001580154ac0 000000014241e638 00000016800f6e00
  00000000039511c8 00000007ef967c20 000000090323baff 00000007ef967ba7 81 06 00
  000000108025af00 e0 ff 00000007ef967ba8 ff f0 00000016800f6e28 48 00000007ef967c90
 81 80
  0000001580154ac0 10 01 00000007ef967ba6 00 00 00000016800f6e00 00 00000007ef967ba5 20 00
  00000007ef967ba7 00 49 000000108025af00 8b 00000007ef967ba8 07 f0 00000016800f6e28 49
  00000007ef967c90 0f
 0000001580154ac0stack:
  00000007efaabc40 0000001580154ac0 000000014241e638 00000016800f46f0
  00000000039531c8 00000007efaabc20 000000090323baff 00000007efaabba7
  0000001080256e20 00000007efaabba8 00000016800f4718 00000007efaabc90
  0000001580154ac0 00000007efaabba6 00000016800f46f0 00000007efaabba5
  00000007efaabba7 0000001080256e20 00000007efaabba8 00000016800f4718
  00000007efaabc90 0000001580154ac0 00000007efaabba6 00000016800f46f0
  00000007efaabba5 00000100a259bda0 fffffff0000002f0 00000007ef967ba6 00000016800f6e00 fffffee0fffffee0
  0000000000000300
  00000007ef967ba5 00000100a25d90d0 00000000fffffef0 0000001a80338000 ffffffd0000002e0 fffffef0fffffef0 fffffff0000002f0

  ffffffe0000002f0 00000000ffffff00 0000001a80308000--- Build ---
Source build 58ca8d1-dirty
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x000000090323e347 access=2 address=0x0000000000000040
 in D:/Progetti/KytyPS5/src/loader/runtimeLinker.cpp:719
 ffffffd0000002e0
--- Build ---
Source build 58ca8d1-dirty
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x000000090323e347 access=2 address=0x0000000000000040
 in D:/Progetti/KytyPS5/src/loader/runtimeLinker.cpp:719
```

## Steps to reproduce

Open the game
Start a new game.

## Expected behavior

The game is expected to run properly without crashing.

## Extra notes

The shadows in the game also look very dark, but I don't think it's a mistake.

> Source: [KytyPS5 issue #2249](https://github.com/KytyPS5/KytyPS5/issues/2249)
