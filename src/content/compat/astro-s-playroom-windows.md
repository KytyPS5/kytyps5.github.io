---
title: "Astro's Playroom"
titleId: "PPSA01325"
status: "in-game"
testedVersion: "Official build KytyPS5-2026-10-06-fb7ff7e (ver 0.3.0)"
testedDate: "2026-10-06"
os: "windows"
hardware: "AMD Ryzen 5 5600 (6C/12T) / AMD Radeon RX 6700 XT, Adrenalin 26.8.1 (driver 32.0.21045.5002), Vulkan / 32 gb ddr4 3600 4 planks"
---

The game reaches controllable gameplay (CPU Plaza and levels) but performance is very low on RDNA2: 5-8 fps in levels, ~25 fps with the camera pointed away from level geometry.

Profile data (Windows GPU engine perf counters + thread sampling, measured while in level):
- GPU engine utilization: 3D ~64-68% average; NO Compute engine activity; NO Copy engine activity (uploads appear serialized on the 3D queue).
- Emulator CPU usage: ~1 core total of 12; one dominant thread ~53% of a single core, all other threads <=7%. Serialized prepare/submit loop waiting on the GPU - neither side saturated, the rest is bubbles.
- Frame math: ~166 ms/frame, ~110 ms of it GPU 3D busy at a forced 1080p internal render target. The console renders this scene at 60 Hz on similar TFLOPs, so the effective recompiler/pipeline overhead is roughly 6-7x.
- Shader counts keep growing slowly during gameplay (VS 79 / PS 118 / CS 31) - on-the-fly compilation present but not a stutter storm.
- Title screen hits the --vblank-frequency 30 cap (30 fps) with CPU/GPU mostly idle.

## Steps to reproduce

1. Open KytyPS5 (build KytyPS5-2026-10-06-fb7ff7e).
2. Boot ASTRO's PLAYROOM (PPSA01325, 01.904.000).
3. Enter CPU Plaza and any level (e.g. Memory Heaven).
4. Look at the level geometry with the camera: fps counter in the window title drops to 5-8.
5. Point the camera at the sky/empty space: fps rises to ~25.

## Expected behavior

On a PS5-class GPU (RX 6700 XT is similar in TFLOPs to the console) this scene renders at 60 Hz in 16.6 ms. The emulator currently spends ~110 ms of GPU 3D time per frame at a forced 1080p internal target, so I would expect roughly an order of magnitude less GPU time per frame once known inefficiencies are addressed.

## Extra notes

A community memory patch was applied and verified in the guest log ("Successfully applied cheat: Select the common GI-unavailable state" + "Fixed render resolution 1920x1080"), so the internal render target is forced to 1080p and GI is disabled - the measurements above are WITH those active.

Full guest printf log attached (prof_fb7ff7e_20261006.zip, ~28 MB uncompressed). Patched JSON used for the partial cheat application can be shared if useful.

Questions:
- Is ~110 ms 3D/frame at 1080p on RDNA2 expected at this stage, or are known inefficiencies already identified here?
- Would a Tracy capture (--profile) or command buffer dumps from this level be useful? Happy to run specific env switches/patches and re-measure.

> Source: [KytyPS5 issue #1113](https://github.com/KytyPS5/KytyPS5/issues/1113)
