---
title: "Call of Duty: Black Ops II"
titleId: "PPSA34502"
status: "in-game"
testedVersion: "KytyPS5-2026-10-20-f186b35-Windows-x64"
testedDate: "2026-10-20"
os: "windows"
hardware: "13th Gen Intel Core i9-13950HX / NVIDIA GeForce RTX 4060 Laptop GPU, driver 32.0.15.9579 / 31.7 GB / 7.82 GB"
---

Campaign is playable and the world renders correctly, but every animated character
(player arms, enemies, friendly NPCs) renders as corrupted geometry: triangles stretched
to extreme coordinates, fanning out in spikes from the model's position. Static world
geometry, terrain, vehicles and UI are all correct. The corruption tracks characters as
they move.

Performance collapses when corrupted characters are on screen: a locked 60 fps in clean
scenes drops to 19-38 fps, presumably from the rasterized area.

Only skinned geometry is affected, and vertices at extreme coordinates is the signature of
bad bone transforms. Given #931, skinning here presumably also runs as compute shaders
storing through V#s; if those stores land wrong or are read before they complete, this is
the shape of the result. I have not confirmed that by capture, so treat it as a lead
rather than a cause.

Present on f186b35, whose only change over 992a830 was shader-recompiler work
(ShaderRecompiler.cpp, SpirvEmitter.cpp, ResourceTracking.cpp). _PipelineCache was cleared
before testing, ruling out stale pipelines.

Flags tried with no effect: --shader-optimization-type None, --sync-raw-image-buffers true,
--readback-linear-images true, --tessellation, --network-connected true.

Two other findings:

1. --playgo-hack is mandatory for this title. Without it, Zombies and Multiplayer show "The
   game is currently downloading the required data for this game mode." This dump has no
   PlayGo metadata: none of the three candidates in src/loader/systemContent.cpp:603-610
   exist, so PlayGoGetLocus cannot report chunks installed. With the flag
   (playgo_hack chunks = 1000) both menus load.

2. Zombies and Multiplayer lobbies cannot start a match. The Local setup screen shows
   "1 Player (4 Max)" with the profile listed, and simultaneously "Cannot begin the game.
   Minimum 1 players." START MATCH stays greyed and no controller button registers a join.
   Same via LAN Party and Multiplayer. Controller detection is fine (Controller added /
   assigned to player 1 on every launch, including after the mode-switch relaunch into
   codzm.elf), IsPlayerConnected(0) is true, and IsPlayerLoggedIn(0) is hardcoded true.

## Steps to reproduce

1. Launch with --game <PPSA34502-app> --playgo-hack
2. Campaign -> any mission -> look at any character, including your own arms
3. For the lobby issue: Zombies -> Local -> press X to join

## Expected behavior

Characters render as solid skinned meshes. Pressing X in a Local lobby registers player 1.

> Source: [KytyPS5 issue #1752](https://github.com/KytyPS5/KytyPS5/issues/1752)
