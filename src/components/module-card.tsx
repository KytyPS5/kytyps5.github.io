import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { type ModuleEntry, modulesCdnBase, modulesRepo } from "../data/modules-types";

export function ModuleCard({
  entry,
  categoryLabel,
  headingLevel = "h3",
}: {
  entry: ModuleEntry;
  categoryLabel?: string;
  headingLevel?: "h3" | "h4";
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const sanitizedSegments = (entry.path || "")
    .split("/")
    .filter((seg) => seg && seg !== "." && seg !== "..");
  const encodedPath = sanitizedSegments.map(encodeURIComponent).join("/");
  const downloadUrl = `${modulesCdnBase}/${encodedPath}`;
  const githubUrl = `${modulesRepo}/blob/main/${encodedPath}`;
  const filename =
    sanitizedSegments[sanitizedSegments.length - 1] || `${entry.id}.json`;

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const copyJsonUrl = async () => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  const formattedSize =
    typeof entry.size === "number" && Number.isFinite(entry.size)
      ? `${(entry.size / 1024).toFixed(1)} KB`
      : null;

  const cardDomId = `mod-${encodedPath.replace(/[^a-zA-Z0-9_-]/g, "-") || `${entry.id}-${entry.index}`}`;
  const HeadingTag = headingLevel;

  return (
    <article className="module-card" id={cardDomId}>
      <div className="module-card-header">
        <div className="module-badges">
          <span className="module-badge module-badge-ppsa" title="PS5 Title ID">
            {entry.id}
          </span>
          <span className="module-badge module-badge-version" title="Target Game Version">
            v{entry.version}
          </span>
          {categoryLabel && (
            <span className="module-badge module-badge-category">
              {categoryLabel}
            </span>
          )}
          {entry.author && entry.author !== "Community" && (
            <span className="module-author">
              by @{entry.author.replace(/^@+/, "")}
            </span>
          )}
        </div>
      </div>

      <HeadingTag className="module-title">{entry.title}</HeadingTag>

      {entry.description && (
        <p className="community-description module-description">
          {entry.description}
        </p>
      )}

      <div className="module-actions">
        <a
          href={downloadUrl}
          onClick={handleDownload}
          className="button secondary module-download-btn"
          title={
            entry.sha256
              ? `Download ${filename} (SHA-256: ${entry.sha256.slice(0, 8)}…)`
              : `Download ${filename}`
          }
        >
          <Download size={16} aria-hidden="true" />
          <span>{downloading ? "Downloading…" : "Download JSON"}</span>
          {formattedSize && (
            <span className="community-file-size">({formattedSize})</span>
          )}
        </a>

        <button
          type="button"
          onClick={copyJsonUrl}
          className="button secondary module-copy-btn"
          title="Copy CDN direct link"
          aria-label={copied ? "Copied CDN link to clipboard" : "Copy CDN link"}
        >
          {copied ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy Link"}</span>
        </button>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link module-gh-link"
          title="View source on GitHub (opens in a new tab)"
          aria-label={`View ${filename} source on GitHub (opens in a new tab)`}
        >
          <span>Source</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
