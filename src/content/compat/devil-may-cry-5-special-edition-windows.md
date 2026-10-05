---
title: "Devil May Cry 5: Special Edition"
titleId: "PPSA-01443"
status: "logo"
testedVersion: "KytyPS5-2026-10-03-e6cb880"
testedDate: "2026-10-03"
os: "windows"
hardware: "AMD Ryzen 5 5600X 6-Core / AMD Radeon RX 7600 / 32 GB DDR4 RAM / 8 GB GDDR6 VRAM"
screenshots: ["https://github.com/user-attachments/assets/42fb6d96-fcc9-46f2-8086-c9324f27f1af","https://github.com/user-attachments/assets/28a29caf-6142-4ebd-9f65-7f306ef01024","https://github.com/user-attachments/assets/680f7053-d52e-444a-9d5a-76a9998bae01","https://github.com/user-attachments/assets/a5cda015-1514-496b-a781-2f9e215dbf44","https://github.com/user-attachments/assets/dd4eecac-1f05-4b5f-92fd-23dc5ff50404","https://github.com/user-attachments/assets/be547eec-4504-44fd-ac4e-13027462a641"]
---

The game boots and progresses through the initial first-run setup, including save creation, TV/HDR configuration, and the EULA/privacy policy screens.
After accepting the EULA/privacy policy, KytyPS5 crashes before the main menu is displayed.

## Steps to reproduce

1. Launch Devil May Cry 5 Special Edition.  
2. Allow the startup logos to complete.  
3. Complete the initial save creation and TV/HDR setup.  
4. Accept the EULA/privacy policy.  
5. KytyPS5 crashes immediately afterward, before reaching the main menu.

## Expected behavior

The game should complete the startup/setup sequence and proceed to the main menu without crashing.

## Last working build / first broken build

No known working build / first tested on KytyPS5-2026-10-01-b3e419f

## Extra notes

Keyboard input mapping works correctly during the setup screens.
The issue occurs before reaching the main menu.
The same runtimeLinker.cpp:719 host exception was reproduced on both KytyPS5-2026-10-01-b3e419f and KytyPS5-2026-10-03-e6cb880.

> Source: [KytyPS5 issue #999](https://github.com/KytyPS5/KytyPS5/issues/999)
