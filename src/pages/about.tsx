import { Cpu, GitBranch, Layers, Microscope, ShieldCheck, Workflow } from "lucide-react";
import { Seo, softwareJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributorsGrid } from "@/components/github/contributors-grid";
import { REPO_URL } from "@/lib/github";

const ARCHITECTURE = [
  {
    icon: Microscope,
    title: "Shader recompiler",
    text: "RDNA 2 instruction decoding, intermediate representation, control flow, resource tracking and SPIR-V emission — with AMD's RDNA 2 ISA reference as the primary encoding guide.",
  },
  {
    icon: Layers,
    title: "Guest GPU",
    text: "PS5 (Prospero) GPU formats and command processing, translating what games actually submit.",
  },
  {
    icon: Cpu,
    title: "Host GPU",
    text: "A Vulkan 1.3 host backend with resource management built on modern memory-allocation libraries.",
  },
  {
    icon: Workflow,
    title: "Tests that matter",
    text: "Focused memory, shader and resource-tracking regression tests keep the foundations honest.",
  },
] as const;

const TECH = [
  "C++", "CMake", "Ninja", "Clang", "Vulkan 1.3", "SPIR-V", "RDNA 2", "Qt 6", "SDL2", "FFmpeg", "imgui", "tracy",
] as const;

export function AboutPage() {
  return (
    <>
      <Seo
        title="About"
        description="KytyPS5 is a free and open-source PlayStation 5 emulator based on a heavily modified Kyty fork, focused on compatibility and boot reliability."
        path="/about"
        jsonLd={softwareJsonLd()}
      />
      <PageHeader
        eyebrow="About"
        title="Why KytyPS5 exists"
        description="A free, open-source emulator for a console generation that's barely documented — built by the community, for the community."
      />

      {/* Story */}
      <Section className="!pt-4">
        <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-text-secondary sm:text-lg">
          <p>
            KytyPS5 is a <span className="text-text-primary">free and open-source PlayStation 5
            emulator</span> written in C++, based on a heavily modified version of the original{" "}
            <a href="https://github.com/InoriRus/Kyty" target="_blank" rel="noreferrer noopener" className="text-accent hover:text-accent-2">
              Kyty
            </a>{" "}
            project. It targets Windows, Linux and macOS — with Windows as the primary platform and
            macOS support still experimental.
          </p>
          <p>
            The project is in an early stage of development, and it is honest about it. Today it can
            boot 2D games and a selection of 3D games — including titles built with Unreal Engine
            4/5, Unity and custom engines — with no external low-level emulation modules required.
            Development is focused on{" "}
            <span className="text-text-primary">compatibility and boot reliability</span>, the
            fundamentals everything else depends on.
          </p>
          <p>
            Like the games it runs, the emulator is x86-64 at its core. On Apple Silicon it runs
            under Rosetta 2, and Vulkan comes from the bundled MoltenVK — a small number of titles
            have already been verified in-game on Apple Silicon hardware.
          </p>
        </div>
      </Section>

      {/* Architecture */}
      <Section
        eyebrow="Under the hood"
        title="A modern emulator architecture"
        className="bg-surface/40"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {ARCHITECTURE.map((item) => (
            <div
              key={item.title}
              className="rounded-panel border border-border bg-surface p-7 shadow-card transition-colors duration-200 hover:border-border-strong"
            >
              <span className="grid size-11 place-items-center rounded-control border border-border bg-elevated text-accent">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {TECH.map((tech) => (
            <Badge key={tech} variant="default" className="px-3 py-1 font-mono normal-case">
              {tech}
            </Badge>
          ))}
        </div>
      </Section>

      {/* License & legal */}
      <Section eyebrow="License & legal" title="Free, and honest about it">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="rounded-panel border border-border bg-surface p-7 shadow-card">
            <span className="grid size-11 place-items-center rounded-control bg-iris text-white shadow-glow-soft">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
              GPL-2.0, for everyone
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              KytyPS5 is licensed under the GNU General Public License version 2. It is based on the
              original Kyty project (MIT License), whose copyright and license notice are preserved
              in the repository.
            </p>
          </div>
          <div className="rounded-panel border border-border bg-surface p-7 shadow-card">
            <span className="grid size-11 place-items-center rounded-control border border-border bg-elevated text-run">
              <GitBranch className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
              Not affiliated with Sony
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              KytyPS5 is not affiliated with Sony Interactive Entertainment or PlayStation. The
              project does not distribute games or copyrighted system software — use only game
              files you have obtained legally.
            </p>
          </div>
        </div>
      </Section>

      {/* Contributors */}
      <Section eyebrow="People" title="The team" className="bg-surface/40">
        <div className="flex flex-col items-center gap-6 text-center">
          <ContributorsGrid />
          <Button asChild variant="secondary">
            <a href={`${REPO_URL}/graphs/contributors`} target="_blank" rel="noreferrer noopener">
              All contributors on GitHub
            </a>
          </Button>
        </div>
      </Section>
    </>
  );
}
