---
title: "Astro Bot"
titleId: "PPSA21567"
status: "logo"
testedVersion: "[104530e](https://github.com/KytyPS5/KytyPS5/releases/tag/KytyPS5-2026-09-17-104530e)"
testedDate: "2026-09-17"
os: "windows"
hardware: "Intel Core Ultra 5 250KF Plus / RX 9070 XT, AMD Adrenalin 26.8.1 / 32 GB DDR5 RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/7a4aff1a-076e-42af-9c8f-1154edac0fe1"]
---

The game does boot normally with sound but after the logo it freezes and crashes

```
--- Guest fault context ---
thread: SceSndzAudioOutMain
rax=00000000000034b8 rbx=3f80000030000120 rcx=3f80000030000120 rdx=0000000000000000
rsi=3f80000030000000 rdi=0000000000000000 rbp=00000007edfca010 rsp=00000007edfc9fa0
r8 =0000000000000000 r9 =0000000000011040 r10=00000007edfca840 r11=00000010550ecb10
r12=0000000000000000 r13=0000000326a3d410 r14=0000000326a3eb58 r15=0000000000000010
code (pc-48 .. pc+48, fault at byte 48):
 41 48 ff ff ff ff 48 89 41 08 48 89 41 10 89 41
 4c 89 11 c3 cc cc cc cc cc cc cc cc cc 48 89 5c
 24 10 57 48 83 ec 20 48 8b d9 ff 15 5d b4 04 00
 8b 13 8b f8 8b 43 48 0f ba f2 08 83 fa 01 75 21
 3b c7 74 0d 48 8d 4b 10 ff 15 cf b2 04 00 89 7b
 48 ff 43 4c 33 c0 48 8b 5c 24 38 48 83 c4 20 5f
stack:
  43627f4a43fd6b0f c3b86d18440757d2 c3cb26da441ef649 c30f485643ad8f52
  0000000000000000 0000000140b5d989 0000010026242450 0000010031332490
  43a0001f43d8867f 0000000000000000 00000007edfca070 c336d3b643be86a9
  3f80000030000120 0000000140b5f446 fffffffffffffffe 00000007edfca0cc
  0000000326a3eb58 0000000080020016 0000000000000000 0000000326a3d410
  0000000326a3eb58 0000000000000010 00000007edfca0a0 0000000140b5d8b3
  0000010026242570 c3c3bfa4440d9e01 fffffffffffffffe 00000007edfca140
  0000000300a617e0 0000000900000660 0000000000000200 00000007edfca138
```

## Steps to reproduce

1. Add Patch file to _Patches Folder
2. Deactivate Shader Validation and set AMD CPU patch and Windows SysV red zone crash protection to on in settings
3. Boot the Game

[PPSA21567.json](https://github.com/user-attachments/files/32355594/PPSA21567.json)

<img width="761" height="764" alt="Image" src="https://github.com/user-attachments/assets/7a4aff1a-076e-42af-9c8f-1154edac0fe1" />

## Expected behavior

The game should reach the selection menu

> Source: [KytyPS5 issue #687](https://github.com/KytyPS5/KytyPS5/issues/687)
