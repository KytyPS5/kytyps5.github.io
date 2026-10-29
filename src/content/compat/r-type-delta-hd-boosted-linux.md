---
title: "R-Type Delta: HD Boosted"
titleId: "PPSA26414"
status: "in-game"
testedVersion: "KytyPS5-2026-10-27-ffc8137 (0.3.0)"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 9900X (12 cores) / NVIDIA GeForce RTX 4080 SUPER, driver 615.78.08 (Vulkan 1.4) / 60 GB RAM / 16 GB VRAM"
screenshots: ["https://files.catbox.moe/6tkn6g.png","https://files.catbox.moe/eyokzx.png"]
---

The game boots with the default configuration and is fully playable. It loads its title, select and stage modules (`title_Release.prx`, `select_Release.prx`, `st1r9_Release.prx`, `loads1_Release.prx`) and reaches controllable gameplay. No fatal errors or host exceptions in the log; the run was stopped by us after about three minutes of play.

The only anomaly in the log is a non-fatal missing file:

```
Can't open .../PPSA26414-app0/playgo-chunkdefs.xml
```

## Steps to reproduce

1. Start KytyPS5 2026-10-27-ffc8137 on Linux.
2. Boot R-Type Delta: HD Boosted (app version 01.000.002) from a clean dump.
3. Wait for the initial shader compilation.
4. Confirm on the title screen and start a game.

## Expected behavior

No known issue: the game boots and is playable.

## Extra notes

- Tested with one host gamepad on player 1; no special flags were needed.
- The dump comes from my own console; no game files, keys or decrypted assets are shared, only the log and screenshots.
- Test executed and the reported status confirmed by the dump owner; the report text was drafted and filed with AI assistance from the emulator log.

> Source: [KytyPS5 issue #1952](https://github.com/KytyPS5/KytyPS5/issues/1952)
