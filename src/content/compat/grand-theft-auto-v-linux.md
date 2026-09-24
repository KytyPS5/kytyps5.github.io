---
title: "Grand Theft Auto V"
titleId: "PPSA04264"
status: "in-game"
testedVersion: "KytyPS5-2026-09-24-2aaf0c9"
testedDate: "2026-09-24"
os: "linux"
hardware: "AMD Ryzen 5 5600 / AMD Radeon RX 9070 XT, Mesa 26.2.2 (RADV GFX1201), Vulkan 1.4.354 / 16GB DDR4 RAM / 16GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/feed605b-3906-4631-83e5-d30439fb62f1","https://github.com/user-attachments/assets/ee8de20f-8d8a-40da-9b5c-f240a0b29a40","https://github.com/user-attachments/assets/4ce08e7d-2e10-4cc6-b95f-789737e3f559","https://github.com/user-attachments/assets/49f22a72-f54a-4466-b160-55fede4c0ffe"]
---

Replaces #229 (@DistantMyth, as requested). It also collects the earlier GTA V reports, listed at the bottom.

The game has three graphics modes (Settings, Display, Graphics mode). Results on Linux, a few minutes of play per mode:

| Mode | Result |
|---|---|
| **Performance** | Starts and is playable. Visuals look correct apart from the glyph problem below, audio is fine, but the game is pretty laggy. |
| **Performance RT** | Starts and is playable, with visual glitches: characters are drawn as black silhouettes and lights shimmer. Audio is fine, and the game is pretty laggy. |
| **Fidelity** | Story mode does not load. Some dialog is audible until it crashes (details below). |

**Fidelity mode: story mode does not load.** Every crashing run I did was in Fidelity mode. The maintainers said on #315 that Fidelity mode uses ray tracing, which is not supported ([comment](https://github.com/KytyPS5/KytyPS5/pull/315#issuecomment-5413817453)). The two builds fail differently:

*Latest release (2026-09-24-2aaf0c9):* the log shows the game reading the prologue audio (`PROLOGUE.rpf`), then the emulator exits with:
`TextureCache: invalid depth upload` (`textureCache.cpp:1081`)
That check rejects a depth image that is multisampled, has zero layers or a size that is not a multiple of its layer count, or whose format size does not match; the release message does not say which. I did not see the descriptor error below on this build. The full `_kyty.txt` is attached.

*Official 2026-09-20 release (ba55ba5) and local builds:*
1. On the official 2026-09-20 release, starting story mode plays the intro dialog and the "Ludendorff, North Yankton, nine years ago" text on a black screen, then exits with:
   `shader resource tracking: hash=0x6a53456e7ef5d1b0 stage=compute pc=0x0000086c GetBufferResource dword 0 is not a valid runtime value`
   Same class as #507 and #548 (their hash is `0x5e3e42fe237d3e16`). With a diagnostic build I traced the descriptor's base address to `Ballot -> CompositeExtractU32x4 -> ... -> ReadFirstLane -> ReadConstBuffer`, i.e. a per-lane value that cannot be resolved on the CPU.
2. With #690 (dynamic buffer descriptors) merged on top, that error is gone. The next failure was a missing DS opcode (0xa0, `DS_WRITE_B8_D16_HI`), now upstream through #794.
3. After that, the run ends in a GPU hang: `vkQueueSubmit failed: ErrorDeviceLost`, kernel `ring gfx_0.0.0 timeout`, no page fault. `RADV_DEBUG=hang,syncshaders` pins it on a single compute dispatch: shader hash `0xa016c19e423c6efb` (64-thread groups, 27x1x1 or 3x1x1). It reproduces with the GPU at stock clocks (I reset an undervolt and memory overclock to rule that out), and the shader's SPIR-V matches the emulator's. The kernel looks like tree/BVH traversal (atomics, wave-wide prefix sums, data-dependent loops), which fits a ray-tracing acceleration-structure path.
4. In Performance mode neither of those two shaders is dispatched: on a local build with #690 and #794, a session of about 3 minutes ran 226,925 compute dispatches across 34 compute shaders with no errors or hangs. I did not capture a log for Performance RT.

**Glyph problem (all modes).** The game has a glyph problem: the controller-button icons in on-screen hints are drawn as plain boxes (the second screenshot, the first-person camera hint). It looks like the same class of problem as the missing letters reported in #166 and #729, and the boot-time text glyph loss PR #449 tried to fix.

## Steps to reproduce

1. Start the KytyPS5 launcher and add the folder that contains the game (`PPSA04264`) under the global settings' game folders. Select Grand Theft Auto V in the game list and run it.
2. At the game's main menu, open Settings, Display, Graphics mode, and choose the mode to test: Fidelity, Performance RT or Performance.
3. Start Story Mode.
4. Result:
   - Performance and Performance RT reach the prologue and are playable (Performance RT with black characters and shimmering lights).
   - Fidelity exits during the story-mode load with the errors described in Result details.

To capture a log, set "Printf output" to File in the launcher's global settings before starting the game.

## Expected behavior

- Performance: Story mode loads and plays without heavy lag, and on-screen button icons render as icons (currently the game is pretty laggy and the icons are plain boxes).
- Performance RT: characters and lighting render like in Performance mode (currently characters are black silhouettes and lights shimmer).
- Fidelity: Story mode loads and reaches the prologue like the other modes. Ray tracing is not supported yet (see #315), so this may need that work first.

## Extra notes

Settings used: 1280x720, Mailbox present mode, vblank 60, shader optimization Performance, shader validation on, GPU Auto, AMD CPU patch off, tessellation off. The game is pretty laggy at 1280x720 on this hardware; I did not measure frame rates.

Related issues and pull requests (GTA V):
- Reports: #166 (closed, older story-mode crash), #229 (replaced by this issue), #507 (descriptor-tracking design, documents the same GTA V chain), #548 (same descriptor error, EUR release PPSA04263 v01.010.002), #729 (Windows/NVIDIA: missing text glyphs, prologue cutscene crash when frames drop)
- Fixes for the Fidelity path or shared code: #690 (open, dynamic buffer descriptors, clears the descriptor error on the 2026-09-20 release), #794 (merged, `DS_WRITE_B8_D16_HI`), #795 (open, GPU tiler shaders: avoids a `uvec4` specialization-constant select that RADV evaluates wrongly, found while testing this)

<details>
<summary>Earlier GTA V bring-up PRs (merged / open / closed)</summary>

- Merged: #315 (Standard64KB colour-target arrays), #404 (V_PK_FMAC_F16 high half), #428 (fast clear from a read-modify-write dispatch), #436 (R32_SFLOAT packed colour clears), #437 (DualSense HIDAPI / light bar), #511 (refresh imports after dynamic module loads), #645 (Nix flake)
- Open: #431 (border colours from the guest table), #532 (finalize bindings after every range-changing operation)
- Closed without merging: #401 (HTile fast clears), #419, #422, #433, #435, #534 (streaming-time page-fault retries), #434 and #557 (save metadata / timestamps), #440 (DCC clears before sampled access), #449 (boot-time text glyph loss), #464 (vertex buffer size)
</details>

Not resolved by anything above: missing text glyphs (#166, #729), the streaming-time fault race, and the prologue cutscene crash (#729).

> Source: [KytyPS5 issue #810](https://github.com/KytyPS5/KytyPS5/issues/810)
