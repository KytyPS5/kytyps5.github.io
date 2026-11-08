---
title: "Teardown"
titleId: "PPSA15246"
status: "in-game"
testedVersion: "KytyPS5-2026-11-06-182161e"
testedDate: "2026-11-07"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/613f8861-12c2-4a75-8822-7c3675d4e44c","https://github.com/user-attachments/assets/eb0aff83-c585-43da-bc6e-e150a790180c","https://github.com/user-attachments/assets/32b731aa-57bf-4b4f-b921-f169ec8e5130","https://github.com/user-attachments/assets/f0055063-995d-4312-a3d7-009057e59b7f","https://github.com/user-attachments/assets/5d808b53-7c3e-484c-8dc2-760fd5a2a131","https://github.com/user-attachments/assets/3544ae9f-2cc4-4935-964f-b7caffd30202"]
---

Teardown game.. 

It's good enough. It has some performance issues; the player has trouble loading all the body parts...


**There are also a few errors like this:**
```
Example filename: /app0/RAW:data/level/menu/script/avatarui/resources/lockicon.png
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/common/box-solid-10.png
FileSystem: Windows-incompatible guest filename: /app0/RAW:data/ui/common/box-solid-10.png.tde
```

**An unresolved import stub called:** 
`IXmfUaze9So[NpCommerce_v1][NpCommerce_v1.1][Func]`


**--- Error ---**
```
TextureCache: unresolvable equal-address image overlap, address=0x000000024dcb4000 requested=3x1 cached=3x1 requested_size=0x0000000000002000 cached_size=0x0000000000001000 type=10/10 tile=5/5
 in D:/Progetti/KytyPS5/src/graphics/host_gpu/renderer/cache/textureCache.cpp:844
```

## Steps to reproduce

1) Launch the game from Kyty
2) The first file system errors will appear.
3) From the main menu, open the mod shop. An “unresolved import” error will appear.
4) From the main menu, open the character selection screen and notice that the characters do not appear fully—some parts are not rendered (the parts vary, but they are usually the legs or arms).
5) Play the game; you’ll see errors affecting the player, and after a while, the game will crash.

## Expected behavior

Player is complete (no missing body parts).
No sudden crashes.
No filesystem errors 
or issues with unresolved imports.

> Source: [KytyPS5 issue #2144](https://github.com/KytyPS5/KytyPS5/issues/2144)
