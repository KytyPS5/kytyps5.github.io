---
title: "NASCAR Arcade Rush (v01.001)"
titleId: "PPSA13790"
status: "logo"
testedVersion: "KytyPS5-2026-08-28-c52bf45"
testedDate: "2026-08-28"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/13015979-f6b8-4929-9c57-aec83d63d9da","https://github.com/user-attachments/assets/9498c9c5-b1e9-4a3c-be94-11693b60a6b3","https://github.com/user-attachments/assets/f6fd1abb-5e5a-4b9d-bcfe-76343c40621d","https://github.com/user-attachments/assets/4bc0441c-7704-46c3-91f7-799b58f9cdb5","https://github.com/user-attachments/assets/925b2216-c305-44a0-a7ad-b6c32b1a0b87","https://github.com/user-attachments/assets/fb1f175f-f519-4d05-83e2-dc23f77cad9a","https://github.com/user-attachments/assets/1a2fb89d-be56-46ae-bc17-2115e328c6cd","https://github.com/user-attachments/assets/ff00b5e0-6be6-477e-b55b-b149a935e120"]
---

Tested on KytyPS5-2026-08-28-c52bf45 and KytyPS5-2026-08-27-ade32e7. The logos play game crashes before entering menus with the following error on build KytyPS5-2026-08-28-c52bf45. The menus somewhat work in  KytyPS5-2026-08-27-ade32e7, you can select race and driver but no game play. Graphical issues in menus.
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=36895 debug_op=3 debug_submit=21232 args=4,1,0,0,0x0000001e414ee500
--- Build ---
Official build KytyPS5-2026-08-28-c52bf45
--- Stack Trace ---
[0] 0000000140b758f2
[1] 000000014077028b
[2] 00000001407160d5
[3] 00000001407155f0
[4] 0000000140735970
[5] 0000000140734e44
[6] 000000014072dcf6
[7] 000000014073adbc
[8] 00007ffa12efcd30
[9] 00007ffa1497ccb7
[10] 00007ffa157cad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

## Steps to reproduce

1.open kytyps5
2.boot game

## Expected behavior

The logos play game crashes before entering menus with the following error.
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=36895 debug_op=3 debug_submit=21232 args=4,1,0,0,0x0000001e414ee500
--- Build ---
Official build KytyPS5-2026-08-28-c52bf45
--- Stack Trace ---
[0] 0000000140b758f2
[1] 000000014077028b
[2] 00000001407160d5
[3] 00000001407155f0
[4] 0000000140735970
[5] 0000000140734e44
[6] 000000014072dcf6
[7] 000000014073adbc
[8] 00007ffa12efcd30
[9] 00007ffa1497ccb7
[10] 00007ffa157cad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

## Last working build / first broken build

last worked in KytyPS5-2026-08-27-ade32e7 first broken build KytyPS5-2026-08-28-c52bf45

> Source: [KytyPS5 issue #355](https://github.com/KytyPS5/KytyPS5/issues/355)
