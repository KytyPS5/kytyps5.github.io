import * as React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Info } from "lucide-react";
import { Seo } from "@/lib/seo";
import { BUILD_STEPS, DOC_SECTIONS } from "@/lib/content";
import { Container } from "@/components/layout/container";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { REPO, REPO_URL } from "@/lib/github";

function DocSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-28 border-b border-border py-10 first:pt-0 last:border-b-0"
    >
      <h2
        id={`${id}-heading`}
        className="flex items-baseline gap-3 font-display text-2xl font-semibold tracking-tight"
      >
        <span className="font-mono text-sm text-text-muted">{index.toString().padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-text-secondary sm:text-base">
        {children}
      </div>
    </section>
  );
}

const CALL = (
  <>
    <p>
      The emulator can also be started directly with a legally obtained game directory or ELF file.
      Run <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">kyty_emulator --help</code>{" "}
      to see the available graphics, logging, validation, profiling and debugging options.
    </p>
    <div className="grid gap-4 md:grid-cols-2">
      <CodeBlock
        code={['kyty_emulator.exe --game "D:\\Games\\ExampleGame"']}
        title="Windows · CLI"
        variant="code"
      />
      <CodeBlock
        code={['./_Build/linux/install/kyty_emulator --game "/games/ExampleGame"']}
        title="Linux · CLI"
        variant="code"
      />
    </div>
    <p>
      On macOS, point SDL at the MoltenVK library explicitly — the hardened runtime prevents it
      from being picked up from the executable's directory:
    </p>
    <CodeBlock
      code={[
        "cd _Build/macos/install",
        'SDL_VULKAN_LIBRARY="$PWD/libMoltenVK.dylib" ./kyty_emulator --game "/games/ExampleGame"',
      ]}
      title="macOS · CLI"
      variant="code"
    />
  </>
);

