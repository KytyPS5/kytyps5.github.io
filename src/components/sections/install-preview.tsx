import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/layout/reveal";
import { BUILD_STEPS } from "@/lib/content";

export function InstallPreview() {
  return (
    <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-16">
      <Reveal from="left" className="flex flex-col">
        <div className="flex flex-col items-center text-center lg:text-start lg:items-start">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Get started</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary">
            Grab a prebuilt archive for your platform, or build from source — the CMake + Clang
            toolchain is the same everywhere. On first launch, add your game folders and the
            launcher finds every{" "}
            <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
              eboot.bin
            </code>{" "}
            automatically.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 ">
            <Button asChild size="lg">
              <Link to="/download">
                <Download className="size-5" aria-hidden="true" />
                Download the latest build
              </Link>
            </Button>
            <Link
              to="/docs"
              className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Full installation guide
              <ArrowRight
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </Reveal>
      <Reveal from="right" delay={0.12}>
        <Tabs defaultValue="linux">
          <TabsList aria-label="Choose your operating system" className="mx-auto flex w-fit lg:mx-0 lg:inline-flex">
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
            <TabsTrigger value="macos">macOS</TabsTrigger>
          </TabsList>
          <TabsContent value="windows">
            <CodeBlock
              code={[...BUILD_STEPS.common, ...BUILD_STEPS.windows]}
              title="Windows · clang-cl + Ninja"
            />
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Windows is the primary platform. Prebuilt .zip releases run straight out of the box;
              building requires Visual Studio 2022 with{" "}
              <span className="text-text-primary">Desktop development with C++</span> and{" "}
              <span className="text-text-primary">C++ Clang tools</span>.
            </p>
          </TabsContent>
          <TabsContent value="linux">
            <CodeBlock
              code={[...BUILD_STEPS.common, ...BUILD_STEPS.linux]}
              title="Linux · clang + Ninja"
            />
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Builds and runs on current distributions. The bundled SDL2 needs the audio, Wayland
              and udev dev packages, or it silently builds without sound or gamepad hotplug.
            </p>
          </TabsContent>
          <TabsContent value="macos">
            <CodeBlock
              code={[...BUILD_STEPS.common, ...BUILD_STEPS.macos]}
              title="macOS · x86-64 + Rosetta 2"
            />
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              macOS support is experimental: builds target x86-64 and run under Rosetta 2 on Apple
              Silicon, with Vulkan provided by the bundled MoltenVK.
            </p>
          </TabsContent>
        </Tabs>
      </Reveal>
    </div>
  );
}
