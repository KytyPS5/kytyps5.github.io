---
title: "Unpacking"
titleId: "PPSA07117"
status: "in-game"
testedVersion: "KytyPS5-2026-09-17-ce629e0 (Official Build)"
testedDate: "2026-09-17"
os: "windows"
hardware: "AMD Ryzen 5 5600G / NVIDIA GeForce RTX 5050 8GB / 16 GB DDR4 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/af6b47d7-e612-4f78-82df-2cb95d567e96","https://github.com/user-attachments/assets/b65063f2-c1d5-4d5b-a155-5bfb6695638e","https://github.com/user-attachments/assets/97234d1b-4499-4692-9632-5560b74f2f13"]
---

* **What worked:** The game boots correctly, reaches the main menu, and allows full navigation through the menu options without graphical glitches.
* **What failed:** Starting a new game fails. After entering a save file name and clicking "Continue", the screen goes completely black and the emulator crashes to desktop a few seconds later.
* **Audible/Visible problems:** Black screen upon starting a new game followed by an immediate crash.

## Steps to reproduce

1. Boot *Unpacking* on the latest KytyPS5 build.
2. Navigate the main menu and select "New Game".
3. Enter any name for the save profile and click "Continue".
4. Observe the black screen and subsequent crash after a few seconds.

## Expected behavior

After entering a name for the save file and clicking "Continue", the game should load the first level/room and transition smoothly into gameplay.

## Extra notes

Custom settings used for this test:
* **AMD CPU patch (EXPERIMENTAL):** Enabled
* **Screen resolution:** 1280x720
* **Present mode:** Immediate
* **Vblank frequency:** 60 Hz
* **Shader optimization:** Performance

> Source: [KytyPS5 issue #668](https://github.com/KytyPS5/KytyPS5/issues/668)
