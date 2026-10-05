---
title: "Astro's Playroom"
titleId: "PPSA01325"
status: "in-game"
testedVersion: "0.3.0"
testedDate: "2026-10-04"
os: "linux"
hardware: "AMD Ryzen 7 5700X / AMD RX 7800XT / 16GB DDR4 RAM / 16GB VRAM"
---

vkQueueSubmit failed: ErrorDeviceLost (-4), tick=1345396 debug_op=3 debug_submit=37611 args=4,1,0,0,0x0000000500803978
--- Build ---
Official build KytyPS5-2026-10-04-719e025
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in /home/runner/work/KytyPS5/KytyPS5/src/graphics/host_gpu/renderer/commandScheduler.cpp:388

## Steps to reproduce

1. Open KytyPS5
2. Boot ASTRO'S PLAYROOM
3. Finish the controller showcase scene
4. Get to initial tutorial
5. Crash!

## Expected behavior

Continue normal gameplay

## Last working build / first broken build

Remember it being broken but not crashing in an earlier commit, new latest version broke it

## Extra notes

Found a fix, go to the save data, and set <IsCpuTowerActivated>false</IsCpuTowerActivated> (this never gets turned on since the game crashes) to true

> Source: [KytyPS5 issue #1054](https://github.com/KytyPS5/KytyPS5/issues/1054)
