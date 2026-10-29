---
title: "Palworld"
titleId: "PPSA23126"
status: "in-game"
testedVersion: "KytyPS5-2026-10-27-ffc8137 (0.3.0)"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 9900X (12 cores) / NVIDIA GeForce RTX 4080 SUPER, driver 615.78.08 (Vulkan 1.4) / 60 GB RAM / 16 GB VRAM"
screenshots: ["https://files.catbox.moe/0427kx.png","https://files.catbox.moe/7hd7zy.png"]
---

The game boots with the default configuration and reaches controllable gameplay. It compiles its shaders (up to VS 167 / PS 242 / CS 153 / GS 5), loads the AK audio modules, the EOS SDK and `libdiscord_partner_sdk.prx`, and runs in game without crashes. No fatal errors or host exceptions in the log; the run was stopped by us after about two minutes of play.

Some networked imports are stubbed and called during the run, but they did not prevent gameplay:

```
Stubbed: ... m5CYKX20wfg[SystemService_v1][SystemService_v1.1][Func]
Stubbed: ... uaieF+glFPs[SystemService_v1][SystemService_v1.1][Func]
Stubbed: ... VgYczPGB5ss[NpManager_v1][NpManager_v1.1][Func]
Stubbed: ... KJdPcOGmK58[NpWebApi2_v1][NpWebApi2_v1.1][Func]
Stubbed: ... hOnIlcGrO6g[NpWebApi2_v1][NpWebApi2_v1.1][Func]
```

The initial boot spends a while on shader compilation before the first frame.

## Steps to reproduce

1. Start KytyPS5 2026-10-27-ffc8137 on Linux.
2. Boot Palworld (app version 01.102.999) from a clean dump.
3. Wait for the initial shader compilation.
4. Confirm on the title screen and enter the world.

## Expected behavior

No known issue for local gameplay: the game boots and is playable.

## Extra notes

- Tested with one host gamepad on player 1; no special flags were needed.
- The dump comes from my own console; no game files, keys or decrypted assets are shared, only the log and screenshots.
- Test executed and the reported status confirmed by the dump owner; the report text was drafted and filed with AI assistance from the emulator log.

> Source: [KytyPS5 issue #1955](https://github.com/KytyPS5/KytyPS5/issues/1955)
