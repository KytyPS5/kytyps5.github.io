---
title: "Grand Theft Auto III – The Definitive Edition"
titleId: "PPSA03527"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-08-09-d7063d0"
testedDate: "2026-08-10"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 / 16 GB RAM"
---

The game fails to boot and crashes in the runtime linker with a null pointer dereference access violation:

Error: Access violation: Write [0000000000000000] in runtimeLinker.cpp:1031

## Steps to reproduce

1. Open KytyPS5.
2. Boot Grand Theft Auto III – The Definitive Edition (PPSA03527).
3. Observe immediate crash in runtimeLinker.

## Expected behavior

The runtime linker should properly resolve dynamic libraries and link the executable without triggering an access violation.

## Last working build / first broken build

Unknown

## Extra notes

Tested on official build KytyPS5-2026-08-09-d7063d0. App version: 01.003.000 (FW 4.03).

> Source: [KytyPS5 issue #225](https://github.com/KytyPS5/KytyPS5/issues/225)
