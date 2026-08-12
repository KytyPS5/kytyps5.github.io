import * as React from "react";

/**
 * Match a CSS media query in the browser. The initial value is computed
 * synchronously so the first render is already correct (this site is a
 * client-side SPA — no hydration to worry about), and a listener keeps it in
 * sync across resizes / orientation changes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** True below the Tailwind `sm` breakpoint (640px) — i.e. mobile viewports. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 639px)");
}
