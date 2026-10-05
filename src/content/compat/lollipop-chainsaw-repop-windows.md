---
title: "LOLLIPOP CHAINSAW RePOP"
titleId: "PPSA21837"
status: "main-menu"
testedVersion: "2026-10-02-e317465"
testedDate: "2026-10-02"
os: "windows"
hardware: "Intel Core i7-14700KF / NVIDIA GeForce RTX 4080 Super / 32GB DDR5 (4400MT/s)"
screenshots: ["https://github.com/user-attachments/assets/d9db36e1-41dc-428e-bb8e-7c30cd7713c3","https://github.com/user-attachments/assets/4fe6ad77-f880-43aa-8f70-622562974f82","https://github.com/user-attachments/assets/1e75d9cf-800d-45d9-b31f-5e8cbe7addd9","https://github.com/user-attachments/assets/24c8fef1-1c38-4fa0-9e44-237e02132ec9"]
---

PAL release dumped from disc, an Unreal Engine 5.3.1 remaster of the PS3-era Unreal Engine 3 game. The game does not present any apparent flaws until you start a game, at which point the game loads through the first level but crashes to render the first 3D frame. On this system, menu oscillates between 50 and 60 frames per second (with graphics mode set to performance in the game's menu).

Tested in both 1080p and 2160p without any noticeable difference. Attached log is 1080p.

On a more minor note, FMVs can and will desync if the game does not run at full speed.

## Steps to reproduce

1. Open KytyPS5
2. Reach the main menu
3. Select either original mode or repop mode from the main menu
4. The game will try to load into gameplay, then crash as it finishes up

## Expected behavior

The first frame of gameplay should render correctly and gameplay should continue.

> Source: [KytyPS5 issue #989](https://github.com/KytyPS5/KytyPS5/issues/989)
