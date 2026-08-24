---
title: "DRAGON BALL XENOVERSE 2"
titleId: "PPSA08587"
status: "doesnt-boot"
testedVersion: "7ff9e49"
testedDate: "2026-08-08"
os: "windows"
hardware: "AMD Ryzen 5 5600X / NVIDIA GeForce RTX 3070 Ti / 32 GB RAM / 8 GB VRAM"
---

On official unmodified KytyPS5 build 7ff9e49, the game does not reach logo/intro: `main` returns immediately caught by `catchReturnFromMain` due to `scePadOpen` requesting remote control port (`type=16`) with system user ID (`0xFF`).

## Steps to reproduce

1. Boot the game with `--game <dump dir>` on official build 7ff9e49.
2. Process exits silently within a couple of seconds with `return from main = 0`.

## Expected behavior

The game should boot, initialize controllers, and reach the title screen and main menu.

> Source: [KytyPS5 issue #214](https://github.com/KytyPS5/KytyPS5/issues/214)
