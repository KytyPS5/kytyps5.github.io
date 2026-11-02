---
title: "Two Point Museum"
titleId: "PPSA19769"
status: "main-menu"
testedVersion: "KytyPS5-2026-09-28-8e61798"
testedDate: "2026-09-28"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/9f94dbfd-18bf-4d21-bdf4-19fc24f63564","https://github.com/user-attachments/assets/e8c09060-b756-4417-bf2d-37355b7157be","https://github.com/user-attachments/assets/77566ed7-bb57-46cc-b701-12dc8b67bda8","https://github.com/user-attachments/assets/74076d85-eb74-4ee3-89b6-609328fbeb7b","https://github.com/user-attachments/assets/3392eaed-ad9d-4a69-946e-6442ff45329b"]
---

game reaches main menu then crashes with the following error before reaching in game.
--- Build ---
Official build KytyPS5-2026-09-28-8e61798
--- Error ---
unknown op
        0011c:
        cmd_id = 0000000c
 in D:\a\KytyPS5\KytyPS5\src\graphics\guest_gpu\graphicsRun.cpp:771

--- Build ---
Official build KytyPS5-2026-10-19-0cad467
--- Error ---
unknown op
        0000c:
        cmd_id = c8010002
 in D:\a\KytyPS5\KytyPS5\src\graphics\guest_gpu\graphicsRun.cpp:739

## Steps to reproduce

1. open kytyps5
2. boot game
3. new game

## Expected behavior

game reaches main menu then crashes with error before reaching in game.

> Source: [KytyPS5 issue #897](https://github.com/KytyPS5/KytyPS5/issues/897)
