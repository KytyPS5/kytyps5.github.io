---
title: "Construction Simulator Gold Edition"
titleId: "PPSA04379"
status: "main-menu"
testedVersion: "KytyPS5-2026-09-08-d285efe"
testedDate: "2026-08-28"
os: "windows"
hardware: "AMD Ryzen 7 7840hs / Nvidia RTX 4050 / 16GB DDR5 RAM/ 6GB GDDR6 VRAM"
trusted: true
---

loads to character creator then crashes

## Steps to reproduce

1. start Kytyps5
2. boot the game
3. start a new game

## Expected behavior

loads to character creator then crashes with following error
--- Error ---
ShaderRecompiler PS failed hash=0x00000000aa6b499c: unsupported decoded instruction in CFG at pc 0x000010bc: 0x000010bc: unsupported family=VOP3 opcode=0xe2 raw=[0xd4e2006a 0x0000d47e] reason=VOP3 opcode is not implemented
 in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162

after the KytyPS5-2026-09-03-c2189de version the game no longer has the above error but has the following error
vkQueueSubmit failed: ErrorDeviceLost (-4), tick=851333 debug_op=3 debug_submit=39605 args=4,1,0,0,0x00000002189903a0
--- Build ---
Official build KytyPS5-2026-09-03-c2189de
--- Stack Trace ---
[0] 0000000140b84962
[1] 000000014076e80b
[2] 00000001407158f5
[3] 0000000140714e10
[4] 0000000140733ded
[5] 00000001407332c4
[6] 000000014072cd82
[7] 0000000140738f6c
[8] 00007ffde6cecd30
[9] 00007ffde80dccb7
[10] 00007ffde928ad6c
--- Fatal Error ---
Not implemented (result != vk::Result::eSuccess) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\commandScheduler.cpp:410

> Source: [KytyPS5 issue #328](https://github.com/KytyPS5/KytyPS5/issues/328)
