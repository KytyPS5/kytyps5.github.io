---
title: "Ridge Racer"
titleId: "PPSA31372"
status: "in-game"
testedVersion: "KytyPS5-2026-10-17-6aa3846"
testedDate: "2026-10-17"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti (12 GB), 617.42 / 32 GB DDR5 RAM / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/536e35b8-c842-456b-891e-794a5697cee6","https://github.com/user-attachments/assets/49c1d6f3-cca6-4b16-8f49-672441ee6bf9","https://github.com/user-attachments/assets/be5d101d-3ee8-4e8d-91ea-9033a65a8f2e"]
---

The game runs smoothly and at a good frame rate.
There is significant pop-in (though this is likely due to the game itself rather than the emulator).

Please pay special attention to the following unresolved import stubs:
- Unresolved import stub called: uZrOwuNJX-M[RazorCpu_v1][RazorCpu_v1.1][Func]
- Unresolved import stub called: 2mfSRGdshtk[SaveData_native_v1][SaveData_native_v1.1][Func]

## Steps to reproduce

1. Open KytyOS5
2. Run the Game
3. Play

## Expected behavior

Import stubs 2mfSRGdshtk[SaveData_native_v1][SaveData_native_v1.1] and uZrOwuNJX-M[RazorCpu_v1][RazorCpu_v1.1][Func] are expected to be resolved correctly.

> Source: [KytyPS5 issue #1611](https://github.com/KytyPS5/KytyPS5/issues/1611)
