---
title: "Resident Evil 2 Remake"
titleId: "PPSA04288"
status: "in-game"
testedVersion: "KytyPS5-2026-11-26-61db2f8"
testedDate: "2026-11-27"
os: "windows"
hardware: "AMD Ryzen 7 7735HS / NVIDIA GeForce RTX 4060 140W (Laptop GPU) / 16 GB DDR5 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/146f8512-505b-4c68-bd52-4337e164ecfa","https://github.com/user-attachments/assets/e3d566e0-4b13-411e-87b3-c52da748216d","https://github.com/user-attachments/assets/fe081256-4cfe-421c-9926-8a7e88fdf8a7"]
---

Game version: 01.002.000

The game boots and is playable in-game (tested through the opening gas station section). Lighting, rain effects, flashlight, UI, subtitles, and cutscenes render properly, but there are performance and minor graphical issues:
- In-game frame rate averages around 19–26 FPS during the gas station section (60 FPS is only occasionally seen in the menus, never during gameplay).
- Severe stutters and brief freezes occur during gameplay and area transitions, dropping as low as 0–7 FPS (e.g., near the patrol car outside and when opening the backroom door inside the gas station).
- Transparency/depth sorting bug during the car scene: the car windows render incorrectly, causing the character's hand to appear behind the window glass.

## Steps to reproduce

1. Open KytyPS5 (build KytyPS5-2026-11-26-61db2f8).
2. Boot RESIDENT EVIL 2 (PPSA04288, v01.002.000).
3. Start a new game and play through the opening gas station section (walking outside in the rain, entering the store, and opening the backroom door).
4. Observe the low average FPS (19–26 FPS), severe drops to 2–7 FPS during transitions/door opening, and the window/hand rendering bug in the car scene.

## Expected behavior

The game should maintain stable frame pacing without severe drops to 2–7 FPS during gameplay/transitions, and transparent surfaces like car windows should render with proper depth sorting.

## Extra notes

_KytyPS5 default settings. In-game graphics settings were set to Performance mode, with Ray Tracing disabled._

> Source: [KytyPS5 issue #2582](https://github.com/KytyPS5/KytyPS5/issues/2582)
