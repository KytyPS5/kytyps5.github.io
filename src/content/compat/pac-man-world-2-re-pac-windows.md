---
title: "PAC-MAN WORLD 2 Re-PAC"
titleId: "PPSA18189"
status: "doesnt-boot"
testedVersion: "1df53b1 (source build, Release)"
testedDate: "2026-08-29"
os: "windows"
hardware: "Intel Core i7-10750H / NVIDIA GeForce RTX 2060, driver 596.36 / 16 GB RAM / 6 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/4500e9f2-6436-43a5-acd6-9afd12c0957c"]
---

The game loads and runs its main loop, but never renders anything. The window
opens with correct metadata, audio produces a brief burst of noise at startup
and then goes silent, and the frame counter advances to somewhere between 60
and 200 before stalling. The reported frame rate stays at ~60 because the
present loop keeps running with nothing drawn. The screen is black throughout.

Three things stand out in the log, none of which Tetris Forever triggers on the
same build:

1. No shaders are ever compiled. "Num compiled N shaders" never appears.

2. An unresolved libkernel import is called continuously, roughly once per
   frame, about 650 calls per minute:

     Unresolved import stub called: 04AjkP0jO9U[libkernel_v1][libkernel_v1.1][Func]

   It is the only unresolved symbol in the run and hits the 1024-entry log cap.
   The stub returns 0. I could not identify which function this NID is: I
   verified my NID derivation against four of the project's own registrations
   (clock_gettime -> lLMT9vJAck0, getpagesize -> k+AXqu2-eBc, gettimeofday ->
   n88vx3C5nW8, clock_getres -> smIj7eqzZE8, all exact) and then tested ~1650
   candidate names without a match, so I am reporting the NID rather than
   guessing at a name.

3. The game requests AGC register defaults version 13. agc.cpp:145 sets
   GRAPHICS_REGISTER_DEFAULTS_MAX_VERSION = 12, so AgcInit and
   AgcGetRegisterDefaults2 log "unsupported version 13" (three times) and
   normalize_register_defaults_version() silently falls back to the version 12
   table. Tetris Forever does not request version 13.

Meanwhile the graphics thread loops on event queues that never fire:

  Equeue wait: Flip Event Queue GfxDeviceAgc ...
  Equeue wait timedout: Flip Event Queue GfxDeviceAgc
  Equeue wait: Eop Event Queue GfxDeviceAgc ...
  Equeue wait timedout: Eop Event Queue GfxDeviceAgc

276 timeouts in 75 seconds. Consistent with the game never submitting GPU work
rather than submitting work that fails.

I have not established which of (2) or (3) causes the stall, or whether either
does, so I am not claiming a root cause. Both are reproducible on every run.

## Steps to reproduce

1. Start KytyPS5 with PAC-MAN WORLD 2 Re-PAC (PPSA18189, version 01.000.004).
2. Wait ~15 seconds.
3. A window opens, a short burst of audio noise plays and stops, the frame
   counter advances briefly and then stops, and the screen stays black.
4. The process stays alive and the reported frame rate stays near 60.

## Expected behavior

The game should reach its first logo or startup screen instead of holding a
black screen.

> Source: [KytyPS5 issue #411](https://github.com/KytyPS5/KytyPS5/issues/411)
