---
title: "3D Mini Golf"
titleId: "PPSA03647"
status: "in-game"
testedVersion: "KytyPS5-2026-09-24-5a705dd (source build, commit 5a705dd)"
testedDate: "2026-09-25"
os: "linux"
hardware: "Intel Core i5-13420H / NVIDIA GeForce RTX 5050 Laptop (Blackwell), driver 615.71.09, Vulkan 1.4.351 / 32 GB RAM / 8 GB VRAM"
---

The game boots and is playable, but **audio is distorted garbage noise from the very first sound** - logo/attract phase, menus, UI and gameplay are all affected. There is no silence and no crackling: it is continuous corrupted-sample noise, the same character as the Ghost Song report in #805.

Performance note: #44 measured 1-2 FPS on a Ryzen 7 7700X + RX 7900 XTX in July 2026. On the current build this game averages ~28 FPS at 1280x720 on much weaker laptop hardware (i5-13420H + RTX 5050 Laptop), so the frame-rate problem appears fixed by the recent graphics work.

Log analysis (complete session log, 88 MB uncompressed, zipped to 7.6 MB):

- Unity + FMOD title - FMOD mixer, AudioOut, stream and nonblocking threads all start normally.
- Same stubbed import signature as #805: `unresolved PLT import patched to stub [369] [0000000901993650] <- 00000002000007bc, wVwPU50pS1c[AudioOut_v1][AudioOut_v1.1][Func]` (eboot.bin).
- That stub is never invoked: the log contains zero `Unresolved import stub called` lines, so it is not the direct cause.
- Host streams open cleanly twice: `AudioOut: opened SDL stream (48000 Hz, 2 ch, format 0x8120)` - 0x8120 is SDL_AUDIO_S16LSB.
- 159 stubs in total; every other stub is PSN/trophy related (PSNCore.prx: NpWebApi2, NpManager, PSNCommon, NpTrophy2).
- Zero fatal errors, zero assertions, zero shader compile failures.
- The log contains no AudioOut buffer/queue activity lines at all, so the corruption cannot be traced from the log itself.

Hypothesis (for triage): FMOD mixes float samples while the SDL port here is negotiated as S16. If the data written to / read from the port is interpreted with the wrong sample format, the result is exactly this kind of corrupted noise from the very first buffer. #805 shows the same symptom class on the same Unity/FMOD stack with a different title.

## Steps to reproduce

1. Run KytyPS5 build KytyPS5-2026-09-24-5a705dd (clang/lld Release) with printf_direction=File.
2. Add 3D Mini Golf (PPSA03647) and start it.
3. Sound is already distorted noise during the logo/attract phase.
4. Continue to the menu and into gameplay: the noise continues everywhere.
5. Exit the game normally so the log is flushed.

## Expected behavior

Clean music and sound effects from boot through gameplay, as on real hardware. The original reporter in #44 noted audio was perfect on build 0.0.5.5 in July 2026, so this may be a regression somewhere between that build and the current one.

## Extra notes

- Own dump of a first-party PS5 title, v01.000.000.
- Related reports: #805 (Ghost Song - same Unity/FMOD stack, same distorted-noise symptom), #44 (original 3D Mini Golf report).
- Test configuration: default settings, 1280x720, Mailbox present mode, shader optimization Performance, keyboard only.
- Since the log has no AudioOut queue/buffer logging, reproducing the corruption likely needs instrumentation around `AudioOutOutputs` / `QueueSdlAudio` for FMOD-backed ports.
- AI assistance (OpenCode) was used to analyze the log and prepare this report; I reviewed the findings and text before submitting.

> Source: [KytyPS5 issue #819](https://github.com/KytyPS5/KytyPS5/issues/819)
