---
title: "Carmen Sandiego"
titleId: "PPSA25256"
status: "in-game"
testedVersion: "KytyPS5-2026-10-27-ffc8137 (0.3.0)"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 9900X (12 cores) / NVIDIA GeForce RTX 4080 SUPER, driver 615.78.08 (Vulkan 1.4) / 60 GB RAM / 16 GB VRAM"
screenshots: ["https://files.catbox.moe/0ts3ln.png"]
---

The game boots with the default configuration and is fully playable at a stable frame rate. It compiles its shaders (up to VS 66 / PS 139 / CS 29), loads its AK audio modules (`akreverb`, `akdelay`, `akcompressor`, etc.) and reaches controllable gameplay. No fatal errors or host exceptions in the log; the run was stopped by us after about 90 seconds of play.

The only anomaly in the log is a missing import that falls back to a stub, called three times during the run:

```
Unresolved import stub called [0..2]: patch_vaddr=0x0000000905e642e0 jmprela_index=53 symbol=fgIsQ10xYVA[libkernel_v1][libkernel_v1.1][Func] type=Func bind=Global program=.../eboot.bin
```

It did not prevent the game from running.

## Steps to reproduce

1. Start KytyPS5 2026-10-27-ffc8137 on Linux.
2. Boot Carmen Sandiego (app version 01.009.000) from a clean dump.
3. Wait for the initial shader compilation and confirm on the title screen.

## Expected behavior

No known issue: the game boots and is playable.

## Extra notes

- Tested with one host gamepad on player 1; no special flags were needed.
- The dump comes from my own console; no game files, keys or decrypted assets are shared, only the log and screenshot.
- Test executed and the reported status confirmed by the dump owner; the report text was drafted and filed with AI assistance from the emulator log.

> Source: [KytyPS5 issue #1953](https://github.com/KytyPS5/KytyPS5/issues/1953)
