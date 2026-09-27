---
title: "Resident Evil 2"
titleId: "PPSA04288"
status: "logo"
testedVersion: "Custom local build based on commit 7e1c2d1, with additional compatibility fixes."
testedDate: "2026-09-25"
os: "windows"
hardware: "Intel Core i5-12450H / NVIDIA GeForce RTX 3050 6GB Laptop GPU Windows driver version: 32.0.16.1714 / RAM: [ 16GB ] VRAM: 6 GB"
---

I managed to boot Resident Evil 2 (PPSA04288) and reach the opening cinematic using a modified KytyPS5 build.

The cinematic renders and subtitles are readable, but the 3D graphics are severely corrupted, with stretched geometry and large distorted triangles. Performance during the observed cinematic was approximately 11–17 FPS.

An earlier crash associated with skipping the cinematic reported an equal-address texture-cache overlap. A depth-image layout fix allowed the game to progress beyond that error. A later run stopped with a different pixel-shader resource-tracking error:

Shader hash: 0x4dca9395f0d319e7
Stage: pixel
PC: 0x00000174
GetImageResource dword 0 is not a valid runtime value

Stable gameplay has not been achieved.

## Steps to reproduce

1. Launch the modified build based on commit 7e1c2d1.
2. Boot Resident Evil 2, PPSA04288, version 01.000.002.
3. Complete the initial settings if prompted.
4. Wait for the opening cinematic.
5. Observe the stretched geometry and graphical corruption.
6. Continue or attempt to skip the cinematic and check the resulting log.

The attached results apply to the modified build. Vulkan validation and shader validation were enabled during the diagnostic run.

## Expected behavior

The opening cinematic should render correctly, without stretched geometry. Skipping it should transition to the next scene without crashing.

## Last working build / first broken build

Unknown. These results were obtained using a modified local build, not the unmodified release.

> Source: [KytyPS5 issue #832](https://github.com/KytyPS5/KytyPS5/issues/832)
