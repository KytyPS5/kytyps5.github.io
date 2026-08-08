import { motion, type Variants } from "framer-motion";
import { AlertTriangle, Bug, FileCode2, HeartHandshake, TerminalSquare } from "lucide-react";
import { Seo } from "@/lib/seo";
import { CONTRIBUTOR_GUIDELINES } from "@/lib/content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { CodeBlock } from "@/components/ui/code-block";
import { ContributorsGrid } from "@/components/github/contributors-grid";
import { Button } from "@/components/ui/button";
import { REPO_URL } from "@/lib/github";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function ContributingPage() {
  return (
    <>
      <Seo
        title="Contributing"
        description="Contribute to KytyPS5: test games, file detailed bug reports, or submit focused code contributions. Read the guidelines and AI-use policy."
        path="/contributing"
      />
      <PageHeader
        eyebrow="Contributing"
        title="Help shape the emulator"
        description="KytyPS5 is an early-stage project, and every tested game and detailed bug report moves it forward."
      />

      <Section className="!pt-4">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-2"
        >
          {CONTRIBUTOR_GUIDELINES.map((item) => (
            <motion.div
              key={item.title}
              variants={card}
              className="rounded-panel border border-border bg-surface p-7 shadow-card transition-colors duration-200 hover:border-border-strong"
            >
              <h2 className="font-display text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section
        eyebrow="Reporting bugs"
        title="The right way to file an issue"
        description="Good reports are the fastest path to fixes."
        className="bg-surface/40"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-panel border border-border bg-surface p-7 shadow-card">
            <span className="grid size-11 place-items-center rounded-control bg-iris text-white shadow-glow-soft">
              <Bug className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
              Use the game-status template
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
              Search existing issues first, then use the{" "}
              <span className="text-text-primary">Game Emulation Status Report</span> template —
              it asks for the game, title ID, build, status, host system and the complete log
              file. The project is in an early stage, so please be mindful when opening new
              issues.
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-5">
              <a href={`${REPO_URL}/issues/new/choose`} target="_blank" rel="noreferrer noopener">
                Open the issue templates
              </a>
            </Button>
          </div>
          <div className="rounded-panel border border-border bg-surface p-7 shadow-card">
            <span className="grid size-11 place-items-center rounded-control border border-border bg-elevated text-warning">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
              Set expectations
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">
              Expect crashes, graphical glitches, low compatibility and poor performance. Behavior
              changes significantly between builds — a game that worked yesterday may not boot
              today, and that's part of the process.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Formatting" title="Keep the codebase clean">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TerminalSquare className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                Set up the clang-format hook after cloning. It formats staged{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                  .cpp
                </code>
                ,{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                  .h
                </code>{" "}
                and{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">
                  .inc
                </code>{" "}
                files in <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">src</code>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <FileCode2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                Code contributions should include relevant tests where practical — the repository
                keeps focused memory, shader and resource-tracking regression tests under{" "}
                <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-accent">tests</code>.
              </p>
            </div>
          </div>
          <CodeBlock
            code={[
              "python -m pip install pre-commit",
              "python -m pre_commit install --install-hooks",
            ]}
            title="Formatting hook"
          />
        </div>
      </Section>

      <Section eyebrow="Special thanks" title="Built on the shoulders of giants">
        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="https://github.com/InoriRus/Kyty"
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-panel border border-border bg-surface p-7 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <HeartHandshake className="size-5 text-accent" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">InoriRus/Kyty</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              KytyPS5 is based on a heavily modified version of the original Kyty project (MIT).
            </p>
          </a>
          <a
            href="https://github.com/shadps4-emu/shadPS4"
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-panel border border-border bg-surface p-7 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <HeartHandshake className="size-5 text-accent" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">shadps4-emu/shadPS4</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Reference for memory-model understanding and the AVPlayer implementation.
            </p>
          </a>
        </div>
      </Section>

      <Section eyebrow="People" title="Contributors" className="bg-surface/40">
        <div className="flex flex-col items-start gap-6">
          <ContributorsGrid />
          <p className="text-sm text-text-muted">
            Contribution counts are live from GitHub. Every contributor counts — including the
            testers whose reports never make it into the stats.
          </p>
        </div>
      </Section>
    </>
  );
}
