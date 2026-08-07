import { useEffect } from "react";
import { SITE_URL } from "@/config";

export const SITE_NAME = "KytyPS5";
export const SITE_TAGLINE = "Open-source PlayStation 5 emulator for Windows, Linux and macOS.";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  /** Optional JSON-LD object(s) injected into the page head. */
  jsonLd?: object | object[];
  /** Optional og:image URL. */
  image?: string;
  /** Emit <meta name="robots" content="noindex"> (thin/no-content pages). */
  noindex?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Lightweight per-page SEO: title, description, canonical, OpenGraph and Twitter tags,
 * plus optional JSON-LD structured data. Runs client-side (SPA).
 */
export function Seo({ title, description, path, jsonLd, image, noindex }: SeoProps) {
  // Serialize so object identity changes don't re-run the effect on every render.
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = `${title} · KytyPS5`;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }
    if (noindex) {
      upsertMeta("name", "robots", "noindex");
    } else {
      document.head.querySelector('meta[name="robots"]')?.remove();
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script = document.getElementById("seo-jsonld") as HTMLScriptElement | null;
    if (jsonLdKey) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = jsonLdKey;
    } else if (script) {
      script.remove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, jsonLdKey, image, noindex]);

  return null;
}

/** Common breadcrumb / organization JSON-LD used across pages. */
export function softwareJsonLd(version?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "GameApplication",
    operatingSystem: "Windows 10+, Linux, macOS (Apple Silicon via Rosetta 2)",
    description: SITE_TAGLINE,
    license: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    url: "https://github.com/KytyPS5/KytyPS5",
    codeRepository: "https://github.com/KytyPS5/KytyPS5",
    ...(version ? { softwareVersion: version } : {}),
    isAccessibleForFree: true,
  };
}
