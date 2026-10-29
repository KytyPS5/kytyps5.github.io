---
title: "HOT WHEELS™ Infinite Rush"
titleId: "PPSA22408"
status: "logo"
testedVersion: "KytyPS5-2026-10-27-ffc8137 (0.3.0)"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 9900X (12 cores) / NVIDIA GeForce RTX 4080 SUPER, driver 615.78.08 (Vulkan 1.4) / 60 GB RAM / 16 GB VRAM"
screenshots: ["https://files.catbox.moe/ojtra8.png"]
---

The game starts to display the Mattel logo and then the window closes before the Hot Wheels logo or the main menu appear.

The crash is deterministic. Reproduced twice at the same guest point:

- default run (splash enabled): process aborted after ~12 seconds;
- `--no-splash`: process aborted after ~5 seconds.

Both runs end with the same host exception and exit code 65:

```
Unhandled host exception: type=1 code=11 pc=0x00000009008a10c0 access=1 address=0x00000007efdf4000
 in /home/runner/work/KytyPS5/KytyPS5/src/loader/runtimeLinker.cpp:721
```

Immediately before the abort the log shows a networked import being stubbed and then called from `eboot.bin`:

```
Stubbed: ... RCCY01Xd+58[Net_v1][Net_v1.1][Func], Func, Global
Unresolved import stub called [0]: patch_vaddr=0x000000090b1c3da8 jmprela_index=308 symbol=RCCY01Xd+58[Net_v1][Net_v1.1][Func] type=Func bind=Global program=.../eboot.bin
```

Modules loaded before the crash: `libc.prx`, `libSceNpCppWebApi.prx`, `eossdk-ps5-shipping.prx`, `kitt_support-ps5-shipping.prx`, `kitt_webkit-ps5-shipping.prx`, `kitt-ps5-shipping.prx`, `kitt_data_eos-ps5-shipping.prx`. The pipeline cache was still empty when it aborted.

## Steps to reproduce

1. Start KytyPS5 2026-10-27-ffc8137 on Linux.
2. Boot HOT WHEELS™ Infinite Rush (app version 01.000.000) from a clean dump.
3. Wait ~5 s with `--no-splash` (or ~12 s with the default splash).
4. The Mattel logo starts to appear and the emulator closes.

## Expected behavior

The Mattel logo should finish and the game should continue to its own logo and main menu.

## Extra notes

- Tested with one host gamepad on player 1; no special flags were needed for the default run.
- The dump comes from my own console; no game files, keys or decrypted assets are shared, only the log and screenshot.
- Test executed and the reported status confirmed by the dump owner; the report text was drafted and filed with AI assistance from the emulator log.

> Source: [KytyPS5 issue #1954](https://github.com/KytyPS5/KytyPS5/issues/1954)
