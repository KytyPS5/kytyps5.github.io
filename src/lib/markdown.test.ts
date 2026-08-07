import { describe, expect, it } from "vitest";
import { markdownToText, parseInline, parseMarkdown } from "@/lib/markdown";

describe("parseMarkdown", () => {
  it("parses paragraphs", () => {
    const blocks = parseMarkdown("First line.\nSecond line.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({ type: "paragraph", children: [{ type: "text", value: "First line. Second line." }] });
  });

  it("splits paragraphs on blank lines", () => {
    const blocks = parseMarkdown("One.\n\nTwo.");
    expect(blocks).toHaveLength(2);
    expect(blocks[1]).toEqual({ type: "paragraph", children: [{ type: "text", value: "Two." }] });
  });

  it("parses headings", () => {
    const blocks = parseMarkdown("## Tested on");
    expect(blocks[0]).toMatchObject({ type: "heading", level: 2 });
  });

  it("parses blockquotes", () => {
    const blocks = parseMarkdown("> Status is inferred");
    expect(blocks[0]).toMatchObject({ type: "blockquote" });
  });

  it("parses bullet and numbered lists", () => {
    const blocks = parseMarkdown("- Boots\n- Menu");
    expect(blocks[0]).toMatchObject({ type: "list", ordered: false, items: [[{ type: "text", value: "Boots" }], [{ type: "text", value: "Menu" }]] });

    const ordered = parseMarkdown("1. one\n2. two");
    expect(ordered[0]).toMatchObject({ type: "list", ordered: true });
  });

  it("does not treat decimal- or year-leading lines as lists", () => {
    expect(parseMarkdown("1.5 GB available")[0]).toMatchObject({ type: "paragraph" });
    expect(parseMarkdown("2026. a year of emulation")[0]).toMatchObject({ type: "paragraph" });
  });

  it("parses fenced code blocks", () => {
    const blocks = parseMarkdown("```\nconst x = 1;\n```");
    expect(blocks[0]).toEqual({ type: "code", value: "const x = 1;" });
  });

  it("parses horizontal rules", () => {
    const blocks = parseMarkdown("---");
    expect(blocks[0]).toEqual({ type: "hr" });
  });

  it("strips trailing source blockquotes when they exist", () => {
    const blocks = parseMarkdown("Boots fine.\n\n> Source: [GitHub issue #1](https://github.com/x/y/issues/1)");
    expect(blocks.filter((b) => b.type === "blockquote")).toHaveLength(1);
  });
});

describe("parseInline", () => {
  it("parses bold and italic", () => {
    expect(parseInline("**bold**")).toEqual([{ type: "bold", children: [{ type: "text", value: "bold" }] }]);
    expect(parseInline("*italic*")).toEqual([{ type: "italic", children: [{ type: "text", value: "italic" }] }]);
  });

  it("parses links with only http(s) hrefs", () => {
    expect(parseInline("[text](https://example.com)")).toEqual([
      { type: "link", href: "https://example.com", children: [{ type: "text", value: "text" }] },
    ]);
    // javascript: is not allowed and stays literal text
    const [token] = parseInline("[x](javascript:alert(1))");
    expect(token.type).toBe("text");
  });

  it("parses images with only http(s) sources", () => {
    expect(parseInline("![alt](https://example.com/img.png)")).toEqual([
      { type: "image", alt: "alt", src: "https://example.com/img.png" },
    ]);
  });

  it("tolerates balanced parentheses in URLs", () => {
    expect(parseInline("[see](https://example.com/foo_(bar))")).toEqual([
      { type: "link", href: "https://example.com/foo_(bar)", children: [{ type: "text", value: "see" }] },
    ]);
  });

  it("keeps trailing text after links and images", () => {
    expect(parseInline("![img](https://example.com/a.png) more")).toEqual([
      { type: "image", alt: "img", src: "https://example.com/a.png" },
      { type: "text", value: " more" },
    ]);
  });

  it("escapes HTML", () => {
    const [token] = parseInline("<script>alert(1)</script>");
    expect(token).toEqual({ type: "text", value: "&lt;script&gt;alert(1)&lt;/script&gt;" });
  });

  it("parses inline code", () => {
    expect(parseInline("run `npm test` now")).toContainEqual({ type: "code", value: "npm test" });
  });
});

describe("markdownToText", () => {
  it("strips markdown to readable text", () => {
    const src = "**Bold** game\n\n![Screen](https://example.com/a.png)\n\n> Quote line";
    const text = markdownToText(src);
    expect(text).toContain("Bold game");
    expect(text).toContain("Screen");
    expect(text).toContain("Quote line");
    expect(text).not.toContain("**");
    expect(text).not.toContain("[");
  });
});
