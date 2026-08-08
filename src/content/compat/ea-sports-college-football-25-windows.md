---
title: "EA Sports College Football 25"
titleId: "PPSA04184"
status: "boots"
testedVersion: "0.2.2"
testedDate: "2026-07-19"
os: "windows"
hardware: "AMD Ryzen 9 9900X / NVIDIA GeForce RTX 4070"
---

**Current Blocker - unimplemented `libkernel` import causes an infinite wait** The game does not reach the main menu. Over the course of investigating this, three distinct emulator bugs were found and fixed, after which the game now hangs indefinitely in a busy-loop on an unimplemented `libkernel` import. The game boots further: it loads `eboot.bin` and several `.prx` modules, sets up its EA engine memory pools, and creates an `EAThread Timer Queue`. It then enters what looks like a queue/free-list processing loop and calls an **unresolved `libkernel_v1.1` import** (encoded NID `lgK+oIWkJyA`) once per iteration. Because that function isn't implemented, it unconditionally returns `0`; the game's code appears to treat that as "not ready, check again" and spins forever, so it never falls through to whatever comes after this step in its boot sequence (and the menu never appears). There were some other issues that i fixed on my own. to get to this point. Detailed here: **Bug 1 — Vulkan device-layer validation error (fixed)** `vkCreateDevice()` was being called with `enabledLayerCount = 1`, enabling `VK_LAYER_KHRONOS_validation` at the *device* level. Device-level layers have been non-fu

**Steps to reproduce:** 1. Open KytyPS5. 2. Boot EA Sports College Football 25 (PPSA04184). 3. Observe the emulator initializes subsystems, loads modules, and then never proceeds — log fills with repeated `Unresolved import stub called: lgK+oIWkJyA[libkernel_v1][libkernel_v1.1][Func]`.

> Source: [KytyPS5 issue #79](https://github.com/KytyPS5/KytyPS5/issues/79)

