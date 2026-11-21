---
title: "The Last of Us Part 1"
titleId: "PPSA07642"
status: "logo"
testedVersion: "KytyPS5-2026-11-19-861b07b-Windows-x64"
testedDate: "2026-11-19"
os: "windows"
hardware: "AMD Ryzen 5600x / NVIDIA GeForce RTX 3060 / 32GB DDR4 12gb VRAM"
---

The Last of Us Part I fails to boot on KytyPS5. The game is recognized correctly, initializes multiple emulator subsystems, and begins compiling compute shaders, but does not reach the main menu or gameplay.

The initial reproducible failure was:

shader resource tracking: hash=0x1864e38d38096567 stage=compute pc=0x000007c4 GetImageResource dword 0 is not a valid runtime value in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:646

Updating the NVIDIA drivers, clearing the shader/pipeline cache, and testing the available graphics/debug settings did not resolve this failure.

Further investigation with locally modified diagnostic builds revealed additional issues:

1. Vulkan device loss

The emulator encounters VK_ERROR_DEVICE_LOST (-4) while waiting for a GPU timeline semaphore in masterSemaphore.cpp.

vkWaitSemaphores failed:
ErrorDeviceLost (-4)
waiting=5745
completed=5728
current=5746

2. Invalid indirect compute dispatch

Vulkan GPU-assisted validation reported an invalid vkCmdDispatchIndirect Z dimension:

Indirect dispatch Z count: 790635776
Device limit: 65535

The origin of this value has not yet been established. It is not confirmed whether this invalid dispatch caused the observed GPU device loss.

3. Additional shader resource specialization failure

An experimental image atomic memory barrier allowed three local runs to progress further before failing on compute shader:

0x91f2b40bccd3dc9e

The failing shader accesses descriptors through a dynamically indexed resource table using 240-byte records and a 96-byte member offset. The index selection involves a loop-carried value, ballot operation, and ReadLane.

The resource materializer could not establish a sufficiently constrained descriptor index domain.

The experimental barrier was removed because it was not proven correct or verified to resolve the underlying problem.

## Steps to reproduce

1. Open KyTyPS5
2. Boot Game
3. Wait for Logo

## Expected behavior

The game should complete shader compilation, initialize its rendering pipeline, and boot to the main menu without shader resource-tracking failures, invalid indirect dispatch commands, or Vulkan device loss.

> Source: [KytyPS5 issue #2433](https://github.com/KytyPS5/KytyPS5/issues/2433)
