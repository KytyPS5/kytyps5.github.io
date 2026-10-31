---
title: "Scott Pilgrim EX"
titleId: "PPSA28238"
status: "doesnt-boot"
testedVersion: "Official build: KytyPS5-2026-10-29-5e837a9"
testedDate: "2026-10-29"
os: "windows"
hardware: "Intel Core Ultra 7 265F / NVIDIA GeForce RTX 5060 Ti, driver 610.60 / 16 GB / 8 GB"
---

On the official build above, the game stopped during startup with a Windows placeholder memory split failure while unmapping a guest range of 0x800A0 bytes. Recovery then failed while trying to coalesce the placeholder range.

With a local fix that rounds KernelMunmap lengths up to the 16 KiB guest page size, the game booted. I started a new game and played through to the end at about 60 FPS, with no visible graphics or audio issues.

## Steps to reproduce

Start KytyPS5 build KytyPS5-2026-10-29-5e837a9.

Boot Scott Pilgrim EX, game ID PPSA28238, version 03.000.000.

Observe the placeholder split/unmap failure during startup.

## Expected behavior

The game should boot into gameplay without a guest placeholder split or recovery failure.

> Source: [KytyPS5 issue #1971](https://github.com/KytyPS5/KytyPS5/issues/1971)
