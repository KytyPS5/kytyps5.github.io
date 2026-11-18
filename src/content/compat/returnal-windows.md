---
title: "Returnal"
titleId: "PPSA01285"
status: "main-menu"
testedVersion: "0.3.0 b7012cf"
testedDate: "2026-11-18"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/7480ae71-73fd-4e59-ab24-771242935e69","https://github.com/user-attachments/assets/40601004-0a27-4526-a8d8-3965f781dcf3","https://github.com/user-attachments/assets/1610fb1b-c8e0-49f7-8cfd-43d1f5f051f1","https://github.com/user-attachments/assets/137a5c04-d702-417f-9758-7cae2129ea28","https://github.com/user-attachments/assets/52e2cc26-dbfd-4b1f-a596-e04051327cb4","https://github.com/user-attachments/assets/669e8ee6-a87f-416f-9e60-8f00adba1f0c"]
---

Game Boots to the main menu, set the options, then cutscene plays. At the end of the cutscene, device is lost and hard crash.

Unresolved import stub called: yUBESvCCJ4I[Agc_v1][Agc_v1.1][Func]
--- Build ---
Official build KytyPS5-2026-11-18-b7012cf
--- Error ---
vkQueueSubmit failed: ErrorDeviceLost, tick=147963
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:341

## Steps to reproduce

1. Open Translator
2. Boot Game
3. Set options

## Expected behavior

Cutscene would complete without crashing and player takes control.

## Extra notes

Default settings. Skipping cutscene also leads to lost device.

> Source: [KytyPS5 issue #2373](https://github.com/KytyPS5/KytyPS5/issues/2373)
