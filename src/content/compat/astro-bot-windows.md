---
title: "ASTRO BOT"
titleId: "PPSA21564"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-08-30-9992ab1"
testedDate: "2026-08-31"
os: "windows"
hardware: "AMD Ryzen 7 5800X / NVIDIA GeForce RTX 5070 Ti 616.56 / 32 GB RAM / 16GB VRAM"
---

ASTRO BOT starts initializing successfully and KytyPS5 begins compiling shaders.

The emulator compiles 19 shaders before crashing in the compute shader recompiler.

The final error is:

ShaderRecompiler CS failed hash=0x503d7f066a496c3c:
unsupported decoded instruction in CFG at pc 0x00002190:
0x00002190: unsupported family=MIMG opcode=0xe6
raw=[0xf1989f07 0x00040505 0x4442413d 0x4543403e 0x00004746]
reason=MIMG opcode is not implemented

in D:\a\KytyPS5\KytyPS5\src\graphics\shader\shader.cpp:162

Before the crash, the log also reports:

Unresolved import stub called: mUuUOWI-C+0[ConvertKeycode_v1][ConvertKeycode_v1.0][Func]

warning: executing wave64 compute shader cs=0x0000000908e6aa00

No main menu or controllable gameplay is reached.

## Steps to reproduce

1. Start KytyPS5.
2. Launch ASTRO BOT (PPSA21564).
3. Wait while the game initializes and shaders begin compiling.
4. KytyPS5 compiles 19 shaders. The emulator crashes with ShaderRecompiler CS failed because MIMG opcode=0xe6 is not implemented.

## Expected behavior

The shader should be successfully recompiled and execution should continue instead of KytyPS5 terminating on the unsupported MIMG instruction.

## Last working build / first broken build

Unknown

> Source: [KytyPS5 issue #426](https://github.com/KytyPS5/KytyPS5/issues/426)
