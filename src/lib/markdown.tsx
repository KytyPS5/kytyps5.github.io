import { Fragment } from "react";
import { parseMarkdown, type Block, type InlineToken } from "@/lib/markdown";

/**
 * Render a markdown report body into styled HTML. All text is escaped by the
 * parser (see markdown.ts), images are lazy-loaded and links open externally.
 */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="space-y-4">
      {parseMarkdown(source).map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return <InlineView block={block} />;
    case "paragraph":
      return <InlineView block={block} />;
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-accent/25 pl-4 text-text-secondary">
          <InlineList tokens={block.children} />
        </blockquote>
      );
    case "list":
      return (
        <>
          {block.ordered ? (
            <ol className="list-decimal space-y-1.5 pl-6">
              {block.items.map((item, i) => (
                <li key={i}>
                  <InlineList tokens={item} />
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc space-y-1.5 pl-6">
              {block.items.map((item, i) => (
                <li key={i}>
                  <InlineList tokens={item} />
                </li>
              ))}
            </ul>
          )}
        </>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-card border border-border bg-elevated p-4 font-mono text-sm leading-relaxed text-text-secondary">
          <code>{block.value}</code>
        </pre>
      );
    case "hr":
      return <hr className="border-border" />;
  }
}

function HeadingView({ level, children }: { level: number; children: InlineToken[] }) {
  const cls = {
    1: "text-2xl font-semibold",
    2: "text-xl font-semibold",
    3: "text-lg font-medium",
  }[Math.min(level, 3)] as string;
  const Tag = (["h2", "h3", "h4"] as const)[Math.min(level, 3) - 1];
  return (
    <Tag className={`${cls} font-display tracking-tight text-text-primary`}>
      <InlineList tokens={children} />
    </Tag>
  );
}

function InlineView({ block }: { block: Extract<Block, { type: "heading" | "paragraph" }> }) {
  if (block.type === "heading") return <HeadingView level={block.level} children={block.children} />;

  // Images cannot live inside <p> (invalid HTML). Split the paragraph into
  // text runs and standalone figures so screenshots render correctly.
  const runs: InlineToken[][] = [[]];
  for (const token of block.children) {
    if (token.type === "image") {
      runs.push([token]);
      runs.push([]);
    } else {
      runs[runs.length - 1].push(token);
    }
  }
  return (
    <>
      {runs.map((run, i) =>
        run.length === 1 && run[0].type === "image" ? (
          <TokenView key={i} token={run[0]} />
        ) : run.length > 0 ? (
          <p key={i} className="leading-relaxed text-text-secondary">
            <InlineList tokens={run} />
          </p>
        ) : null,
      )}
    </>
  );
}

function InlineList({ tokens }: { tokens: InlineToken[] }) {
  return (
    <>
      {tokens.map((token, i) => (
        <TokenView key={i} token={token} />
      ))}
    </>
  );
}

function TokenView({ token }: { token: InlineToken }) {
  switch (token.type) {
    case "text":
      return <Fragment>{token.value}</Fragment>;
    case "bold":
      return <strong className="font-semibold text-text-primary"><InlineList tokens={token.children} /></strong>;
    case "italic":
      return <em><InlineList tokens={token.children} /></em>;
    case "code":
      return (
        <code className="rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
          {token.value}
        </code>
      );
    case "link":
      return (
        <a
          href={token.href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors duration-150 hover:text-accent-2"
        >
          <InlineList tokens={token.children} />
        </a>
      );
    case "image":
      return (
        <figure className="my-4 overflow-hidden rounded-card border border-border">
          <img
            src={token.src}
            alt={token.alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full object-cover"
          />
          {token.alt && (
            <figcaption className="border-t border-border bg-surface px-4 py-2 text-xs text-text-muted">
              {token.alt}
            </figcaption>
          )}
        </figure>
      );
  }
}
