import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/8", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
