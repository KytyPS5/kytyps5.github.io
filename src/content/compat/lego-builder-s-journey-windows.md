---
title: "Lego Builder's Journey"
titleId: "PPSA05496"
status: "in-game"
testedVersion: "V0.3.0"
testedDate: "2026-11-10"
os: "windows"
hardware: "AMD Ryzen 5 9600X / AMD Radeon RX 9600XT 26.20.15.07 / 32 GB DDR5 RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/68b5599d-44b1-43f7-acc7-e3b75bb62a0b","https://github.com/user-attachments/assets/6a165dfc-f219-4a83-a4f8-7af2161b01bf","https://github.com/user-attachments/assets/4268859f-f864-4ca1-8c2c-a1fff0a50630","https://github.com/user-attachments/assets/a337836a-190e-4613-aa63-96e6ed22c5c0","https://github.com/user-attachments/assets/c1529b2b-7068-448c-93bb-0e942b667986"]
---

The game first crashed after the logo popped up in the bottom right hand corner, after further investigation and tweaking, I was able to get the game to boot and it is playable. About 5 seconds of no frames occurs, then the Lego logo appears in the middle of the screen. I already had my Dual-sense controller connected via Bluetooth so it was straight forward to get the controls working. It reaches a stable 60FPS with or without PS5 pro mode. It sometimes crashes due to a miss-input of keyboard or button press. After the light brick logo fades away, a yellow screen is shown with the game logo. After the x button is pressed the game starts. Audio starts playing after logos are complete. I tested 720p and 1080p both seemed to work.
After first trophy wait 10s before gameplay is resumed.

## Steps to reproduce

1. Open KytyPS5
2. Run Game
3. Wait 5s after the Builder's Journey Logo is shown
4. Wait until all logos are shown
5. Press X to Start Playing

<img width="319" height="291" alt="Image" src="https://github.com/user-attachments/assets/68b5599d-44b1-43f7-acc7-e3b75bb62a0b" />

<img width="709" height="424" alt="Image" src="https://github.com/user-attachments/assets/6a165dfc-f219-4a83-a4f8-7af2161b01bf" />

<img width="326" height="165" alt="Image" src="https://github.com/user-attachments/assets/4268859f-f864-4ca1-8c2c-a1fff0a50630" />

<img width="1738" height="982" alt="Image" src="https://github.com/user-attachments/assets/a337836a-190e-4613-aa63-96e6ed22c5c0" />

## Expected behavior

No known issue
Recorded Kyty Crashes:
unknown op 0049b: cmd_id = 00000000
unknown op 00077: cmd_id = 00000010
unknown op 00547: cmd_id = 105e9470

> Source: [KytyPS5 issue #2202](https://github.com/KytyPS5/KytyPS5/issues/2202)
