---
title: "Contra Operation Galuga"
titleId: "PPSA15368"
status: "in-game"
testedVersion: "KytyPS5-2026-09-27-421684e-Windows-x64"
testedDate: "2026-09-28"
os: "windows"
hardware: "AMD Ryzen 9800X3D / NVIDIA GeForce RTX 5080 / 32 GB DDR5 RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/ed44d46d-a895-43fa-a1ee-cd1d976aa40c","https://github.com/user-attachments/assets/b8f5bc61-bd63-4fc0-8114-c8e4a14b5411","https://github.com/user-attachments/assets/422d8f56-406e-4df6-b986-a6960391cfc2","https://github.com/user-attachments/assets/6edf20ee-edf9-4597-ba47-993eb3183037","https://github.com/user-attachments/assets/b1ee7223-c325-49e2-ab4c-f0af93597a6a"]
---

Since my last status report, the screen doesn't flick anymore and the music is running smoothly. Well Done !

I discovered an new issue playing it: the controller input is taking twice the input each time, making difficult to navigate in menus.
It also force me to select 2 players with the same controller.

My guess is the game takes the controller as controller 1 and 2 at the same time.
You can clearly see this as if i go to the player selection, it takes player 1 or 2, then back and forth it takes the other one or the same one.

The behavior does not occur with other games so it's not a controller hardware issue.
Same behavior with the keyboard input without any controller plugged in.

## Steps to reproduce

Boot
In the menu, try to navigate
Select a game
Select one player, you have to choose the second player.

## Expected behavior

It should navigate normally in the menu and only select one player.

> Source: [KytyPS5 issue #886](https://github.com/KytyPS5/KytyPS5/issues/886)
