---
title: "Ghost of Yotei"
titleId: "PPSA26344"
status: "logo"
testedVersion: "Version 0.3.0, git=589bd14"
testedDate: "2026-11-07"
os: "windows"
hardware: "AMD Ryzen 9700x / NVIDIA Geforce 2070 Super (Driver Version 621.01) / 32 GB DDR5 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/718aa6e9-c117-4dff-9752-6391caba37bb"]
---

Note that this is an extension of #1599. While nothing has changed in any signifcant degree, I wanted to post some new tests with TSC on/off, proper logs for information, and an update on Ghost of Yotei's boot progress. I will most likely close #1599 as a duplicate after publishing this one.

While testing Ghost of Yōtei, a stack overflow (0xC00000FD) occurs after the 309-block compute shader translates; PS5 TSC rate on avoids it but stalls on the loading spinner. A couple related issues are #1599 (stack overflow in the 309-block compute shader) and #1609 (commit 497020a, makes it translate). With PS5 TSC rate off, the official builds still crash deterministically in the 309-block compute shader, but now after translation succeeds. The log ends in the "native IR before resource tracking" dump, before the shader finishes resource tracking and SPIR-V emit. The exit code is `-1073741571` (0xC00000FD, STATUS_STACK_OVERFLOW). With PS5 TSC rate on there is no crash, but the game stalls on the loading spinner with a healthy emulator.


| Source 8415235 (#1609 / 497020a test build) | no Guest TSC line | Compiles all 108 CS including the 309-block shader and submits ~453 flips, then hard-stalls: no frames, ~782K write-tracking faults/s, page table 13853/2048, direct memory 13.35/13.35 GB |
| Official 2026-10-28-c528324 | no Guest TSC line | Exits inside the 309-block shader after ~418 flips |
| Official 2026-11-06-9a29dc6 | off | ~903 flips, log ends after 105 compute shaders (shader logging was off, and output is buffered) |
| Official 2026-11-06-182161e | off | 105 CS compiled, exits in the 309-block shader |
| Official 2026-11-07-589bd14 | off, readback and tiled readback on | ~985 flips, 105 CS compiled, exits in the 309-block shader, exit code -1073741571 |
| Official 2026-11-06 builds | **on** | No crash. Stalls on the spinner; see below |

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
Enable Tessellation Support turned on
Enable Occlusion Queries turned on
Enable HDR Display Support turned on
Cache Shaders turned off
PS5 Pro Mode turned off
Network Connection turned off
Emulate PSN turned off
Accurate Texture Synchronization turned on

> Source: [KytyPS5 issue #2151](https://github.com/KytyPS5/KytyPS5/issues/2151)
