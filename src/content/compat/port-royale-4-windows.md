---
title: "Port Royale 4"
titleId: "PPSA02815"
status: "in-game"
testedVersion: "KytyPS5-2026-09-18-5b7d334-Windows-x64"
testedDate: "2026-09-19"
os: "windows"
hardware: "AMD Ryzen 7 7800X3D 8-Core / NVIDIA GeForce RTX 3070, driver 32.0.16.1074 / 24 GB DDR5 RAM (16+8, asymmetrical) / 8 GB VRAM"
---

Loads and runs. The intro video plays, a new game can be started, and the campaign map is reached and is controllable — playable.

**Graphics: no issues observed.** Video playback picture quality is perfect throughout.

**Audio: clipping / scratching artifacts, but only during cutscenes.** In-game audio is clean. The defect is confined to the audio accompanying video playback; general gameplay audio has no problems.

For contrast on the same build: Tetris Forever (PPSA25646) is wall-to-wall documentary video with audio and has no audio artifacts at all. So this does not appear to affect all video playback, and something about this title's video or audio codec may differ.

**Not tested:** the fully 3D town/port view was not reached in this session, so that part of the renderer is unverified. Short test session only.

## Steps to reproduce

1. Launch KytyPS5.
2. Boot Port Royale 4.
3. Let the intro video play — audio clipping/scratching is audible here.
4. Start a new game.
5. Arrive at the campaign map. Gameplay is controllable from this point.
6. Compare audio during any cutscene against audio during normal gameplay — the artifacts occur only in the former.

## Expected behavior

Cutscene audio should play cleanly, the way in-game audio already does. Instead it clips and scratches whenever video is playing.

No known issue with graphics, loading or gameplay.

## Extra notes

Not in the compatibility database — first report for PPSA02815.

Launched through EmulationStation/RetroBat rather than the Kyty launcher, with `--fullscreen --amd-cpu`.

> Source: [KytyPS5 issue #711](https://github.com/KytyPS5/KytyPS5/issues/711)
