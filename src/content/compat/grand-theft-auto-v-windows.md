---
title: "Grand Theft Auto V"
titleId: "PPSA04264"
status: "in-game"
testedVersion: "Last Windows test: KytyPS5-2026-10-02-e317465-Windows-x64\nLast Linux test: KytyPS5-2026-10-02-82a2f4a-Linux-x86_64"
testedDate: "2026-09-28"
os: "windows"
hardware: "AMD Ryzen 7 5700 / NVIDIA GEForce RTX 4060 / 32GB RAM 8GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/ffef7907-3166-4f25-b28b-af114cc6582b","https://github.com/user-attachments/assets/4f120354-400c-4229-b221-2c85fe24ae9e","https://github.com/user-attachments/assets/18c8ad68-fe20-4504-9cff-0e4befe0e636"]
---

Windows:
KytyPS5-2026-10-02-82a2f4a-Windows-x64 and above: The game is crashing for me. I cannot get past the prologue. Don't know if this is the emulator or whether it might be a random issue with vm. Last working version was KytyPS5-2026-09-30-bc193f5-Windows-x64.

The game launches, text is glitched, not rendering properly. I set to performance mode. Laggy but its actually working. After prologue is finished, I'm finally in game. I get in the car, start driving and for some reason my tires start going crazy. The tires are nearly detaching from the vehicle. But i can still drive, although i think the handling/feel is off as well.
Performance: 10-20 fps average, more laggy when in open world.

Linux:
The game launches, text is glitched, not rendering properly. I set to performance mode. Overall FPS seems to be more stable and higher than last test. When in the open world, same issue with wacky tires, I can't really progress any further than the initial car chase with Franklin and Lamar yet.
Performance: 20-30fps average during prologue, laggy when finally in open world.

## Steps to reproduce

1. Open KytyPS5
2. Launch the game.
3. Go to settings > display, change mode to performance
4. Start game and play

## Expected behavior

Car tires don't usually jump around

## Last working build / first broken build

In previous builds the game crashed a few seconds after first cutscene starts, only rendering a few laggy frames before crashing.

## Extra notes

I am using a single GPU passthrough VM to run Windows tests. I reduced VM RAM to 28GB

> Source: [KytyPS5 issue #888](https://github.com/KytyPS5/KytyPS5/issues/888)
