import * as React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/content";
import { Container } from "@/components/layout/container";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function Navbar() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScrolled();
  const location = useLocation();
  const reduced = useReducedMotion();

  // Close the mobile drawer on navigation
  React.useEffect(() => setOpen(false), [location.pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled || open
          ? "border-border bg-overlay/70 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-sm text-lg focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="KytyPS5 home"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link to="/download">
              <Download className="size-4" aria-hidden="true" />
              Get KytyPS5
            </Link>
          </Button>
        </div>

        <button
          type="button"
          className="grid size-10 cursor-pointer place-items-center rounded-control border border-border text-text-secondary transition-colors duration-150 hover:bg-white/5 hover:text-text-primary md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-overlay/95 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-6">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-md px-3 py-3 text-base font-medium transition-colors",
                      isActive ? "bg-white/5 text-text-primary" : "text-text-secondary hover:text-text-primary",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Button asChild size="lg" className="mt-4 w-full">
                <Link to="/download">
                  <Download className="size-4" aria-hidden="true" />
                  Get KytyPS5
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
