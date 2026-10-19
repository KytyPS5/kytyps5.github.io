---
title: "Tennis World Tour 2"
titleId: "PPSA02019"
status: "main-menu"
testedVersion: "Official build KytyPS5-2026-10-16-3ff6606"
testedDate: "2026-10-16"
os: "windows"
hardware: "Intel Core i7-10870H / NVIDIA GeForce RTX 3060 Laptop GPU 6GB VRAM"
gameVersion: "01.000.007"
---

The game boots correctly and reaches the language selection screen.  
After selecting the language and pressing **X**, a message appears:  
Reading profile data....  
It loads for a short moment, then the emulator crashes with an unhandled host exception.

## Steps to reproduce

1. Launch Tennis World Tour 2 (PPSA02019)
2. Reach the language selection screen
3. Select a language
4. Press **X** to confirm
5. The message "Reading profile data....  " appears and loads briefly → crash

## Expected behavior

The game should finish loading the profile data and enter the main menu.

## Extra notes

- Several unresolved imports related to `NpCppWebApi` appear in the log.
- Game currently not present in the compatibility list on the website

[_kyty.txt](https://github.com/user-attachments/files/33549553/_kyty.txt)
[TWT2.txt](https://github.com/user-attachments/files/33549552/TWT2.txt)

> Source: [KytyPS5 issue #1557](https://github.com/KytyPS5/KytyPS5/issues/1557)
