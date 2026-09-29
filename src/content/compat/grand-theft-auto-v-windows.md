---
title: "Grand Theft Auto V"
titleId: "PPSA04264"
status: "in-game"
testedVersion: "KytyPS5-2026-09-28-0791f92-Windows-x64"
testedDate: "2026-09-28"
os: "windows"
hardware: "AMD Ryzen 7 5700 / NVIDIA GEForce RTX 4060 / 32GB RAM 8GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/11b7f9a9-4c11-485f-be49-edbf5f2ca09e"]
---

The game launches, Text is glitched, not rendering properly. Set to performance mode, start story. Go through the whole prologue, opening the shutter and I actually manage to play the game finally! Shoot all the cops, Trevor runs, escaping through the snow, it fades to black. Then it crashes with error: Buffercache download exceeds 64 MiB staging buffer capacity. Tested multiple times, exact same result. Around 11 minutes of fairly stable gameplay

## Steps to reproduce

1. Open KytyPS5
2. Launch the game.
3. Go to settings > display, change mode to performance
4. Start game and play

## Expected behavior

The fade to black should instead of crashing, transition to the funeral scene, then show the GTA V logo, etc

## Last working build / first broken build

In previous builds the game crashed a few seconds after first cutscene starts, only rendering a few laggy frames before crashing.

## Extra notes

I am using a single GPU passthrough VM to run Windows. (Previous Kyty Linux version runs resulted in crash, so for the new version i decided to use Windows.) I reduced VM RAM to 28GB

> Source: [KytyPS5 issue #888](https://github.com/KytyPS5/KytyPS5/issues/888)
