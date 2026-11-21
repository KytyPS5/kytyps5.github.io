---
title: "Uncharted: Legacy of Thieves Collection"
titleId: "PPSA05389"
status: "in-game"
testedVersion: "0.3.0 b3295be"
testedDate: "2026-11-18"
os: "windows"
hardware: "AMD Ryzen 7 7700X / AMD Radeon RX 9070XT, Driver 26.10.1 / 32 GB RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/d586c711-d323-4071-8a66-c34e2276725d","https://github.com/user-attachments/assets/261f9a26-593e-4088-a1f5-8929c193d408","https://github.com/user-attachments/assets/439f6140-fb99-4479-a5b2-a9ee71951660","https://github.com/user-attachments/assets/bdec084d-a5cc-4d1d-a757-5a11f5887cea","https://github.com/user-attachments/assets/c24a8c82-fd3c-4fe4-be18-4896d9222e7e","https://github.com/user-attachments/assets/6bf1726c-19e0-4582-bf25-6ca47f330622","https://github.com/user-attachments/assets/781d38f0-3573-408d-8ef4-4f016cab654a","https://github.com/user-attachments/assets/9250c2a0-0b8b-44b7-8b55-cad52072dd28"]
---

Game boots to the main menu, select which game and then new game.
Low frame rate, perfect audio, no graphical issues.

Crashes shortly after with:

Shaders: VS 28 | PS 14 | CS 2 | GS 0 | LS 0 | HS 0 | TES 0
--- Build ---
Official build KytyPS5-2026-11-18-b3295be
--- Fatal Error ---
Not implemented (desc.info.data.size == 0 || alignment == 0 || (address & (static_cast<uint64_t>(alignment) - 1u)) != 0) in D:\a\KytyPS5\KytyPS5\src\graphics\host_gpu\renderer\pipeline\descriptors.cpp:623

## Steps to reproduce

1. Open Translator
2. Boot Game
3. Start New Game

## Expected behavior

Game boots, starts new game and is playable for a short time

## Extra notes

Default settings.

Both games tested and both crash with the same error.

> Source: [KytyPS5 issue #2385](https://github.com/KytyPS5/KytyPS5/issues/2385)
