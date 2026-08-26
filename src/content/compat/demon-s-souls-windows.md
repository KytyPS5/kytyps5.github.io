---
title: "Demon's Souls"
titleId: "PPSA01342"
status: "main-menu"
testedVersion: "KytyPS5-2026-08-09-d7063d0"
testedDate: "2026-08-10"
os: "windows"
hardware: "Intel Core i3-12100F / AMD Radeon RX 6600 / 16 GB RAM"
---

The game crashes during launch/shader compilation with a fatal error in host GPU renderer debug assertions: 
Fatal Error: Not implemented (c.user_clip_planes != 0 || c.user_clip_plane_mode != 0 || c.vertex_kill_any || !c.IsZClipModeRepresentable() || c.user_clip_plane_negate_y || c.clip_disable || c.user_clip_plane_cull_only || c.cull_on_clipping_error_disable || c.force_viewport_index_from_vs_enable) in debug.cpp:615

## Steps to reproduce

1. Open KytyPS5.
2. Boot Demon's Souls (PPSA01342).
3. Observe crash during shader compilation / execution.

## Expected behavior

The game should initialize the renderer without triggering debug assertions and proceed to render or show logo/menu.

## Last working build / first broken build

Unknown

## Extra notes

Tested on official build KytyPS5-2026-08-09-d7063d0.

> Source: [KytyPS5 issue #224](https://github.com/KytyPS5/KytyPS5/issues/224)
