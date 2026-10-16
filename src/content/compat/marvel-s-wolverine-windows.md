---
title: "Marvel's Wolverine"
titleId: "PPSA03671"
status: "logo"
testedVersion: "KytyPS5-2026-10-12-5b0ef07 and KytyPS5-2026-10-12-df5b9b9"
testedDate: "2026-10-12"
os: "windows"
hardware: "Amd Ryzen 7 / Nvidia 3060 / 16Gb"
screenshots: ["https://github.com/user-attachments/assets/56221a2f-f737-46a0-bb14-1c11cdde6fe3"]
---

Title: Marvel's Wolverine (PPSA03671) crashes: "indirect image table at pc 0x0000114c has incompatible candidates"

Game: Marvel's Wolverine, Title ID PPSA03671
Emulator builds tested: KytyPS5-2026-10-12-5b0ef07 and KytyPS5-2026-10-12-df5b9b9 (both official builds)
OS: Windows [10,]
GPU: 3060,
CPU / RAM: [Amd Ryzen 7 7800] / [16GB]

What happens:
The game starts, shaders compile (last state: VS 3 | PS 2 | CS 13), then
the emulator crashes with a fatal error. The crash is reproducible on every
launch and in both builds. The Vulkan pipeline cache was empty
(freshly created), so it is not caused by a stale cache.

Relevant log lines:
shader resource specialization failed: indirect image table at pc 0x0000114c has incompatible candidates
Error: condition (!ShaderRecompiler::IR::MaterializeResources(entry->second.resource_plan, runtime, entry->second.resources, entry->second.specialization)) is true in src/graphics/host_gpu/renderer/pipeline/pipelineCache.cpp:427

Also seen before the crash (probably unrelated):
Unresolved import stub called: juWbTNM+8hw[Posix_v1][libkernel_v1.1][Func]

Full log is attached.

## Steps to reproduce

[kytyps5_wolverine_log_5b0ef07.txt](https://github.com/user-attachments/files/33340292/kytyps5_wolverine_log_5b0ef07.txt)

[kytyps5_wolverine_log_df5b9b9.txt](https://github.com/user-attachments/files/33340302/kytyps5_wolverine_log_df5b9b9.txt)

## Expected behavior

Steps to reproduce:
1. Start Marvel's Wolverine (PPSA03671) in KytyPS5 (build df5b9b9, also 5b0ef07).
2. The game logo is shown, but the game never reaches the main menu. Shaders compile (last state: VS 3 | PS 2 | CS 13).
3. The emulator crashes with "shader resource specialization failed: indirect image table at pc 0x0000114c has incompatible candidates" and a fatal error in pipelineCache.cpp:427.
Happens on every launch.

Expected behavior:
The shader should compile and the game should continue past the logo into the main menu instead of the emulator crashing.

## Last working build / first broken build

first test on Wovlerine

> Source: [KytyPS5 issue #1453](https://github.com/KytyPS5/KytyPS5/issues/1453)
