---
title: "Astro Bot"
titleId: "PPSA21567"
status: "in-game"
testedVersion: "Official [KytyPS5-2026-10-05-dc3cd2d](https://github.com/KytyPS5/KytyPS5/releases/tag/KytyPS5-2026-10-05-dc3cd2d), compared with the BryKytyPS5 fork, build BryKytyPS5-2026-10-04-a9e1ae5.\n\ncc @BryanKAdams: issues are disabled on your fork, so I'm posting here. Your Astro Bot measurements are from AMD hardware; these are from Intel + NVIDIA."
testedDate: "2026-10-05"
os: "windows"
hardware: "Intel Core i9-12900KF (8P + 8E, no SSE4a) / NVIDIA GeForce RTX 5080, driver 617.14 / 64 GB DDR5-4800 / 16 GB"
---

Setup: 3840x2160 fullscreen, `--amd-cpu --redzone`, non-RT patch ported to 01.018 (offsets under Extra notes). Without `--amd-cpu`, this Intel CPU crashes in `SceSndzAudioOutMain` right after the intro video (same as #687).

Measured while loading save slot 1 into its area:

| | official dc3cd2d | BryKytyPS5 a9e1ae5 |
| --- | --- | --- |
| Title screen | 36-40 fps | 60 fps |
| Level entry | ~8 s at 1-7 fps, then the loading tunnel ran >4 min at ~40 fps while reading ~155 MB/s (cf. #745) | ~35 s at 6-8 fps, then a steady 4-5 fps for over a minute |

BryKytyPS5 options: `--async-pipelines true --relaxed-readback true --gpu-timestamp-scale 115 --drain-stats 5` (shader precompile on; it replayed 452 permutations).

**Phase 1 (6-8 fps):** sampling shows one thread at ~85% in `nvgpucomp64.dll`, i.e. driver pipeline compiles. Presumably first-use compilation.

**Phase 2 (4-5 fps):** Thread_Gpu is idle ~4.05 s of every 5 s (`gpu-thread-idle`), so the game side is the bottleneck. `--drain-stats` reports **50,000-57,000 guest write faults per 5 s**, almost all from `tbb_thead` at a handful of sites (pc 0x920003e55-0x920004039):

```
drain-stats: 5.0s frames=27 (5.4/s) presents=27 | full-drain n=0 0.0ms | tick-wait n=1 1.9ms | ...
  frame-times    p50=100ms p95=100ms p99=100ms max=100ms >=25ms=27 of 27 (100.0%)
  gpu-thread-idle unattributed  -   n=54      4052.85ms avg=75.053ms
  stale-read     guest-read-fault -  n=144    (5.3/frame)
  readback       eager-readback  R_RELEASE_MEM  n=688  0.37MiB
  fault-site     write pc=0x000920003e55 thread=tbb_thead   n=30353  317.40ms avg=0.010ms addr=0x00050262cfa0
  fault-site     write pc=0x000920003fe2 thread=tbb_thead   n=5797    47.08ms avg=0.008ms addr=0x00050bc9e000
  fault-site     write pc=0x000920003ef0 thread=tbb_thead   n=3984    32.93ms avg=0.008ms addr=0x000502628fe0
  fault-site     write pc=0x000920004019 thread=tbb_thead   n=3453    25.19ms avg=0.007ms addr=0x00050bc94000
  fault-site     write pc=0x000920004039 thread=MainThread  n=3438    22.95ms avg=0.007ms addr=0x00050bbd4000
  fault-site     write pc=0x000920003fff thread=tbb_thead   n=3205    22.46ms avg=0.007ms addr=0x00050bb55000
  fault-site     write pc=0x000920003ff5 thread=MainThread  n=3355    22.25ms avg=0.007ms addr=0x00050bcc4000
  fault-site     write pc=0x000920004029 thread=tbb_thead   n=3285    21.65ms avg=0.007ms addr=0x00050bcae000
```

A SuspendThread/GetThreadContext sampler on the six busiest threads during phase 2 (each at ~95% of a core) gives roughly: ~20% guest code, ~75-79% ntdll, ~1-6% kyty_emulator (mostly the `regionManager.h` function at 0x1407e2150 in a9e1ae5, plus the guest fault handler). By nearest export (so approximate), the ntdll samples land in `KiUserExceptionDispatcher`/`ZwContinue`, in unexported code next to `RtlQueryFeatureConfiguration` (~35-38%), and in `RtlSleepConditionVariableSRW`/`ZwWaitForAlertByThreadId` (~18-25%). The handler time drain-stats attributes is only ~0.45-0.48 s per 5 s, so most of the cost looks like Windows exception dispatch per write plus lock contention between the six threads, not the handler itself.

Hot guest pages in phase 2: 0x910219000, 0x910218000, 0x91021c000, 0x907095000, 0x9010ea000.

## Steps to reproduce

1. Windows with an Intel CPU (no SSE4a); run with `--amd-cpu --redzone`, 3840x2160 fullscreen, non-RT patch.
2. Boot, press X at the title, load save slot 1.
3. Watch the level entry (on BryKytyPS5 with `--drain-stats 5`).

## Expected behavior

Level entry without a minute-long 4-5 fps phase.

## Last working build / first broken build

n/a (performance report)

## Extra notes

- Non-RT patch ported to 01.018 (from the 01.007 patch quoted in #745): renderer jump at `0x73eec3f` (`4584f60f84f10800004531f64c8d3d8ec4a90141b430` -> `4584f6e9f2080000904531f64c8d3d8ec4a90141b430`), GI toggle at `0x7108a33` (`0fb682a00700008887e4050000` -> `b80000000090908887e4050000`).
- On the official build, these made no difference at the 4K title screen: `--vblank-frequency 120`, `--redzone` off, P-core-only affinity. The GPU stays at full clock (~2.9 GHz) at 40-57% utilization; in gameplay Thread_Gpu spends ~36% of its time in `D3DKMTWaitForSynchronizationObjectFromCpu`.
- Separately, on official dc3cd2d without the non-RT patch: `CaptureOrdinaryRead()` (ResourceMaterialization.cpp) and the raw fallback in `SrtWalker::EvaluateRawRead()` read unvalidated guest addresses, crashing at address 0x58 / 0x18 (null SRT pointer plus offset). Returning zero for reads below 0x10000 avoided the crash; I can provide the diff.

> Source: [KytyPS5 issue #1081](https://github.com/KytyPS5/KytyPS5/issues/1081)
