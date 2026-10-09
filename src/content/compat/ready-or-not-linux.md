---
title: "Ready or Not"
titleId: "PPSA18605"
status: "in-game"
testedVersion: "Built from source at `5a880808` (ver 0.3.0), Release, clang 21 + lld, Linux"
testedDate: "2026-10-08"
os: "linux"
hardware: "Intel Core i7-13620H (10C/16T) / NVIDIA GeForce RTX 4070 Laptop GPU, proprietary driver, Vulkan 1.4.312 / 15.7 GB system RAM / 8 GB VRAM"
---

The game boots, plays its intro video, reaches the SWAT HQ (Los Sueños Police Department) and is controllable — the tutorial prompts respond, the weapon rack and briefing area render correctly, and the in-game chat shows `Kyty has joined the game!`, so the title's own session/player layer works. No rendering corruption was visible: PBR materials, shadows, the HUD and UI text all look correct.

**The run ends in the title's own watchdog, not in an emulator assert:**

```
LowLevelFatalError [File:.\Runtime/RenderCore/Private/RenderingThread.cpp] [Line: 1272]
GameThread timed out waiting for RenderThread after 120.00 secs
```

followed by `Guest abort()` (`src/libs/libC.cpp:254`). At that point the title had presented 743 flips, so it was running normally beforehand.

**Why the render thread stalls — measured.** Pipeline creation is the cost, and it is serialised on the thread UE is waiting for. Instrumented `GetGraphicsPipeline`, timing `CreatePipelineInternal` per call:

| | cold run | run 2, caches warm |
|---|---|---|
| pipelines created | 247 | 241 |
| total creation time | **48.8 s** | **0.3 s** |
| creations over 100 ms | **138** | **0** |

Cost distribution on a cold run (590 creations on an older tree, same shape):

```
   0-1 ms  : 388 (66%)  ->  0.05 s
  10-100   :  69        ->  3.25 s
 100-500   : 112 (19%)  -> 29.9 s   = 65% of the total
 500-2000  :  19 ( 3%)  -> 13.0 s   = 28% of the total
```

So ~22% of creations consume ~93% of the time, at 100-900 ms each. Splitting the zone shows where it goes — this is the driver, not emulator code:

```
PipelineCache::CreatePipeline(Gfx)  n=1379  total=    13.4 ms   <- key build + map lookup
Gfx.CreatePipelineInternal          n= 204  total=   253.1 ms   <- layout/DSL setup
vkCreateGraphicsPipelines           n= 204  total=31,991.2 ms   <- 156.8 ms per call
```

Entering new content requests hundreds of new pipelines in a burst; the frame counter freezes for the duration because `renderDraw.cpp` holds the renderer mutex across `GetGraphicsPipeline`, and `Presenter::Impl::Present` needs that same mutex. Long enough bursts trip UE's 120 s limit.

**Where the warm-run speed actually comes from.** On this machine it is the NVIDIA driver's own shader cache, not KytyPS5's `VkPipelineCache`. Controlled test, same emulator cache loaded in both arms, only `~/.cache/nvidia/GLCache` differing:

```
emulator cache loaded + GLCache removed : 241 creations, 45.3 s, 129 over 100 ms
emulator cache loaded + GLCache present : 241 creations,  0.2 s,   0 over 100 ms
```

(The GLCache directory was moved aside and restored afterwards.) I mention it because it means the first launch on a fresh machine — or the first launch after a GPU driver update — pays the full ~45 s, and that is the configuration most likely to hit the UE timeout.

**Frame rate.** ~7.5 fps steady (1272 frames in 170 s) at 1280x720. Neither side is saturated: GPU 4-12% utilisation and ~18 W, whole process 0.66-0.87 of 16 cores. The emulator also warns:

```
Warning: game uses occlusion queries, which are currently treated as always visible;
GPU usage may be higher and FPS may be lower.
```

**Other log signals**, all benign as far as I can tell:

- Unresolved imports are limited to `NpCppWebApi_v1` / `NpCppWebApi_v1.1` (PSN web API) — harmless offline.
- `warning: requested present mode is unavailable; falling back to Fifo` (NVIDIA Wayland WSI does not advertise Mailbox here).
- `warning: ignoring indirect uc reg GE_STEREO_CNTL at 0x25f`
- `warning: base / size_bytes is not 256-byte aligned`
- Shader counts at the end of the session: `VS 218 | PS 700 | CS 76 | GS 1`.

## Steps to reproduce

1. Build `5a880808` for Linux (Release, clang) or use an equivalent official build.
2. `kyty_emulator --game <PPSA18605 dir> --screen-width 1280 --screen-height 720`
3. Wait through the intro video; the game reaches the HQ and is controllable.
4. Keep playing / move between areas. When a content transition needs a large batch of new pipelines, the frame counter in the window title stops advancing; if that exceeds 120 s the title aborts with the `RenderingThread.cpp:1272` message above.

The timeout is most reliably hit on a first launch with no warm shader cache (delete `_PipelineCache/PPSA18605.bin` and, on NVIDIA, `~/.cache/nvidia/GLCache`).

## Expected behavior

The game should not abort. UE's 120 s render-thread watchdog is a last resort; it firing means the render thread made no progress for two minutes, which here is pipeline compilation rather than anything the game is doing.

## Last working build / first broken build

n/a — no prior report exists for this title. I could not find PPSA18605 in the issue tracker or in the compatibility list, so this is a first datapoint rather than a regression report.

## Extra notes

- No emulator-side assert fired in this session. In earlier sessions on an older tree I also hit `failed to create image ... image.cpp:727` (VMA out of memory at ~7.09/7.22 GB on the 8 GB card); I have not reproduced that at `5a880808`, where three consecutive runs were crash-free apart from the UE timeout.
- Commit `98401022` ("make depth bounds dynamic to reuse pipelines") measurably helped here: distinct pipeline keys went from 590 to 247 between the older tree and `5a880808`, and warm-run creation time dropped from 8.8 s to 0.3 s.
- I filed #1178 separately for an unrelated stall found while investigating this (guest unmap forcing a full GPU drain).
- I can test patches on Linux/NVIDIA and re-measure with the same instrumentation.

> Source: [KytyPS5 issue #1179](https://github.com/KytyPS5/KytyPS5/issues/1179)
