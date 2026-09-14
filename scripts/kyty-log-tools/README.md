# kyty-log-tools

Deterministic analysis tooling for the `_kyty.txt` runtime logs that the KytyPS5
emulator writes to the root of the games' directory.

## Purpose

Parses a `_kyty.txt` log in a single streaming pass and produces a normalized
JSON report: categorized log events (unresolved import stubs, module loads,
unimplemented/build/host messages, warnings, stack frames, host exceptions),
stable error signatures, and evaluation of each candidate signature with the
evidence that supports it (fact / catalog-mismatch / hypothesis — never "root
cause confirmed").

The analyzer is deterministic: for the same input it produces the same output
except for `duration` and peak memory measurements.

## What is `_kyty.txt`?

A text runtime log written by KytyPS5 (PlayStation 4 emulator for Windows/Linux)
next to the game files. It records module loads, import resolution failures
(`Relocate: unresolved PLT import patched to stub`), unimplemented instructions,
and other runtime diagnostics.

## What it analyzes

- Unresolved import stubs, grouped by module and function.
- Loaded modules and their dependencies.
- Shader opcode disassembly candidates, looked up in the bundled opcode catalog.
- Stack frames, warnings, host exceptions, `Build`/`Host` markers, fatal sections.

## Requirements

- Node.js. The `.ts` sources are run directly, which requires Node `>=22.18`
  (built-in type stripping). Node 22 is what the repository CI uses.
- `npm test` runs the suite with Vitest (no Node runtime minimum beyond Vitest's).

## Usage

Analyze a log (human-readable summary to stdout):

```sh
node scripts/kyty-log-tools/cli.ts analyze path/to/_kyty.txt
```

Analyze with JSON output:

```sh
node scripts/kyty-log-tools/cli.ts analyze path/to/_kyty.txt --json
```

Shader opcode candidates are looked up automatically against the bundled
`opcode-catalog.json`; point `--catalog <path>` elsewhere to use a different
catalog.

Regenerate the opcode catalog from a local KytyPS5 checkout:

```sh
node scripts/kyty-log-tools/cli.ts catalog path/to/KytyPS5 --out scripts/kyty-log-tools/opcode-catalog.json
```

Run the tests:

```sh
npm test
```

## Regenerating `opcode-catalog.json`

The catalog is derived from the canonical decoder tables in KytyPS5,
`src/graphics/shader/recompiler/frontend/decode/*.cpp`. Regenerate it with the
`catalog` command above; the JSON records the exact KytyPS5 commit it was
generated from in the `source` field. The generation is deterministic: two runs
over the same checkout produce byte-identical files.

## Architecture

- `cli.ts` — argument parsing and command dispatch (`analyze`, `catalog`).
- `parser.ts` — streaming parser (`createReadStream` + `readline`).
- `analyzer.ts` — event aggregation, signature normalization, evaluation.
- `catalog.ts` — table extraction from decoder sources and catalog generation.
- `types.ts` — shared types.
- `opcode-catalog.json` — generated data, committed for hermetic tests and output.
- `fixtures/sample.kyty.txt` — real-log fixture used by integration tests.

## Streaming nature

The log file is read line by line with `createReadStream` + `readline`; the full
log is never loaded into memory, so memory usage is proportional to the number
of matched events, not to file size. Unmatched lines are counted, not buffered.

## Limitations

- Candidate classification is evidence-based, not a confirmed root cause;
  hypothesis and catalog-mismatch are deliberately less factual than fact.
- No shader-opcode candidates have been observed in real logs yet; that path is
  covered by fixtures and tests.
- No interrupt/resume, no truncation handling beyond counting unknown lines.
- Correlator, AI assistance, and a sanitizer are out of scope by design.

## Privacy

The tool does not publish anything and does not interact with GitHub
automatically. It reads the log and a local KytyPS5 checkout only and writes
the report to stdout (or a file with `--out` for `catalog`). Guest paths and
pc/address values are intentionally excluded from signature identifiers, so
signatures stay stable across runs and locations.