---
title: "Sniper Ghost Warrior Contracts 2"
titleId: "PPSA03131"
status: "main-menu"
testedVersion: "KytyPS5-2026-09-03-c2189de"
testedDate: "2026-09-04"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/0f11d79f-31f3-4782-8dfa-737c84997819","https://github.com/user-attachments/assets/0fda5247-1cae-4320-880a-dcd356de31b3","https://github.com/user-attachments/assets/84168e7a-1189-408d-bddf-d0bc128ab40c","https://github.com/user-attachments/assets/df983474-c447-4ec8-892a-01eb0ada38ae","https://github.com/user-attachments/assets/8b0800d1-25ee-408a-a347-0402b2e7786d","https://github.com/user-attachments/assets/fe2b8ed9-614a-4637-b016-3789baad5a30","https://github.com/user-attachments/assets/16928e6d-159a-458a-b896-bef8b24a406b"]
---

when game boots and plays intro the screen goes green and stays green for most of the menus where 3d graphics are present. once you load into to menus you can select missions on a map which is 2d and load in without issues. then when the game starts the audio plays but the screen stays black and crashes with the following error
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=7782 debug_op=0 debug_submit=0 args=0,0,0,0,0x0000000000000000
--- Build ---
Official build KytyPS5-2026-09-03-c2189de
--- Stack Trace ---
[0] 0000000140b84962
[1] 000000014076e80b
[2] 00000001407fa21b
[3] 00000001407f32df
[4] 00007ffde6cecd30
[5] 00007ffde80dccb7
[6] 00007ffde928ad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=34979 debug_op=8 debug_submit=7403 args=1,2,1,0,0x0000000000001ce7
--- Build ---
Official build KytyPS5-2026-09-03-c2189de
--- Stack Trace ---
[0] 0000000140b84962
[1] 000000014076e80b
[2] 000000014076f004
[3] 0000000140743e82
[4] 0000000140743be7
[5] 000000014075062d
[6] 0000000140739022
[7] 000000014072c986
[8] 0000000140738f6c
[9] 00007ffde6cecd30
[10] 00007ffde80dccb7
[11] 00007ffde928ad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

## Steps to reproduce

1. open kytyps5
2. boot game
3. start new game

## Expected behavior

when game boots and plays intro the screen goes green and stays green for most of the menus where 3d graphics are present. once you load into to menus you can select missions on a map which is 2d and load in without issues. then when the game starts the audio plays but the screen stays black and crashes with the following error
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=7782 debug_op=0 debug_submit=0 args=0,0,0,0,0x0000000000000000
--- Build ---
Official build KytyPS5-2026-09-03-c2189de
--- Stack Trace ---
[0] 0000000140b84962
[1] 000000014076e80b
[2] 00000001407fa21b
[3] 00000001407f32df
[4] 00007ffde6cecd30
[5] 00007ffde80dccb7
[6] 00007ffde928ad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=34979 debug_op=8 debug_submit=7403 args=1,2,1,0,0x0000000000001ce7
--- Build ---
Official build KytyPS5-2026-09-03-c2189de
--- Stack Trace ---
[0] 0000000140b84962
[1] 000000014076e80b
[2] 000000014076f004
[3] 0000000140743e82
[4] 0000000140743be7
[5] 000000014075062d
[6] 0000000140739022
[7] 000000014072c986
[8] 0000000140738f6c
[9] 00007ffde6cecd30
[10] 00007ffde80dccb7
[11] 00007ffde928ad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

> Source: [KytyPS5 issue #479](https://github.com/KytyPS5/KytyPS5/issues/479)
