import { motion, type Variants } from "framer-motion";
import { HOW_IT_WORKS } from "@/lib/content";

const SLIDE = 56;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// Alternate slide direction per step: odd steps from the left, even from the right.
const card: Variants = {
  hidden: (i: number) => ({ opacity: 0, x: i % 2 === 0 ? -SLIDE : SLIDE }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function HowItWorks() {
  return (
    <motion.ol
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.15 }}
      className="relative grid gap-4 md:grid-cols-3"
    >
      {/* connector */}
      <div
        className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block"
        aria-hidden="true"
      />
      {HOW_IT_WORKS.map((step, i) => (
        <motion.li
          key={step.step}
          variants={card}
          custom={i}
          className="relative flex flex-col gap-5 rounded-panel border border-border bg-surface p-7 shadow-card transition-colors duration-200 hover:border-border-strong"
        >
          <span className="grid size-[72px] place-items-center rounded-card border border-border bg-elevated font-display text-2xl font-bold text-gradient-iris">
            {step.step}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{step.description}</p>
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
