---
title: "Superliminal"
titleId: "PPSA06084"
status: "in-game"
testedVersion: "KytyPS5 Official Build 2026-09-17-ce629e0"
testedDate: "2026-09-17"
os: "windows"
hardware: "AMD Ryzen 5 5600G / NVIDIA Geforce RTX 5050 / 16 GB DDR4 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/c66a92c3-ec1d-4d3a-a0db-06a06eae3cfc","https://github.com/user-attachments/assets/ef2c9e8d-b6b2-4e0e-a92f-f9f518051271","https://github.com/user-attachments/assets/4a1af32b-b079-4295-99dc-8a706abb08ea","https://github.com/user-attachments/assets/62ca89a5-fd54-494b-8f0e-27ddeaca5d01","https://github.com/user-attachments/assets/0c2a04e6-5210-42ca-a0fe-d94936dbb26f"]
---

The main menu renders with severe graphical artifacts (heavy green lighting glitches, corrupted geometry, and blocky textures). Upon selecting "New Game", the intro video/cinematic plays correctly with video and audio, followed by the "LOADING..." screen. However, once the game finishes loading, the screen stays completely black while gameplay audio (footsteps, ambient sounds) remains active in the background.

## Steps to reproduce

1. Open KytyPS5.
2. Boot Superliminal (PPSA06084).
3. Observe the graphical/lighting glitches on the main menu.
4. Select "New Game" 
5. Watch the introductory cutscene.
6. Observe that after the loading screen finishes, gameplay loads into a black screen with audio continuing normally.

## Expected behavior

The game should render visuals properly, allowing gameplay to display normally on screen instead of staying black.

## Extra notes

Custom settings used for this test:
* **AMD CPU patch (EXPERIMENTAL):** Enabled
* **Screen resolution:** 1280x720
* **Present mode:** Immediate
* **Vblank frequency:** 60 Hz
* **Shader optimization:** Performance

> Source: [KytyPS5 issue #665](https://github.com/KytyPS5/KytyPS5/issues/665)
