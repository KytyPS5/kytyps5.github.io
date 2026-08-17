import { describe, expect, it } from "vitest";
import { parseIssueBody } from "./issue-form.mjs";
import {
  appendOverrides,
  buildMirrorBody,
  MIRROR_LABEL,
  mirrorSlug,
  mirrorSource,
  mirrorTitle,
  mirrorUpstreamBody,
  readOverrides,
  reportSourceNumber,
  reportTestedDate,
  shouldCreateMirror,
} from "./status-issues.mjs";

const UPSTREAM_BODY = `### Game title
Stray

### Game ID / serial
PPSA01670

### KytyPS5 version
main

### Compatibility status
In game

### OS
Windows 11

### CPU
Ryzen 9

### Result details
Boots and reaches gameplay.
`;

describe("mirrorTitle", () => {
  it("builds [GAME STATUS] <title> (<os>) from the form fields", () => {
    expect(mirrorTitle(UPSTREAM_BODY, "[GAME STATUS] something")).toBe(
      "[GAME STATUS] Stray (windows)",
    );
  });

  it("normalizes free-text OS values onto the canonical OS", () => {
    const linux = UPSTREAM_BODY.replace("Windows 11", "Arch Linux");
    expect(mirrorTitle(linux, "x")).toBe("[GAME STATUS] Stray (linux)");
  });

  it("omits the OS suffix when the body has no OS answer", () => {
    const noOs = UPSTREAM_BODY.replace(/### OS\n[\s\S]*?\n\n/, "");
    expect(mirrorTitle(noOs, "x")).toBe("[GAME STATUS] Stray");
  });

  it("falls back to the upstream issue title", () => {
    expect(mirrorTitle("", "[GAME STATUS] Stray")).toBe("[GAME STATUS] Stray");
  });

  it("applies an os override when the body has no OS answer", () => {
    const noOs = UPSTREAM_BODY.replace(/### OS\n[\s\S]*?\n\n/, "");
    expect(mirrorTitle(noOs, "x", { os: "windows" })).toBe("[GAME STATUS] Stray (windows)");
  });

  it("lets a title override beat the parsed Game title", () => {
    expect(mirrorTitle(UPSTREAM_BODY, "x", { title: "Stray: Director's Cut" })).toBe(
      "[GAME STATUS] Stray: Director's Cut (windows)",
    );
  });
});

describe("buildMirrorBody", () => {
  it("appends a `## Source` footer after the upstream body", () => {
    const body = buildMirrorBody(UPSTREAM_BODY, {
      number: 42,
      url: "https://github.com/KytyPS5/KytyPS5/issues/42",
      created: "2026-08-10",
    });
    expect(body.endsWith(`## Source\n\nMirrors [KytyPS5 issue #42](https://github.com/KytyPS5/KytyPS5/issues/42) — created 2026-08-10.`)).toBe(true);
    expect(body.startsWith("### Game title")).toBe(true);
  });

  it("caps very long upstream bodies", () => {
    const body = buildMirrorBody("x".repeat(70_000), {
      number: 1,
      url: "https://github.com/KytyPS5/KytyPS5/issues/1",
      created: "2026-08-10",
    });
    expect(body.length).toBeLessThan(61_500);
    expect(body).toContain("…(body truncated)");
    expect(body).toContain("## Source");
  });
});

describe("mirrorSource", () => {
  const src = { number: 42, url: "https://github.com/KytyPS5/KytyPS5/issues/42", created: "2026-08-10" };

  it("round-trips with buildMirrorBody", () => {
    const body = buildMirrorBody(UPSTREAM_BODY, src);
    expect(mirrorSource(body)).toEqual(src);
  });

  it("returns null for a body without a `## Source` footer", () => {
    expect(mirrorSource(UPSTREAM_BODY)).toBeNull();
  });

  it("ignores a KytyPS5 issue mention inside the upstream answers", () => {
    // The upstream body itself references an issue — without a footer the
    // mirror must not be mistaken for one.
    const mention = UPSTREAM_BODY.replace(
      "Boots and reaches gameplay.",
      "See KytyPS5 issue #99 for details.",
    );
    expect(mirrorSource(mention)).toBeNull();
  });

  it("uses the LAST `## Source` footer, not one typed in the notes", () => {
    const body =
      UPSTREAM_BODY +
      "\n\n## Source\n\nMirrors [KytyPS5 issue #1](https://github.com/KytyPS5/KytyPS5/issues/1) — created 2026-08-01.\n\n" +
      "## Source\n\n" +
      `Mirrors [KytyPS5 issue #${src.number}](${src.url}) — created ${src.created}.`;
    expect(mirrorSource(body)).toEqual(src);
  });

  it("stops at the `## Overrides` section after the footer", () => {
    const body = appendOverrides(buildMirrorBody(UPSTREAM_BODY, src), {
      os: "windows",
      title: "KytyPS5 issue #99 created 2020-01-01",
    });
    // Even an override value that looks like provenance must not leak into the source.
    expect(mirrorSource(body)).toEqual(src);
  });
});

describe("readOverrides", () => {
  const src = { number: 42, url: "https://github.com/KytyPS5/KytyPS5/issues/42", created: "2026-08-10" };
  const withOverrides = appendOverrides(buildMirrorBody(UPSTREAM_BODY, src), {
    os: "linux",
    titleId: "PPSA09999",
    title: "Stray: Director's Cut",
  });

  it("reads the values from the `## Overrides` section", () => {
    expect(readOverrides(withOverrides)).toEqual({
      os: "linux",
      titleId: "PPSA09999",
      title: "Stray: Director's Cut",
    });
  });

  it("returns {} when there is no Overrides section", () => {
    expect(readOverrides(buildMirrorBody(UPSTREAM_BODY, src))).toEqual({});
    expect(readOverrides("")).toEqual({});
  });

  it("ignores unknown keys and stops at the next `## ` heading", () => {
    const b = withOverrides + "\n## Something else\n- os: macos\n- os: windows\n";
    expect(readOverrides(b)).toEqual({
      os: "linux",
      titleId: "PPSA09999",
      title: "Stray: Director's Cut",
    });
  });
});

describe("appendOverrides", () => {
  const src = { number: 42, url: "https://github.com/KytyPS5/KytyPS5/issues/42", created: "2026-08-10" };

  it("appends the section after the footer without breaking provenance", () => {
    const body = appendOverrides(buildMirrorBody(UPSTREAM_BODY, src), { os: "windows" });
    expect(body.endsWith("## Overrides\n- os: windows\n")).toBe(true);
    expect(mirrorSource(body)).toEqual(src);
  });

  it("replaces the section but keeps other overrides", () => {
    const base = appendOverrides(buildMirrorBody(UPSTREAM_BODY, src), {
      os: "linux",
      titleId: "PPSA09999",
    });
    const out = appendOverrides(base, { os: "macos", titleId: "PPSA09999" });
    expect(readOverrides(out)).toEqual({ os: "macos", titleId: "PPSA09999" });
    expect(out.match(/## Overrides/g)).toHaveLength(1);
  });

  it("returns the body unchanged when there are no overrides", () => {
    const base = buildMirrorBody(UPSTREAM_BODY, src);
    expect(appendOverrides(base, {})).toBe(base);
  });
});

describe("mirrorUpstreamBody", () => {
  const src = { number: 42, url: "https://github.com/KytyPS5/KytyPS5/issues/42", created: "2026-08-10" };

  it("returns the upstream body without the footer and overrides", () => {
    const body = appendOverrides(buildMirrorBody(UPSTREAM_BODY, src), { os: "linux" });
    expect(mirrorUpstreamBody(body)).toBe(UPSTREAM_BODY.trim());
  });
});

describe("issue-form interplay (the footer never leaks into the parsed answers)", () => {
  it("parseIssueBody stops at the `## Source` group heading", () => {
    const body = buildMirrorBody(UPSTREAM_BODY, {
      number: 42,
      url: "https://github.com/KytyPS5/KytyPS5/issues/42",
      created: "2026-08-10",
    });
    const sections = parseIssueBody(body);
    expect(sections["Game title"].trim()).toBe("Stray");
    expect(sections["Result details"]).not.toContain("Source");
    expect(sections["Result details"]).not.toContain("KytyPS5 issue");
  });
});

describe("mirrorSlug", () => {
  it("builds the <game>-<os> report slug from the form fields", () => {
    expect(mirrorSlug(UPSTREAM_BODY, "[GAME STATUS] something")).toBe("stray-windows");
  });

  it("normalizes the OS onto the canonical value", () => {
    const linux = UPSTREAM_BODY.replace("Windows 11", "Arch Linux");
    expect(mirrorSlug(linux, "x")).toBe("stray-linux");
  });

  it("drops the [GAME STATUS] prefix from a fallback title", () => {
    expect(mirrorSlug("", "[GAME STATUS]: Stray")).toBe("stray");
  });

  it("omits the OS suffix when the body has no OS answer", () => {
    const noOs = UPSTREAM_BODY.replace(/### OS\n[\s\S]*?\n\n/, "");
    expect(mirrorSlug(noOs, "x")).toBe("stray");
  });

  it("returns undefined when no title can be derived", () => {
    expect(mirrorSlug("", "")).toBeUndefined();
  });
});

describe("reportTestedDate / reportSourceNumber", () => {
  const md =
    '---\ntitle: "Stray"\ntestedDate: "2026-08-09"\nos: "windows"\n---\n\nnotes\n\n' +
    "> Source: [KytyPS5 issue #222](https://github.com/KytyPS5/KytyPS5/issues/222)\n";

  it("reads testedDate and the source issue number from a report", () => {
    expect(reportTestedDate(md)).toBe("2026-08-09");
    expect(reportSourceNumber(md)).toBe(222);
  });

  it("returns undefined when absent", () => {
    expect(reportTestedDate("no frontmatter")).toBeUndefined();
    expect(reportSourceNumber("no source")).toBeUndefined();
  });
});

describe("shouldCreateMirror", () => {
  const report = { sourceNumber: 222, testedDate: "2026-08-09" };

  it("mirrors when no report exists for the (game, OS)", () => {
    expect(shouldCreateMirror({ number: 227, created: "2026-08-10" }, { report: undefined, batchSize: 1 })).toEqual({
      create: true,
    });
  });

  it("mirrors an issue NEWER than the existing report", () => {
    expect(shouldCreateMirror({ number: 227, created: "2026-08-10" }, { report, batchSize: 1 })).toEqual({
      create: true,
    });
  });

  it("skips an issue OLDER than the existing report (the clobbered-marker case)", () => {
    // Report converted from #227 (tested 2026-08-10); older #222 must not be re-mirrored.
    const reportFrom227 = { sourceNumber: 227, testedDate: "2026-08-10" };
    expect(shouldCreateMirror({ number: 222, created: "2026-08-09" }, { report: reportFrom227, batchSize: 1 })).toEqual({
      create: false,
      reason: "existing 2026-08-10 report is as new or newer",
    });
  });

  it("skips the exact issue the report was converted from, regardless of date", () => {
    const older = { sourceNumber: 222, testedDate: "2026-08-05" };
    expect(shouldCreateMirror({ number: 222, created: "2026-08-09" }, { report: older, batchSize: 1 })).toEqual({
      create: false,
      reason: "already converted",
    });
  });

  it("mirrors ALL same-game issues found in the same run (the batch exception)", () => {
    const reportFrom227 = { sourceNumber: 227, testedDate: "2026-08-10" };
    expect(shouldCreateMirror({ number: 222, created: "2026-08-09" }, { report: reportFrom227, batchSize: 2 })).toEqual({
      create: true,
      reason: "same-run batch",
    });
  });
});

describe("MIRROR_LABEL", () => {
  it("is the compat label", () => {
    expect(MIRROR_LABEL).toBe("compat");
  });
});
