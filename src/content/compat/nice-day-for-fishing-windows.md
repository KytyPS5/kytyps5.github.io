---
title: "Nice Day for Fishing"
titleId: "PPSA26923"
status: "in-game"
testedVersion: "KytyPS5-2026-11-07-589bd14"
testedDate: "2026-11-07"
os: "windows"
hardware: "13th Gen Intel(R) Core(TM) i7-13700K (3.40 GHz) / NVIDIA GeForce RTX 4070 Ti / 32 GB DDR5 / 12 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/4b4a2a30-d420-4731-a8bf-401076300950"]
---

The game starts up correctly, but shortly after it starts, the following error occurs:

--- Error ---
[Vulkan][E][2]: vkCmdBeginRendering(): pRenderingInfo->pDepthAttachment->imageView width (18) is less than pRenderingInfo->renderArea.offset.x (0) + pRenderingInfo->renderArea.extent.width (69).
The Vulkan spec states: If the pNext chain does not contain VkDeviceGroupRenderPassBeginInfo or its deviceRenderAreaCount member is equal to 0, the width of the imageView member of each element of pColorAttachments, pDepthAttachment, or pStencilAttachment that is not VK_NULL_HANDLE must be greater than or equal to renderArea.offset.x + renderArea.extent.width (https://docs.vulkan.org/spec/latest/chapters/renderpass.html#VUID-VkRenderingInfo-pNext-06079)
 in D:/Progetti/KytyPS5/src/graphics/presentation/window/vulkanWindow.cpp:767

## Steps to reproduce

1 Launch the game from KytyPS5
2 Start a game from the menu
3 The game crashes shortly after starting the game

## Expected behavior

The game should prevent crashes.

> Source: [KytyPS5 issue #2171](https://github.com/KytyPS5/KytyPS5/issues/2171)
