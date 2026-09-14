---
title: "Lost Judgment"
titleId: "PPSA03775"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-12-d3d7bd3-Linux"
testedDate: "2026-09-12"
os: "linux"
hardware: "AMD Ryzen 9 6900HX / NVIDIA GeForce RTX 3070 Ti Laptop GPU / 32 GB DDR5 / 8GB Vram"
screenshots: ["https://github.com/user-attachments/assets/d2b6e8ae-9a53-409c-823c-fd4975aea1a3"]
---

Black screen, game doesn't boot

Official build KytyPS5-2026-09-12-d3d7bd3
--- Error ---
shader CFG build failed: unsupported decoded instruction in CFG at pc 0x000078bc: 0x000078bc: unsupported family=VOP1 opcode=0x01 raw=[0x7e0202f9 0x00861280] reason=VOP1 SDWA destination selector is not supported in /home/runner/work/KytyPS5/KytyPS5/src/graphics/shader/recompiler/frontend/cfg/ShaderCFG.cpp:40

## Steps to reproduce

1. sudo ./launcher
2. attempt to boot the game
3. process craches

## Expected behavior

No expect behaviour at this stage

> Source: [KytyPS5 issue #592](https://github.com/KytyPS5/KytyPS5/issues/592)
