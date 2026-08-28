---
title: "LEGO 2K Drive"
titleId: "PPSA04048"
status: "logo"
testedVersion: "KytyPS5-2026-08-28-c52bf45"
testedDate: "2026-08-28"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/9c707ed0-6cec-4db5-8155-8f6f2c2e3ea0","https://github.com/user-attachments/assets/0ce4f4d5-7e06-49a1-94d2-8839d4967c97","https://github.com/user-attachments/assets/42988f95-9870-4a18-923c-3dd4beaab072","https://github.com/user-attachments/assets/2cc7a4e7-e68f-4ab8-b4b5-87169ef221fb"]
---

tested on KytyPS5-2026-08-28-c52bf45 and KytyPS5-2026-08-27-ade32e7 logos and promo ends. before getting to main menu the game crashes with the following error
--- Error ---
ShaderRecompiler CS failed hash=0xac148c996d7ee431: unsupported decoded instruction in CFG at pc 0x000003ec: 0x000003ec: unsupported family=VOP1 opcode=0x37 raw=[0x7e066ef9 0x00061400] reason=VOP1 SDWA destination selector is not supported
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162
Log file attached from KytyPS5-2026-08-28-c52bf45

## Steps to reproduce

1.open kytyps5
2.boot game

## Expected behavior

tested on KytyPS5-2026-08-28-c52bf45 and KytyPS5-2026-08-27-ade32e7 logos and promo ends. before getting to main menu the game crashes with the following error
--- Error ---
ShaderRecompiler CS failed hash=0xac148c996d7ee431: unsupported decoded instruction in CFG at pc 0x000003ec: 0x000003ec: unsupported family=VOP1 opcode=0x37 raw=[0x7e066ef9 0x00061400] reason=VOP1 SDWA destination selector is not supported
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162
crashes after "There is a problem with your connection to out online services." screen

> Source: [KytyPS5 issue #349](https://github.com/KytyPS5/KytyPS5/issues/349)
