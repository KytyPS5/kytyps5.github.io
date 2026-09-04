---
title: "Art of rally"
titleId: "PPSA03686"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-04-040b2b9"
testedDate: "2026-09-04"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
---

Doesn't boot crash with following error
--- Build ---
Official build KytyPS5-2026-09-04-040b2b9
--- Stack Trace ---
[0] 000000014091e206
[1] 000000014091f96e
[2] 000000014091b9bf
[3] 000000014083329e
[4] 00000001407991d8
[5] 0000000140798d18
[6] 00000001407b8110
[7] 00000001407bad59
[8] 00000001407123e0
[9] 0000000140733ded
[10] 00000001407332c4
[11] 000000014072cd82
[12] 0000000140738f6c
--- Error ---
shader resource tracking: hash=0x6b21e6bdf3062cf1 stage=pixel pc=0x000003d0 GetBufferResource dword 0 is not a valid runtime value in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:167

## Steps to reproduce

1. open kytyps5
2. boot game

## Expected behavior

Doesn't boot crash with following error
--- Build ---
Official build KytyPS5-2026-09-04-040b2b9
--- Stack Trace ---
[0] 000000014091e206
[1] 000000014091f96e
[2] 000000014091b9bf
[3] 000000014083329e
[4] 00000001407991d8
[5] 0000000140798d18
[6] 00000001407b8110
[7] 00000001407bad59
[8] 00000001407123e0
[9] 0000000140733ded
[10] 00000001407332c4
[11] 000000014072cd82
[12] 0000000140738f6c
--- Error ---
shader resource tracking: hash=0x6b21e6bdf3062cf1 stage=pixel pc=0x000003d0 GetBufferResource dword 0 is not a valid runtime value in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:167

## Extra notes

will be trying another version later.

> Source: [KytyPS5 issue #481](https://github.com/KytyPS5/KytyPS5/issues/481)
