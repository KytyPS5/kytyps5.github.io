---
title: "MotoGP 23"
titleId: "PPSA10682"
status: "in-game"
testedVersion: "KytyPS5-2026-10-20-7b7f9a7"
testedDate: "2026-09-16"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/4286be6b-c698-4137-ab85-6a7d7fc2a7b7","https://github.com/user-attachments/assets/6cf01323-33f2-41d4-bf71-4d36c7a3bdf2","https://github.com/user-attachments/assets/6d391b05-f7f6-4cd7-b355-9c9c21169480","https://github.com/user-attachments/assets/42649808-f1ec-4ff9-90f3-6a107a57079c","https://github.com/user-attachments/assets/90f35e11-4749-4b65-b4c4-9eb9778086cd","https://github.com/user-attachments/assets/88a35a2a-e34f-48ce-b6de-c0e852b33d7a","https://github.com/user-attachments/assets/274c665b-47df-4a95-8ef4-414580bf243b","https://github.com/user-attachments/assets/7ef5aa61-c8c7-4f69-8642-01ec778b0aed","https://github.com/user-attachments/assets/d5f3575b-4c80-4d7f-a436-832652e03c5f"]
---

gets in game then crashes. no graphical issues in menus. crashes with following error
--- Build ---
Official build KytyPS5-2026-09-16-5b54137
--- Error ---
TextureCache: color target requires rediscovery before final acquisition
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\cache\textureCache.cpp:1410

--- Build ---
Official build KytyPS5-2026-10-19-0cad467
--- Error ---
shader resource tracking: hash=0x7c235a5c14d914ab stage=compute pc=0x000040e4 buffer resource limit exceeded in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:580

--- Build ---
Official build KytyPS5-2026-10-20-7b7f9a7
--- Error ---
shader resource tracking: hash=0x7c235a5c14d914ab stage=compute pc=0x000040e4 buffer resource limit exceeded in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:579

## Steps to reproduce

1. open kytyps5
2. boot game
3. start new game

## Expected behavior

only gets in game in certain game modes in others it crashes with above error.

> Source: [KytyPS5 issue #646](https://github.com/KytyPS5/KytyPS5/issues/646)
