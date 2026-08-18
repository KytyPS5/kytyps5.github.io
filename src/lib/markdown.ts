/**
 * Minimal, dependency-free Markdown parser for compatibility report bodies.
 * Supports the subset community reports actually use: headings, paragraphs,
 * blockquotes, bullet/numbered lists, fenced code, images, links, emphasis and
 * inline code. Raw HTML is NOT passed through — everything is escaped at parse
 * time, so rendering the token tree can never inject markup (XSS-safe).
 */

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; children: InlineToken[] }
  | { type: "italic"; children: InlineToken[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: InlineToken[] }
  | { type: "image"; alt: string; src: string };

export type Block =
  | { type: "heading"; level: number; children: InlineToken[] }
  | { type: "paragraph"; children: InlineToken[] }
  | { type: "blockquote"; children: InlineToken[] }
  | { type: "list"; ordered: boolean; items: InlineToken[][] }
  | { type: "code"; value: string }
  | { type: "hr" };

/**
 * Allow http(s) URLs, or — when `allowRelative` — any scheme-less path
 * (e.g. "screenshots/ps5-01.png"). Other schemes (javascript:, data:, …) are
 * rejected so links/images can never execute code; a rejected URL is rendered
 * as literal text.
 */
function safeUrl(url: string, allowRelative = false): string | null {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (allowRelative && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return null;
}

/**
 * Match a `(...)` URL after `[label]`/`![alt]`, tolerating one level of
 * balanced parentheses (GitHub attachment URLs often contain them). Returns
 * the URL and the remaining string, or null if no well-formed paren closes.
 */
function extractUrl(rest: string): { url: string; after: string } | null {
  if (!rest.startsWith("(")) return null;
  let depth = 0;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "(") depth++;
    else if (rest[i] === ")") {
      depth--;
      if (depth === 0) return { url: rest.slice(1, i), after: rest.slice(i + 1) };
    }
  }
  return null;
}

/* ------------------------------- Inline ------------------------------- */

/**
 * Parse inline markup into tokens. Recursively handles code, images, links,
 * bold and italic; nested emphasis works (e.g. `**bold *nested***`).
 */
export function parseInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let rest = input;

  while (rest.length > 0) {
    // Escape hatch: backslash escapes the next character.
    if (rest.startsWith("\\")) {
      tokens.push({ type: "text", value: rest[1] ?? "" });
      rest = rest.slice(2);
      continue;
    }

    // Inline code: `code` (no nested parsing, backticks stripped).
    const codeMatch = rest.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push({ type: "code", value: codeMatch[1] });
      rest = rest.slice(codeMatch[0].length);
      continue;
    }

    // Image: ![alt](src) — must be checked before links. Relative srcs are
    // allowed (site screenshots live in public/screenshots/); the renderer
    // resolves them against BASE_URL.
    const imageMatch = rest.match(/^!\[([^\]]*)\]/);
    if (imageMatch) {
      const urlPart = extractUrl(rest.slice(imageMatch[0].length));
      if (urlPart) {
        const src = safeUrl(urlPart.url, true);
        if (src) tokens.push({ type: "image", alt: imageMatch[1], src });
        else tokens.push({ type: "text", value: imageMatch[0] + `(${urlPart.url})` });
        rest = urlPart.after;
      } else {
        tokens.push({ type: "text", value: imageMatch[0] });
        rest = rest.slice(imageMatch[0].length);
      }
      continue;
    }

    // Link: [text](href) with recursive children.
    const linkMatch = rest.match(/^\[([^\]]+)\]/);
    if (linkMatch) {
      const urlPart = extractUrl(rest.slice(linkMatch[0].length));
      if (urlPart) {
        const href = safeUrl(urlPart.url);
        if (href) tokens.push({ type: "link", href, children: parseInline(linkMatch[1]) });
        else tokens.push({ type: "text", value: linkMatch[0] + `(${urlPart.url})` });
        rest = urlPart.after;
      } else {
        tokens.push({ type: "text", value: linkMatch[0] });
        rest = rest.slice(linkMatch[0].length);
      }
      continue;
    }

    // Bold: **text**
    const boldMatch = rest.match(/^\*\*([\s\S]+?)\*\*/);
    if (boldMatch) {
      tokens.push({ type: "bold", children: parseInline(boldMatch[1]) });
      rest = rest.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = rest.match(/^\*([^*\n]+)\*/);
    if (italicMatch) {
      tokens.push({ type: "italic", children: parseInline(italicMatch[1]) });
      rest = rest.slice(italicMatch[0].length);
      continue;
    }

    // Plain text up to the next special char.
    const next = rest.search(/[\\`!*[\n]/);
    if (next === 0) {
      // A lone special char that didn't match above — emit literally.
      tokens.push({ type: "text", value: rest[0] });
      rest = rest.slice(1);
    } else if (next === -1) {
      tokens.push({ type: "text", value: rest });
      rest = "";
    } else {
      tokens.push({ type: "text", value: rest.slice(0, next) });
      rest = rest.slice(next);
    }
  }

  return tokens;
}

/* -------------------------------- Blocks ------------------------------- */

/**
 * List markers: `- `, `* `, or an ordinal (≤3 digits) followed by `.`/`)` and
 * whitespace. Tight enough that "2026. something" or "1.5 GB" stays a
 * paragraph instead of becoming a bogus ordered list.
 */
const isListMarker = (line: string) => /^(\s*)([-*]|\d{1,3}[.)])\s+/.test(line);

/**
 * Fast, self-contained Markdown block parser for compat report bodies.
 * Supports:
 *   - Headings (# … ######)
 *   - Bullet lists (- item, * item) and numbered lists (1. item)
 *   - Fenced code blocks (``` … ```)
 *   - Blockquotes (> …)
 *   - Horizontal rules (---, ***, ___)
 *   - Paragraphs with soft breaks joined by spaces
 */
export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line — advance.
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block.
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume the closing ```
      blocks.push({ type: "code", value: codeLines.join("\n") });
      continue;
    }

    // Heading (# to ######).
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        children: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Horizontal rule: ---, ***, or ___ on its own line.
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote (> …). Multi-line quotes gather while lines start with >.
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "blockquote",
        children: parseInline(quoteLines.join(" ")),
      });
      continue;
    }

    // List: bullet or numbered.
    if (isListMarker(line)) {
      const isOrdered = /^\s*\d/.test(line);
      const items: InlineToken[][] = [];

      while (i < lines.length && isListMarker(lines[i])) {
        const itemLine = lines[i].replace(/^(\s*)([-*]|\d{1,3}[.)])\s+/, "");
        const itemLines = [itemLine];
        i++;
        // Continuation lines (indented or non-empty non-markers).
        while (
          i < lines.length &&
          lines[i].trim() &&
          !isListMarker(lines[i]) &&
          !lines[i].trim().startsWith("#") &&
          !lines[i].trim().startsWith(">") &&
          !lines[i].trim().startsWith("```") &&
          !/^(\s*[-*_]\s*){3,}$/.test(lines[i])
        ) {
          itemLines.push(lines[i].trim());
          i++;
        }
        items.push(parseInline(itemLines.join(" ")));
      }

      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    // Paragraph: consume lines until a blank line or a special block start.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !isListMarker(lines[i]) &&
      !/^(\s*[-*_]\s*){3,}$/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length) {
      blocks.push({
        type: "paragraph",
        children: parseInline(paraLines.join(" ")),
      });
    }
  }

  return blocks;
}
