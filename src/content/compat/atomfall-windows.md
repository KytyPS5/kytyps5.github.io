---
title: "Atomfall"
titleId: "PPSA15493"
status: "logo"
testedVersion: "KytyPS5-2026-09-30-b7a1fac (official Windows x64 release build)"
testedDate: "2026-10-02"
os: "windows"
hardware: "Intel Core i9-14900HX (32 threads) / NVIDIA GeForce RTX 4080 Laptop GPU, driver 617.14 (32.0.16.1714); secondary Intel RaptorLake-S iGPU (emulator selects the RTX 4080; Vulkan loader 1.4.341) / 32 GB DDR5 / 12 GB GDDR6"
---

The game boots much further than "won't boot": all six modules load and relocate
(eboot.bin + libc.prx, libSceFontGsm.prx, libSceJobManager.prx, libSceNpCppWebApi.prx,
libScePfs.prx), the game creates its own audio threads ("Ngs2 Streaming",
"Ngs2 file closing") and two audio racks (AsuraNgs2#1/#2), shaders compile
(VS 2 / PS 5), GPU command submissions are flowing, and the intro VIDEO PLAYS
TO COMPLETION ("AvPlayer video stopped" in the log). Roughly one minute after
launch, during the transition after the intro (audio buffer allocations are the
last kernel activity in the log), the emulator exits with:

  --- Fatal Error ---
  Not implemented (voice->rack->type != (rack_id == 0x1000 ? Ngs2RackType::Sampler
                                         : Ngs2RackType::CustomSampler))
   in src/libs/ngs2.cpp:2357

So the game is setting up its first gameplay audio voice through the Sampler
module (rack_id 0x1000) on a rack whose modeled type doesn't match what that
check expects. 320 symbol imports resolved via the PS5 NID fallback path;
no unresolved-import stubs were hit. Reproduced 1/1 on this machine.

## Steps to reproduce

1. Start kyty_emulator with --game pointing at the game dump folder.
2. Wait through the publisher/logo intro videos (they play at full speed with
   the default settings; ~1 minute).
3. Immediately after the intro finishes, the emulator terminates with the
   ngs2.cpp:2357 fatal above (exit code 321).

## Expected behavior

After the intro, the game should continue into its loading screen / main menu.

> Source: [KytyPS5 issue #967](https://github.com/KytyPS5/KytyPS5/issues/967)
