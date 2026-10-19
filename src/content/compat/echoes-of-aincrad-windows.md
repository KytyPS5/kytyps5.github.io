---
title: "Echoes of Aincrad"
titleId: "PPSA22969"
status: "main-menu"
testedVersion: "KytyPS5-2026-10-17-763d3be (Windows x64 official release).\nAlso reproduced on KytyPS5-2026-10-16-3ff6606."
testedDate: "2026-10-17"
os: "windows"
hardware: "Intel Core i7-14650HX / NVIDIA GeForce RTX 5060 Laptop GPU; Windows driver version 32.0.16.1692. / Approximately 16 GB system RAM / 8 GB VRAM."
---

The game reaches the main menu and character creation, but exits with a fatal assertion during character customization or the introductory sequence after choosing a character and starting the game. Reproduced repeatedly.

```text
--- Build ---
Official build KytyPS5-2026-10-17-763d3be
--- Fatal Error ---
Error: condition (!is_allocated(id)) is true in D:\a\KytyPS5\KytyPS5\src\common/slotVector.h:41
```

The launcher recorded exit code 321. The exact caller/root cause is unknown; no stack trace was captured.

## Steps to reproduce

1. Start the official Windows build and boot PPSA22969.
2. Reach the main menu and start a new game.
3. Select/name/customize the character.
4. Select Start to enter the introductory sequence.
5. The emulator exits with the assertion above. An earlier attempt also failed during customization.

The latest attempt used:
```text
kyty_emulator.exe --game "<game directory>" --shader-optimization-type Performance
```

## Expected behavior

Character customization and the intro should complete and allow entry into controllable gameplay.

## Last working build / first broken build

No known working build. Both builds above failed.

## Extra notes

- Installed game version is believed to be 01.000.006 based on the installation folder name; not independently verified.
- A clean, newly obtained game dump has **not** been tested. Dump integrity is unverified.
- Shader optimization None was tested on the older build; Performance was tested on the older and newer builds. All produced the same assertion.
- The newer build automatically invalidated the old Vulkan pipeline cache and initialized a fresh cache; the assertion persisted.
- Active Windows paging file was increased to 32768 MB on C before the latest attempt; the same assertion persisted. A separately configured paging file on D was not active.
- Moving the emulator and working directory to D did not resolve the issue.
- These checks do not establish the root cause. Please let me know if a particular diagnostic option or additional trace would help.

Report prepared with AI assistance from local diagnostic logs and the user's reproduction observations.

> Source: [KytyPS5 issue #1618](https://github.com/KytyPS5/KytyPS5/issues/1618)
