---
title: "Silent Hill: Townfall"
titleId: "PPSA33286"
status: "doesnt-boot"
testedVersion: "Official build KytyPS5-2026-10-10-307fdcf (Windows x64 release)"
testedDate: "2026-10-10"
os: "windows"
hardware: "Intel Core i7-11700KF / NVIDIA GeForce RTX 3070, driver 617.14 / 32 GB RAM / 8 GB VRAM"
---

The window opens with the game's title and stays black (49 frames, nothing drawn), then the emulator exits about 5 seconds after start. Same result on two runs:

```
--- Error ---
scalar resource reads overlap a shader buffer write
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:978
```

By then it had compiled 1 vertex and 30 compute shaders. The only unresolved imports called are four `NpCppWebApi` functions (`8x++mBOUeso`, `Y295ygEccqk`, `UYPxv8MIzGo`, `52AlYvq+dmk`).

**With open PR #1253** (its Windows CI build, `d53546a`), this error is gone. The title runs about 40 s on a cold shader cache (8 s on a warm one) and compiles 7 VS / 11 PS / 170 CS / 1 GS, then stops on a different error (window still black):

```
shader resource tracking: hash=0xb9da5e64f4c5b10a stage=compute pc=0x00000084 buffer descriptor is not a valid runtime value; GPU-selected access requires a scalar, raw DWORD x1/x2/x3/x4, or formatted X load in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:506
```

The same message appears in #824, #1053 and #1278.

## Steps to reproduce

1. `kyty_emulator.exe --game <game dir> --printf-direction File`
2. Wait about 5 seconds.

## Expected behavior

The game shows its startup logos.

## Extra notes

Dump: v02.003.000 fake PKG, unpacked. The pkg's `sce_sys` sits one level deeper (`sce_sys/sce_sys`), so the game directory used for the test is a folder of links to the dump with `sce_sys` pointing at the inner one. Nothing in the dump was changed.

*Tested and written with Claude (AI assistant) on my machine.*

> Source: [KytyPS5 issue #1373](https://github.com/KytyPS5/KytyPS5/issues/1373)
