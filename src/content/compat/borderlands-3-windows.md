---
title: "Borderlands 3"
titleId: "PPSA01462"
status: "main-menu"
testedVersion: "KytyPS5-2026-10-03-f53e5d2"
testedDate: "2026-10-03"
os: "windows"
hardware: "AMD Ryzen 5 5600X 6-Core / AMD Radeon RX 7600 / 32 GB DDR4 RAM / 8 GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/21e860e2-214c-4f50-ba6b-0b988f28fddb","https://github.com/user-attachments/assets/66f24bce-f0c8-4a15-ab1b-c2ce9261173a","https://github.com/user-attachments/assets/09af0bae-9767-4765-9928-4e0d08654783","https://github.com/user-attachments/assets/31b140be-5988-4fe4-85cb-1713e3e5fa97","https://github.com/user-attachments/assets/53d73b36-a1e7-4cd3-a26a-b8709a971f3a","https://github.com/user-attachments/assets/b930b5a3-a15f-4c85-85f1-6d69216df54b","https://github.com/user-attachments/assets/e198483b-7d13-49e4-92a3-f4e00109c0dc"]
---

The game boots successfully and progresses through the startup/logo screens. When prompted for internet access, access was denied.
The main menu loads successfully, but performance is extremely poor at approximately 1–2 FPS. Input works, but key presses often need to be held until another frame is processed before they register.
After starting a new game, the initial pre-game video plays correctly at approximately 50+ FPS.
After the video, the following in-engine cinematic performs significantly worse, generally between 0–10 FPS and often appearing effectively frozen at 0 FPS, while audio continues to play normally.
The cinematic can be skipped, although the extremely low frame rate makes this difficult.
The character selection screen loads and runs at approximately 4–7 FPS.
After selecting a character, another in-engine cinematic begins. This cinematic renders incorrectly, with the image appearing excessively bright and covered by a strong blue hue.
Attempting to skip this cinematic causes KytyPS5 to crash before controllable gameplay is reached.
Final error:
Unhandled host exception: type=1 code=3221225477 pc=0x0000000906311340 access=1 address=0x0000000000000000
in D:\a\KytyPS5\KytyPS5\src\loader\runtimeLinker.cpp:719

## Steps to reproduce

1. Open KytyPS5.  
2. Launch Borderlands 3.  
3. Progress through the startup/logo screens.  
4. Deny the internet access prompt.  
5. Wait for the main menu to load.  
6. Start a new game.  
7. Progress through or skip the initial video.  
8. Progress through or skip the following low-FPS cinematic.  
9. Select a character.  
10. During the subsequent in-engine cinematic, attempt to skip it.  
11. KytyPS5 crashes before controllable gameplay is reached.

## Expected behavior

The game should render the menus and in-engine cinematics correctly at a usable frame rate and proceed into controllable gameplay without crashing.

## Last working build / first broken build

No known working build. First tested on KytyPS5-2026-10-03-f53e5d2.

## Extra notes

Main menu performance: approximately 1–2 FPS.
Initial video playback: approximately 50+ FPS.
First in-engine cinematic: approximately 0–10 FPS, frequently appearing frozen while audio continues normally.
Character selection: approximately 4–7 FPS.
Post-character-selection cinematic has incorrect rendering with excessive brightness and a strong blue hue.
Skipping the post-character-selection cinematic results in a crash.
Controllable gameplay was not reached.

> Source: [KytyPS5 issue #1002](https://github.com/KytyPS5/KytyPS5/issues/1002)
