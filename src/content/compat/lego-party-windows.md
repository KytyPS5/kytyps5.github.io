---
title: "LEGO Party!"
titleId: "PPSA29141"
status: "in-game"
testedVersion: "KytyPS5-2026-09-18-5b7d334-Windows-x64"
testedDate: "2026-09-18"
os: "windows"
hardware: "AMD Ryzen 7 7800X3D 8-Core / NVIDIA GeForce RTX 3070, driver 32.0.16.1074 / 24 GB DDR5 RAM (16+8, asymmetrical) / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/714c1e31-6cc4-48fe-98ed-609c6e6bb763","https://github.com/user-attachments/assets/2433c32d-e84b-4145-983d-57659add90bd"]
---

Boots reliably, reaches the main menu and gets into controllable gameplay. Playable.

**Texture/material defect on large character models.** In the Wardrobe / "My Minifigures" screen, the full-size 3D character preview renders costume and fur materials as solid black, while the small grid thumbnails of the *same* characters render correctly in the same frame. Two examples, both screenshotted below:

- **Peapod Suit Fan** — the peapod shell renders as glossy black with white/cyan specular streaks instead of green with visible peas. The head, hands and legs render correctly. The grid thumbnail of the same character is correct.
- **Yeti** — the fur renders as a black speckled mass instead of white/pale blue. The white torso, legs and pale blue hands render correctly. The grid thumbnail of the same character is correct.

In both cases only the costume/fur overlay layer is affected; the underlying minifigure body renders normally. Since the low-detail thumbnail of the same asset renders correctly in the same frame, the asset itself appears fine and the fault looks specific to the material or shader path used for the high-detail preview model.

Minor stuttering during video playback.

**Audio:** on build KytyPS5-2026-09-17-104530e, audio would get stuck and loop the same segment repeatedly. On 5b7d334 this is resolved — audio now plays correctly with no looping.

Note: gameplay was only briefly sampled. This is primarily a multiplayer title, so single-player testing depth is limited and deeper gameplay issues may exist beyond what is reported here.

## Steps to reproduce

1. Launch KytyPS5.
2. Boot LEGO Party.
3. Observe boot through to the main menu.
4. Open the Wardrobe / "My Minifigures" screen.
5. Select a character with a costume or fur layer — e.g. "Peapod Suit Fan" or "Yeti".
6. Compare the large 3D preview model against that same character's grid thumbnail.
7. Start a game to reach gameplay.

## Expected behavior

The large character preview should render costume and fur materials in their correct colours and textures, matching that same character's grid thumbnail — green peapod shell with visible peas, white/pale blue yeti fur. Instead those layers render solid black.

Video playback in menus should also play without stuttering.

Audio: no known issue remaining as of 5b7d334.

## Last working build / first broken build

Audio looping bug present in KytyPS5-2026-09-17-104530e, resolved in KytyPS5-2026-09-18-5b7d334

## Extra notes

This title doesn't appear in the compatibility database yet, so this is a first report for PPSA29141.

Launched through EmulationStation/RetroBat rather than the Kyty launcher, with `--fullscreen --amd-cpu`.

> Source: [KytyPS5 issue #710](https://github.com/KytyPS5/KytyPS5/issues/710)
