/**
 * Google Analytics 4 (GA4) integration for KytyPS5.
 *
 * Supports client-side SPA route tracking, custom event dispatching,
 * and measurement ID configuration via `VITE_GA_MEASUREMENT_ID`.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Measurement ID can be configured via environment variable (e.g. VITE_GA_MEASUREMENT_ID in .env or CI)
// or defaults to the KytyPS5 production Google Analytics 4 Measurement ID.
export const GA_MEASUREMENT_ID: string =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
  "G-Y00F1GRMYS";

const GA_ID_PATTERN = /^(G|GT|GTM)-[A-Za-z0-9]+$/i;

let isInitialized = false;
let lastTrackedKey = "";

/**
 * Initialize Google Analytics 4 with gtag.js.
 * Safe to call multiple times (idempotent).
 * If no valid measurementId is provided, this cleanly no-ops without error.
 */
export function initAnalytics(measurementId: string = GA_MEASUREMENT_ID): void {
  if (typeof window === "undefined" || isInitialized) return;
  if (!measurementId || !GA_ID_PATTERN.test(measurementId)) return;

  isInitialized = true;

  // Initialize dataLayer and gtag stub if not already present
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  }

  window.gtag("js", new Date());

  // Disable default automatic page view on config because React Router
  // handles client-side page views with accurate titles and routes.
  window.gtag("config", measurementId, {
    send_page_view: false,
  });

  // Inject gtag.js script if not already present in the document
  if (!document.getElementById("ga-gtag")) {
    const script = document.createElement("script");
    script.id = "ga-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onerror = () => {
      // Gracefully handle ad-blockers, network blocks, or offline environments
    };
    document.head.appendChild(script);
  }
}

/**
 * Track an SPA page view.
 * Sends a `page_view` event to Google Analytics with the current path and document title.
 */
export function trackPageView(
  path: string,
  title?: string,
  measurementId: string = GA_MEASUREMENT_ID,
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  if (!measurementId || !GA_ID_PATTERN.test(measurementId)) return;

  const pageTitle = title || document.title;
  const pagePath = path.startsWith("/") ? path : `/${path}`;
  const currentKey = `${pagePath}|${pageTitle}`;
  if (lastTrackedKey === currentKey) return;
  lastTrackedKey = currentKey;

  const pageLocation = window.location.origin + pagePath;

  window.gtag("event", "page_view", {
    page_title: pageTitle,
    page_location: pageLocation,
    page_path: pagePath,
    send_to: measurementId,
  });
}

/**
 * Track custom events (e.g. downloads, button clicks, search queries).
 */
export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}
