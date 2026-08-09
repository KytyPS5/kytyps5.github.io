import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  containerClassName?: string;
}

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className,
  containerClassName,
  children,
}: SectionProps) {
  const reduced = useReducedMotion();
  return (
    <section id={id} className={cn("relative py-20 sm:py-28 overflow-hidden", className)}>
      <Container className={containerClassName}>
        {(eyebrow || title || description) && (
          <motion.div
            variants={reveal}
            initial={reduced ? false : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "mb-12 flex max-w-2xl flex-col gap-4 sm:mb-16",
              align === "center" && "mx-auto items-center text-center",
            )}
          >
            {eyebrow && (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            )}
            {title && (
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base leading-relaxed text-text-secondary">{description}</p>
            )}
          </motion.div>
        )}
        {children}
      </Container>
    </section>
  );
}
