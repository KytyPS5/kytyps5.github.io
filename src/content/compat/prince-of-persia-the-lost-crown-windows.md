---
title: "Prince of Persia: The Lost Crown"
titleId: "PPSA10067"
status: "in-game"
testedVersion: "0.3.0"
testedDate: "2026-10-19"
os: "windows"
hardware: "AMD Ryzen 7 7800X3D / NVIDIA GeForce RTX 4080 SUPER, driver 617.42 / 32 GB RAM / 16 GB VRAM"
---

rince of Persia: The Lost Crown reaches gameplay and Kyty successfully loads all 42 trophy definitions. However, the emulator reports no supported UDS extraction rules.

Gameplay events are received, but no trophy unlock is recorded and the following file is not created:

_Trophies/PPSA10067/trophies_1001_0.json

## Log evidence

```text
[Trophy] loaded 42 trophy definitions for PPSA10067 (service 0)
[Trophy] no supported UDS extraction rules in /app0/sce_sys/uds/uds00.ucp
[UDS] created event: UpdateNbSpikesKills
[UDS] posted event: UpdateNbSpikesKills
```

The captured session contains no `[Trophy] recorded unlock` message and no unlock-save failure.

## Metadata evidence

Read-only inspection of this game's `sce_sys/uds/uds00.ucp` found 59 stat definitions and 53 extraction rules.

A concrete example is trophy 0030, **Deadly Trap**:
“Eliminate 5 enemies by throwing them into spikes.”

Its metadata specifies:

- Event: `UpdateNbSpikesKills`
- Input: `$.newValue`
- Output stat ID: `113`
- Stat name: `NbSpikesKills`
- Data type: `int64`
- Aggregation: `max`
- Trophy comparator: `ge`
- Target value: `5`
- Progressive: `true`

The current `LoadUdsRules` implementation accepts only unsigned `latest` statistics, so this definition is skipped:

https://github.com/KytyPS5/KytyPS5/blob/e5f0ee7/src/common/trophies.cpp#L313-L378

The package also contains `count` statistics and enum/set definitions. None of its stat definitions satisfy the current unsigned `latest` restriction.

## Steps to reproduce

1. Launch the game using the Kyty launcher with user ID 1001.
2. Enable file logging and trophy notifications.
3. Perform gameplay actions associated with the trophy, such as throwing enemies into spikes.
4. Inspect the log: `UpdateNbSpikesKills` events are posted, but the UDS rules are reported as unsupported.

The numeric event values are not printed, so this log alone does not prove that the threshold of 5 was reached.

## Expected behavior

Evaluate the game's UDS rules and persist the corresponding trophy when its actual condition is satisfied.

I understand that #1088 intentionally introduced limited UDS support. This report provides a concrete affected title and metadata example for extending that support.

Related game compatibility report: #220.

> Source: [KytyPS5 issue #1705](https://github.com/KytyPS5/KytyPS5/issues/1705)
