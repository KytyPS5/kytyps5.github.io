---
title: "Marvel's Spider-Man Remastered"
titleId: "PPSA01467"
status: "logo"
testedVersion: "Build df5b9b9 Windows x64"
testedDate: "2026-10-14"
os: "windows"
hardware: "Intel(R) Core(TM) Ultra 7 265K / NVIDIA GeForce RTX 5050 (8 Go) / 32 GB DDR5 RAM / 8 GB VRAM"
---

Crashes after Sony's boot cinematic.

## Steps to reproduce

1. Open KytyPS5
2. Boot the game

## Expected behavior

The game should boot up to Menu

## Extra notes

Some Errors : 

AMD CPU compatibility: libc.prx no matching instructions (VRSQRTPS: native=0, trapped=0, skipped=0; EXTRQ: native=0, trapped=0, skipped=0; INSERTQ: native=0, trapped=0, skipped=0; RDPID: native=0, trapped=0, skipped=0; CLWB: native=0, trapped=0, skipped=0)

Unresolved import stub called: juWbTNM+8hw[Posix_v1][libkernel_v1.1][Func]

Warning: HDR output is unavailable; HDR-to-SDR conversion is not implemented, displaying PQ video-out pixels unchanged.

--- Build ---
Official build KytyPS5-2026-10-12-df5b9b9
--- Fatal Error ---
Not implemented (source.call.has_value() || options.stage != ShaderType::Compute) in D:\a\KytyPS5\KytyPS5\src\graphics\shader\recompiler\ShaderRecompiler.cpp:488

> Source: [KytyPS5 issue #1509](https://github.com/KytyPS5/KytyPS5/issues/1509)
