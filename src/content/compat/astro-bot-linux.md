---
title: "Astro Bot"
titleId: "PPSA21564"
status: "doesnt-boot"
testedVersion: "Fork build Randomuser8219/KytyPS5 commit 90c08fc (release tag `raytracing`, build date 2026.09.14), prebuilt Linux x86_64"
testedDate: "2026-09-17"
os: "linux"
hardware: "Intel Core Ultra 9 285K (24 threads) / NVIDIA GeForce RTX 5090 (Vulkan) / 64 GB DDR5 / 32 GB VRAM"
---

Boots successfully, renders the logo / opening animation, then the process exits ~30s later. Deterministic: identical PC and fault across 3 separate runs.

```
--- Guest fault context ---
thread: MainThread
rax=00000010100f3699 rbx=0000000000000000 rcx=00000010100f3480 rdx=00000010100f33c8
rsi=00000010100f3370 rdi=000000032fbc2670 rbp=00000000000000ff rsp=0000000326f22ff0
r8 =00000010100f3699 r9 =0000000000000000 r10=000000029d r11=00000010100f4730
r12=0000000000000010 r13=00000010100f33b8 r14=000000000000000b r15=00000010100f3480
code (pc-48 .. pc+48, fault at byte 48):
 b0 02 00 00 c5 f9 fa c1 c5 f9 fe d3 c5 f9 72 f0
 08 c5 e9 72 f2 08 c5 e9 eb ac 24 40 01 00 00 c5
 79 7f ca c5 79 eb fb c5 f9 6f c1 c5 b9 73 dd 08
 66 0f 79 d5 c5 c1 73 dd 0c 66 41 0f 79 e0 66 44
 0f 79 df c5 f9 7f bc 24 90 00 00 00 c5 e9 62 d4
 c5 d9 73 dd 04 66 44 0f 79 d4 c4 41 29 62 d3 c4
--- Error ---
Unhandled host exception: type=2 code=4 pc=0x00000009000082e6 access=0 address=0x0000000000000000
 in /home/runner/work/KytyPS5/KytyPS5/src/loader/runtimeLinker.cpp:843
```

Null read (access=0, address=0) in guest code on the MainThread, fatal. Looks like the same class as #583 (guest null-pointer in a renderer/AGC pipeline-state path) but a different game and a different faulting PC, and fatal here (MainThread) rather than reported on a worker thread.

## Last working build / first broken build

Didn't work at all. Upstream also fails earlier: `shader CFG build failed: unsupported decoded instruction in CFG ... family=MIMG opcode=0xe6`. The raytracing fork gets further (logo + intro animation play) then crashes.

## Extra notes

Tried without effect (same crash at the same PC each time):
- `--playgo-hack`
- `--shader-optimization-type Performance`

Happy to run instrumented builds / call tracing if a maintainer wants specific data (see #583 discussion).

> Source: [KytyPS5 issue #677](https://github.com/KytyPS5/KytyPS5/issues/677)
