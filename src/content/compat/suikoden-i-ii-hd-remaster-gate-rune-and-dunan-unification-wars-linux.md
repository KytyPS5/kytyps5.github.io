---
title: "Suikoden I&II HD Remaster Gate Rune and Dunan Unification Wars"
titleId: "PPSA18305"
status: "in-game"
testedVersion: "Commit: 9e41d832"
testedDate: "2026-10-15"
os: "linux"
hardware: "Intel 13th Gen Core i5-13600HX (Mobile chip) / Nvidia RTX 1000 Ada Generation Laptop GPU, NVIDIA-SMI 615.78.08, KMD Version: 615.78.08, CUDA UMD Version: 13.4 / 32GB of DDR5 laptop SODIMM, 6GB VRAM"
---

This is a dual-game modern remaster that utilizes the Unity game engine.

The first game plays decently as far as I can tell, with minor graphical glitches.
The second game has slow-downs and more graphical glitches.

## Steps to reproduce

1. Open or build Kyty
2. Configure Kyty to have a game dir
3. Place game in the game dir
4. Run game

## Expected behavior

Some smooth down and graphical issues are likely due to shaders and random bugs. There are two scrolling bugs within the two different games in each game's settings/license menu screens.

The first game, the text over flows the text box.
The second game, the joystick scrolls the text too fast and creates a rubber banding issue that is not present if just using the d-pad to scroll.

## Extra notes

Some notes to make building on Arch/CachyOS easier for others:

Dependencies:
```
sudo pacman -Syu

sudo pacman -S --needed \
  base-devel clang lld ninja cmake git glslang python pkgconf \
  mesa libglvnd vulkan-headers vulkan-icd-loader vulkan-tools \
  libx11 libxcursor libxext libxfixes libxi libxrandr \
  libxss libxtst libxkbcommon \
  alsa-lib libpulse systemd-libs dbus \
  wayland wayland-protocols \
  qt6-base \
  jxrlib libheif
```

> Source: [KytyPS5 issue #1543](https://github.com/KytyPS5/KytyPS5/issues/1543)
