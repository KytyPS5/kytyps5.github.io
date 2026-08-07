import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-bold tracking-tight", className)}>
      Kyty
      <span className="text-gradient-iris">PS5</span>
    </span>
  );
}
