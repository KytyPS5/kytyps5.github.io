---
title: "FINAL FANTASY RESONANCE"
titleId: "PPSA31544"
status: "doesnt-boot"
testedVersion: "Official build KytyPS5-2026-10-23-9dcff95 (Windows x64). Also reproduced on the Jetsku fork U59 (fork build 106c9a8) with the identical guest fault."
testedDate: "2026-10-23"
os: "windows"
hardware: "Intel Core i9-13900K / AMD Radeon RX 9070 XT, driver 26.9.2 (LLPC), Vulkan 1.4.355 / 64 GB / 16 GB"
---

Deterministic boot crash, 100% reproducible. The emulator finishes graphics/audio initialization and the eboot CPU-compatibility patching, then the guest MainThread dereferences a null structure field (+0x18) right at module start (a "[Emo]  Start =" string is visible on the guest stack) and the process terminates:
Unhandled host exception: code 3221225477 (0xC0000005), access=1 (write), address 0x0000000000000018
Guest pc is identical on both builds: 0x000000091000450d
Reported from src/loader/runtimeLinker.cpp:715 (official build) and :944 (Jetsku fork)
Already ruled out on my side:
A fresh, clean re-extract of the game files produces a byte-identical crash (same guest pc, same faulting code bytes).
Other PS5 titles boot fine on the same machine and build.
The crash is fully deterministic, not environment-dependent.
My guess: this day-one title is built against the latest PS5 SDK, and something it requests during early module initialization currently returns null.

## Steps to reproduce

1.Boot PPSA31544 with the official 2026-10-23 build.
2.The emulator initializes and patches eboot.bin.
3.The process terminates with the unhandled host exception before any video output.

## Expected behavior

The game should proceed past module loading.

## Last working build / first broken build

Never worked. The game was released on 2026-10-22 and was only tested on release-week builds.

## Extra notes

Guest fault context (official build):
--- Guest fault context ---
thread: MainThread
rax=0000000000000002 rbx=0000000000000000 rcx=fffffff81020d670 rdx=0000000000000000
rsi=0000000000000000 rdi=0000000000000000 rbp=00000007efdf2980 rsp=00000007efdf2950
r8 =7efefefefefefeff r9 =7efefeff3c3c3c1f r10=0000000900b6cbfe r11=8101010101010100
r12=000001007ac8fd00 r13=000001007ac8fda0 r14=00000007efdf2990 r15=0000000140cefff0
--- Build ---
Official build KytyPS5-2026-10-23-9dcff95
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x000000091000450d access=1 address=0x0000000000000018
 in src/loader/runtimeLinker.cpp:715
Happy to test newer builds or provide more logs if needed.

> Source: [KytyPS5 issue #1859](https://github.com/KytyPS5/KytyPS5/issues/1859)
