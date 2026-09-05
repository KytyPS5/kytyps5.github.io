---
title: "Tour de France 2023"
titleId: "PPSA14198"
status: "in-game"
testedVersion: "KytyPS5-2026-09-04-d96d0ee"
testedDate: "2026-09-04"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/1205b1ab-af80-4d4e-b622-2c6c9752a22d","https://github.com/user-attachments/assets/7e1795dd-b511-4b8a-8e6e-e7d0905b9b53","https://github.com/user-attachments/assets/3710ba2c-26b1-4e2c-98be-547daa2e735c","https://github.com/user-attachments/assets/53323dca-96bd-40a5-8172-d654933b74e6","https://github.com/user-attachments/assets/7b3abb73-34e3-42b9-b33c-636bc73fde94","https://github.com/user-attachments/assets/73e4bb20-9523-49cd-8a95-45267fe47c48","https://github.com/user-attachments/assets/65c0566c-89c1-412a-84d6-54aa535e7e6f","https://github.com/user-attachments/assets/54e7869e-f8d4-4202-afcb-c9ccc71dc0bc","https://github.com/user-attachments/assets/a5dd9bbe-1a69-49a9-9e6b-4d88c2bc450c","https://github.com/user-attachments/assets/f5492113-d6f8-4b19-acab-7ab8be755782"]
---

Menus have some graphical issue but gets into game crashes after a few minutes of gameplay with the following error in time attack event
--- Build ---
Official build KytyPS5-2026-09-04-d96d0ee
--- Stack Trace ---
[0] 000000014074ab43
[1] 0000000140732efc
[2] 0000000140711d0b
[3] 0000000140733d3d
[4] 0000000140733214
[5] 000000014072ccd2
[6] 0000000140738ebc
[7] 00007ffe089fcd30
[8] 00007ffe091fccb7
[9] 00007ffe0b56ad6c
--- Error ---
BufferCache: GDS fill range is out of bounds
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\cache\bufferCache.cpp:570

does not get ingame in team race event crashes with following error
Unresolved import stub called: NLW0QcvJY-E[Ces_v1][Ces_v1.1][Func]
Unresolved import stub called: NLW0QcvJY-E[Ces_v1][Ces_v1.1][Func]
shader resource specialization failed: sampled image descriptor 1 uses unsupported format 16
--- Build ---
Official build KytyPS5-2026-09-04-d96d0ee
--- Stack Trace ---
[0] 0000000140b85aa2
[1] 0000000140798c25
[2] 0000000140798a38
[3] 00000001407b7e20
[4] 00000001407b6c92
[5] 0000000140734832
[6] 0000000140711f0c
[7] 0000000140733d3d
[8] 0000000140733214
[9] 000000014072ccd2
[10] 0000000140738ebc
[11] 00007ffe089fcd30
[12] 00007ffe091fccb7
--- Fatal Error ---
Error: condition (!ShaderRecompiler::IR::MaterializeResources( entry->second.resource_plan, runtime, resources, specialization)) is true in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\pipelineCache.cpp:299
 
in build KytyPS5-2026-09-04-040b2b9 the team event boots you can play for a second or two the it crashes with error
--- Build ---
Official build KytyPS5-2026-09-04-040b2b9
--- Stack Trace ---
[0] 000000014078b5f8
[1] 000000014078f44e
[2] 0000000140791b03
[3] 00000001407b150c
[4] 00000001407b7072
[5] 00000001407348e2
[6] 0000000140711fbc
[7] 0000000140733ded
[8] 00000001407332c4
[9] 000000014072cd82
[10] 0000000140738f6c
[11] 00007ffe089fcd30
[12] 00007ffe091fccb7
--- Error ---
unsupported texture mip view: base=15 last=3 levels=5 max=4 type=8 tile=31 class=1 numeric=1 dimension=1 mip_mode=0 read=1 written=0 dwords=00000080,0a000500,00000080,87f3f144,0000008a,622c0244,0000008b,00030018
 in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:715

## Steps to reproduce

1. open kytyps5
2. boot game
3. start a race

> Source: [KytyPS5 issue #485](https://github.com/KytyPS5/KytyPS5/issues/485)
