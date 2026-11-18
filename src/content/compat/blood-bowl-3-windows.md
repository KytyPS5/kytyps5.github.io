---
title: "Blood Bowl 3"
titleId: "PPSA08555"
status: "main-menu"
testedVersion: "0.3.0 1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/64433e17-30f3-450e-ba05-7d263e9644fd","https://github.com/user-attachments/assets/3c38b2a8-9cfa-42cd-9ec0-a3b73ee13bb6"]
---

Game boots to the main menu. Cutscene plays, then choose new game and campaign then crashes with:

Shaders: VS 39 | PS 65 | CS 41 | GS 3 | LS 0 | HS 0 | TES 0
--- Guest fault context ---
thread: MainThread
rax=0000001440dfdf88 rbx=00000007efdf0908 rcx=0000001440dfdf80 rdx=00000007efdf0820
rsi=00000007efdf0908 rdi=00004e0000119e4c rbp=00000007efdf0810 rsp=00000007efdf07b0
r8 =0000000909567718 r9 =0000000000000000 r10=0000001280ebaff0 r11=0000000000000009
r12=0000000141984808 r13=0000000000000002 r14=00000012c0e02800 r15=00000007efdf0820
code (pc-48 .. pc+48, fault at byte 48):
 83 ec 40 4c 8b 25 aa be 1f 07 49 89 fe 48 89 f3
 49 8b 04 24 48 89 45 d8 48 8b 46 20 48 8b 38 48
 83 c0 08 48 89 46 20 48 89 7e 30 48 85 ff 74 41
 48 63 47 4c 48 03 43 28 48 89 43 38 48 85 d2 0f
 84 dd 00 00 00 48 8b 0f 48 8b 89 d8 00 00 00 49
 8b 34 24 48 3b 75 d8 0f 85 dc 00 00 00 48 89 d6
stack:
  00000007efdf07e0 0000000901e4c7e6 00000007efdf0908 0000000909564960
  0000000141984808 00000007efdf0820 00000007efdf0810 deadbeef00000007
  00000007efdf0908 0000000909564960 0000000000000000 00000007efdf0820
  00000007efdf0890 0000000901ecca39 deadbeef00000007 0000000000000000
  00000000ffffff80 0000001180f2c260 0000000000000000 0000000000000080
  00000007efdf0860 0000000901a530f3 deadbeef00000007 00000007efdf0908
  00000012c0e02800 0000000000000000 0000000000000000 0000001140e0e7e0
  00000007efdf08d0 0000000901d61a9c 000000000000ffff 00000007efdf09f4
--- Build ---
Official build KytyPS5-2026-11-16-1e87171
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x0000000901ecdfec access=1 address=0x00004e0000119e98
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:719

## Steps to reproduce

1. Open Translator
2. Boot Game
3. Start New Game

## Expected behavior

Game could go in game after choosing campaign.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2346](https://github.com/KytyPS5/KytyPS5/issues/2346)
