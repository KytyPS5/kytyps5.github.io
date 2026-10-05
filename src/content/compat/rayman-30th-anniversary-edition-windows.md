---
title: "Rayman 30th Anniversary Edition"
titleId: "PPSA33016"
status: "in-game"
testedVersion: "KytyPS5-2026-10-04-719e025"
testedDate: "2026-10-04"
os: "windows"
hardware: "AMD Ryzen 7500f / AMD RADEON 7900 GRE / 32 GB DDR5 6000"
screenshots: ["https://github.com/user-attachments/assets/efddcf45-36d5-4487-bafe-eb6f2515f93b","https://github.com/user-attachments/assets/d3861f5f-241d-4bc3-811c-d99bc299a670"]
---

The game runs smoothly at around 60 FPS with no noticeable stuttering or frame-time drops, but the image quality becomes heavily pixelated / corrupted when entering gameplay.

The main menu looks clean and sharp. The rendering issue appears specifically during gameplay.

Observations
Menu rendering: normal
Gameplay rendering: severe pixelation / rendering artifacts
Performance: smooth, approximately 60 FPS
No significant frame-time spikes observed
GPU utilization remains relatively low
The issue occurs on both:
db17585-dirty
KytyPS5-2026-10-04-719e025

Pipeline Cache

The game successfully creates a Vulkan pipeline cache:

_PipelineCache\PPSA33016.bin

Example log:

Vulkan pipeline cache: initializing _PipelineCache\PPSA33016.bin
Vulkan pipeline cache: initialized empty
...
GPU: using buffer device address (BDA) shader memory access.
...
Vulkan pipeline cache: saved 164332 bytes to _PipelineCache\PPSA33016.bin

The issue persists after the pipeline cache has been created.

AMD CPU Patcher

The AMD CPU patch option is enabled. The log reports no matching instructions, but there are no crashes or aborts:

AMD CPU compatibility: eboot.bin no matching instructions
...
native=0, trapped=0, skipped=0
Expected Result

Gameplay should render with the same image quality as the menu without severe pixelation or rendering artifacts.

Actual Result

Gameplay is smooth and playable, but the rendered image contains severe pixelation/artifacts.

Additional Information

Screenshots showing the difference between the menu and gameplay rendering are attached.

Full emulator log can be provided if required.

## Steps to reproduce

1. Launch KytyPS5 using `KytyPS5-2026-10-04-719e025`.
2. Launch game `PPSA33016`.
3. Wait for the main menu to load.
4. Start the game and enter gameplay.
5. Observe the rendering quality during gameplay.
6. The game runs smoothly at around 60 FPS, but severe pixelation/rendering artifacts appear during gameplay.

## Expected behavior

Gameplay should render correctly without severe pixelation or rendering artifacts while maintaining normal image quality.

> Source: [KytyPS5 issue #1051](https://github.com/KytyPS5/KytyPS5/issues/1051)
