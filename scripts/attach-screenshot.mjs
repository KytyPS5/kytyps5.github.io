#!/usr/bin/env node
/**
 * Attach screenshot(s) to a game's compatibility report.
 * Invoked by .github/workflows/get-screenshot.yml from a `/getss <url> …`
 * comment (or a manual workflow_dispatch run).
 *
 * For each `--image` URL the image is downloaded into public/screenshots/,
 * validated (must be an image under 10 MB), and attached to the report whose
 * title ID matches `--title-id`:
 *   - the report's `screenshot` frontmatter is set to the first image when it
 *     has none yet (drives the homepage carousel), and
 *   - every image is embedded in the report body so the game page shows it.
 *
 * The report must already exist (create it via /compat first) — screenshots
 * attach to a game's verified report; this script never invents a status.
 *
 * Usage:
 *   node scripts/attach-screenshot.mjs --title-id PPSA01670 --title "DEATHLOOP" \
 *     --image "https://example.com/shot1.png" --image "https://example.com/shot2.jpg"
 */
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPAT_DIR = path.join(ROOT, "src", "content", "compat");
const SHOTS_DIR = path.join(ROOT, "public", "screenshots");
const MAX_BYTES = 10 * 1024 * 1024;

/** Content-type → file extension (only raster images the site renders). */
const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : undefined;
}

/** All values of a repeatable flag: --image a --image b → [a, b]. */
function args(name) {
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === `--${name}` && process.argv[i + 1]) out.push(process.argv[i + 1]);
  }
  return out;
}

const titleId = arg("title-id");
const title = arg("title");
const images = args("image");

const errors = [];
if (!titleId) errors.push("--title-id is required");
if (!images.length) errors.push("at least one --image URL is required");
if (errors.length) {
  console.error("[attach-screenshot] " + errors.join("; "));
  process.exit(1);
}

const norm = (s) => s.replace(/-/g, "").toUpperCase();

/** Find the report file whose frontmatter title ID matches (dash-insensitive). */
async function findReport() {
  for (const file of await readdir(COMPAT_DIR)) {
    if (!file.endsWith(".md")) continue;
    const raw = await readFile(path.join(COMPAT_DIR, file), "utf8");
    const m = raw.match(/^titleId:\s*"?([^"\n]+)"?/m);
    if (m && norm(m[1]) === norm(titleId)) return { file, raw };
  }
  return null;
}

/** Pick the next free filename: <report-slug>-<n>.<ext>. */
function freeName(slug, ext) {
  let n = 1;
  while (existsSync(path.join(SHOTS_DIR, `${slug}-${n}.${ext}`))) n++;
  return `${slug}-${n}.${ext}`;
}

/** Download and validate one image; returns the stored filename. */
async function fetchImage(url, slug) {
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (err) {
    throw new Error(`could not fetch image: ${url} (${err.message})`);
  }
  if (!res.ok) throw new Error(`image download failed: HTTP ${res.status} for ${url}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = IMAGE_TYPES[type];
  if (!ext) throw new Error(`not an image (content-type "${type || "unknown"}"): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    throw new Error(`image too large (${(buf.length / 1024 / 1024).toFixed(1)} MB > 10 MB): ${url}`);
  }
  await mkdir(SHOTS_DIR, { recursive: true });
  const name = freeName(slug, ext);
  await writeFile(path.join(SHOTS_DIR, name), buf);
  return name;
}

const report = await findReport();
if (!report) {
  console.error(
    `[attach-screenshot] no compatibility report found for title ID "${titleId}" — ` +
      "screenshots attach to an existing report. Run /compat on the issue first (or file a report via the template), then /getss again.",
  );
  process.exit(1);
}

const slug = report.file.replace(/\.md$/, "");
const stored = [];
for (const url of images) {
  try {
    stored.push(await fetchImage(url, slug));
  } catch (err) {
    console.error(`[attach-screenshot] ✗ ${err.message}`);
    // Clean up anything already written so a failed run never ships partial work.
    for (const name of stored) {
      try {
        await unlink(path.join(SHOTS_DIR, name));
      } catch {
        /* best-effort cleanup */
      }
    }
    process.exit(1);
  }
}

// Attach to the report: set `screenshot` + `screenshotVerified` frontmatter
// when unset (screenshots are evidence attached to a community-verified
// report — they never imply a status), then embed every image in the body
// (before the `> Source:` line when present).
let { raw } = report;
if (!/^screenshot:/m.test(raw) && stored.length > 0) {
  raw = raw.replace(
    /^(---\r?\n)/,
    `$1screenshot: "screenshots/${stored[0]}"\nscreenshotVerified: true\n`,
  );
} else if (!/^screenshotVerified:/m.test(raw) && /^screenshot:/m.test(raw)) {
  // Re-run on a report that already has a screenshot but predates the flag.
  raw = raw.replace(/^(---\r?\n)/, `$1screenshotVerified: true\n`);
}
const embeds = stored.map((name) => `![${title ?? slug}](screenshots/${name})`).join("\n\n");
if (/^> Source:/m.test(raw)) {
  raw = raw.replace(/^> Source:/m, `${embeds}\n\n> Source:`);
} else {
  raw = raw.replace(/\s*$/, "") + `\n\n${embeds}\n`;
}
await writeFile(path.join(COMPAT_DIR, report.file), raw);

console.log(
  `[attach-screenshot] attached ${stored.length} screenshot(s) to ${report.file}: ${stored.join(", ")}`,
);
console.log(
  stored.length > 0 && !/^screenshot:/m.test(report.raw)
    ? `[attach-screenshot] set screenshot: "screenshots/${stored[0]}" (carousel)`
    : "[attach-screenshot] screenshot frontmatter already set — only body embeds added.",
);
