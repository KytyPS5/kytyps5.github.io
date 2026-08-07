import * as React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { CAROUSEL_SLIDES, type CarouselSlide } from "@/lib/slides";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const AUTOPLAY_MS = 5000;

/** Optional link shown on each slide caption. */
function SlideCaption({ slide }: { slide: CarouselSlide }) {
  return (
    <Link
      to={slide.to}
      // The caption overlay is pointer-events-none so it doesn't block the
      // lightbox button — re-enable events on the link itself.
      className="pointer-events-auto rounded-sm transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-white"
    >
      {slide.title}
    </Link>
  );
}

export function ScreenshotCarousel() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(false);
  const reduced = useReducedMotion();
  const count = CAROUSEL_SLIDES.length;

  const next = React.useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = React.useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  React.useEffect(() => {
    if (paused || lightbox || reduced) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [next, paused, lightbox, reduced]);

  // Prefetch the next slide during autoplay for a seamless advance.
  React.useEffect(() => {
    if (reduced || count === 0) return;
    const img = new Image();
    img.src = CAROUSEL_SLIDES[(index + 1) % count].src;
    img.decoding = "async";
  }, [index, count, reduced]);

  if (count === 0) return null;

  const current = CAROUSEL_SLIDES[index];

  return (
    <div
      className="group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-panel border border-border bg-surface shadow-float">
        <div className="relative aspect-video w-full overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={current.src}
              src={current.src}
              alt={`${current.title} running in KytyPS5`}
              loading="lazy"
              decoding="async"
              width={1280}
              height={720}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Caption */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-5">
            <div>
              <p className="font-display text-lg font-semibold text-white drop-shadow">
                <SlideCaption slide={current} />
              </p>
              <p className="mt-0.5 text-xs text-white/70">Running in KytyPS5</p>
            </div>
          </div>

          {/* Lightbox */}
          <Dialog open={lightbox} onOpenChange={setLightbox}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={`Open ${current.title} screenshot in a larger view`}
                className="absolute right-4 top-4 grid size-9 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm transition-colors duration-150 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                <Expand className="size-4" aria-hidden="true" />
              </button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0">
              <DialogTitle className="sr-only">{current.title} — KytyPS5 screenshot</DialogTitle>
              <img
                src={current.src}
                alt={`${current.title} running in KytyPS5`}
                className="max-h-[85vh] w-full object-contain"
                width={1280}
                height={720}
              />
              <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                <p className="text-sm font-medium text-text-primary">{current.title}</p>
                <p className="font-mono text-xs text-text-muted">{index + 1} / {count}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Arrows */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous screenshot"
              className="absolute left-4 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/40 text-white/80 opacity-100 backdrop-blur-sm transition-all duration-150 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Previous</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={next}
              aria-label="Next screenshot"
              className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/20 bg-black/40 text-white/80 opacity-100 backdrop-blur-sm transition-all duration-150 hover:bg-black/60 hover:text-white focus-visible:outline-2 focus-visible:outline-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Next</TooltipContent>
        </Tooltip>
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2" role="group" aria-label="Screenshot selection">
        {CAROUSEL_SLIDES.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            aria-label={`Show ${shot.title} screenshot`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-accent",
              i === index ? "w-8 bg-iris" : "w-2 bg-border-strong hover:bg-text-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
