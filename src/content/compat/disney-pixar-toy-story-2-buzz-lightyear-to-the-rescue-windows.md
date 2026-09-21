---
title: "Disney•Pixar Toy Story 2: Buzz Lightyear to the Rescue!"
titleId: "PPSA07372"
status: "in-game"
testedVersion: "KytyPS5-2026-09-16-86e5e01"
testedDate: "2026-09-16"
os: "windows"
hardware: "AMD Ryzen 5 5600G / NVIDIA Geforce RTX 5050 / 16 GB DDR4 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/b43a859e-82f9-4445-a82d-e217c58167a5","https://github.com/user-attachments/assets/4a358d23-b0f4-439c-99a7-aadf66a466d2","https://github.com/user-attachments/assets/a8b490a5-26ef-4339-8666-e48638b97217","https://github.com/user-attachments/assets/b01001fe-8f7c-4a05-9106-a4cab98b19fe","https://github.com/user-attachments/assets/970ba0cc-461c-4513-98a6-ca0b1679c19d","https://github.com/user-attachments/assets/8478c833-267d-477d-b2d1-6757cdc0dd68"]
---

The game boots properly through all intro logos into the main menu. Memory card save files from Slot 1 are detected and loaded without errors (`TOY STORY 2: TOK01:00`, 1 Block Used). The gameplay loads into the level (Andy's House) and stays playable at a stable 60 FPS without crashing or corrupting saved data when restarting the emulator. Minor audio buffer stutters occur during scene transitions.
 * **Known Issue:** In-game FMV cutscenes (movie clips) exhibit minor graphical glitches/artifacts around the edges during playback, though gameplay rendered in-engine displays without these issues.

## Steps to reproduce

1. Open KytyPS5.
2. Boot Disney•Pixar Toy Story 2: Buzz Lightyear to the Rescue! [PPSA07372].
3. Press Start on the Title Screen and select 'Start Game'.
4. Play/complete a level or save progress via the in-game Memory Card menu.
5. Close the emulator and relaunch the game to verify save data persistence.

## Expected behavior

The game should detect, save, and load Memory Card data properly, maintain level progress across emulator restarts, and play audio smoothly without buffer stutters or pitch shifts.

## Extra notes

Custom settings used for this test:
* **AMD CPU patch (EXPERIMENTAL):** Enabled
* **Screen resolution:** 1280x720
* **Present mode:** Immediate
* **Vblank frequency:** 60 Hz
* **Shader optimization:** Performance

> Source: [KytyPS5 issue #650](https://github.com/KytyPS5/KytyPS5/issues/650)
