import { motion, type Variants } from "framer-motion";
import { Laptop, Monitor, Terminal } from "lucide-react";
import { PLATFORMS } from "@/lib/content";
import { Badge } from "@/components/ui/badge";

const SLIDE = 56;

const ICONS = {
  monitor: Monitor,
  terminal: Terminal,
  laptop: Laptop,
} as const;

const TAG_VARIANT = {
  Primary: "accent",
  Supported: "run",
  Experimental: "warning",
} as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// Alternate slide direction per card: odd cards from the left, even from the right.
const card: Variants = {
  hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -SLIDE : SLIDE }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Platforms() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.15 }}
      className="grid gap-4 md:grid-cols-3"
    >
      {PLATFORMS.map((platform, i) => {
        const Icon = ICONS[platform.icon];
        return (
          <motion.div
            key={platform.name}
            variants={card}
            custom={i}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-panel border border-border bg-surface p-7 shadow-card transition-colors duration-200 hover:border-border-strong"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(closest-side, rgba(91,140,255,0.2), transparent)" }}
              aria-hidden="true"
            />
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-control border border-border bg-elevated text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <Badge variant={TAG_VARIANT[platform.tag]}>{platform.tag}</Badge>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold tracking-tight">{platform.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {platform.description}
              </p>
            </div>
            <p className="mt-auto border-t border-border pt-4 font-mono text-xs text-text-muted">
              {platform.requirement}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
