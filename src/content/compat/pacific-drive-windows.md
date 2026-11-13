---
title: "Pacific Drive"
titleId: "PPSA10965"
status: "main-menu"
testedVersion: "KytyPS5-2026-11-12-58ca8d1"
testedDate: "2026-11-12"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
---

The game launches, reaches the menu, and if you try to enter the game, it loads multiple shaders. At a certain point, the following crash occurs:

```
Shaders: VS 348 | PS 648 | CS 58 | GS 33 | LS 0 | HS 0 | TES 0
Shaders: VS 348 | PS 649 | CS 58 | GS 33 | LS 0 | HS 0 | TES 0
Shaders: VS 349 | PS 649 | CS 58 | GS 33 | LS 0 | HS 0 | TES 0
--- Build ---
Source build 58ca8d1-dirty
--- Error ---
[Vulkan][E][2]: vkCreateImageView(): pCreateInfo->pNext<VkImageViewUsageCreateInfo>.usage (VK_IMAGE_USAGE_2_STORAGE_BIT_KHR) must not include any bits that were not set in VkImageCreateInfo::usage (VK_IMAGE_USAGE_2_TRANSFER_SRC_BIT_KHR|VK_IMAGE_USAGE_2_TRANSFER_DST_BIT_KHR|VK_IMAGE_USAGE_2_SAMPLED_BIT_KHR|VK_IMAGE_USAGE_2_DEPTH_STENCIL_ATTACHMENT_BIT_KHR|VK_IMAGE_USAGE_2_ATTACHMENT_FEEDBACK_LOOP_BIT_EXT) of the image.
The Vulkan spec states: If the pNext chain includes a VkImageViewUsageCreateInfo structure, and image was not created with a VkImageStencilUsageCreateInfo structure included in the pNext chain of VkImageCreateInfo, its usage member must not include any bits that were not set in the usage member of the VkImageCreateInfo structure used to create image (https://docs.vulkan.org/spec/latest/chapters/resources.html#VUID-VkImageViewCreateInfo-pNext-02662)
 in D:/Progetti/KytyPS5/src/graphics/presentation/window/vulkanWindow.cpp:818
```

This makes it impossible to access the gameplay.

## Steps to reproduce

1. start the game
2. select new game from main menu.
3. Crash

## Expected behavior

Getting to the Gameplay

> Source: [KytyPS5 issue #2237](https://github.com/KytyPS5/KytyPS5/issues/2237)
