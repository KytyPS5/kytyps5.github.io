---
title: "Abiotic Factor"
titleId: "PPSA26012"
status: "main-menu"
testedVersion: "KytyPS5-2026-11-07-589bd14"
testedDate: "2026-11-07"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game launches and enters gameplay. 
Unfortunately, performance and stability are inconsistent, and there are several graphical glitches.

**An import stub is reported:**
`Unresolved import stub called: 0Cq8ipKr9n0[libkernel_v1][libkernel_v1.1][Func]`

As soon as I start playing and move the controller's stick to rotate the camera, the game crashes.
**Crash:**
```
--- Error ---
[Vulkan][E][2]: vkCmdCopyBufferToImage(): pRegions[0].imageOffset.x (0) + extent.width (128) exceeds imageSubresource width extent (64).
The VK_IMAGE_TYPE_2D VkImage was created with format VK_FORMAT_R16_UNORM and an extent of [width = 64, height = 128, depth = 1]
The Vulkan spec states: For each element of pRegions, imageOffset.x and (imageExtent.width + imageOffset.x) must both be greater than or equal to 0 and less than or equal to the width of the specified imageSubresource of dstImage (https://docs.vulkan.org/spec/latest/chapters/copies.html#VUID-vkCmdCopyBufferToImage-imageSubresource-07971)
 in D:/Progetti/KytyPS5/src/graphics/presentation/window/vulkanWindow.cpp:767
```

## Steps to reproduce

Launch the game from kytyPS5 and play!
As soon as I start playing and move the controller's stick to rotate the camera, the game crashes.

## Expected behavior

The game is expected to run smoothly, without any graphical artifacts.

> Source: [KytyPS5 issue #2163](https://github.com/KytyPS5/KytyPS5/issues/2163)
