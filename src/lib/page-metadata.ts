const SITE = "https://kytyps5.github.io";
const DEFAULT_IMAGE =
  "https://raw.githubusercontent.com/KytyPS5/KytyPS5/main/docs/screenshots/ps5-01.png";
export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KytyPS5",
    applicationCategory: "GameApplication",
    operatingSystem: "Windows 10+, Linux, macOS (Apple Silicon via Rosetta 2)",
    description:
      "Open-source PlayStation 5 emulator for Windows, Linux and macOS.",
    license: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    url: "https://github.com/KytyPS5/KytyPS5",
    codeRepository: "https://github.com/KytyPS5/KytyPS5",
    isAccessibleForFree: true,
  };
}
const descriptions: Record<string, string> = {
  "/": "KytyPS5 is a free, open-source PlayStation 5 emulator for Windows, Linux and macOS. Explore builds, compatibility and community reports.",
  "/download":
    "Download KytyPS5 for Windows, Linux and macOS, check requirements and build the emulator from source.",
  "/compatibility":
    "Search tested PS5 games, filter compatibility by platform and status, and read the original community reports.",
  "/patches":
    "Browse community patches for PS5 games, read installation instructions and download patch packages for KytyPS5.",
  "/cheats":
    "Browse community cheats, trainers, and gameplay modifications for PS5 games running on KytyPS5.",
  "/configs":
    "Explore community configuration presets and performance profiles for KytyPS5 games.",
  "/forks":
    "Explore community forks of KytyPS5 and the specific games each fork targets.",
  "/docs":
    "Quick Start: download, extract, add games, configure settings, apply patches and run KytyPS5. Full installation and build documentation follows.",
  "/faq":
    "Answers to common KytyPS5 questions about compatibility, installation, requirements and reporting issues.",
  "/about":
    "Learn about KytyPS5, its development, architecture, license and open-source contributors.",
  "/contributing":
    "Help develop KytyPS5, test games, submit compatibility reports and contribute to the project.",
};
export function pageMetadata(
  path: string,
  title: string,
  gameDescription?: string,
  options: {
    canonicalPath?: string;
    image?: string;
    noindex?: boolean;
    jsonLd?: object;
  } = {},
) {
  // An exiting route must not overwrite the current page's metadata.
  if (window.location.pathname !== path) return;
  const description =
    gameDescription ??
    descriptions[path] ??
    "KytyPS5 community compatibility report.";
  const fullTitle = `KytyPS5 — ${title}`;
  const url = `${SITE}${options.canonicalPath ?? path}`;
  document.title = fullTitle;
  const meta = (
    attribute: "name" | "property",
    key: string,
    content: string,
  ) => {
    let node = document.head.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${key}"]`,
    );
    if (!node) {
      node = document.createElement("meta");
      node.setAttribute(attribute, key);
      document.head.append(node);
    }
    node.content = content;
  };
  meta("name", "description", description);
  meta("property", "og:title", fullTitle);
  meta("property", "og:description", description);
  meta("property", "og:url", url);
  meta("property", "og:type", "website");
  meta("name", "twitter:card", "summary_large_image");
  meta(
    "property",
    "og:image",
    new URL(options.image || DEFAULT_IMAGE, SITE).href,
  );
  meta(
    "name",
    "twitter:image",
    new URL(options.image || DEFAULT_IMAGE, SITE).href,
  );
  meta("name", "twitter:title", fullTitle);
  meta("name", "twitter:description", description);
  meta(
    "name",
    "robots",
    (options.noindex ?? !descriptions[path])
      ? "noindex,follow"
      : "index,follow",
  );
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = url;
  const jsonLd =
    options.jsonLd ??
    (path === "/" || path === "/download" ? softwareJsonLd() : undefined);
  let script = document.getElementById("seo-jsonld");
  if (jsonLd) {
    if (!script) {
      script = document.createElement("script");
      script.id = "seo-jsonld";
      script.setAttribute("type", "application/ld+json");
      document.head.append(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  } else script?.remove();
}
