---
title: "PAC-MAN WORLD 2 Re-PAC"
titleId: "PPSA18189"
status: "in-game"
testedVersion: "0.2.2 — build KytyPS5-2026-08-05-f380d69-15-g8523229"
testedDate: "2026-08-08"
os: "windows"
hardware: "AMD Ryzen 5 5600X 6-Core / NVIDIA GeForce RTX 3070 Ti"
---

Good news rather than a bug: the game goes in-game and stays playable for the whole session. - ~24 fps at 720p (frame 3595, 24.32 fps at the moment captured) - 270 shaders compiled, no compile stalls after warm-up - HUD, score counter and "Ponto Salvo" (checkpoint) all render and update correctly - Collectibles, enemies and world geometry render as expected 2m42s capture of a continuous play session: https://www.tiktok.com/@code.bugfix/video/7671501100482268423 The local commits that got it there — happy to open PRs for any of these if they're useful: - `fix(dma)`: accept `DMA_DATA` with byte counts that are not a multiple of 4 - `fix(dma)`: ignore `DMA_DATA` control packets instead of aborting the title - `feat(shader)`: implement `v_subb_u32` / `v_subbrev_u32` (VOP2 0x29/0x2a) - `feat(shader)`: implement `v_cmp_gt_u64` (VOP3 0xe4) - `feat(shader)`: implement `s_ff1_i32_b64` and `s_trap` - `fix(shader)`: VOP3B encoding path for subb/subbrev

**Steps to reproduce:** 1. Open the launcher and boot PAC-MAN WORLD 2 Re-PAC (PPSA18189). 2. Let the shader cache warm up (~270 shaders). 3. Play — it stays in-game with no crash for the length of the capture.

> Source: [KytyPS5 issue #198](https://github.com/KytyPS5/KytyPS5/issues/198)

