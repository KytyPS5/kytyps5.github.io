---
title: "Potionomics: Masterwork Edition"
titleId: "PPSA24152"
status: "in-game"
testedVersion: "Source build 6eed46b (Release)"
testedDate: "2026-08-24"
os: "windows"
hardware: "AMD Ryzen 9 7900X3D / NVIDIA GeForce RTX 4080 / 32 GB RAM / 16 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/fec9ace4-f821-4c9c-9ec0-0fa7af99d48c","https://github.com/user-attachments/assets/079b1bd5-2eba-42f7-a42f-cef53df1003a"]
---

The game reaches gameplay, but important shaders are missing. In the negotiation/battle scene, the HUD and cards render while most of the 3D scene, characters, and background remain black. The attached screenshot was captured at approximately 33 FPS in the affected scene.

## Steps to reproduce

1. Add Potionomics: Masterwork Edition to the KytyPS5 launcher.
2. Boot the game.
3. Start or continue a save.
4. Reach a negotiation/battle sequence.
5. Observe that the UI renders but most scene geometry is black.

## Expected behavior

All scene geometry, characters, lighting, and backgrounds should render correctly while gameplay remains visible.

## Extra notes

Game version: 01.000.000. Required firmware reported by the package: 9.60. Tested offline; PSN/online features were not tested.

> Source: [KytyPS5 issue #310](https://github.com/KytyPS5/KytyPS5/issues/310)
