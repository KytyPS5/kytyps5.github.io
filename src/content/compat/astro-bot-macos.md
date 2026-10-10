---
title: "Astro Bot"
titleId: "PPSA21567"
status: "doesnt-boot"
testedVersion: "Official build KytyPS5-2026-10-09-7b9997b (v0.3.0 macOS release)"
testedDate: "2026-10-09"
os: "macos"
hardware: "Apple M4 Pro (14 cores, arm64) / Apple M4 Pro (Metal 4.0 / MoltenVK 1.4.2) / 48 GB Unified Memory"
---

On macOS (Apple Silicon via MoltenVK), attempting to launch ASTRO BOT (`PPSA21567`) fails immediately during Vulkan device suitability checking before guest execution can begin.

The emulator reports:
```text
--- Error ---
Could not find suitable device:
  Apple M4 Pro: image view minLod is not supported; shaderBufferInt64Atomics is not supported; shaderCullDistance is not supported in /Users/runner/work/KytyPS5/KytyPS5/src/graphics/presentation/window/vulkanWindow.cpp:966
```
Because `vulkanWindow.cpp` marks `minLod`, `shaderBufferInt64Atomics`, and `shaderCullDistance` as mandatory device features, MoltenVK on Metal (Apple Silicon) is rejected and execution halts with exit code 65.

## Steps to reproduce

1. On macOS Apple Silicon, launch `kyty_emulator`:
   `DYLD_LIBRARY_PATH=./ SDL_VULKAN_LIBRARY=./libMoltenVK.dylib ./kyty_emulator --game "/path/to/PPSA21567/eboot.bin"`
2. MoltenVK initializes the instance for Apple M4 Pro (supporting Vulkan 1.3/1.4).
3. `vulkanWindow.cpp` checks device features and aborts because Metal lacks `minLod`, `shaderBufferInt64Atomics`, and `shaderCullDistance`.

## Expected behavior

Device selection should support portability subset / fallback paths when running on macOS via MoltenVK, allowing the title to attempt booting.

## Extra notes

*(This compatibility report was prepared with AI assistance — Gemini 3.8 Flash High).*

> Source: [KytyPS5 issue #1319](https://github.com/KytyPS5/KytyPS5/issues/1319)
