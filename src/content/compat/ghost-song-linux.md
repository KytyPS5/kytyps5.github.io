---
title: "Ghost Song"
titleId: "PPSA09232"
status: "in-game"
testedVersion: "KytyPS5-2026-09-24-2aaf0c9 (source build, commit 2aaf0c9)"
testedDate: "2026-09-24"
os: "linux"
hardware: "Intel Core i5-13420H / NVIDIA GeForce RTX 5050 Laptop (Blackwell), driver 615.71.09, Vulkan 1.4.351 / 32 GB RAM / 8 GB VRAM"
---

Boot/render: reaches controllable gameplay (In game). Menus work. The problem is audio.

- In gameplay: audio is constant distorted/garbled noise (corrupted-sample static) instead of music and sound effects.
- In menus: sounds play correctly, navigation/UI audio is clean.

Log observations (full session log attached as _kyty.zip, 109 MB uncompressed):
- Unity + FMOD title.
- SDL audio streams open normally: 48000 Hz, 2 channels (F32 x2 + S16).
- FMOD initialises cleanly; zero fatal errors in the entire session.
- Exactly one stubbed audio-related import out of 166 total stubs (the rest are PSN/Net/Agc): unresolved PLT import patched to stub [372] [0000000901a62ec0] <- 0000000200000af5, wVwPU50pS1c[AudioOut_v1][AudioOut_v1.1][Func]
- Because menu audio is correct but gameplay audio is corrupted, the failure is likely in the FMOD/game-mix path rather than the host audio backend, but the stubbed AudioOut_v1 import may be worth checking too.

First test on this setup, so no older-build comparison yet.

## Steps to reproduce

1. Build KytyPS5 from source (clang + lld, Release) and set printf_direction=File in the launcher settings.
2. Add Ghost Song (PPSA09232) and start it from the launcher.
3. Play through the title screen into controllable gameplay (keyboard: WASD to move).
4. Listen during gameplay: audio is distorted garbage noise.
5. Open a menu: menu sounds are clean and correct.

## Expected behavior

Music and sound effects during gameplay should play cleanly, matching the already-correct menu audio. No distortion.

## Extra notes

- Own dump, EUR, v01.005 (Backport 4.xx+), serial PPSA09232.
- Tested with default keyboard mapping, no gamepad.
- Config: printf_direction=File, shader_log_direction=File; attached log is the complete unmodified session (zipped to 4.5 MB).
- Built from source at commit 2aaf0c9 on 2026-09-24 with one local CMake-only fix (linker -Map path quoting for build paths containing spaces); no emulation code modified. The build fix will be submitted upstream separately.
- Host audio: PipeWire 1.6.8.

> Source: [KytyPS5 issue #805](https://github.com/KytyPS5/KytyPS5/issues/805)
