# KytyPS5 Website

The official website for **[KytyPS5](https://github.com/KytyPS5/KytyPS5)** — a free and
open-source PlayStation 5 emulator for Windows, Linux and macOS. Live at
**[kytyps5.github.io](https://kytyps5.github.io/)**.

Dark-first, premium, accessible and fast. Built with React 19, Vite, TypeScript, Tailwind CSS v4,
Radix UI primitives, Framer Motion and Lucide icons.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run test      # Vitest suite
npm run build     # typecheck + production build (regenerates derived data first)
npm run preview   # preview the production build
```

`npm run build` regenerates all derived data (GitHub snapshot, compat exports, sitemap), so a
fresh checkout builds cleanly. Set `GITHUB_TOKEN` when building to avoid anonymous rate limits.

## Project layout

- `src/content/compat/*.md` — community game-status reports (one per game + OS); the source of
  the compatibility pages and the launcher's status export.
- `src/data/games.json` — the deduplicated PS5 title database (imported — don't hand-edit).
- `public/data/*` — derived JSON served statically (regenerated at build time).
- `scripts/` — data generators, the compat sync/conversion tooling and validators.

## Compatibility reports

Game-status reports come from [KytyPS5](https://github.com/KytyPS5/KytyPS5)'s Game Emulation
Status Report issues. Every 30 minutes the **Mirror game-status issues** workflow mirrors each
unconverted issue here as an issue labeled `compat` — one per (game, OS). To convert one into a
report, comment `/compat` on it: the **Convert compat issue to report PR** workflow writes
`src/content/compat/<game>-<os>.md` and opens a single PR for that game (re-running `/compat`
updates the same PR). One report file per (game, OS) keeps the games separate — a Linux report
never overwrites a Windows one, and the site shows each OS's own status.

## License

Site code is licensed under GPL-2.0 (see `LICENSE`). The KytyPS5 name, screenshots and all
project facts belong to the [KytyPS5 project](https://github.com/KytyPS5/KytyPS5) (GPL-2.0).
