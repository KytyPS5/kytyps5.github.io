import * as React from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowRight, ChevronDown, Download } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/ui/icons";
import { REPO_URL } from "@/lib/github";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const OS_CHIPS = ["Windows x64", "Linux x64", "macOS · experimental"] as const;

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBlobA = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yBlobB = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const yContent = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={ref}
      aria-label="KytyPS5 introduction"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32"
    >
      {/* Ambient background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />
        <motion.div
          style={reduced ? undefined : { y: yBlobA }}
          className="absolute -top-32 left-1/2 h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(91,140,255,0.22),transparent)] blur-3xl"
        />
        <motion.div
          style={reduced ? undefined : { y: yBlobB }}
          className="absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.16),transparent)] blur-3xl"
        />
        <motion.div
          style={reduced ? undefined : { y: yBlobB }}
          className="absolute -right-40 bottom-0 h-[380px] w-[460px] rounded-full bg-[radial-gradient(closest-side,rgba(79,163,255,0.12),transparent)] blur-3xl"
        />
      </div>

      <Container className="relative">
        <motion.div
          variants={container}
          initial={reduced ? false : "hidden"}
          animate="show"
          style={reduced ? undefined : { y: yContent }}
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <Badge variant="default" className="px-3.5 py-1 text-xs">
              <span className="size-1.5 rounded-full bg-run" aria-hidden="true" />
              Early development · free &amp; open source
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-8 font-display text-[clamp(3.2rem,10vw,7rem)] font-bold leading-[0.95] tracking-tight"
          >
            Kyty
            <span className="text-gradient-iris">PS5</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-text-secondary sm:text-xl"
          >
            A free and open-source PlayStation 5 emulator for Windows, Linux and macOS — written in
            C++ and focused on compatibility and boot reliability.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/download">
                <Download className="size-5" aria-hidden="true" />
                Download
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
                <GithubIcon className="size-5" aria-hidden="true" />
                View on GitHub
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {OS_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-surface/60 px-3.5 py-1.5 font-mono text-xs text-text-secondary"
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Container>

      <motion.a
        href="#overview"
        aria-label="Scroll to overview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2 text-text-muted transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
      >
        <motion.span
          animate={reduced ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown className="size-5" aria-hidden="true" />
        </motion.span>
      </motion.a>
    </section>
  );
}
