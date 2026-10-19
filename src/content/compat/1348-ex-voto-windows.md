---
title: "1348 Ex Voto"
titleId: "PPSA24249"
status: "main-menu"
testedVersion: "KytyPS5-2026-10-18-37df7f3"
testedDate: "2026-10-18"
os: "windows"
hardware: "intel i5-12600k / RX 7900 XT driver 26.9.2 / 32GB DDR4 RAM / 20GB VRAM"
---

What worked:
The game boots successfully and reaches the main menu without any apparent issues.

What failed:
The game crashes immediately after proceeding past the main menu.

Visible or audible problems:
The game stops working, and the following error is displayed in the command prompt (cmd) window:

--- Build ---
Official build KytyPS5-2026-10-18-37df7f3
--- Error ---
Unhandled host exception: type=1 code=3221225477 pc=0x000000090460438a access=1 address=0xffffffffffffffff
in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:715

## Steps to reproduce

1.Start KytyPS5.

2.Launch the game "1348 Ex Voto".

3.Wait for the main menu to load.

4.Try to start the game / proceed past the main menu.

5.The emulator crashes and displays the error in the console.

## Expected behavior

The game should load into the gameplay without crashing the emulator.

> Source: [KytyPS5 issue #1639](https://github.com/KytyPS5/KytyPS5/issues/1639)
