---
title: "Borderlands 4"
titleId: "PPSA01494"
status: "logo"
testedVersion: "v0.1.5"
testedDate: "2026-11-26"
os: "windows"
hardware: "i5 12500 / AMD RX 9060 XT 16gb / 32 gb ddr4/ 16gb"
---

crashes before the menu loads

## Steps to reproduce

1. Launch `KytyPS5-2026-11-25-3057d08` on Windows (with a clean or existing `_PipelineCache` folder).
2. Select and boot Borderlands 4 (`PPSA01494`) via `eboot.bin`.
3. Wait for the initial shader compilation to finish (~780+ shaders: VS 100, PS 158, CS 450, GS 81).
4. The emulator immediately crashes with an Access Violation (`0xC0000005`) at `pc=0x0000000905975bcb` in a background worker thread before reaching the intro/menu.

## Expected behavior

The game should proceed past shader compilation and initialize the intro videos / main menu without crashing on a NULL pointer dereference in the background worker thread.

> Source: [KytyPS5 issue #2566](https://github.com/KytyPS5/KytyPS5/issues/2566)
