---
title: "Teardown"
titleId: "PPSA15246"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-08-09-d7063d0"
testedDate: "2026-08-10"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 / 16 GB RAM"
---

The game crashes with an error in the GPU texture cache subsystem during rendering/initialization:

Error: TextureCache: compressed video-out read requires clean native GPU contents in textureCache.cpp:1248

## Steps to reproduce

1. Open KytyPS5.
2. Boot Teardown (PPSA15246).
3. Observe crash in textureCache.cpp.

## Expected behavior

The texture cache should properly synchronize/flush compressed video-out buffers without raising an assertion error.

## Last working build / first broken build

Unknown

## Extra notes

Tested on official build KytyPS5-2026-08-09-d7063d0. App version: 01.006.000 (FW 10.01).

> Source: [KytyPS5 issue #226](https://github.com/KytyPS5/KytyPS5/issues/226)
