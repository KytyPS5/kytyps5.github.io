---
title: "Tetris® Forever"
titleId: "PPSA25646"
status: "in-game"
testedVersion: "0.2.2 — source build, commit c52bf45 (KytyPS5-2026-08-28-c52bf45)"
testedDate: "2026-08-28"
os: "windows"
hardware: "Intel Core i7-10750H @ 2.60 GHz (6C / 12T) / NVIDIA GeForce RTX 2060 (laptop), driver 596.36, Vulkan 1.4.329 - system also has an Intel UHD iGPU; the emulator correctly selects the RTX 2060 / 16 GB DDR4-3200 (2x8 GB) / 6 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/77580444-04c4-42a4-b3ec-f7b882c56e79"]
---

Runs well end to end. The game reaches controllable gameplay: I played a full round of Tetris Time Warp to a deliberate top-out and returned to the menus afterwards. Session was 3 min 25 s / 12,186 frames with no crash.

**Working**
- Boot sequence: Digital Eclipse intro video, photosensitivity notice, quote cards, title screen.
- All three `.webm` background videos play visibly (`digital_eclipse`, `timeline_bg_1`, `timeline_bg_2`) - no black frames.
- Museum / timeline mode: browsing, thumbnails, box art, video backgrounds.
- Tetris Time Warp: playable, including the mid-round era switch that loads the embedded NES ROM.
- Audio: SDL device opened at 48 kHz stereo; music and SFX correct throughout.
- Save data: `timeline_progress.json` and `recently_played.json` created, written, and read back from `/savedata0`.
- Input: keyboard default mapping fully responsive.

**Performance**
- ~59.3 fps average across the whole session; the title bar held 59.98-60.00.
- Across the 5,400-frame gameplay window the worst frame was 1.1x the mean and no frame exceeded 3x - no traversal stutter and no shader-compile stalls (all 8 shaders were compiled by t=72 s, before gameplay started).

**Rendering**
- 8 shaders total (2 VS, 6 PS); every one reported `structured CFG success`, wave64, each under 1 ms.
- Colour targets at 3840x2160 and 1920x1080 plus a 960 -> 480 -> 240 downsample chain (blur/bloom), composited to the 1080p swapchain. No MSAA (`samples=1`).

**Clean signals** - zero of each: fatal errors, unresolved import stubs, missing shader opcodes, Vulkan validation errors, device-lost.

**Non-fatal warnings observed** (nothing visibly wrong on screen)
- 126x `size_bytes / base is not 256-byte aligned` - the game issues `ACQUIRE_MEM` GCR cache flushes over 32-byte regions; the emulator warns and over-flushes.
- 16x `unsupported PS5 guard band discard = 1.000000, 1.000000, continuing` - the values are a no-op here.
- 16x `ignoring indirect uc reg GE_STEREO_CNTL` - stereo disabled (value 0), safely ignored.
- The game calls `sceAgcInit(..., ver = 13)` but `GRAPHICS_REGISTER_DEFAULTS_MAX_VERSION` is 12, so register defaults clamp to v12 (`unsupported version 13` x3). No visible effect in this title, but newer-SDK titles may need a v13 table.

## Steps to reproduce

1. Place a decrypted PPSA25646 dump (`eboot.bin`, `sce_sys/`, `sce_module/libc.prx`, `assets/`) in a game folder.
2. Launch it:
   `kyty_emulator.exe --game "<dump dir>" --screen-width 1920 --screen-height 1080 --printf-direction File`
   (or add the folder in the launcher and run it from there)
3. Wait through the intro video, photosensitivity notice and quote cards to the title screen.
4. Press Cross (`J` on keyboard) at "PRESS X TO PLAY".
5. Navigate to Tetris Time Warp and start a round.
6. Play until top-out - the game-over screen appears and the score/progress save is written.

## Expected behavior

No known issue. Everything tested behaves as expected: the game reaches gameplay, holds 60 fps, plays its videos and audio, and persists save data. The items listed under "Result details" are non-fatal log warnings rather than visible defects, noted in case they are useful.

## Extra notes

- **Settings**: defaults except resolution 1920x1080 and `printf_direction = File`. Shader validation on, Vulkan validation off, vblank 60, console language 1 (en-US).
- **Build**: stock upstream `c52bf45`, clean working tree (no local modifications), built with clang-cl 20.1.8 and Qt 6.10.3.
- **Startup memory**: the emulator maps a single ~13.5 GB pagefile-backed section at startup (`PhysicalMemory::TotalSize()` = 13,824 MB, committed eagerly). On this 16 GB machine that fails with `direct-memory backing: CreateFileMapping failed: 0x000005aa` whenever system commit charge is high; closing a browser freed enough to start. Mentioning it only in case it is useful for lower-RAM hosts - happy to raise it separately if it warrants its own issue.
- **Absent from the dump** and logged as "Can't open" (no observed effect): `sce_sys/playgo-chunk.dat`, `playgo-chunkdefs.xml`, `Data/chunkmanifest`.

> Source: [KytyPS5 issue #333](https://github.com/KytyPS5/KytyPS5/issues/333)
