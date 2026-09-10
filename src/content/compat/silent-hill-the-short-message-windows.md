---
title: "SILENT HILL: The Short Message"
titleId: "PPSA10112"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-09-09-0b4e78c"
testedDate: "2026-09-09"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 (8 GB) / 16GB / 8GB"
---

The game crashes immediately during the loading/initialization phase before displaying any logos or reaching the menu. 

Host exception: Access violation (`3221225477` / `0xC0000005`) at `runtimeLinker.cpp:843` when attempting to access memory address `0x0000000000000004`.

## Steps to reproduce

1. Launch KytyPS5 (build KytyPS5-2026-09-09-0b4e78c).
2. Start SILENT HILL: The Short Message (PPSA10112, v01.000.001).
3. Wait for shaders and modules to load.
4. The emulator crashes with an unhandled host exception.

## Expected behavior

The game should boot and display the opening intro/logos or progress further into the boot sequence.

> Source: [KytyPS5 issue #547](https://github.com/KytyPS5/KytyPS5/issues/547)
