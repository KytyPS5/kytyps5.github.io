---
title: "R-Type Final 3 Evolved"
titleId: "PPSA08394"
status: "doesnt-boot"
testedVersion: "18a1e0f"
testedDate: "2026-09-14"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon 9070 XT / 32 GB DDR5 RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/03e2fffb-e4d8-47d3-a872-90bcc05a5fc9"]
---

Doesn't boot.

--- Guest fault context ---
thread: (host thread)
rax=0000013f6b9b4a80 rbx=0000013f6b9b4a80 rcx=0000000000000000 rdx=0000000000000000
rsi=0000000000000000 rdi=0000000000000038 rbp=00000140558d7a00 rsp=00000140558d7940
r8 =0000013f6b9b4a98 r9 =0000013f6afc0000 r10=0000000000000000 r11=00000140558d7960
r12=0000000000000010 r13=0000000000000000 r14=0000013f63cb5b01 r15=000001405526b2a0
code (pc-48 .. pc+48, fault at byte 48):
 ff 74 13 48 8b cb e8 b9 d9 fb ff 48 8b d0 48 8b
 cf e8 4e fa 1f 00 48 85 db 4c 8d 43 18 48 8b c3
 48 8b 5c 24 50 4c 0f 44 c6 49 8b 48 08 49 8b 10
 48 89 11 48 89 4a 08 49 89 30 49 89 70 08 48 8b
 74 24 58 48 83 c4 40 5f c3 cc cc cc cc cc cc cc
 cc cc cc cc 40 53 55 41 57 48 83 ec 40 40 32 ed
stack:
  000001405526b2a0 000001405526b130 00000140558d7b08 00007ffe9fab7c35
  0000013f6afc9c60 0000013f63cb5b58 00007ffe9cfa0000 0000013f682652a8
  000001405526b138 00007ffe9dff41c9 0000013f6b9b4a80 00000140558d7b08
  0000013f63c81ef0 00000140558d7b08 0000013f68265248 0000013f682652a8
  0000014055ddecf8 0000000000000000 00000140558d0000 fffffffffffff000
  0000014055ddecf8 0000013f6b9b4a98 00000140558d0000 00007ffe9df06c04
  00000140558d7e30 0000000000000000 0000013f68265248 0000013f67f40848
  00000140558d7b30 00007ffe9dff3eb5 0000013f68265248 00007ffe9d151e83
--- Build ---
Official build KytyPS5-2026-09-14-18a1e0f
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x00007ffe9fafab9c access=2 address=0x0000000000000000
 in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:843

## Steps to reproduce

Open Emulator
Boot Game

## Expected behavior

Splash screens would display, then main menu.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #621](https://github.com/KytyPS5/KytyPS5/issues/621)
