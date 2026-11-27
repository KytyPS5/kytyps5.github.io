---
title: "Hello Neighbor 2"
titleId: "PPSA07426"
status: "in-game"
testedVersion: "KytyPS5-2026-11-26-61db2f8"
testedDate: "2026-11-27"
os: "windows"
hardware: "AMD Ryzen 7 7735hs / NVIDIA GeForce RTX 4060 140W (Laptop GPU) / 16 GB DDR5 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/bd36a2fd-cfbc-4e04-b226-4c1a6b06847b","https://github.com/user-attachments/assets/af3e019f-e12b-49c5-b151-0dc9d0495a89"]
---

The game boots and reaches gameplay, but suffers from severe outdoor lighting glitches and multi-second 0 FPS freezes.
- Main Menu: Runs smoothly at around 120 FPS.
- Intro Cutscene: Heavy stuttering; the environment initially renders completely washed-out white, then turns abnormally bright blue.
- Gameplay (Indoors): Graphics and lighting look normal, running at around 19–30 FPS, with occasional hard freezes dropping to 0 FPS for 2–3 seconds.
- Gameplay (Outdoors): Looking outside through doorways/windows shows broken bright white/blue overexposure and triggers severe 0–1 FPS freezes lasting several seconds.

## Steps to reproduce

1. Open KytyPS5.
2. Boot Hello Neighbor 2 (PPSA07426).
3. Start a new game and watch the intro cutscene (notice the washed-out white/blue lighting and stutters).
4. Gain control inside the barn and look around, then look outside through the doorway/windows to observe the bright blue outdoor lighting and heavy stuttering.

## Expected behavior

The intro cutscene and outdoor areas should render with normal lighting and colors (without white/blue overexposure), and gameplay should run smoothly without heavy stuttering indoors or outdoors.

## Extra notes

Tested with default emulator settings (no custom tweaks or debug options enabled).
Since the only previous report for this title is from late August, this is an updated status report on the latest build (KytyPS5-2026-11-26-61db2f8).

Intro Cutscene Notes:
- Heavy freezing occurs throughout the opening cutscene, causing severe audio/video desync (audio plays ahead while the video lags behind).
- The environment initially renders completely washed-out white, then gradually shifts to an abnormal bright blue after waiting a bit.

Gameplay Notes:
- 2–3 second 0 FPS hard freezes happen both indoors and when looking outdoors.

> Source: [KytyPS5 issue #2574](https://github.com/KytyPS5/KytyPS5/issues/2574)
