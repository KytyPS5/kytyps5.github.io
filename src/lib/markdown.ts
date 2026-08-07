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

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Only allow http(s) URLs in links/images. Anything else is treated as text. */
function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
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

    // Image: ![alt](src) — must be checked before links.
    // Image: ![alt](src) — must be checked before links.
    const imageMatch = rest.match(/^!\[([^\]]*)\]/);
    if (imageMatch) {
      const urlPart = extractUrl(rest.slice(imageMatch[0].length));
      if (urlPart) {
        const src = safeUrl(urlPart.url);
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
      tokens.push({ type: "text", value: escapeHtml(rest[0]) });
      rest = rest.slice(1);
    } else if (next === -1) {
      tokens.push({ type: "text", value: escapeHtml(rest) });
      rest = "";
    } else {
      tokens.push({ type: "text", value: escapeHtml(rest.slice(0, next)) });
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
const isBlockquote = (line: string) => /^>\s?/.test(line);

/**
 * Parse a full markdown document into blocks. Blank lines separate paragraphs;
 * lists and blockquotes group consecutive matching lines.
 */
export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block.
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const value: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        value.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push({ type: "code", value: value.join("\n") });
      continue;
    }

    // Heading.
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, children: parseInline(heading[2]) });
      i++;
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Blockquote: group consecutive `>` lines (including wrapped text).
    if (isBlockquote(line)) {
      const quoted: string[] = [];
      while (i < lines.length && (isBlockquote(lines[i]) || lines[i].trim() === "")) {
        if (lines[i].trim() === "") {
          // Blank line inside quote: only continue if the next is also a quote.
          if (i + 1 < lines.length && isBlockquote(lines[i + 1])) {
            quoted.push("");
            i++;
            continue;
          }
          break;
        }
        quoted.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", children: parseInline(quoted.join("\n")) });
      continue;
    }

    // List: group consecutive marker lines.
    if (isListMarker(line)) {
      const ordered = /^\s*\d{1,3}[.)]/.test(line);
      const items: InlineToken[][] = [];
      while (i < lines.length && isListMarker(lines[i])) {
        const item = lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, "");
        items.push(parseInline(item));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph: accumulate until a blank line or a new block start.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !isListMarker(lines[i]) &&
      !isBlockquote(lines[i]) &&
      !/^```/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", children: parseInline(para.join(" ")) });
  }

  return blocks;
}

/* --------------------------- Plain-text export --------------------------- */

function inlineToText(tokens: InlineToken[]): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case "text":
          return t.value;
        case "code":
          return t.value;
        case "image":
          return t.alt;
        case "bold":
        case "italic":
        case "link":
          return inlineToText(t.children);
      }
    })
    .join("");
}

/** Strip markdown down to readable plain text (used for card previews). */
export function markdownToText(source: string): string {
  return parseMarkdown(source)
    .map((b) => {
      switch (b.type) {
        case "heading":
        case "paragraph":
        case "blockquote":
          return inlineToText(b.children);
        case "list":
          return b.items.map((item) => inlineToText(item)).join(" ");
        case "code":
          return b.value;
        case "hr":
          return "";
      }
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
