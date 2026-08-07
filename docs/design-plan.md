# KytyPS5 Official Website — Design Plan (v1, awaiting approval)

> Scope: a production-ready, dark-first, premium marketing + documentation site for the
> [KytyPS5](https://github.com/KytyPS5/KytyPS5) PlayStation 5 emulator project.
> Stack: React 19 · Vite · TypeScript · TailwindCSS · shadcn/ui · Framer Motion · Lucide.
> All facts below were verified against the live GitHub repository (README, releases, API)
> on **2026-08-07**. Anything the repository does not state is explicitly marked
> `[MAINTAINER INPUT NEEDED]`.

---

## 1. Sitemap

```
/                          Home            (marketing / landing)
/download                  Download        (releases, checksums, build-from-source)
/docs                      Documentation   (install · build · deps · run · troubleshoot)
/docs/[section]#anchor      → anchors: install, build-windows, build-linux, build-macos,
                             dependencies, running, troubleshooting, contributing, repository
/faq                       FAQ             (accordion, from README)
/contributing              Contributing    (contribute, format, bug reports, AI policy)
/about                     About           (project, history, tech, legal, thanks)
/404                       404             (soft-404, not in sitemap.xml)
```

**Navigation (top bar):** `Download · Documentation · FAQ · Contributing · About` + CTA `Get KytyPS5` → `/download`.
**Footer:** logo, tagline, columns (Project: Download, Documentation, FAQ, Contributing, About; External: GitHub, Releases, Issues, Discussions–none), legal line, license line.

**robots.txt:** allow all, sitemap pointer. **sitemap.xml:** the 6 indexable routes with canonical URLs
(`https://kytyps5.github.io/…` — final domain `[MAINTAINER INPUT NEEDED]`).

---

## 2. Design System

### 2.1 Direction

**"Iris"** — an original dark-first identity for an emulator project: near-black ink surfaces, one
signature electric blue→violet gradient ("iris") used sparingly, a hint of run-green for
play/execute actions. The blue-violet family evokes a console light-bar without copying any
PlayStation branding. Reference quality bar: Linear / Vercel / Raycast.

A machine-readable copy of the skill-generated baseline is persisted at
`design-system/kytyps5/MASTER.md` (ui-ux-pro-max skill). The tokens below are the final, refined
superset the site will implement.

### 2.2 Color tokens (dark-only)

| Token            | Value                    | Usage |
|------------------|--------------------------|-------|
| `--bg-ink`       | `#05060B`                | Page base (near-black, avoids pure `#000` OLED smear) |
| `--bg-surface`   | `#0B0E16`                | Cards, nav, footer |
| `--bg-elevated`  | `#111624`                | Hovered cards, dropdowns, code blocks |
| `--border`       | `rgba(255,255,255,.08)`  | Default hairlines |
| `--border-strong`| `rgba(255,255,255,.16)`  | Active / focused surfaces |
| `--text-primary` | `#F2F4FA`                | Headings, body |
| `--text-secondary`| `#A6AEBF`               | Body copy, labels |
| `--text-muted`   | `#67707F`                | Meta, captions, placeholders |
| `--accent`       | `#5B8CFF`                | Primary interactive color |
| `--accent-grad`  | `#4FA3FF → #5B8CFF → #8B5CF6` | Signature iris gradient (text + glows) |
| `--run`          | `#34D399`                | Play / run / "in-game" semantic |
| `--warning`      | `#FBBF24`                | Experimental / caveat badges |
| `--destructive`  | `#F87171`                | Errors |

Contrast on ink: text-primary ≈ 15:1, secondary ≈ 9:1, muted ≈ 5.5:1, accent-on-ink ≈ 6.5:1 → all
pass WCAG AA/AAA. Focus rings use `--accent` at 2px + 3px halo.

### 2.3 Typography

- **Display:** Space Grotesk 500/600 — hero, section titles (distinctive, geometric, techy)
- **Body:** Inter 400/500 — everything else (premium, precise)
- **Mono:** JetBrains Mono 400/500 — code blocks, version tags, checksums, terminal previews, nav meta
- Fluid scale via `clamp()`: `display-xl 72→96px · display-lg 48→64 · h1 36→48 · h2 28→36 · h3 20→24 · body 16 · small 14 · caption 12 · mono-label 12 (uppercase, letter-spacing .12em)`
- Tracking: display −0.03em; body 0; labels +0.12em.

### 2.4 Spacing · Radius · Shadows

- **Spacing:** 4px base grid; scale `4 8 12 16 24 32 48 64 96 128`. Section rhythm 96–128px (64 on mobile). Container max 1200px; prose max 720px; ultrawide handled by `max-w` + centered grid (no full-bleed distortion).
- **Radius:** controls `10px`, cards `14–20px`, large surfaces `24px`, pills `999px`.
- **Shadows:** `sm` `0 1px 2px rgba(0,0,0,.4)` · `md` layered `0 2px 8px -2px rgba(0,0,0,.5), 0 8px 24px -8px rgba(0,0,0,.5)` · `lg` for modals; **glow** `0 0 0 1px var(--border), 0 0 40px -8px rgba(91,140,255,.35)` reserved for primary CTAs and the hero logo.

### 2.5 Motion principles (Framer Motion)

| Use | Duration | Easing | Notes |
|-----|----------|--------|-------|
| Hover / micro | 150ms | `ease-out` | buttons, cards, links |
| Entrance (hero) | 600–750ms | `cubic-bezier(.16,1,.3,1)` | staggered 80ms, translateY 16–24px |
| Scroll reveal | 400–550ms | `cubic-bezier(.16,1,.3,1)` | fade + 16px y, `whileInView` once |
| Press | 0.98 scale, 150ms | spring (stiffness 400, damping 30) | buttons, cards |
| Page transition | 250ms | crossfade + 8px y | `AnimatePresence` route wrapper |

- Scroll reveal is **subtle**: no bounce, no big parallax. Hero glows get a low-intensity parallax
  drift (≤40px, `useScroll` + `useTransform`, pointer-eased).
- `prefers-reduced-motion`: all transforms/parallax disabled, reveals become instant fades, marquee
  pauses — enforced globally via `useReducedMotion` + CSS.

### 2.6 Signature details (original, no copied assets)

- **Wordmark:** original text-logo "KytyPS5" in Space Grotesk 700 with the "5" set in the iris
  gradient — no external logo asset exists, so the wordmark is typographic (approved at build).
- **Ambient background:** two/three large iris radial-gradient blobs, masked, animated at low
  opacity; plus a faint dot-grid or scanline texture at ≤4% opacity.
- **Terminal motif:** a faux-terminal window used in the hero "install preview" and docs (JetBrains
  Mono, mac-style traffic lights kept abstract).
- **Game screenshot carousel** sourced from the repo (`docs/screenshots/ps5-01…06.png`, served
  from `raw.githubusercontent.com`, lazy-loaded, `loading="lazy"` + width/height reserved).

---

## 3. Component Inventory

**Primitives** (`src/components/ui`): `Button` (variants: primary-iris, secondary, ghost, run;
sizes sm/md/lg; icons; loading), `Badge` (default, accent, run, warning, outline), `Card`
(`GlowCard` hover lift variant), `Input`, `Accordion`, `Tabs`, `Dialog` (for download modal),
`Tooltip`, `Separator`, `Skeleton`, `CodeBlock` (faux-terminal + copy), `Table`.

**Layout** (`src/components/layout`): `Navbar` (sticky, blur-on-scroll, mobile drawer with
`AnimatePresence`), `Footer`, `PageTransition`, `Container`, `Section` (eyebrow + heading +
subhead composition), `SkipLink`.

**Sections** (`src/components/sections`): `Hero`, `StatsBar`, `Platforms`, `Features`,
`ScreenshotCarousel`, `InstallPreview` (terminal), `HowItWorks` (3-step), `FaqPreview`,
`ContributingCta`, `CtaBanner`, `ReleaseHighlights` (home), `AboutStory`.

**GitHub-driven** (`src/components/github`): `RepoStats` (stars/forks/issues/commits/language),
`LatestReleaseCard` (tag, date, assets w/ per-OS buttons + size), `ContributorsGrid` (avatar +
commits), `CommitFeed` (recent commits, newest 5), `ReleaseNoteLink` (compare URL), all consuming
`src/lib/github.ts` (typed GitHub REST client with `no-store` fetch, error/fallback states, cached
in-memory per session).

**Hooks** (`src/hooks`): `useScrollReveal` (wrapper around `whileInView`), `useReducedMotion`,
`useMediaQuery`, `useGithubData` (fetch + SWR-like stale-while-revalidate), `useCountUp`
(stats animation).

**Pages** (`src/pages`): `Home`, `Download`, `Documentation`, `Faq`, `Contributing`, `About`,
`NotFound` + routes in `App.tsx` (React Router). **Lib:** `github.ts`, `utils.ts` (cn), `seo.ts`
(meta/OG/Twitter/JSON-LD builder). **Assets/styles:** fonts via `@fontsource` (self-hosted, no
third-party CDN), `index.css` with token `@theme` (Tailwind v4) + shadcn variables.

---

## 4. Wireframe Descriptions

### `/` Home (long-scroll, one screenful hero)
1. **Navbar** — logo wordmark left; links center; `Get KytyPS5` CTA right. Mobile: hamburger → full drawer.
2. **Hero** — animated iris glow + dot grid backdrop; wordmark (large, gradient "5"); one-liner
   *"PlayStation 5 emulator for Windows, Linux and macOS"*; status badge *"Early development"*;
   CTAs `Download` (primary, → /download) + `View on GitHub` (secondary); below: OS chips
   (Windows x64 · Linux x64 · macOS x86-64/Rosetta); scroll-cue.
3. **Stats bar** — live from GitHub: stars · forks · open issues · contributors (count-up on view).
4. **Supported platforms** — three cards (Windows *primary*, Linux, macOS *experimental*) with accurate caveats.
5. **Features** — bento grid of 6 cards (High-performance native C++ · Vulkan 1.3 renderer · Open
   source GPL-2.0 · Actively developed (near-daily builds) · Cross-platform · Developer friendly —
   clang/clang-cl + CMake + tests). Only repo-backed claims.
6. **Screenshots carousel** — auto-advancing carousel w/ arrows + dots, real game screenshots with
   accurate game titles + `[verify captions]` note; respectful of repo licensing.
7. **Installation preview** — faux-terminal with Linux `cmake`/`launcher` snippet + copy button + link to /docs.
8. **How it works** — 3 steps: *Add game folders → detects `eboot.bin` → Run*; plus direct `--game` CLI note.
9. **FAQ preview** — top 4 questions → /faq.
10. **Contributing CTA** — banner (report bugs, test games, contribute code) + GitHub buttons.
11. **Footer.**

### `/download`
1. **Latest release card** — auto from GitHub API: tag (`KytyPS5-2026-08-07-…`), published date,
   per-OS download buttons (Windows x64 `.zip` · Linux x86_64 `.tar.gz` · macOS x86_64 `.zip`),
   file sizes, "Release notes →" (compare/changelog URL).
2. **Checksum section** — `[MAINTAINER INPUT NEEDED]` (repo publishes none): propose client-side
   SHA-256 verification helper **or** official checksum file once maintainers publish one.
3. **Requirements** — OS (Win 10 1803+, Linux distro, macOS Apple Silicon), x86-64 CPU, Vulkan 1.3
   GPU w/ current drivers, Qt 6 note (bundled in releases).
4. **Build from source** — tabs (Windows / Linux / macOS) with the exact README commands, submodule
   init, CMake configure/build/install, notes (clang-cl required, MSVC unsupported, MoltenVK on macOS).
5. **Release cadence note** — near-daily builds; `[MAINTAINER INPUT NEEDED]` on whether to show a release archive list.

### `/docs`
Anchor layout with sidebar (Installation, Building — Windows/Linux/macOS, Dependencies, Running,
Troubleshooting, Contributing, Repository links). Content verbatim-adapted from README; code blocks
with copy; `--game` usage; `--help` flags summarized; GPU-driver advice; experimental status caveats.

### `/faq`
Accordion, 10–12 Q&As derived strictly from README: *What games work? / Is it production ready?
/ Which OS are supported? / Does it need a BIOS?* (no firmware distributed — legally obtained
games; no low-level modules required) *How do I build it? / Where do I report bugs?* (+ game bug
report template + attach log) *Is it affiliated with Sony? / What license? / How can I contribute?*
Unknowns marked `[MAINTAINER INPUT NEEDED]` (e.g., exact supported-game list).

### `/contributing`
Testing games + detailed bug reports; code contribution rules (focused, builds on touched
platforms, tests); formatting (pre-commit + clang-format); AI-use policy (human-authored
communication, disclose AI assistance); links to issues/PRs; Special Thanks (Kyty, shadPS4).

### `/about`
Story (fork of Kyty, early-stage, goals: compatibility + boot reliability), architecture highlights
(RDNA 2 ISA reference, shader recompiler, guest/host GPU, Vulkan 1.3), tech stack chips, license
(GPL-2.0-only, Kyty MIT preserved), legal disclaimer (not affiliated with Sony, no copyrighted
system software distributed), Special Thanks.

### `/404`
Soft-404: wordmark, "Page not found", link home + GitHub. Not indexed.

---

## 5. Verified facts used (source: GitHub API + README, 2026-08-07)

| Fact | Value |
|---|---|
| What | Free & open-source **PlayStation 5 emulator**, C++ |
| Status | Early development; boots 2D games + selection of 3D games (UE4/5, Unity, custom); focus on compatibility & boot reliability |
| Platforms | Windows (primary, most tested) · Linux x64 · macOS experimental (x86-64, Rosetta 2, MoltenVK) |
| Graphics | Vulkan 1.3 renderer; RDNA 2 shader decoding/recompilation |
| License | GPL-2.0-only; based on Kyty (MIT preserved); not affiliated with Sony |
| Releases | Near-daily; assets: Windows x64 `.zip`, Linux x86_64 `.tar.gz`, macOS x86_64 `.zip`; **no checksums published** |
| Stats | 1,248 stars · 117 forks · 100 open issues · 14 contributors (top: Nmzik) · created 2026-06-09 |
| Build | CMake ≥3.12 · Ninja · Clang/clang-cl (MSVC unsupported) · Qt 6 (Concurrent/Network/Widgets) · submodules incl. SDL2, Vulkan-*, SPIRV-*, ffmpeg-core, imgui, spdlog, tracy |
| Run | `launcher` GUI (scans game folders for `eboot.bin`) or `kyty_emulator --game <dir|elf>`; `--help` for flags |
| Screenshots | `ps5-01…06.png`: Disgaea 6, Dreaming Sarah, Neptunia ReVerse, SILENT HILL: The Short Message, Hellboy, Paleo Pines |

### `[MAINTAINER INPUT NEEDED]` (never invented)
1. Canonical domain for SEO (sitemap/OG).
2. Screenshot caption verification (README alt-text has mismatches, e.g. ps5-04 alt = "Minecraft Legends" vs label "Neptunia ReVerse").
3. Checksum strategy (none published).
4. Formal roadmap (none in repo; only "focused on compatibility and boot reliability").
5. Website code license (site itself — propose GPL-2.0 to match project, or MIT for site code).
6. Whether to list an archive of old releases.
7. Any FAQ answers requiring maintainer sign-off.

---

*Next: on approval, scaffold the Vite project and implement incrementally — Phase 1: project
scaffold + tokens + primitives + layout + Home; Phase 2: Download/Docs/FAQ; Phase 3:
Contributing/About/404 + SEO + GitHub API + perf/accessibility pass.*
