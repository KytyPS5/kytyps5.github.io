---
title: "Planet Coaster"
titleId: "PPSA01736"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-28-c52bf45"
testedDate: "2026-08-29"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/499d9b88-38f2-486f-bcd6-aeed0b422f84","https://github.com/user-attachments/assets/270364d7-5798-45fa-9055-b9adbc1ede07","https://github.com/user-attachments/assets/cd5110d6-17ef-49d0-a417-270bd2436f0a"]
---

Tested on KytyPS5-2026-08-28-c52bf45 and KytyPS5-2026-08-27-ade32e7. in both, Main menu loads with severe graphical issues crashes when trying to load game.
unsupported texture mip view: base=9 last=9 levels=9 max=8 type=13 tile=9 kind=10 dimension=3 mip_mode=0 read=1 written=0 dwords=d83f0000,c4b00000,003fc03f,d0999fac,00000000,00700080,00000000,00000000
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:729

## Steps to reproduce

1. open kytyps5
2. boot game

## Expected behavior

Tested on KytyPS5-2026-08-28-c52bf45 and KytyPS5-2026-08-27-ade32e7. in both, Main menu loads with severe graphical issues crashes when trying to load game. 
unsupported texture mip view: base=9 last=9 levels=9 max=8 type=13 tile=9 kind=10 dimension=3 mip_mode=0 read=1 written=0 dwords=d83f0000,c4b00000,003fc03f,d0999fac,00000000,00700080,00000000,00000000
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:729

> Source: [KytyPS5 issue #382](https://github.com/KytyPS5/KytyPS5/issues/382)
