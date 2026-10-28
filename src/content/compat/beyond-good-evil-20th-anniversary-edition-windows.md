---
title: "Beyond Good & Evil - 20th Anniversary Edition"
titleId: "PPSA08705"
status: "in-game"
testedVersion: "KytyPS5-2026-10-25-b2c9ec7"
testedDate: "2026-10-26"
os: "windows"
hardware: "AMD 9800X3d / NVIDIA 5080 / 32 GB DDR5"
---

Main issue is the game runs way too fast. Audio is fine but everything else is too fast (a nice problem to have in emulation!) to be playable.

Beyond Good and Evil actually has its timings defined in an .ini file (BGE.ini).

The block looks like:

```
[Time]
MaxDt = 0.2666666666
# Only used with GDI_Cul_DF_ForceOneTrameEngine in the display flags (or with EnableFixedDt)
FixedDt = 0.0166666666
# 288 fps
MinDt = 0.0034722222
EnableFixedDt = false
```

I actually have been looking at the PC port and I know it has a function around timings called TIM_Clock_Update.

And it's something like:

```
TIM_gf_MainClockReal = (counter - TIM_gul_StartCounter) / TIM_gul_TicksPerSecond;
realdt = MainClockReal - previous;
realdt = clamp(realdt, MinDt, MaxDt);
dt = SpeedFactor * realdt * GameSpeed;
TIM_gf_MainClock += dt;
```
So when you look at these values when running in the emulator it's

```
0x9016B6298  TIM_gf_MaxDt        0.26666668
0x9016B62A0  TIM_gf_MinDt        0.00347222
0x9016B62A4  TIM_gf_SpeedFactor  1.0
0x9016B62A8  TIM_gf_GameSpeed    1.0
0x901E784A4  TIM_gf_MainClock    11.59 per second
0x901E784AC  TIM_gf_realdt       0.1934
0x901E784A0  TicksPerSecond      404932704
```

The weird thing is TicksPerSecond. It's derived from sceKernelGetProcessTimeCounterFrequency() currently. I am currently using a 4.7ghz processor (9800x3d). As I understand it TicksPerSecond is a 32 bit value. So currently it is trying to put 4,699,900,000 in there and it overflows. So 4,699,900,000  -  4,294,967,296  =  404,932,704. And so if you do 4,699,900,000 / 404,932,704 you get 11.606. Which means my game essentially is running 11.606 times faster than it should be.

Fortunately on base PS5 hardware the clock speed is below the 32 bit max so the issue isn't on there.

Amusingly I can actually fix this with no code changes at all by editing the BGE.ini directly and changing MaxDt to 0.0166666667 from 0.2666666666.

In actual code terms on my PC I have fixed this and the code looks like: https://github.com/KytyPS5/KytyPS5/commit/f55fb928eaef36ab254eb6435c3ace1a01cc687c.

So the fix is to use a frequency below the 32 bit limit (like the PS5) and scale the values coming from KernelReadTscNative() based on this.

I am not 100% sure if this is the 'right' fix and if it creates regressions etc so I am unsure about raising a PR. If you feel I should then let me know but for anyone wanting to play the game at the correct speed at time of writing this works.

## Steps to reproduce

1. Open the emulator
2. Start the game
3. Observe intro really really fast and that starting a new game is equally as fast

## Expected behavior

Should run at its expected speed at 60 fps.

> Source: [KytyPS5 issue #1910](https://github.com/KytyPS5/KytyPS5/issues/1910)
