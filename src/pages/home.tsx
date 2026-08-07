import { Seo, softwareJsonLd } from "@/lib/seo";
import { Hero } from "@/components/sections/hero";
import { Platforms } from "@/components/sections/platforms";
import { ScreenshotCarousel } from "@/components/sections/screenshot-carousel";
import { InstallPreview } from "@/components/sections/install-preview";
import { HowItWorks } from "@/components/sections/how-it-works";
import { FaqPreview } from "@/components/sections/faq-preview";
import { ContributingCta } from "@/components/sections/contributing-cta";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/layout/reveal";
import { CompatPreview } from "@/components/sections/compat-preview";
import { RepoStats } from "@/components/github/repo-stats";

export function HomePage() {
  return (
    <>
      <Seo
        title="Open-Source PlayStation 5 Emulator"
        description="KytyPS5 is a free and open-source PlayStation 5 emulator written in C++ for Windows, Linux and macOS. Download the latest build or build from source."
        path="/"
        jsonLd={softwareJsonLd()}
      />
      <Hero />

      {/* Project statistics */}
      <Section id="overview" containerClassName="!max-w-[1000px]" className="!py-0">
        <RepoStats />
      </Section>

      {/* Supported platforms */}
      <Section
        eyebrow="Platforms"
        title="Runs where you do"
        description="Windows is the primary platform and receives the most testing. Linux builds and runs, and macOS support is experimental."
      >
        <Platforms />
      </Section>

      {/* Screenshots */}
      <Section
        eyebrow="In action"
        title="From boot to in-game"
        description="Titles captured from the repository — 2D and 3D games across Unreal Engine 4/5, Unity and custom engines."
        className="bg-surface/40"
      >
        <Reveal from="right" amount={0.3}>
          <ScreenshotCarousel />
        </Reveal>
      </Section>

      {/* Installation preview */}
      <Section>
        <InstallPreview />
      </Section>

      {/* How it works */}
      <Section
        eyebrow="How it works"
        title="Three steps to your first game"
        description="The graphical launcher handles discovery — or drive the emulator directly from the command line."
        className="bg-surface/40"
      >
        <HowItWorks />
      </Section>

      {/* Compatibility preview */}
      <Section eyebrow="Compatibility" className="!pt-0">
        <CompatPreview />
      </Section>

      {/* FAQ preview */}
      <Section
        eyebrow="FAQ"
        title="Common questions"
        className="bg-surface/40"
      >
        <FaqPreview />
      </Section>

      {/* Contributing CTA */}
      <Section>
        <ContributingCta />
      </Section>
    </>
  );
}
