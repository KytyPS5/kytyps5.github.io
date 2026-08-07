import * as React from "react";
import { Check, Copy, TerminalSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CodeBlockProps {
  code: readonly string[];
  title?: string;
  className?: string;
  /** Show the copy button (disabled for prompts with interactive output). */
  copyable?: boolean;
  /** Render inside a faux terminal window with a header. */
  variant?: "terminal" | "code";
}

function CodeBlockContent({ code, className }: { code: readonly string[]; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-text-secondary",
        className,
      )}
    >
      <code>
        {code.map((line, i) => (
          <div key={i} className={cn("whitespace-pre", line.startsWith("$") && "text-text-primary")}>
            {line || "\u00a0"}
          </div>
        ))}
      </code>
    </pre>
  );
}

export function CodeBlock({ code, title, className, copyable = true, variant = "terminal" }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(null);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.join("\n"));
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-window border border-border bg-elevated shadow-card",
        className,
      )}
    >
      {variant === "terminal" && (
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-destructive/70" />
            <span className="size-3 rounded-full bg-warning/70" />
            <span className="size-3 rounded-full bg-run/70" />
          </div>
          {title && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
              <TerminalSquare className="size-3.5" aria-hidden="true" />
              {title}
            </span>
          )}
          {copyable && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onCopy}
                  className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-text-muted transition-colors duration-150 hover:bg-white/5 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
                  aria-label="Copy command"
                >
                  {copied ? <Check className="size-3.5 text-run" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
      {variant === "code" && copyable && (
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-3 top-3 z-10 grid size-7 cursor-pointer place-items-center rounded-md border border-border bg-elevated text-text-muted transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Copy command"
        >
          {copied ? <Check className="size-3.5 text-run" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        </button>
      )}
      <CodeBlockContent code={code} />
    </div>
  );
}
