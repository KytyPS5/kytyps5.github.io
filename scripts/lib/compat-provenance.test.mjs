import { describe, it, expect } from "vitest";
import {
  mkdtemp,
  mkdir,
  copyFile,
  readdir,
  writeFile,
  readFile,
  rm,
} from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const scripts = fileURLToPath(new URL("../", import.meta.url));
const report = (date, source, status = "main-menu") =>
  `---\ntitle: "MAIDEN"\ntitleId: "PPSA01859"\nos: "linux"\nstatus: "${status}"\ntestedVersion: "current build"\ntestedDate: "${date}"\n---\nCurrent notes.\n\n> Source: [KytyPS5 issue #${source}](https://github.com/KytyPS5/KytyPS5/issues/${source})\n`;

async function convert({
  existingDate = "2026-10-23",
  existingSource = 1864,
  date = "2026-10-21",
  source = 1784,
  extraReports = {},
} = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "kyty-provenance-"));
  try {
    await mkdir(path.join(root, "scripts/lib"), { recursive: true });
    await mkdir(path.join(root, "src/content/compat"), { recursive: true });
    await mkdir(path.join(root, "src/data"), { recursive: true });
    await copyFile(
      path.join(scripts, "issue-to-compat.mjs"),
      path.join(root, "scripts/issue-to-compat.mjs"),
    );
    for (const file of await readdir(path.join(scripts, "lib")))
      if (file.endsWith(".mjs") && !file.endsWith(".test.mjs"))
        await copyFile(
          path.join(scripts, "lib", file),
          path.join(root, "scripts/lib", file),
        );
    await writeFile(
      path.join(root, "src/data/games.json"),
      JSON.stringify([
        {
          titleId: "PPSA01859",
          allTitleIds: ["PPSA01859", "PPSA01860"],
          name: "MAIDEN",
        },
      ]),
    );
    const original = report(existingDate, existingSource);
    const oldFile = path.join(root, "src/content/compat/maiden-old-linux.md");
    await writeFile(oldFile, original);
    for (const [file, raw] of Object.entries(extraReports))
      await writeFile(path.join(root, "src/content/compat", file), raw);
    let error;
    try {
      execFileSync(
        process.execPath,
        [
          path.join(root, "scripts/issue-to-compat.mjs"),
          "--title",
          "MAIDEN",
          "--title-id",
          "PPSA01860",
          "--os",
          "linux",
          "--status",
          "logo",
          "--version",
          "incoming build",
          "--date",
          date,
          "--source",
          `KytyPS5 issue #${source}`,
          "--source-url",
          `https://github.com/KytyPS5/KytyPS5/issues/${source}`,
          "--body",
          "Incoming notes.",
        ],
        {
          cwd: root,
          encoding: "utf8",
          windowsHide: true,
          stdio: "pipe",
          timeout: 10000,
        },
      );
    } catch (caught) {
      error = String(caught.stderr ?? caught.message);
    }
    const files = await readdir(path.join(root, "src/content/compat"));
    const contents = Object.fromEntries(
      await Promise.all(
        files.map(async (file) => [
          file,
          await readFile(path.join(root, "src/content/compat", file), "utf8"),
        ]),
      ),
    );
    return { error, files, contents, original };
  } finally {
    if (
      path.dirname(root) !== path.resolve(tmpdir()) ||
      !path.basename(root).startsWith("kyty-provenance-")
    )
      throw new Error("Invalid cleanup path");
    await rm(root, { recursive: true, force: true });
  }
}

describe("compat report provenance", () => {
  it("does not let an older source replace a newer report for the same regional game/OS", async () => {
    const result = await convert();
    expect(result.contents).toEqual({ "maiden-old-linux.md": result.original });
    expect(result.error ?? "").toMatch(/older|newer/i);
  });
  it("uses source issue order to reject an older source tested on the same date", async () => {
    const result = await convert({ date: "2026-10-23" });
    expect(result.contents).toEqual({ "maiden-old-linux.md": result.original });
    expect(result.error ?? "").toMatch(/older|newer/i);
  });
  it("retains reconversion of the same source and accepts a newer report with a lower status", async () => {
    const same = await convert({ source: 1864 });
    expect(same.error).toBeUndefined();
    expect(same.contents["maiden-linux.md"]).toContain("/issues/1864");
    const newer = await convert({ date: "2026-10-24", source: 1900 });
    expect(newer.error).toBeUndefined();
    expect(newer.contents["maiden-linux.md"]).toContain('status: "logo"');
    expect(newer.contents["maiden-linux.md"]).toContain("/issues/1900");
  });
  it("leaves all files intact if any matching report is newer", async () => {
    const older = report("2026-10-01", 1000);
    const result = await convert({ extraReports: { "a-old-linux.md": older } });
    expect(result.error ?? "").toMatch(/older|newer/i);
    expect(result.contents).toEqual({
      "a-old-linux.md": older,
      "maiden-old-linux.md": result.original,
    });
  });
  it("does not let another platform block a newer report", async () => {
    const windows = report("2026-10-25", 2000).replace(
      'os: "linux"',
      'os: "windows"',
    );
    const result = await convert({
      date: "2026-10-24",
      source: 1900,
      extraReports: { "maiden-windows.md": windows },
    });
    expect(result.error).toBeUndefined();
    expect(result.contents["maiden-windows.md"]).toBe(windows);
    expect(result.contents["maiden-linux.md"]).toContain("/issues/1900");
  });
  it("gives different mirror issues independent PR branches and uses that branch for fallback lookup", async () => {
    const workflow = parse(
      await readFile(".github/workflows/compat-convert.yml", "utf8"),
    );
    const steps = workflow.jobs.convert.steps;
    const template = steps.find((step) => step.id === "cpr").with.branch;
    const branchFor = (number) =>
      template
        .replaceAll("${{ steps.convert.outputs.slug }}", "maiden-linux")
        .replaceAll(
          "${{ steps.issue_context.outputs.mirror_number }}",
          String(number),
        );
    expect(branchFor(955)).not.toBe(branchFor(978));
    expect(branchFor(978)).toContain("978");
    const autoMerge = steps.find((step) => step.id === "auto_merge");
    expect(autoMerge.env.REPORT_BRANCH).toBe(template);
    expect(autoMerge.run).toContain('--head "$REPORT_BRANCH"');
  });
});
