---
title: "Gran Turismo 7"
titleId: "PPSA01316"
status: "logo"
testedVersion: "Release, clang-lld, f90a8b1"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 6900HX / NVIDIA GeForce RTX 3070 Ti Laptop GPU / 32 GB DDR5 / 8GB Vram"
---

The game tries network connection, shows an error, the loads into the Logo Intro, after a few moments the game crashes

## Steps to reproduce

> ./launcher
> choose the game from the list
> start it
> get a PSN error dialogue
> get a slowed down version of PS Studio Logo

## Expected behavior

No known issue, the game wasn't bootable on d3d7bd3 so this behaviour is new

## Last working build / first broken build

N/A

> Source: [KytyPS5 issue #1930](https://github.com/KytyPS5/KytyPS5/issues/1930)
