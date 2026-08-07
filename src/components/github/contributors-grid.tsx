import { githubApi, REPO_URL } from "@/lib/github";
import { useGithubData } from "@/hooks/use-github-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ContributorsGrid({ limit = 14 }: { limit?: number }) {
  const { data, loading } = useGithubData(() => githubApi.contributors(limit), "contributors");

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="size-11 rounded-full" />
        ))}
      </div>
    );
  }

  if (!data?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {data.map((contributor) => (
        <Tooltip key={contributor.login}>
          <TooltipTrigger asChild>
            <a
              href={contributor.html_url}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative focus-visible:outline-2 focus-visible:outline-accent"
            >
              <img
                src={contributor.avatar_url}
                alt={`${contributor.login} — ${contributor.contributions} contributions`}
                loading="lazy"
                decoding="async"
                width={44}
                height={44}
                className="size-11 rounded-full border border-border transition-transform duration-150 group-hover:-translate-y-0.5"
              />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <span className="font-medium">{contributor.login}</span>
            {" · "}
            {contributor.contributions} contributions
          </TooltipContent>
        </Tooltip>
      ))}
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={`${REPO_URL}/graphs/contributors`}
            target="_blank"
            rel="noreferrer noopener"
            className="grid size-11 place-items-center rounded-full border border-dashed border-border-strong text-xs font-medium text-text-muted transition-colors duration-150 hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            +{limit}
          </a>
        </TooltipTrigger>
        <TooltipContent>And more on GitHub</TooltipContent>
      </Tooltip>
    </div>
  );
}
