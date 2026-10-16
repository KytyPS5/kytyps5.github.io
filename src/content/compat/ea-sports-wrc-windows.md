---
title: "EA Sports WRC"
titleId: "PPSA06092"
status: "in-game"
testedVersion: "KytyPS5-2026-10-12-df5b9b9-Windows-x64"
testedDate: "2026-10-13"
os: "windows"
hardware: "AMD Ryzen 5 8600G / NVIDIA GeForce RTX 5050, driver 617.42 / 16 GB DDR5 RAM / 8 GB VRAM"
---

EA SPORTS™ WRC successfully boots and reaches in-game gameplay on KytyPS5. The game allows the player to enter races, select vehicles, control cars, and drive through racing stages.

However, several major issues were observed during testing:

## Steps to reproduce

1. Launch KytyPS5.
2. Select EA SPORTS™ WRC from the game list.
3. Start the game and wait for it to load.
4. Navigate through the menus and enter a racing stage.
5. Start driving and observe the extremely low performance (approximately 4–5 FPS).
6. Check the road surfaces. Some stages have missing or invisible road geometry.
7. Drive through affected areas and observe the vehicle falling through the map before respawning.
8. Switch to the cockpit camera and observe the windshield rendering issues.
9. Check the in-race HUD for corrupted text, black lines, and colored graphical artifacts.
10. Enter different racing stages to observe intermittent graphical issues.
11. Return to the vehicle selection menu and select a car. The game may randomly crash during this process.
12. Start a race and attempt to exit the race to return to the menu. The game may also crash during this transition.
13. Repeat the vehicle selection and race exit procedures to reproduce the intermittent crashes.

## Expected behavior

EA SPORTS™ WRC should run correctly without major graphical issues, performance problems, or unexpected crashes.

* **Performance:** The game should maintain a stable and playable frame rate, with smooth gameplay and normal simulation speed.
* **Graphics and Rendering:** All roads, terrain, vehicles, and environmental objects should render correctly without missing geometry or visual artifacts.
* **Vehicle Physics:** Vehicles should remain on the road surface and should not fall through the map due to missing geometry.
* **Windshield Rendering:** Vehicle windshields should render correctly without visual corruption or visibility issues.
* **HUD and Interface:** Driver names, race positions, numbers, weather information, and other race details should remain visible and readable without graphical corruption.
* **Vehicle Selection:** Players should be able to select and change vehicles without the game crashing.
* **Exiting Races:** Players should be able to exit a race and return to the menu without unexpected crashes.
* **Stability:** The game should remain stable during gameplay, menu navigation, vehicle selection, and transitions between races.
* **Audio:** Game audio should play correctly without interruptions or distortion.

**Expected Result:** The game should provide a stable and fully functional racing experience, with correctly rendered graphics, readable HUD elements, responsive controls, and no unexpected crashes.

> Source: [KytyPS5 issue #1477](https://github.com/KytyPS5/KytyPS5/issues/1477)
