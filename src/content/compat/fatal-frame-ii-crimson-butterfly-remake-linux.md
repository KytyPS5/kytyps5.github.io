---
title: "FATAL FRAME II: Crimson Butterfly REMAKE"
titleId: "PPSA32802"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-10-27-ffc8137 (0.3.0)"
testedDate: "2026-10-27"
os: "linux"
hardware: "AMD Ryzen 9 9900X (12 cores) / NVIDIA GeForce RTX 4080 SUPER, driver 615.78.08 (Vulkan 1.4) / 60 GB RAM / 16 GB VRAM"
screenshots: ["https://files.catbox.moe/iujhoh.png"]
---

The emulator creates the game window but its contents stay black. About 6-7 seconds after boot it aborts with a fatal error:

```
--- Fatal Error ---
Not implemented (info.source_buffer_id != info.dest_buffer_id || std::max(info.source_buffer_id, info.extra_buffer_id) >= custom.num_buffers) in /home/runner/work/KytyPS5/KytyPS5/src/libs/ngs2.cpp:1230
```

Before the abort the log shows the NGS2 custom submixer racks being set up (`CompressorFN`, `CompressorFA`, `CompressorB`, 12/16 voice and output channels) and these warnings repeated twice:

```
warning: NGS2 custom control 0x40001700 is ignored
warning: NGS2 custom control 0x40002301 is ignored
warning: NGS2 custom control 0x40001702 is ignored
warning: NGS2 custom control 0x40001304 is ignored
warning: NGS2 custom control 0x40001305 is ignored
warning: NGS2 custom control 0x40001306 is ignored
warning: NGS2 custom control 0x40001307 is ignored
warning: NGS2 custom control 0x40001308 is ignored
warning: NGS2 custom control 0x40001309 is ignored
```

Also present:

```
Unresolved import stub called: 9kPCz7Or+1Y[SystemService_v1][SystemService_v1.1][Func]
Can't open .../sce_sys/playgo-chunk.dat
Can't open .../playgo-chunkdefs.xml
Can't open .../Data/chunkmanifest
```

The game never displays its logo; the fatal error occurs while the window is still black. Process exit code is 65.

## Steps to reproduce

1. Start KytyPS5 2026-10-27-ffc8137 on Linux (KDE Plasma Wayland, Vulkan).
2. Boot FATAL FRAME II: Crimson Butterfly REMAKE (app version 01.002.002) from a clean dump.
3. Wait 6-7 seconds without touching the window.

## Expected behavior

The game should display its startup logo and continue to the main menu instead of aborting in `ngs2.cpp:1230`.

## Extra notes

- The dump comes from my own console; no game files, keys or decrypted assets are shared, only this log and screenshot.
- Test executed and the reported status confirmed by the dump owner; the report text was drafted and filed with AI assistance from the emulator log.

> Source: [KytyPS5 issue #1950](https://github.com/KytyPS5/KytyPS5/issues/1950)
