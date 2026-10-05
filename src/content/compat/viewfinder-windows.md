---
title: "Viewfinder"
titleId: "PPSA10249"
status: "in-game"
testedVersion: "KytyPS5-2026-10-05-af3011c"
testedDate: "2026-10-05"
os: "windows"
hardware: "Ryzen 5 5600X / RX 7600 / 32 GB / 8 GB"
screenshots: ["https://github.com/user-attachments/assets/2a9752f4-c637-460c-89d5-8de9c4daeebd","https://github.com/user-attachments/assets/40c6a152-55d7-4d7c-89c6-046228babd23","https://github.com/user-attachments/assets/e6b9a2d7-4af6-4f96-b808-801fbf310e78"]
---

What works, the R2 problem, the crash with its error line, your eboot findings, and the keyboard-only caveat

I'm able to progess through the start of the game up until the first photo needs placing.
This confirms jump keys work, reqind keys etc.
Upon picking up the photo, I'm able to press L2 to hold the photo up but R2 does nothing.
Pressing L2 then R1 without red zone protection causes a crash shown in the first log (run1).
With redzone protection, nothing fails but nothing happens.
Unable to progess wihotu the ability to press R2.

I'll carry on looking into this issue but nothing obvious right now.

## Steps to reproduce

1. Open Kyty
2. Boot Viewfinder
3. Progess through the game
4. Upon reaching he first photo, try and Press L2+R1 (without redzone protection) and it shoudl throw an error)

## Expected behavior

Pressing L2+R2 should place the photo contents down (confirmed location via gameplay videos)

> Source: [KytyPS5 issue #1064](https://github.com/KytyPS5/KytyPS5/issues/1064)
