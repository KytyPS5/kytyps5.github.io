---
title: "FAR: Changing Tides"
titleId: "PPSA03766"
status: "doesnt-boot"
testedVersion: "KytyPS5-2026-11-07-589bd14"
testedDate: "2026-11-07"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

the game doesn't load the menu.

**Log error:**
```
[Vulkan][E][2]: vkCmdDispatchIndirect(): the sampled image descriptor [Set 0, Binding 24, Index 1] has VkImageView 0xd650000000d65 with format of VK_FORMAT_R8G8B8A8_SRGB which doesn't support VK_FORMAT_FEATURE_2_SAMPLED_IMAGE_DEPTH_COMPARISON_BIT.
(supported features: VK_FORMAT_FEATURE_2_SAMPLED_IMAGE_BIT|VK_FORMAT_FEATURE_2_COLOR_ATTACHMENT_BIT|VK_FORMAT_FEATURE_2_COLOR_ATTACHMENT_BLEND_BIT|VK_FORMAT_FEATURE_2_BLIT_SRC_BIT|VK_FORMAT_FEATURE_2_BLIT_DST_BIT|VK_FORMAT_FEATURE_2_SAMPLED_IMAGE_FILTER_LINEAR_BIT|VK_FORMAT_FEATURE_2_TRANSFER_SRC_BIT|VK_FORMAT_FEATURE_2_TRANSFER_DST_BIT|VK_FORMAT_FEATURE_2_SAMPLED_IMAGE_FILTER_MINMAX_BIT|VK_FORMAT_FEATURE_2_HOST_IMAGE_TRANSFER_BIT|VK_FORMAT_FEATURE_2_COPY_IMAGE_INDIRECT_DST_BIT_KHR).
The Vulkan spec states: If a VkImageView is sampled with depth comparison, the image view's format features must contain VK_FORMAT_FEATURE_2_SAMPLED_IMAGE_DEPTH_COMPARISON_BIT (https://docs.vulkan.org/spec/latest/chapters/dispatch.html#VUID-vkCmdDispatchIndirect-None-06479)
 in D:/Progetti/KytyPS5/src/graphics/presentation/window/vulkanWindow.cpp:767
```

This error is similar whit this #2158

## Steps to reproduce

open kytyps5
boot game

## Expected behavior

The game won't start.

> Source: [KytyPS5 issue #2159](https://github.com/KytyPS5/KytyPS5/issues/2159)
