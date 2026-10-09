---
title: "Sonic Racing: CrossWorlds"
titleId: "PPSA08804"
status: "in-game"
testedVersion: "KytyPS5-2026-10-07-bb98f26"
testedDate: "2026-10-07"
os: "linux"
hardware: "AMD Ryzen AI 9 HX PRO 370 / AMD RADEON RX 7900 XTX, Mesa 26.1.6 / 16 GB DDR5 RAM / 24 GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/2e9f875e-7a23-4b03-9692-cb2c2307050c","https://github.com/user-attachments/assets/99c12b80-ec97-4489-9c92-3088c38e5e38","https://github.com/user-attachments/assets/f2dcc587-c4c8-467b-9a7d-a1d5225c7f13","https://github.com/user-attachments/assets/b5f496ab-28af-4cc5-9291-902d7d67e608","https://github.com/user-attachments/assets/2301581d-ac2f-415f-8937-aa97bc45462c","https://github.com/user-attachments/assets/b6db7423-995d-4da3-b0a9-0e0ed566d508"]
---

The game has fluent intro animations, getting lower FPS in the menu, and in-game is around 3-4 FPS consistently which is not playable, but renders correctly.

At one point in the before race intro I have noticed also a glitch (see attached screenshot)

## Steps to reproduce

1. Open KytyPS5
2. Boot the game
3. It works, but slow

## Expected behavior

The gameplay should maintain 60 FPS.

## Extra notes

Runs in unprivileged LXC, GPU Passthrough (Proxmox VE 9.2.11, 7.0.14-15-pve)

> Source: [KytyPS5 issue #1134](https://github.com/KytyPS5/KytyPS5/issues/1134)
