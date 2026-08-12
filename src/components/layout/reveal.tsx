import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useIsMobile } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export type RevealDirection = "left" | "right" | "up" | "down";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before the enter animation starts. */
  delay?: number;
  /** Which direction the content slides in from. Defaults to "up". */
  from?: RevealDirection;
  /** Vertical travel distance in px (only used for "up"/"down"). */
  y?: number;
  /** Horizontal travel distance in px (only used for "left"/"right"). */
  x?: number;
  /** Start scale (a lower value = bigger "pop"). Applied for vertical only. */
  scale?: number;
  duration?: number;
  /** Animate in once instead of popping out again when scrolled away. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
}

const DIRECTION_OFFSET: Record<RevealDirection, { x: number; y: number }> = {
  left: { x: -56, y: 0 },
  right: { x: 56, y: 0 },
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
};

/**
 * Scroll-reveal wrapper: content slides in from the chosen direction when it
 * enters the viewport and slides back out when it leaves (unless `once`).
 * Respects reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  y: yOverride,
  x: xOverride,
  scale = 0.97,
  duration = 0.55,
  once = false,
  amount = 0.2,
}: RevealProps) {
  const reduced = useReducedMotion();
  // Sideways (left/right) scroll-reveals look glitchy on narrow viewports —
  // content slides in from off-screen horizontally. On mobile they fall back
  // to the same gentle upward reveal used everywhere else.
  const isMobile = useIsMobile();
  const direction: RevealDirection =
    isMobile && (from === "left" || from === "right") ? "up" : from;
  const offset = DIRECTION_OFFSET[direction];
  const x = xOverride ?? offset.x;
  const y = yOverride ?? offset.y;
  const s = from === "up" || from === "down" ? scale : 1;

  const variants: Variants = {
    hidden: { opacity: 0, x, y, scale: s },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once, amount }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
