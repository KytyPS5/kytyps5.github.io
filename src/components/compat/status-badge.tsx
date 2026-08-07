import { STATUS_META, type DisplayStatus } from "@/lib/compat";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className, size = "sm" }: { status: DisplayStatus; className?: string; size?: "sm" | "lg" }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs",
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}55`,
        backgroundColor: `${meta.color}14`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
