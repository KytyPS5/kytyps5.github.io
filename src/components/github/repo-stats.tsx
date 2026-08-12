import { motion, useInView } from "framer-motion";
import * as React from "react";
import { CircleDot, GitFork, Star, Users } from "lucide-react";
import { githubApi, REPO_URL } from "@/lib/github";
import { useGithubData } from "@/hooks/use-github-data";
import { useCountUp } from "@/hooks/use-count-up";
import { useIsMobile } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Stat({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const display = useCountUp(value ?? 0, inView);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex flex-col items-center gap-1.5 rounded-card px-6 py-5 text-center transition-colors duration-150 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="text-text-muted transition-colors duration-150 group-hover:text-accent">
            {icon}
          </span>
          <span className="font-display text-2xl font-semibold tabular-nums text-text-primary sm:text-3xl">
            {value === null ? "—" : display.toLocaleString("en-US")}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {label}
          </span>
        </a>
      </TooltipTrigger>
      <TooltipContent>View on GitHub</TooltipContent>
    </Tooltip>
  );
}

export function RepoStats() {
  const repo = useGithubData(githubApi.repo, "repo");
  const contributors = useGithubData(() => githubApi.contributors(14), "contributors");
  const loading = repo.loading || contributors.loading;
  // No sideways slide on mobile — the stats strip fades in instead.
  const isMobile = useIsMobile();

  const stars = repo.data?.stargazers_count ?? null;
  const forks = repo.data?.forks_count ?? null;
  const issues = repo.data?.open_issues_count ?? null;
  const contributorsCount = contributors.data?.length ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : -56 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 divide-x divide-border overflow-hidden rounded-panel border border-border bg-surface shadow-card sm:grid-cols-4"
    >
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 px-6 py-5">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))
      ) : (
        <>
          <Stat label="Stars" value={stars} icon={<Star className="size-4" aria-hidden="true" />} href={`${REPO_URL}/stargazers`} />
          <Stat label="Forks" value={forks} icon={<GitFork className="size-4" aria-hidden="true" />} href={`${REPO_URL}/forks`} />
          <Stat label="Open issues" value={issues} icon={<CircleDot className="size-4" aria-hidden="true" />} href={`${REPO_URL}/issues`} />
          <Stat label="Contributors" value={contributorsCount} icon={<Users className="size-4" aria-hidden="true" />} href={`${REPO_URL}/graphs/contributors`} />
        </>
      )}
    </motion.div>
  );
}
