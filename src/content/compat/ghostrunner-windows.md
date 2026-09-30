---
title: "Ghostrunner"
titleId: "PPSA03685"
status: "main-menu"
testedVersion: "KytyPS5-2026-09-29-6799ecb"
testedDate: "2026-09-04"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/ad26dd09-0301-47f7-9479-35f96d723351","https://github.com/user-attachments/assets/7ff175fa-0e79-478a-8639-5f79cf25ab0e","https://github.com/user-attachments/assets/6a9aa9f0-f8f9-4d80-8036-b43061fbebf7"]
---

Crashes before logos finish with the following error
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=5272 debug_op=0 debug_submit=280 args=8,1,1,65,0x0000000906f50e00
--- Build ---
Official build KytyPS5-2026-09-04-040b2b9
--- Stack Trace ---
[0] 0000000140b84d22
[1] 000000014076e84b
[2] 000000014076f044
[3] 0000000140743e82
[4] 0000000140743be7
[5] 000000014075062d
[6] 0000000140745dea
[7] 0000000140b51d37
[8] 0000000140b89472
[9] 00007ffde9226896
[10] 00007ffde9225c66
[11] 00007ffde93443fe
[12] 0000000140929890
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

reaches main menu the crashes instantly
--- Build ---
Official build KytyPS5-2026-09-29-6799ecb
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\masterSemaphore.cpp:53

## Steps to reproduce

1. open kytyps5
2. boot game

## Expected behavior

Crashes before logos finish with the following error
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=5272 debug_op=0 debug_submit=280 args=8,1,1,65,0x0000000906f50e00
--- Build ---
Official build KytyPS5-2026-09-04-040b2b9
--- Stack Trace ---
[0] 0000000140b84d22
[1] 000000014076e84b
[2] 000000014076f044
[3] 0000000140743e82
[4] 0000000140743be7
[5] 000000014075062d
[6] 0000000140745dea
[7] 0000000140b51d37
[8] 0000000140b89472
[9] 00007ffde9226896
[10] 00007ffde9225c66
[11] 00007ffde93443fe
[12] 0000000140929890
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

reaches main menu the crashes instantly
--- Build ---
Official build KytyPS5-2026-09-29-6799ecb
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\masterSemaphore.cpp:53

## Extra notes

crashes gpu driver as soon as it reaches the main menu. unable to add screenshot.

> Source: [KytyPS5 issue #480](https://github.com/KytyPS5/KytyPS5/issues/480)
