import { describe, expect, it } from "vitest";
import { parseIssueBody } from "./issue-form.mjs";
import {
  appendOverrides,
  buildMirrorBody,
  buildUpdatedMirrorBody,
  gameKeyFor,
  issueOs,
  issueStatus,
  issueTitleId,
  issueVersion,
  MIRROR_LABEL,
  mirrorSlug,
  mirrorSource,
  mirrorTitle,
  mirrorUpstreamBody,
  readOverrides,
  refreshMirrorBody,
  reportOs,
  reportSourceNumber,
  reportStatus,
  reportTestedDate,
  reportTitleId,
  reportVersion,
  shouldCreateMirror,
  titleIdKey,
  UPDATED_LABEL,
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
    status: "main-menu",
  });

  it("reads the values from the `## Overrides` section", () => {
    expect(readOverrides(withOverrides)).toEqual({
      os: "linux",
      titleId: "PPSA09999",
      title: "Stray: Director's Cut",
      status: "main-menu",
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
      status: "main-menu",
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

describe("refreshMirrorBody", () => {
  const src = { number: 42, url: "https://github.com/KytyPS5/KytyPS5/issues/42", created: "2026-08-10" };
  const withOverrides = appendOverrides(buildMirrorBody(UPSTREAM_BODY, src), { os: "linux" });

  it("returns the plain rebuilt body for a candidate with no mirror", () => {
    // Regression: the poller crashed reading overrides off an undefined mirror.
    expect(refreshMirrorBody(UPSTREAM_BODY, undefined, src)).toBe(buildMirrorBody(UPSTREAM_BODY, src));
  });

  it("preserves overrides from the existing mirror across a refresh", () => {
    const body = refreshMirrorBody(UPSTREAM_BODY, withOverrides, src);
    expect(body.endsWith("## Overrides\n- os: linux\n")).toBe(true);
    expect(mirrorSource(body)).toEqual(src);
  });

  it("returns the plain body when the existing mirror has no overrides", () => {
    const plain = buildMirrorBody(UPSTREAM_BODY, src);
    expect(refreshMirrorBody(UPSTREAM_BODY, plain, src)).toBe(plain);
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

  it("preserves arbitrary user markdown headings inside textarea fields", () => {
    const body =
      "### Game title\nStray\n\n### Result details\nBoots up fine.\n\n## Logs\nShader compilation failed.\n\n## Source\nKytyPS5 issue #42";
    const sections = parseIssueBody(body);
    expect(sections["Result details"]).toContain("## Logs");
    expect(sections["Result details"]).toContain("Shader compilation failed.");
    expect(sections["Result details"]).not.toContain("## Source");
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

  it("strips trailing version numbers and parentheticals without breaking numbered titles", () => {
    expect(mirrorSlug("", "[GAME STATUS] ASTRO BOT V01.018.000")).toBe("astro-bot");
    expect(mirrorSlug("", "[GAME STATUS] Gran Turismo 7")).toBe("gran-turismo-7");
    expect(mirrorSlug("", "[GAME STATUS] Stray (PS5 Edition)")).toBe("stray");
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

  it("supports single-quoted testedDate and bare source issue number", () => {
    const single = "---\ntestedDate: '2026-08-15'\n---\n> Source: KytyPS5 issue #426\n";
    expect(reportTestedDate(single)).toBe("2026-08-15");
    expect(reportSourceNumber(single)).toBe(426);
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

  it("skips an older issue even if batchSize > 1 (batch must NOT bypass date check)", () => {
    const reportFrom227 = { sourceNumber: 227, testedDate: "2026-08-10" };
    expect(shouldCreateMirror({ number: 204, created: "2026-08-08" }, { report: reportFrom227, batchSize: 3 })).toEqual({
      create: false,
      reason: "existing 2026-08-10 report is as new or newer",
    });
  });

  it("skips an issue when candidate.created == report.testedDate", () => {
    const reportSameDay = { sourceNumber: 426, testedDate: "2026-08-31" };
    expect(shouldCreateMirror({ number: 204, created: "2026-08-31" }, { report: reportSameDay, batchSize: 1 })).toEqual({
      create: false,
      reason: "existing 2026-08-31 report is as new or newer",
    });
  });

  it("normalizes ISO timestamps and correctly compares same-day as not newer", () => {
    const reportSameDay = { sourceNumber: 426, testedDate: "2026-08-31" };
    expect(shouldCreateMirror({ number: 204, created: "2026-08-31T14:30:00Z" }, { report: reportSameDay, batchSize: 1 })).toEqual({
      create: false,
      reason: "existing 2026-08-31 report is as new or newer",
    });
  });

  it("skips when report exists but has no testedDate in frontmatter", () => {
    const reportNoDate = { sourceNumber: 426, testedDate: undefined };
    expect(shouldCreateMirror({ number: 204, created: "2026-08-08" }, { report: reportNoDate, batchSize: 1 })).toEqual({
      create: false,
      reason: "existing report exists for this game",
    });
  });

  it("does not allow an older issue with isEdited=true to clobber a report from a different sourceNumber", () => {
    const reportFrom426 = { sourceNumber: 426, testedDate: "2026-08-31", status: "doesnt-boot" };
    expect(
      shouldCreateMirror(
        { number: 204, created: "2026-08-08", isEdited: true, editDate: "2026-09-02", statusChanged: true },
        { report: reportFrom426, batchSize: 1 },
      ),
    ).toEqual({
      create: false,
      reason: "existing 2026-08-31 report is as new or newer",
    });
  });
});

describe("dedup keys (titleId-based (game, OS) matching)", () => {
  it("titleIdKey normalizes dashes and case", () => {
    expect(titleIdKey("ppsa-01670")).toBe("PPSA01670");
    expect(titleIdKey("PPSA01342")).toBe("PPSA01342");
    expect(titleIdKey("")).toBe("");
  });

  it("issueTitleId reads the new template's serial field and handles spaces/dashes", () => {
    expect(issueTitleId(UPSTREAM_BODY)).toBe("PPSA01670");
    const spaced = UPSTREAM_BODY.replace("### Game ID / serial\nPPSA01670", "### Game ID / serial\nPPSA 01670");
    expect(issueTitleId(spaced)).toBe("PPSA01670");
  });

  it("issueTitleId reads the legacy Title ID field", () => {
    const legacy = UPSTREAM_BODY.replace("### Game ID / serial\nPPSA01670", "### Title ID\nPPSA01670");
    expect(issueTitleId(legacy)).toBe("PPSA01670");
  });

  it("issueTitleId returns undefined for Unknown or missing serials", () => {
    expect(issueTitleId(UPSTREAM_BODY.replace("PPSA01670", "Unknown"))).toBeUndefined();
    expect(issueTitleId("no form fields here")).toBeUndefined();
  });

  it("issueOs normalizes the new and legacy OS fields", () => {
    expect(issueOs(UPSTREAM_BODY)).toBe("windows");
    const legacy = UPSTREAM_BODY.replace("### OS\nWindows 11", "### Operating system\nWindows 11");
    expect(issueOs(legacy)).toBe("windows");
    // An OS that doesn't normalize yields no key — the slug fallback applies.
    expect(issueOs(UPSTREAM_BODY.replace("Windows 11", "CachyOS"))).toBeUndefined();
  });

  it("gameKeyFor resolves region variants to the game's canonical key", () => {
    const games = [
      { titleId: "PPSA03527", allTitleIds: ["PPSA03527", "PPSA03528", "PPSA03529"] },
      { titleId: "PPSA00001", allTitleIds: ["PPSA00001"] },
    ];
    expect(gameKeyFor("PPSA03528", games)).toBe("PPSA03527");
    expect(gameKeyFor("ppsa03529", games)).toBe("PPSA03527");
    expect(gameKeyFor("PPSA00001", games)).toBe("PPSA00001");
  });

  it("gameKeyFor falls back to the title ID itself when not in the store", () => {
    expect(gameKeyFor("PPSA09999", [])).toBe("PPSA09999");
  });

  it("reportTitleId / reportOs read a report's frontmatter", () => {
    const md = `---\ntitleId: "PPSA-01342"\ntitle: "Demon's Souls"\nstatus: "doesnt-boot"\ntestedDate: "2026-08-10"\nos: "windows"\n---\n`;
    expect(reportTitleId(md)).toBe("PPSA01342");
    expect(reportOs(md)).toBe("windows");
    expect(reportTitleId("no frontmatter")).toBeUndefined();
    expect(reportOs("no frontmatter")).toBeUndefined();
  });
});

describe("MIRROR_LABEL and UPDATED_LABEL", () => {
  it("defines the expected labels", () => {
    expect(MIRROR_LABEL).toBe("compat");
    expect(UPDATED_LABEL).toBe("updated-existing");
  });
});

describe("reportStatus and reportVersion", () => {
  const md = `---\ntitle: "Demon's Souls"\nstatus: "doesnt-boot"\ntestedVersion: "0.2.2-abc"\ntestedDate: "2026-08-10"\nos: "windows"\n---\n`;

  it("reads status and testedVersion from frontmatter", () => {
    expect(reportStatus(md)).toBe("doesnt-boot");
    expect(reportVersion(md)).toBe("0.2.2-abc");
  });

  it("returns undefined when missing", () => {
    expect(reportStatus("no frontmatter")).toBeUndefined();
    expect(reportVersion("no frontmatter")).toBeUndefined();
  });
});

describe("issueStatus and issueVersion", () => {
  it("extracts status and version from upstream issue body", () => {
    expect(issueStatus(UPSTREAM_BODY)).toBe("in-game");
    expect(issueVersion(UPSTREAM_BODY)).toBe("main");
  });

  it("normalizes legacy status values", () => {
    const legacy = UPSTREAM_BODY.replace("In game", "playable");
    expect(issueStatus(legacy)).toBe("in-game");
  });

  it("normalizes free-text / edited status values", () => {
    const edited1 = UPSTREAM_BODY.replace("In game", "Demons souls in Main menu");
    expect(issueStatus(edited1)).toBe("main-menu");

    const edited2 = UPSTREAM_BODY.replace("In game", "Boots to logo and crashes");
    expect(issueStatus(edited2)).toBe("logo");

    const edited3 = UPSTREAM_BODY.replace("In game", "Does not boot at all");
    expect(issueStatus(edited3)).toBe("doesnt-boot");
  });
});

describe("buildUpdatedMirrorBody", () => {
  it("prepends the diff notice and preserves provenance", () => {
    const body = buildUpdatedMirrorBody(
      UPSTREAM_BODY,
      {
        oldStatus: "doesnt-boot",
        newStatus: "in-game",
        oldVersion: "0.2.1",
        newVersion: "0.2.2",
      },
      {
        number: 42,
        url: "https://github.com/KytyPS5/KytyPS5/issues/42",
        created: "2026-08-20",
      },
    );
    expect(body).toContain("### 🔄 Upstream Report Updated");
    expect(body).toContain("- **Version:** `0.2.1` → `0.2.2`");
    expect(body).toContain("- **Status:** `doesnt-boot` → `in-game`");
    expect(body).toContain("Mirrors [KytyPS5 issue #42](https://github.com/KytyPS5/KytyPS5/issues/42) — created 2026-08-20.");
  });
});

describe("shouldCreateMirror with edits", () => {
  const report = { sourceNumber: 222, testedDate: "2026-08-09", status: "doesnt-boot", version: "0.2.1" };

  it("mirrors an edited issue when editDate is newer than report and status changed", () => {
    expect(
      shouldCreateMirror(
        { number: 222, created: "2026-08-01", isEdited: true, editDate: "2026-08-20", statusChanged: true },
        { report, batchSize: 1 },
      ),
    ).toEqual({
      create: true,
      isUpdate: true,
      reason: "upstream report was edited with changes",
    });
  });

  it("skips an edited issue when editDate is older than or equal to report testedDate", () => {
    expect(
      shouldCreateMirror(
        { number: 222, created: "2026-08-01", isEdited: true, editDate: "2026-08-05", statusChanged: true },
        { report, batchSize: 1 },
      ),
    ).toEqual({
      create: false,
      reason: "already converted",
    });
  });

  it("skips an edited issue when neither status nor version changed", () => {
    expect(
      shouldCreateMirror(
        { number: 222, created: "2026-08-20", isEdited: true, editDate: "2026-08-20", statusChanged: false, versionChanged: false },
        { report, batchSize: 1 },
      ),
    ).toEqual({
      create: false,
      reason: "already converted",
    });
  });
});
