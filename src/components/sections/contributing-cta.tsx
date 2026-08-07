import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bug, Code2 } from "lucide-react";
import { REPO_URL } from "@/lib/github";
import { Button } from "@/components/ui/button";

export function ContributingCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-window border border-accent/20 bg-surface p-10 text-center sm:p-16"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_-10%,rgba(91,140,255,0.14),transparent)]"
        aria-hidden="true"
      />
      <div className="bg-noise pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Contribute</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Help make PS5 emulation on PC a reality
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
          Test games and file detailed bug reports, or contribute code. Every issue filed with a
          complete log file moves the project forward.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="secondary">
            <a href={`${REPO_URL}/issues/new/choose`} target="_blank" rel="noreferrer noopener">
              <Bug className="size-4" aria-hidden="true" />
              Report a bug
            </a>
          </Button>
          <Button asChild size="lg">
            <Link to="/contributing">
              <Code2 className="size-4" aria-hidden="true" />
              Contributing guide
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
