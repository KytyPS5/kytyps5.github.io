---
title: "Rise of the Ronin"
titleId: "PPSA04540"
status: "doesnt-boot"
testedVersion: "0.3.0 b7012cf"
testedDate: "2026-11-18"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/c96f0874-0cb7-4b27-b3dd-548500696b84"]
---

Attempt to boot game and crashes quickly with:

Shaders: VS 3 | PS 3 | CS 1 | GS 0 | LS 0 | HS 0 | TES 0
warning: NGS2 custom control 0x40001500 is ignored
warning: NGS2 custom control 0x40001b01 is ignored
warning: NGS2 custom control 0x40001500 is ignored
warning: NGS2 custom control 0x40001b01 is ignored
warning: NGS2 custom control 0x40001500 is ignored
warning: NGS2 custom control 0x40001b01 is ignored
warning: NGS2 custom control 0x40001500 is ignored
warning: NGS2 custom control 0x40002301 is ignored
warning: NGS2 custom control 0x40001500 is ignored
warning: NGS2 custom control 0x40002301 is ignored
warning: NGS2 custom control 0x40001500 is ignored
warning: NGS2 custom control 0x40002301 is ignored
--- Build ---
Official build KytyPS5-2026-11-18-b7012cf
--- Fatal Error ---
Not implemented (info.source_buffer_id != info.dest_buffer_id || std::max(info.source_buffer_id, info.extra_buffer_id) >= custom.num_buffers) in D:\a\KytyPS5\KytyPS5\src\libs\ngs2.cpp:1485

## Steps to reproduce

1. Open Translator
2. Boot Game

## Expected behavior

Game would boot to logo screens, then onto main menu or cutscene.

## Extra notes

Default settings.

> Source: [KytyPS5 issue #2376](https://github.com/KytyPS5/KytyPS5/issues/2376)
