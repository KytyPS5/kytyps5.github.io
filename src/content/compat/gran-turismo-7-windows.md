---
title: "Gran Turismo 7"
titleId: "PPSA01317"
status: "in-game"
testedVersion: "1b7ea36"
testedDate: "2026-11-06"
os: "windows"
hardware: "amd ryzen 9 5900x 12-core / amd 9060xt 16gb oc (26.10.1) / 64GB DDR4 3200mhz"
screenshots: ["https://github.com/user-attachments/assets/8bbdba8f-affd-4d0b-969c-fede007d289d","https://github.com/user-attachments/assets/8efc89b2-bc4d-4e8b-a28e-105398f922ce","https://github.com/user-attachments/assets/edb96c00-3438-4211-95cf-66a7c266c11f"]
---

ShaderCFG.cpp:43, BC6HFloatBlock erros keep popping up and crashing the game, this is more of a progress report though.

the game runs, after 3-4 days of trouble shooting it does run, in time trials in  Autodrome Lago Maggiore, it runs at a rough 10fps after doing a shader compile lap, it does have stutters as expected but somewhat playable.

in the menus alone the fps from the ps5 experimental mode nearly double, as soon as this is implemented to be usable the game will be a lot more playable, i will list the progress i made when trying the game, i used the help of google gemini (yes i know ai bad and all) and it turned out to be surprisingly helpful in optimising the setup as there are no discord servers to look at or anything i could find myself.

## Steps to reproduce

boot kyty
apply settings that i will list below
run gran turismo
boom
it runs

## Expected behavior

very jittery, may crash a few times and will take a while to compile the shaders, once enough is compiled it becomes "playable" (again very badly with low fps)

## Extra notes

optimisation for shaders needed and full ps5 pro support, thats all that would help that i can see, but im surprised it even worked,
peak fps in menus; 60+
average fps in menus; 30~
peak fps in game; 15
average fps in game; 10
in game is the map Autodrome Lago Maggiore full course time trial, i have not tested with other cars yet.

> Source: [KytyPS5 issue #2133](https://github.com/KytyPS5/KytyPS5/issues/2133)
