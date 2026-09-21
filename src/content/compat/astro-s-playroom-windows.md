---
title: "Astro's Playroom"
titleId: "PPSA01325"
status: "in-game"
testedVersion: "KytyPS5-2026-09-19-8cecaf4 (official build), game version 01.904.000"
testedDate: "2026-09-20"
os: "windows"
hardware: "AMD Ryzen 5 5600 / NVIDIA Geforce RTX 3060, 616.92 / 32 GB RAM / 12 GB VRAM"
---

With a memory patch (see Extra notes) the game boots and reaches controllable
gameplay. No visible rendering artifacts in the intro or in gameplay.

Performance (official build 8cecaf4):
- Cutscenes: ~14-25 FPS, audio lags behind the video.
- First gameplay area (collecting coins): ~8-9 FPS.

Crash: with "Shader validation" enabled in Global settings, the emulator exits
when the player has to pull a cable:

--- Error ---
ShaderRecompiler VS failed hash=0xea0906e528b6d46e: SPIR-V validation failed
 in ...\pipelineCache.cpp:247

With "Shader validation" disabled, the same scene runs on my machine (RTX 3060),
so the recompiler seems to emit SPIR-V that the validator rejects but the
NVIDIA driver accepts. I am not sure which of my builds had which setting
during my first attempts.

## Steps to reproduce

1. Open KytyPS5 (launcher.exe), add the game folder in Global settings and
   enable "Shader validation" in the "Debugging & logs" section.
2. Place the memory patch PPSA01325.json into the _Patches folder (contents in Extra notes).
3. Boot the game and play through the intro.
4. Continue to [your location/level] until the section where the cable has to be pulled.
5. The emulator exits with the VS SPIR-V validation error above.

## Expected behavior

Ray-traced GI is not supported, so I used a GoldHEN-style mods JSON
(process eboot.bin, version 01.904.000) that selects the non-tiled
deferred-lighting renderer and the "GI unavailable" state. The log confirms:

Game cheat: matched eboot.bin with source base 0x10510
Successfully applied cheat: Select the existing non-tiled deferred-lighting renderer
Successfully applied cheat: Select the common GI-unavailable state

Without the patch the game fails earlier on an unimplemented MIMG opcode:
unsupported family=MIMG opcode=0xe6 raw=[0xf1989f07 0x00020e0e 0x1441130a 0x45434442 0x00004746]
pc 0x00001170 (ShaderCFG.cpp:40)

Game is installed on an HDD.

> Source: [KytyPS5 issue #733](https://github.com/KytyPS5/KytyPS5/issues/733)
