---
title: "Demon's Souls"
titleId: "PPSA01341"
status: "doesnt-boot"
testedVersion: "Official build KytyPS5-2026-10-10-947627d (v0.3.0)"
testedDate: "2026-10-11"
os: "windows"
hardware: "AMD Ryzen 9 5900X (AMD CPU patches enabled) / NVIDIA GeForce RTX 4070 Ti SUPER, driver 617.42 / 32 GB / 16 GB"
---

The game exits about 3 seconds after launch, before any logo appears. The game's own log reports:

  Critical FAILURE: sce::Agc::init()
  Message: RESULT FAIL: sce::Agc::init() => 0x80020023

0x80020023 is KERNEL_ERROR_EAGAIN. In _kyty.txt, AgcInit (ver = 13) -> Gen5Driver::InitializeDmem()
asks for 2 MiB of direct memory (len 0x200000, alignment 0x200000, type 12) and it fails:

  search_start = 0x0, search_end = 0x320000000, len = 0x200000 -> [Fail]

Before this, the game had already allocated the whole 0x320000000 direct-memory pool in three calls:
  0x270000 @ 0x31FD90000
  0x1FD90000 @ 0x0
  0x300000000 @ 0x1FD90000
  (total = 0x320000000)

So nothing is left for the driver's SceAgcDriver region. On real hardware this memory doesn't seem to
come from the game's pool. After the failure, the game's error handler crashes the emulator:

  Unhandled host exception: type=1 code=3221225477 pc=0x00000009009028dd access=1
  address=0xffffffffffffffff in src\loader\runtimeLinker.cpp:720

The XML at the end of the game's log looks like uninitialized buffer contents and not a separate problem.

## Steps to reproduce

1. Open the KytyPS5 launcher with default debug settings (validation, RenderDoc and command-buffer dumps off).
2. Launch
3. The emulator exits about 3 s later with the error above. It happens every time (several runs)

## Expected behavior

sce::Agc::init() should succeed and the game should reach its startup logos.

## Last working build / first broken build

Unknown. This is my first test of this game.

## Extra notes

[demonssoul_ps5_2026-10-10-22-37-56_0.log](https://github.com/user-attachments/files/33295297/demonssoul_ps5_2026-10-10-22-37-56_0.log)

Settings: 1920x1080, Fifo present mode, skip notice screen on.

> Source: [KytyPS5 issue #1398](https://github.com/KytyPS5/KytyPS5/issues/1398)
