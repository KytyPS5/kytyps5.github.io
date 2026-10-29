---
title: "LEGO® Voyagers"
titleId: "PPSA23732"
status: "in-game"
testedVersion: "KytyPS5-2026-10-27-ffc8137 (0.3.0)"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 9900X (12 cores) / NVIDIA GeForce RTX 4080 SUPER, driver 615.78.08 (Vulkan 1.4) / 60 GB RAM / 16 GB VRAM"
screenshots: ["https://files.catbox.moe/zazjs7.png","https://files.catbox.moe/nkfknd.png"]
---

The game boots, reaches its menus and runs local co-op gameplay at a sustained 60 FPS.

The only problem found is the second player: with a single gamepad connected the title does not let you select P2, so you cannot enter co-op. The title expects a second pad to be connected on port 2. Launching the emulator with `--keyboard-player 2` makes the keyboard a connected pad on player 2 while the gamepad stays on player 1; after that P2 joins normally with `J` (default Cross key).

Cold-start caveat: on the very first run, with an empty `_PipelineCache`, the emulator aborted after ~14 seconds with

```
Unhandled host exception: type=1 code=11 pc=0x00000009d00f4b1e access=1 address=0x0000000000000000
 in /home/runner/work/KytyPS5/KytyPS5/src/loader/runtimeLinker.cpp:721
```

while reading `Media/sharedassets1.resource` (process exit code 65). It did not reproduce on later runs with the warm pipeline cache. The first cold run also compiles a large number of shaders (VS 27 / PS 36 / CS 15) and can spend a couple of minutes on a black screen before the first frame.

## Steps to reproduce

1. Start KytyPS5 2026-10-27-ffc8137 on Linux.
2. Boot LEGO® Voyagers (app version 01.001.000) from a clean dump, with a gamepad connected:
   `kyty_emulator --game <app0> --keyboard-player 2`
3. Wait for the initial shader compilation.
4. On the menu, press a button on the gamepad for P1 and `J` on the keyboard to join as P2.
5. Select a level and start the game.

## Expected behavior

The title should let player 2 join with a second controller; the emulator connects the keyboard as a second pad when `--keyboard-player 2` is used, and after that the game works normally at 60 FPS. No known issue once P2 is connected.

## Extra notes

- Connected controller: one host gamepad (`StadiaYNYH-b896`), assigned to player 1. Keyboard used as the second pad with `--keyboard-player 2`.
- The dump comes from my own console; no game files, keys or decrypted assets are shared, only the log and screenshots.
- Test executed and the reported status confirmed by the dump owner; the report text was drafted and filed with AI assistance from the emulator log.

> Source: [KytyPS5 issue #1951](https://github.com/KytyPS5/KytyPS5/issues/1951)
