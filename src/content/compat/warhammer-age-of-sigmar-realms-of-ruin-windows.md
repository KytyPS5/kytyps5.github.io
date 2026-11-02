---
title: "Warhammer Age of Sigmar Realms of Ruin"
titleId: "PPSA06927"
status: "main-menu"
testedVersion: "KytyPS5-2026-10-19-0cad467"
testedDate: "2026-09-22"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/297b0fc8-6ef1-42e7-b705-1c9c29ce93cb","https://github.com/user-attachments/assets/05d8fa54-1911-4b97-8942-1ea221bd67eb","https://github.com/user-attachments/assets/53f46271-4176-4053-92c6-56ea0130258e","https://github.com/user-attachments/assets/0399e5ed-b157-438c-9267-39daf4f18833","https://github.com/user-attachments/assets/cecc3139-6afd-4d85-b8ff-3ff10b03d7ce","https://github.com/user-attachments/assets/72c9546b-3903-4e79-9743-1e65d6608022","https://github.com/user-attachments/assets/7f8cd810-5fbf-4a57-b747-31526f93a28e","https://github.com/user-attachments/assets/3ba91df4-c6fa-4425-9cf3-3d31aaf22b66","https://github.com/user-attachments/assets/b64dcf01-c1fb-48cc-9717-530b6cf30981"]
---

--- Build ---
Official build KytyPS5-2026-10-12-df5b9b9
--- Error ---
shader resource tracking: hash=0x5abd8c970d631756 stage=compute pc=0x00000d1c GetImageResource dword 0 is not a valid runtime value in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:506

--- Build ---
Official build KytyPS5-2026-10-19-0cad467
--- Error ---
TextureCache: unresolvable equal-address image overlap, address=0x0000081130000000 requested=9x2 cached=11x1 requested_size=0x00000000002c0000 cached_size=0x0000000000160000 type=9/9 tile=9/9
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\cache\textureCache.cpp:872

## Steps to reproduce

1. open kytyps5
2. boot game

## Expected behavior

crashes after main menu

> Source: [KytyPS5 issue #774](https://github.com/KytyPS5/KytyPS5/issues/774)
