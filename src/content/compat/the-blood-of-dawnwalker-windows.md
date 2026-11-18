---
title: "The Blood of Dawnwalker"
titleId: "PPSA28000"
status: "main-menu"
testedVersion: "Official build KytyPS5-2026-11-16-1e87171"
testedDate: "2026-11-17"
os: "windows"
hardware: "AMD Ryzen 7 7840HS / NVIDIA GeForce RTX 4060 Laptop GPU (8 GB), driver 621.24 (Game Ready) / 16 GB RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/5d3bb05b-e5a5-4193-93a0-d0a7eaa79695"]
---

The game boots, reaches the main menu and starts the opening cinematic after
"New Game", but it freezes during that cinematic and never reaches
controllable gameplay. The emulator then aborts.

Crash:
- After the last frame, Unreal aborts about 2 minutes later (~00:08:20 in the log):
  LowLevelFatalError [File:.\Runtime/RenderCore/Private/RenderingThread.cpp] [Line: 1150]
  GameThread timed out waiting for RenderThread after 120.00 secs
  followed by "Guest abort() in src\libs\libC.cpp:250".
  The VideoOut flip counter stays at 8946 from ~00:06:21 until the abort.

Observed issues:
- Very long freezes on first launch: "No frames for 40 s" or more
  (observed on first boot, not captured on video).
- Video 1 (33 s, logos + intro cinematic) is stable at ~29-30 FPS
  (worst frames ~50-73 ms).
- Video 2: the main menu and difficulty selection run mostly around 30 FPS
  (occasional drops, worst frame ~1050 ms). After "New Game", the loading
  screen and opening cinematic collapse to 0.6-5 FPS with repeated
  "No frames for 2/3/5/6/10 s" freezes. Worst frame time reached 9771 ms.
- Pipeline compilation stalls: 1036 pipelines compiled (avg 335.5 ms,
  peak 7982.3 ms), plus 1132 shader recompilations (avg 2.3 ms, peak 67.9 ms).
  The long freezes seem to match pipeline compile spikes, even though the
  pipeline cache was loaded at startup (1126 pipelines).
- GPU memory over budget right before the freeze: 8.48 GB used / 7.02 GB available.
- System RAM almost full: 15.10 GB / 15.29 GB (emulator alone uses 7.56 GB).
- Audio plays but stutters heavily.
- Graphical artifacts: hair renders as grainy/noisy dithered strands
  (visible on all characters in the attached screenshot).

## Steps to reproduce

1. Open KytyPS5 and boot The Blood of Dawnwalker (PPSA28000).
2. Let the logos and the intro cinematic play.
3. In the main menu, select "New Game", choose the "Fair" difficulty and confirm.
4. Wait through the loading screen.
5. The opening cinematic stutters heavily, then freezes before gameplay; the game aborts about 2 minutes after the last frame.

## Expected behavior

The opening cinematic should play smoothly and lead into controllable gameplay without freezing or aborting.

## Extra notes

- Laptop with hybrid graphics (Radeon 780M iGPU + RTX 4060 Laptop); the RTX 4060 is selected explicitly in the GPU setting.
- Global settings are default except: resolution 1920x1080, "Show performance panel" and "Skip boot logos" enabled.
- Memory pressure is likely involved: VRAM was over budget and system RAM nearly full right before the freeze.

> Source: [KytyPS5 issue #2351](https://github.com/KytyPS5/KytyPS5/issues/2351)
