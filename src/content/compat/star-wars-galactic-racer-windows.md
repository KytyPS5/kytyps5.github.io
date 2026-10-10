---
title: "STAR WARS: Galactic Racer"
titleId: "PPSA28416"
status: "main-menu"
testedVersion: "Official build KytyPS5-2026-10-09-59183db (Windows x64)"
testedDate: "2026-10-09"
os: "windows"
hardware: "AMD Ryzen 5 9600X / AMD Radeon RX 9060 XT, Adrenalin driver 32.0.32015.2008 / 32 GB DDR5-6000 / 16 GB VRAM"
---

Boots and reaches the menus. Starting a quick race loads the track, but at the starting grid `vkQueueSubmit` returns `ErrorDeviceLost`, Windows resets the GPU driver (TDR), and Kyty exits with:

```
Not implemented (result != vk::Result::eSuccess) in src\graphics\host_gpu\renderer\commandScheduler.cpp:382
```

Happens 3 out of 3 times, right after the first geometry shaders compile. No hull or tessellation-evaluation shaders compile, even with `--tessellation`. GPU-assisted validation reported no out-of-bounds shader accesses before the hang.

| Flags (besides `--game`) | Result | Shader counts at crash |
|---|---|---|
| `--playgo-hack` | ErrorDeviceLost tick=290620 debug_op=9 debug_submit=20560 args=4046259200,16,0,65 | VS 35, PS 95, CS 422, GS 12 |
| `--playgo-hack --redzone --gpu-assisted-validation true` | ErrorDeviceLost tick=193657 debug_op=2 debug_submit=16324 args=1792,8,0,1 | VS 30, PS 82, CS 397, GS 5 |
| `--playgo-hack --redzone --readback-linear-images true --tessellation` | ErrorDeviceLost tick=193816 debug_op=0 debug_submit=16013 args=480,270,1,65 | VS 30, PS 83, CS 408, GS 9 |

Separate crash: starting the **campaign** (with `--playgo-hack --gpu-assisted-validation true`) fails on the CPU side instead:

```
Memory: attempted to access invalid address 0x000026722c35263e with size 0x0000140fc017d529
 in src\kernel\memory.cpp:899
```

The last guest call before it is the unresolved stub `2mfSRGdshtk [SaveData_native_v1]`. That stub is also called once at boot without crashing.

Warnings on every run: `Bc6HUfloatBlock does not support storage access` (block-compressed textures written by the guest won't render); occlusion queries treated as always visible. Unresolved stubs: NpCppWebApi `8x++mBOUeso` `Y295ygEccqk` `UYPxv8MIzGo` `52AlYvq+dmk`, NpManager `ZVZ++68nNI8`, Posix `c7ZnT7V1B98`, SaveData_native `2mfSRGdshtk`.

## Steps to reproduce

1. Boot PPSA28416 with `--playgo-hack`.
2. From the main menu, start a quick race.
3. The track loads, then the GPU hangs at the starting grid (device lost).
4. (Separately) Choosing the campaign from the main menu crashes with the invalid memory access above.

## Expected behavior

The race should start from the grid, and the campaign should load.

## Extra notes

Display is 3840x2160 @ 165 Hz. The GPU recovers after each TDR. Console logs from all four runs are attached under Log file upload.

> Source: [KytyPS5 issue #1337](https://github.com/KytyPS5/KytyPS5/issues/1337)
