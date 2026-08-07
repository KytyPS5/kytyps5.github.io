import { Download, ExternalLink, RefreshCw, Tag } from "lucide-react";
import { githubApi } from "@/lib/github";
import { useGithubData } from "@/hooks/use-github-data";
import { formatBytes, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function osFromAsset(name: string): { label: string; hint: string } | null {
  if (name.includes("Windows")) return { label: "Windows x64", hint: "Windows 10 1803+" };
  if (name.includes("Linux")) return { label: "Linux x86_64", hint: "Current Linux distro" };
  if (name.includes("macOS")) return { label: "macOS x86_64", hint: "Apple Silicon · Rosetta 2" };
  return null;
}

export function LatestReleaseCard({ className }: { className?: string }) {
  const { data, error, loading, retry } = useGithubData(githubApi.latestRelease, "latestRelease");

  return (
    <div className={cn("rounded-panel border border-border bg-surface shadow-card", className)}>
      {loading && (
        <div className="space-y-5 p-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-card" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-sm text-text-secondary">
            Could not load the latest release from GitHub.
          </p>
          <Button variant="secondary" size="sm" onClick={retry}>
            <RefreshCw className="size-4" aria-hidden="true" /> Try again
          </Button>
        </div>
      )}

      {data && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-8 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Latest release
              </h2>
              <Badge variant="accent">
                <Tag className="size-3" aria-hidden="true" />
                {data.tag_name}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {data.prerelease && <Badge variant="warning">Pre-release</Badge>}
              <time dateTime={data.published_at} className="text-sm text-text-muted">
                {formatDate(data.published_at)}
              </time>
            </div>
          </div>

          <div className="grid gap-3 p-8 pt-6 sm:grid-cols-3">
            {data.assets.map((asset) => {
              const os = osFromAsset(asset.name);
              if (!os) return null;
              return (
                <a
                  key={asset.name}
                  href={asset.browser_download_url}
                  download
                  className="group relative flex flex-col gap-1 rounded-card border border-border bg-elevated p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow-soft focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span className="flex items-center gap-2 font-display text-sm font-semibold text-text-primary">
                    <Download className="size-4 text-accent transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
                    {os.label}
                  </span>
                  <span className="text-xs text-text-muted">{os.hint}</span>
                  <span className="mt-1 font-mono text-xs text-text-secondary">
                    {formatBytes(asset.size)}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-8 py-5">
            <p className="text-xs text-text-muted">
              Prebuilt binaries for every platform. See the documentation for builds from source.
            </p>
            <a
              href={data.html_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Release notes <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
