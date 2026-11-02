---
title: "Yakuza: Like a Dragon"
titleId: "PPSA02384"
status: "in-game"
testedVersion: "v0.3.0 - KytyPS5-2026-10-31-a06e356"
testedDate: "2026-11-02"
os: "linux"
hardware: "AMD Ryzen 9 6900HX / NVIDIA GeForce RTX 3070 Ti Laptop GPU - DV: 580.178.04 / 32 GB DDR5 / 8GB Vram"
screenshots: ["https://github.com/user-attachments/assets/43061ac0-9706-44c5-b93a-01986fcc0abb","https://github.com/user-attachments/assets/521b60e6-115d-4803-8e35-88e7c3611ddc","https://github.com/user-attachments/assets/24be4b45-76c1-478d-a6b8-b8ab895f6b0c","https://github.com/user-attachments/assets/fb2a719f-0771-478b-8bb2-669639674e1c","https://github.com/user-attachments/assets/906724fe-eb34-42f7-8eb5-3b1241d8890c","https://github.com/user-attachments/assets/10d12d56-7853-48f6-873f-e1dceb940c07","https://github.com/user-attachments/assets/8dd83f7e-17ea-45ee-8557-3cff8ea974e4","https://github.com/user-attachments/assets/74f6406e-fa47-46b2-a5ff-03ace5dd2664","https://github.com/user-attachments/assets/d8918d6b-49a1-4df3-9fca-c89732cdfa73","https://github.com/user-attachments/assets/866ba53b-0dfd-42ba-92c1-befb130d3c5c"]
---

The game boots, loads into the menu, shows cutscenes and loads into initial gameplay. Some 3D assets might be improperly visualised.

Problems:
- The game might quit or stall after the first two initial cutscenes. Manually skipping them gets past this issue.
- After that, the emulator crashes when entering the first battle.

## Steps to reproduce

> ./launcher
> run the game
> initial cutscene might render the game unresponsive
> restart the emulator
> run the game again
> load from an autosave
> get into the gameplay

## Expected behavior

The initial cutscenes should play through without the game quitting or stalling, and the first battle should load and play normally without the emulator crashing.

## Last working build / first broken build

Emulation N/A from build d3d7bd3

> Source: [KytyPS5 issue #2068](https://github.com/KytyPS5/KytyPS5/issues/2068)
