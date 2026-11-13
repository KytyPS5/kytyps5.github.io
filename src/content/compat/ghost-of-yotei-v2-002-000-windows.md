---
title: "Ghost of Yotei (v2.002.000)"
titleId: "PPSA26344"
status: "logo"
testedVersion: "ver=0.3.0 git=7d4e0d9"
testedDate: "2026-11-11"
os: "windows"
hardware: "AMD Ryzen 9700x / NVIDIA Geforce 2070 Super (Driver Version 621.01) / 32 GB DDR5 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/21ab2d4b-a918-44fa-a049-d1b0a746cebf"]
---

Ghost of Yōtei (PPSA26344, v02.002.000): fatal "buffer descriptor is not a valid runtime value" in compute shader 0xc37d0172087dc1a6 (ResourceTracking.cpp:605), exit code 321

Build: KytyPS5 official 2026-11-10-7d4e0d9 (same result on 2026-11-10-782a85c)

- Follow-up to #1599. The stack overflow in the 309-block compute shader no longer happens on these builds: 0xe4a433b4298b813e finishes SPIR-V emit (271,413 words, 16 ms), and so does a 433-block shader (0x38d50151933e3321, 387-410K words, compiled 4 times with slightly different sizes).
- The game now renders at ~30 FPS with dips to 1-5 FPS, then the emulator stops itself with exit code 321 (not -1073741571). Shader counter at exit: VS 19 | PS 46 | CS 157.
- Error text: shader resource tracking: hash=0xc37d0172087dc1a6 stage=compute pc=0x00000980 buffer descriptor is not a valid runtime value; GPU-selected access requires a scalar, raw 8/16-bit, raw DWORD x1/x2/x3/x4, or formatted X load in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:605
- Shader: 18 CFG blocks (26 after structurize), 1 loop, 27 IR blocks; fails in resource tracking after IR translation. The instruction at pc 0x980 is BUFFER_ATOMIC_ADD v0, v0, s20, 0 (glc=0, result unused). In the IR dump the descriptor operands %1652-%1655 are Phis merging the values from before the loop (block $6: %738-%741) with the loop back-edge (block $17: %1617-%1620), feeding GetBufferResource %1680 -> BufferAtomicIAdd32.
- Other BUFFER_ATOMIC_ADD / BUFFER_ATOMIC_OR instructions with plain descriptors (for example s60 at pc 0x508 and s4 at pc 0xa20 in other shaders) were translated fine earlier in the same run.
- Reproducible: both runs fail on the same compute shader after 157 compute shaders finished (the 158th fails). VS/PS counts differ (VS 21 / PS 57 on 782a85c, VS 19 / PS 46 on 7d4e0d9).
- Not memory or compile speed: overlay mid-run showed pipeline compile avg 2.3 ms / peak 14.1 ms, shader recompiler avg 1.7 ms / peak 22.5 ms, Vulkan heap 3.50/7.05 GB, page table CPU 8521 / GPU 8073 of 16384. The 1-5 FPS dips line up with GPU waits (last hitch 1367 ms, GPU wait 2652 ms), not compilation, which is probably due to hardware limitations.

## Steps to reproduce

1. Open KytyPS5
2. Boot Game
3. Watch logos
4. Crash

## Expected behavior

The game should successfully boot to the main menu.

## Extra notes

AMD CPU patch turned on
Windows SysV red zone crash protection turned on
Screen Resolution: 2560x1440
Present Mode: Fifo
Vblank Frequency: 60
GPU: 2070 Super
Enable Readback turned on
Enable Tiled Readback turned on
Enable Storage Readback turned on
Enable Tessellation Support turned on
Enable Occlusion Queries turned on
Enable HDR Display Support turned on
Cache Shaders turned on
Relaxed Shader float math turned off
PS5 Pro Mode turned off
Network Connection turned off
Emulate PSN turned off
Accurate Texture Synchronization turned on

> Source: [KytyPS5 issue #2204](https://github.com/KytyPS5/KytyPS5/issues/2204)
