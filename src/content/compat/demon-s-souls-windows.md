---
title: "Demon's Souls"
titleId: "PPSA01341"
status: "in-game"
testedVersion: "v20261026"
testedDate: "2026-11-05"
os: "windows"
hardware: "Intel Core i5-12400F / NVIDIA GeForce RTX 4080 / 32 GB DDR4 RAM, 16GB VRAM"
---

Moving the entire setup—both the emulator folder and the game directory—off a high-end NVMe drive serving as the primary Windows boot partition (Samsung 980 Pro, C:) and onto a completely separate, dedicated secondary drive (Crucial SATA SSD) completely eliminates severe real-time shader compilation bottlenecks and micro-stuttering.
When hosted on the primary OS drive (C:), the emulator's new asynchronous background thread compiler triggers severe real-time thread locks whenever it attempts to write data to the root shader pool. This appears to be caused by native Windows kernel file-locking, real-time Windows Defender security indexing, and NTFS write-buffer overhead on the C:\ partition clashing with rapid, concurrent microscopic shader writes. Shifting the setup to an independent secondary drive removes these OS-level file-lock contentions entirely, resulting in perfectly flat frame pacing and flawless rendering smoothness.

Additional Hardware Telemetry & Metrics (Massive Utilization Delta):
• When on C:\ drive (Samsung 980 Pro NVMe): Both CPU and GPU immediately spiked and pinned at 99%–100% utilization, accompanied by heavy, visible real-time micro-stuttering. The hardware is trapped in severe brute-force kernel-wait loops waiting for I/O clearance.
• When on dedicated secondary drive (Crucial SATA SSD): CPU usage dropped cleanly to 45% and GPU usage dropped to 70% with perfectly smooth, fluid gameplay.
The Tech Behind the Fix: The SLC Cache Overwhelm & Kernel Lock Trap
High-end NVMe drives rely on temporary, volatile SLC speed caches and aggressive Windows write-buffer flushing. Spanning the asynchronous background compiler to write microscopic shader fragments thousands of times a minute essentially acts like a non-stop I/O spam attack on a smart NVMe controller, exhausting the SLC cache and causing firmware-level stalls. Conversely, an older secondary SATA drive relies on flat, sustained hardware write speeds and bypasses the aggressive OS-level file-locks of the C:\ drive, delivering an unchoked data pipeline to the CPU and GPU.
(Note: This I/O thread lock behavior may share root causes with, or heavily exacerbate, the parallel shader-cache warm-up bottlenecks noted in issue #2069).

## Steps to reproduce

1. Place the KytyPS5 emulator directory and the Demon's Souls game files together on the main Windows OS C:\ drive (utilizing a high-speed NVMe drive).
2. Boot the game and observe prominent hitching, massive 100% CPU/GPU spikes, and severe micro-stutters during intro cutscenes and early map navigation as shaders compile asynchronously.
3. Close the emulator and move the entire emulator and game directory setup over to an isolated, non-OS secondary SSD partition (even a legacy SATA SSD).
4. Relaunch the game from the new drive path and observe perfectly flat frame pacing, relaxed hardware utilization (45% CPU / 70% GPU), and smooth rendering.

## Expected behavior

The game should render smoothly without massive frame-pacing drops or micro-stutters during dynamic, real-time shader compilation when running on high-end NVMe hardware hosted on the primary OS partition.

> Source: [KytyPS5 issue #2131](https://github.com/KytyPS5/KytyPS5/issues/2131)
