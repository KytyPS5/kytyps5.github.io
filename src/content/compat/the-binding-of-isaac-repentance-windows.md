---
title: "The Binding of Isaac: Repentance"
titleId: "PPSA03311"
status: "in-game"
testedVersion: "KytyPS5-2026-09-17-ce629e0 (Official Build)"
testedDate: "2026-09-17"
os: "windows"
hardware: "AMD Ryzen 5 5600G / NVIDIA GeForce RTX 5050 8GB / 16 GB DDR4 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/28cb1e00-bfca-482d-b397-43807954c0d0","https://github.com/user-attachments/assets/17acca57-cc0c-4b9f-895c-ff14c735e98a","https://github.com/user-attachments/assets/c27970e6-dbfe-4ff9-a528-13105332069a"]
---

* **What worked:** The game boots cleanly, renders graphics correctly, and runs at a stable 60 FPS during gameplay and menus.
* **What failed:** Complete absence of audio output (no music, sound effects, or menu sounds).
* **Audible/Visible problems:** Silent gameplay throughout the entire session. No graphical glitches observed.

## Steps to reproduce

1. Boot *The Binding of Isaac: Repentance* (PPSA03311) on the latest build.
2. Reach the title screen or start a new run.
3. Observe that no audio is played despite volume settings being turned up in-game and in Windows.

## Expected behavior

The game should play background music, voice lines, and sound effects properly during menus and gameplay.

## Extra notes

Custom settings used for this test:
* **AMD CPU patch (EXPERIMENTAL):** Enabled
* **Screen resolution:** 1280x720
* **Present mode:** Immediate
* **Vblank frequency:** 60 Hz
* **Shader optimization:** Performance

> Source: [KytyPS5 issue #667](https://github.com/KytyPS5/KytyPS5/issues/667)
