---
title: "Demon's Souls"
titleId: "PPSA01342"
status: "doesnt-boot"
testedVersion: "Official build KytyPS5-2026-09-26-f1f930e"
testedDate: "2026-09-26"
os: "windows"
hardware: "AMD Ryzen 5 9800X3D / AMD Radeon RX 9070 XT / 48 GB DDR5 RAM, 16 GB VRAM"
---

Game crashes during the initial shader compilation pass, before reaching the title screen. Fails while compiling compute shaders (crash occurs partway through, at CS index 95 out of the batch shown in the log).

Error Log:
shader resource tracking: hash=0xfb0becc9db83db77 stage=compute pc=0x00001044 GetImageResource dword 0 is not a valid runtime value in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ir\passes\ResourceTracking.cpp:168

## Steps to reproduce

1. Boot Demon's Souls (PPSA01342) on the above build
2. Let shader compilation proceed
3. Crash occurs during compute shader compilation

## Expected behavior

The shaders should complete compilation.

## Extra notes

This looks related to the broader class of resource-tracking failures currently affecting other titles (e.g. issues #507 and #548 for GTA V, #824 for Killzone: Liberation) on recent builds — the tracker's ValidateRuntimeValue/similar logic appears unable to statically resolve certain dynamically-indexed image/buffer descriptors. This report is for the GetImageResource (rather than GetBufferResource) variant of the same crash, on a title that doesn't yet appear to have a tracked issue.

> Source: [KytyPS5 issue #855](https://github.com/KytyPS5/KytyPS5/issues/855)
