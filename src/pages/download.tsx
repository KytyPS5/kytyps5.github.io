import { Link } from "react-router-dom";
import { ArrowRight, Blocks, Cpu, MonitorCheck } from "lucide-react";
import { Seo, softwareJsonLd } from "@/lib/seo";
import { BUILD_STEPS, BUILD_REQUIREMENTS, SYSTEM_REQUIREMENTS } from "@/lib/content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { LatestReleaseCard } from "@/components/github/latest-release-card";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function DownloadPage() {
  return (
    <>
      <Seo
        title="Download"
        description="Download the latest KytyPS5 build for Windows x64, Linux x86_64 or macOS x86_64, or build from source."
        path="/download"
        jsonLd={softwareJsonLd()}
      />

      <PageHeader
        eyebrow="Download"
        title="Get the latest build"
        description="Prebuilt binaries for every platform. Requirements and build-from-source instructions are below."
      />

      <Section className="!pt-4">
        <LatestReleaseCard />
      </Section>

      {/* Requirements */}
      <Section
        eyebrow="Requirements"
        title="What you need"
        className="bg-surface/40"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-panel border border-border bg-surface p-7 shadow-card">
            <span className="grid size-11 place-items-center rounded-control border border-border bg-elevated text-accent">
              <Cpu className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
              System requirements
            </h3>
            <ul className="mt-4 space-y-2.5">
              {SYSTEM_REQUIREMENTS.map((req) => (
                <li key={req} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-panel border border-border bg-surface p-7 shadow-card">
            <span className="grid size-11 place-items-center rounded-control border border-border bg-elevated text-accent">
              <Blocks className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
              Build requirements
            </h3>
            <ul className="mt-4 space-y-2.5">
              {BUILD_REQUIREMENTS.map((req) => (
                <li key={req} className="flex gap-2.5 text-sm leading-relaxed text-text-secondary">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Build from source */}
      <Section
        eyebrow="Build from source"
        title="Same toolchain, every platform"
        description="Initialize the submodules, configure with CMake and Ninja using Clang, then build the launcher. The MSVC compiler is not supported."
      >
        <Tabs defaultValue="windows">
          <TabsList>
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
            <TabsTrigger value="macos">macOS</TabsTrigger>
          </TabsList>
          <TabsContent value="windows">
            <div className="space-y-4">
              <CodeBlock code={[...BUILD_STEPS.common, ...BUILD_STEPS.windows]} title="Windows · clang-cl + Ninja" />
              <p className="text-sm leading-relaxed text-text-secondary">
                Requires Visual Studio 2022 (or Build Tools 2022) with the{" "}
                <span className="text-text-primary">Desktop development with C++</span> workload and{" "}
                <span className="text-text-primary">C++ Clang tools for Windows</span>, plus Qt 6 for
                MSVC 2022 64-bit. The finished app lands in{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                  _Build/windows/install
                </code>
                .
              </p>
            </div>
          </TabsContent>
          <TabsContent value="linux">
            <div className="space-y-4">
              <CodeBlock code={[...BUILD_STEPS.common, ...BUILD_STEPS.linux]} title="Linux · clang + Ninja" />
              <p className="text-sm leading-relaxed text-text-secondary">
                The bundled SDL2 needs the audio, Wayland and udev dev packages — without them it
                silently builds without sound or gamepad hotplug. Qt 6 (Concurrent, Network,
                Widgets) is required, from your distribution or the official installer.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="macos">
            <div className="space-y-4">
              <CodeBlock code={[...BUILD_STEPS.common, ...BUILD_STEPS.macos]} title="macOS · x86-64 + Rosetta 2" />
              <p className="text-sm leading-relaxed text-text-secondary">
                macOS builds target x86-64 and run under Rosetta 2 on Apple Silicon. The build
                re-signs <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">kyty_emulator</code>{" "}
                with JIT entitlements automatically, and release archives include a signed MoltenVK.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* CTA */}
      <Section className="!pt-0">
        <div className="flex flex-col items-center gap-5 rounded-window border border-border bg-surface p-10 text-center sm:p-14">
          <span className="grid size-12 place-items-center rounded-control bg-iris text-white shadow-glow-soft">
            <MonitorCheck className="size-6" aria-hidden="true" />
          </span>
          <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Running into trouble?
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            The documentation covers installation, running and troubleshooting on every platform —
            including the command-line options for graphics, logging and profiling.
          </p>
          <Button asChild size="lg">
            <Link to="/docs">
              Read the documentation
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
