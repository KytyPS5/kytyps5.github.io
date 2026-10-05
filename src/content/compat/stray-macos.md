---
title: "Stray"
titleId: "PPSA02100"
status: "in-game"
testedVersion: "af3011cd + custom macOS PR stack (Release)"
testedDate: "2026-10-05"
os: "macos"
hardware: "Apple M4 Pro / Apple M4 Pro integrated GPU / 24 GB unified memory; no separate VRAM allocation"
gameVersion: "01.005.000"
---

Tested on macOS 15.7.4 with an x86_64 Release emulator through Rosetta 2. This result requires a custom PR stack and an experimental MoltenVK driver; it does not establish compatibility with an unmodified release.

Game version `01.005.000`. The intro, title menu, and rainy opening scene run. The human tester confirmed cat movement and later confirmed visible gameplay with a normal image.

Steady presentation rates were approximately 5–8 FPS, depending on the scene. These are presentation-rate observations, not controlled benchmarks. A complete playthrough was not tested.

A later view became blue-gray while frames continued to present. No matching fatal shader/compiler error was found. The cause remains unknown. A capture-enabled diagnostic run also exited during buffer allocation after reported driver heap usage exceeded its 16 GiB budget. Xcode capture/replay overlapped that run, so the crash is not evidence of ordinary gameplay memory use.

PR #977 was subsequently installed, and startup presentation was verified. Gameplay and the blue-gray view were not reverified after that patch.

## Steps to reproduce

1. Use the custom x86_64 Release build and experimental MoltenVK mesh-shader driver described below.
2. Enable the conservative Performance shader optimizer from #1015.
3. Disable GPU capture for ordinary gameplay testing.
4. Boot the supplied PPSA02100 game folder.
5. Advance the brightness screen, choose Start Game, choose an empty slot, and start a new game.
6. Observe the rainy opening scene and move the cat.

## Expected behavior

The game should render correctly and retain player control without crashes. These results establish early gameplay only.

## Extra notes

Integration stack: #633, #637, #685, #721, #735, #983, #984, #1015, and the local `FoldVertexBranchSelects` pass. #635 was already in the base. #977 was added after the gameplay evidence described above. PR #715 was reviewed but not applied. PR #1014 was tested and removed after a startup illegal-instruction failure.

Driver: `carbonimax/MoltenVK`, branch `macgaming/mesh-shader`, commit `9525fe13719f02de71bbfc70233d9677d8e8adae`, version 1.4.3, x86_64. This is an experimental driver fork with Metal private APIs disabled.

Vertex fix submitted as [PR #1071](https://github.com/KytyPS5/KytyPS5/pull/1071): shader `0x79ef5bf7d0ca9452`, branch-proven vertex selects, followed by dead-code elimination. PR #735 alone did not remove the inactive `WriteLane` dependency.

PR #1015 fixed a separate Metal compiler failure on compute shader `0xca3c43d6cbea7619`. The optimized module compiled and game progression past it was observed. Its cold Metal compilation took about 50 seconds.

The 50% resolution-scale trial did not establish a frame-rate improvement or actual 3D resolution. The later diagnostic trial restored the requested scale to 100%.

The website stores one report per game and OS. This macOS report should remain separate from Windows issue #698 and `stray-windows.md`.

AI assistance: Codex prepared this report from local logs and prior human gameplay observations. The human tester confirmed gameplay and authorized this compatibility submission.

> Source: [KytyPS5 issue #1073](https://github.com/KytyPS5/KytyPS5/issues/1073)
