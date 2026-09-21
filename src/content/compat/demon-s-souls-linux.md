---
title: "Demon's Souls"
titleId: "PPSA01342"
status: "in-game"
testedVersion: "KytyPS5-2026-09-18-5b7d334"
testedDate: "2026-09-18"
os: "linux"
hardware: "Ryzen 7 5700x / 7900XT / 32GB DDR4 at 3600MHz"
---

The game boots correctly, I can start a new game in offline mode, but as soon as I reach the "Choose body type" dialog (when selecting type A or B) the game crashes with the following error log.
Another thing I noticed is audio only playing during the PlayStation intro, there's no audio at all after that scene

```
shader resource specialization failed: indirect image table at pc 0x0000159c has incompatible candidates
--- Build ---
Official build KytyPS5-2026-09-18-5b7d334
--- Fatal Error ---
Error: condition (!ShaderRecompiler::IR::MaterializeResources( entry->second.resource_plan, runtime, resources, specialization)) is true in /home/runner/work/KytyPS5/KytyPS5/src/graphics/host_gpu/renderer/pipeline/pipelineCache.cpp:292
Press any key...
```

## Steps to reproduce

1. Open the game
2. Select New Game
3. Offline mode
4. Select a character type
5. Crash

## Expected behavior

Load the character model and begin character customization

## Extra notes

I'm playing on patch 01.004.000

> Source: [KytyPS5 issue #697](https://github.com/KytyPS5/KytyPS5/issues/697)
