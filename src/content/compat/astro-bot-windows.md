---
title: "Astro Bot"
titleId: "PPSA21564"
status: "in-game"
testedVersion: "2026-09-20-ba55ba5"
testedDate: "2026-09-21"
os: "windows"
hardware: "AMD Ryzen 5 3600X 6-Core / NVIDIA GeForce RTX 3060 Ti / 32 GB DDR4 RAM / 8 GB VRAM"
screenshots: ["https://github.com/user-attachments/assets/ffad12a7-c5a2-4e49-96a7-40b3aacb0b3d","https://github.com/user-attachments/assets/52564cd0-4adb-4244-a117-aa99e5c21e33"]
---

Without any patches, the game will hang due to unimplemented MIMP instructions (see #281 and #657 among other tickets).

However, there is a patch floating around to get around said unimplemented instructions:
```json
{
    "id": "PPSA21564",
    "name": "ASTRO BOT: non RT patch",
    "version": "01.007.000",
    "process": "eboot.bin",
    "source_sha256": "70d673f7c43edb189461a60f076e15baa73f9a82a579603e44372ae5b7225d3d",
    "mods": [
        {
            "name": "Select the existing non-tiled deferred-lighting renderer",
            "enabled": true,
            "memory": [
                {
                    "offset": "0x73eb993",
                    "off": "4584f60f84ed0800004531f64c8d3dea78a40141b430",
                    "on": "4584f6e9ee080000904531f64c8d3dea78a40141b430"
                }
            ]
        },
        {
            "name": "Disable GI probes and lighting shaders",
            "enabled": true,
            "memory": [
                {
                    "offset": "0x711d0b3",
                    "off": "0fb682800700008887e4050000",
                    "on": "b80000000090908887e4050000"
                }
            ]
        }
    ]
}
```
With this patch, the game manages to boot, play the intro FMV, get to the file select menu to start a new game, plays the in-engine intro cutscenes, and finally reaches gameplay in the intro level. Granted, performance is rather sluggish on my decent-but-not-quite-high-end hardware (ranging anywhere from 1 to 16 frames per second in-engine, and topping out around 40 when simply rendering FMVs), but the bulk of the game's code appears to be largely working.

However, once you get to the level select hub, attempting to select the first level (Sky Garden) will result in one of three things happening, seemingly at random:
- The game crashes with an `Unhandled host exception` as soon as the controller begins to "rev up" to transition into the loading screen. This happens roughly around compiled shader 120 when using the reproduction steps below on an existing save.
- The game gets past that first crash, and then softlocks in the loading screen tunnel. The game is technically still controllable in this state, but it will never progress. (Tested by leaving it run for well over ten minutes, far longer than real hardware would take to load this level and confirming via Task Manager that no data is being read off of my SSD)
- The game gets past both of these and manages to start the level proper. So far I have only managed this on the specific commit ba55ba5 , but I might have just be getting unlucky on previous versions of KytyPS5.

## Steps to reproduce

1. Start ASTRO BOT with KytyPS5. In my case, since Windows Defender kept flagging the launcher as malware (which I'd rather not take a chance on despite double-checking the source code to be sure it's a false positive), I was using the command line in Windows: `kyty_emulator.exe --game "G:\KytyPS5\Games\PPSA21564\eboot.bin" --game-patch "G:\KytyPS5\_Patches\PPSA21564.json"`
2. Either start a new save or load up a save if one is present. In this test case, I had a save already present with 0 Bots collected and nothing but the intro level completed.
3. Once the hub loads, select the first galaxy (Gorilla Nebula).
4. Go to the first level, Sky Garden, and then hold X for a few seconds to start it.
5. Observe results. If you're using the command line, you can also monitor the shaders being compiled as a way of monitoring progress.

## Expected behavior

After an animation of the controller twisting and flying into the level, a loading screen "tunnel" should appear for about 5 seconds, before transitioning to a white screen, and then the level itself starts. There should also be plenty of shaders compiled during this time and hard drive activity since the game is loading data.

## Last working build / first broken build

2026-09-19-f100f78 (likely earlier as well)

## Extra notes

From my experimenting, it seems that clearing the `_PipelineCache` and `_TempData` folders makes loading levels *slightly* more likely to load properly, though by no means a guarantee. I suspect there's most likely a race condition somewhere.

I have also, on rare occasions, seen a similar crash for this function that's ran when simply loading the hub world, and may be caused by the same underlying issue:
```
thread: ProductNextLoad_ATQT
```

> Source: [KytyPS5 issue #745](https://github.com/KytyPS5/KytyPS5/issues/745)
