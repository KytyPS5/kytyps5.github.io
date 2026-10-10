---
title: "STAR WARS Zero Company"
titleId: "PPSA18054"
status: "doesnt-boot"
testedVersion: "Source build of `main` at 59183db (2026-10-09, Release, clang 22 / lld). Also reproduced on the official Linux release KytyPS5-2026-10-08-2f4b8a3 and on Jetsku U59 int18-pre (1c682a1)."
testedDate: "2026-10-10"
os: "linux"
hardware: "Intel Core i9-14900K / NVIDIA GeForce RTX 4090 24 GB, proprietary driver 615.78.08 / 48 GB / 24 GB"
---

The game boots, loads its bundled modules, compiles ~200 compute pipelines and presents black frames. After ~50–100 s the guest stops flipping (flipArg stops at ~1900–2600) and the window stays black at 0 fps for good. No logo is ever shown.

**NVIDIA Xid 109 on every run** (one per run, from `dmesg`):
```
NVRM: Xid (PCI:0000:01:00): 109, pid=763199, name=kyty_emulator, channel 0x0000001f, errorString CTX SWITCH TIMEOUT, Info 0x1bc028
NVRM: Xid (PCI:0000:01:00): 109, pid=766631, name=kyty_emulator, channel 0x0000001f, errorString CTX SWITCH TIMEOUT, Info 0x1bc028
NVRM: Xid (PCI:0000:01:00): 109, pid=768524, name=kyty_emulator, channel 0x0000001f, errorString CTX SWITCH TIMEOUT, Info 0xbc028
NVRM: Xid (PCI:0000:01:00): 109, pid=770285, name=kyty_emulator, channel 0x0000001f, errorString CTX SWITCH TIMEOUT, Info 0x1bc028
NVRM: Xid (PCI:0000:01:00): 109, pid=771820, name=kyty_emulator, channel 0x0000001f, errorString CTX SWITCH TIMEOUT, Info 0xbc028
```
So a shader in one batch never finishes, the driver times the context out, and that batch's timeline tick is never signaled. Afterwards the GPU is idle (~28 W) and the device is not reported lost, so `MasterSemaphore::Wait` (`waitSemaphores(..., UINT64_MAX)`) waits forever.

**Where the emulator waits** (59183db, stripped Release binary symbolized with its lld map). Guest GPU thread:
```
MasterSemaphore::Wait
CommandScheduler::Wait
BufferCache::DownloadBufferMemory<false>
BufferCache::ReadMemory
TextureCache::MaterializeColorClear          (another run: RenderContext::HandleFault <- CommandProcessor::DrawIndirectMulti)
TextureCache::FindImage
RenderExecutor::ResolveRenderColorTarget
RenderExecutor::PrepareDrawRenderState / DrawIndex
CommandProcessor::DrawIndexOffset / ProcessPm4 / Process
GuestGpu::Process / GuestGpu::ThreadRun
```
The game's RHISubmissionThread then waits in `Gen5::AgcSuspendPoint -> GuestGpu::SuspendPoint` (the previous suspend point is never released), which stops the frame loop.

With a local, logging-only change to `MasterSemaphore::Wait` (5 s timeout slices; the hang is the same without it):
```
MasterSemaphore::Wait stalled 15 s: waiting for tick 14622, GPU reached 14621, recorded up to 14623
```
The batch the GPU thread has just submitted never completes. No wait semaphores are attached to it. `--present-mode Immediate` does not change anything.

**Vulkan validation** (`--vulkan-validation true`): no validation errors before the hang (they are fatal in this build; the run reached the same hang). Repeated warnings:
```
vkCmdDrawIndexed(): Inside [VK_SHADER_STAGE_FRAGMENT_BIT] [Output variable, Location 0, "out_mrt_0"] with a numeric type of FLOAT but VkRenderingInfo::pColorAttachments[0].imageView is created with VK_FORMAT_R32_UINT (numeric type of UINT)
(same for VK_FORMAT_R32G32B32A32_UINT)
```
Fragment exports to integer render targets are emitted as float. UE5 uses R32_UINT / RGBA32_UINT targets (e.g. the Nanite visibility buffer); undefined values there could send a later GPU-driven pass into a loop that never ends, which would match the Xid 109. This is a guess, not proven.

On 2f4b8a3 and U59 the game also calls three unresolved Agc stubs (`uZW-mqsxkrM` AgcCbBranchGetSize, `7Wa3aeJgeVU` AgcBranchPatchSetThenTarget, `GBCh3zCihoU` AgcDcbSetCxRegistersIndirectGetSize). On 59183db these are implemented and no Agc stub is called, but the hang is the same. The only stubs called on 59183db are NpCppWebApi / Http2 / Net / Ssl (offline).

## Steps to reproduce

1. Use a dump of PPSA18054 01.000.003 (the folder with `eboot.bin`, `sce_sys`, `sce_module`, `prx`).
2. Run: `kyty_emulator --game <PPSA18054 folder> --gpu 0 --screen-width 1920 --screen-height 1080 --amd-cpu --shader-validation false --skip-notice-screen true --printf-direction Console`
3. Wait about 1–2 minutes: the window stays black, the guest stops flipping, and `dmesg` shows Xid 109 for kyty_emulator.

## Expected behavior

The game shows its startup logos and reaches the main menu.

## Last working build / first broken build

(no build has booted it)

> Source: [KytyPS5 issue #1347](https://github.com/KytyPS5/KytyPS5/issues/1347)