export function DocumentationPage() {
  return (
    <>
      <Seo
        title="Documentation"
        description="Installation, building from source, dependencies, running and troubleshooting guides for KytyPS5 on Windows, Linux and macOS."
        path="/docs"
      />
      <div className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black,transparent)]" />
          <div className="absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(91,140,255,0.16),transparent)] blur-3xl" />
        </div>
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Documentation</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              From source to screen
            </h1>
            <p className="mt-5 text-base leading-relaxed text-text-secondary sm:text-lg">
              Everything you need to install, build and run KytyPS5 — adapted from the repository
              README.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav
              aria-label="Documentation sections"
              className="sticky top-24 flex flex-col gap-1 rounded-panel border border-border bg-surface p-4"
            >
              {DOC_SECTIONS.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-md px-3 py-2 text-sm text-text-secondary transition-colors duration-150 hover:bg-white/5 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span className="mr-2 font-mono text-xs text-text-muted">
                    {i.toString().padStart(2, "0")}
                  </span>
                  {section.label}
                </a>
              ))}
              <div className="mt-2 border-t border-border pt-3">
                <Link
                  to="/faq"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  FAQ →
                </Link>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            <DocSection id="install" index={1} title="Installation">
              <p>
                The fastest way to get started is to download the prebuilt archive for your platform
                from the{" "}
                <Link to="/download" className="rounded-sm text-accent hover:text-accent-2">
                  Download page
                </Link>
                . To run from source, build the launcher as described below.
              </p>
              <div className="flex items-start gap-3 rounded-card border border-warning/25 bg-warning/5 p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <p className="text-sm text-text-secondary">
                  KytyPS5 is in an early stage of development — expect crashes, graphical glitches,
                  low compatibility and poor performance. Behavior may change significantly between
                  builds. Update your graphics driver before reporting rendering problems.
                </p>
              </div>
              <p>
                Use only game files you have obtained legally. The project does not distribute games
                or copyrighted system software, and no external low-level emulation modules are
                currently required.
              </p>
            </DocSection>

            <DocSection id="build" index={2} title="Building from source">
              <p>
                Clone the repository, initialize the submodules, then configure and build with CMake
                and Ninja. Clang is required on every platform — the Microsoft C++ compiler is not
                supported.
              </p>
              <CodeBlock code={["$ git clone https://github.com/KytyPS5/KytyPS5.git", "$ cd KytyPS5", "$ git submodule update --init --recursive"]} title="Clone & init submodules" />
              <Tabs defaultValue="windows">
                <TabsList>
                  <TabsTrigger value="windows">Windows</TabsTrigger>
                  <TabsTrigger value="linux">Linux</TabsTrigger>
                  <TabsTrigger value="macos">macOS</TabsTrigger>
                </TabsList>
                <TabsContent value="windows">
                  <div className="space-y-4">
                    <CodeBlock code={BUILD_STEPS.windows} title="Windows · clang-cl + Ninja" />
                    <p>
                      Open an <span className="text-text-primary">x64 Native Tools Command Prompt
                      for Visual Studio 2022</span> (or the equivalent Developer PowerShell) before
                      configuring. A ready-made VS Code setup (CMake Tools, launch profiles for{" "}
                      <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">launcher.exe</code>{" "}
                      and <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">kyty_emulator.exe</code>)
                      is included in the repository's <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">.vscode</code> folder.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="linux">
                  <div className="space-y-4">
                    <CodeBlock code={BUILD_STEPS.linux} title="Linux · clang + Ninja" />
                    <p>
                      Without the audio, Wayland and udev development packages, the bundled SDL2
                      quietly configures itself without those backends — and the resulting build has
                      no working sound and no gamepad hotplug.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="macos">
                  <div className="space-y-4">
                    <CodeBlock code={BUILD_STEPS.macos} title="macOS · x86-64 + Rosetta 2" />
                    <p>
                      macOS builds target x86-64, so the PS5's x86-64 game code runs through the same
                      translation layer as the emulator itself. Install Rosetta 2 with{" "}
                      <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                        softwareupdate --install-rosetta
                      </code>
                      . Homebrew's Qt is arm64-only and will not link — use the official universal Qt
                      installation.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              <p>
                The install step copies the Qt libraries and plugins next to the binaries, so the
                install folder runs without a matching system Qt. Regression tests:{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                  cmake --build _Build/windows --target kyty_tests
                </code>{" "}
                then{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                  ctest --test-dir _Build/windows --output-on-failure
                </code>
                .
              </p>
            </DocSection>

            <DocSection id="dependencies" index={3} title="Dependencies">
              <p>
                Beyond the toolchain, the project vendors most libraries as Git submodules — including
                SDL2, Vulkan-Headers, SPIRV-Tools, SPIRV-Headers, VulkanMemoryAllocator, ffmpeg-core,
                fmt, spdlog, tracy, imgui and more.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Git",
                  "CMake 3.12 or newer",
                  "Ninja",
                  "Clang / clang-cl (MSVC is not supported)",
                  "Qt 6 including Concurrent, Network and Widgets",
                  "A Vulkan 1.3-capable GPU with current drivers",
                ].map((dep) => (
                  <li key={dep} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {dep}
                  </li>
                ))}
              </ul>
            </DocSection>

            <DocSection id="running" index={4} title="Running">
              <p>To use the graphical launcher:</p>
              <div className="grid gap-4 md:grid-cols-2">
                <CodeBlock code={[".\\_Build\\windows\\install\\launcher.exe"]} title="Windows" variant="code" />
                <CodeBlock code={["./_Build/linux/install/launcher"]} title="Linux" variant="code" />
              </div>
              <p>
                On first launch, add one or more game folders in the global settings. The launcher
                searches those folders recursively for game directories containing{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">eboot.bin</code>{" "}
                — select a detected game and run it from the game list.
              </p>
              {CALL}
            </DocSection>

            <DocSection id="troubleshooting" index={5} title="Troubleshooting">
              <ul className="space-y-4">
                <li>
                  <h3 className="font-display text-sm font-semibold text-text-primary">
                    Rendering problems?
                  </h3>
                  <p className="mt-1">
                    Update your graphics driver before reporting rendering problems.
                  </p>
                </li>
                <li>
                  <h3 className="font-display text-sm font-semibold text-text-primary">
                    Game won't boot or crashes?
                  </h3>
                  <p className="mt-1">
                    The project is in an early stage — expect crashes, graphical glitches and poor
                    performance. Compatibility changes significantly between builds.
                  </p>
                </li>
                <li>
                  <h3 className="font-display text-sm font-semibold text-text-primary">
                    Opening an issue?
                  </h3>
                  <p className="mt-1">
                    Search existing issues first, then use the Game Emulation Bug Report template and
                    attach the complete log file.
                  </p>
                </li>
                <li>
                  <h3 className="font-display text-sm font-semibold text-text-primary">
                    Linux build has no sound or gamepad hotplug?
                  </h3>
                  <p className="mt-1">
                    The SDL2 dev packages (audio, Wayland, udev) were missing when CMake configured
                    the project. Reinstall them and reconfigure.
                  </p>
                </li>
              </ul>
            </DocSection>

            <DocSection id="contributing" index={6} title="Contributing">
              <p>
                Testing games and submitting detailed bug reports are useful ways to contribute, as
                are focused code contributions that build on the platforms they touch. See the{" "}
                <Link to="/contributing" className="rounded-sm text-accent hover:text-accent-2">
                  Contributing page
                </Link>{" "}
                for the full guidelines, formatting setup and AI-use policy.
              </p>
            </DocSection>

            <DocSection id="repository" index={7} title="Repository links">
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: "Source code", href: REPO_URL },
                  { label: "Releases", href: `${REPO_URL}/releases` },
                  { label: "Issues", href: `${REPO_URL}/issues` },
                  { label: "Pull requests", href: `${REPO_URL}/pulls` },
                  { label: "License (GPL-2.0)", href: `${REPO_URL}/blob/main/LICENSE` },
                ].map((link) => (
                  <Badge key={link.label} variant="default" className="gap-1 py-1.5 pl-3">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      {link.label}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-text-muted">
                Maintained by the {REPO} project. Found an error in this page? The content mirrors
                the README — open an issue or PR against the repository.
              </p>
            </DocSection>
          </div>
        </div>
      </Container>
    </>
  );
}
