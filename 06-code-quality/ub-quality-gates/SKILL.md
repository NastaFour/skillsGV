---
name: ub-quality-gates
description: "Trigger: ub-mode, uncle bob, crapper, crap score, dryer, mutator, mutation testing, attack the premise. Deterministic post-implementation code-rigor gates adapted from Robert C. Martin's ub-mode (0BSD): CRAP score (< 10), structural AST clone detection (dryer < 0.82), differential mutation testing (mutator), and net-new structural heuristics (Attack the Premise, Separate Before Serializing, Idempotent Operations). Use when running quantitative complexity, clone, or mutation gates on non-trivial logic. Do NOT use for TDD workflows (use testing-patterns or tdd), commit/PR slicing (use work-unit-commits), general SOLID architecture (use solid-clean-code), or UI/CSS-only diffs."
license: 0BSD
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Gemini CLI, Antigravity. Optional Python 3 CLIs (unclebob/crapper, dryer, mutator) with graceful manual fallback."
allowed-tools: Read Bash(pnpm:*,git:*,python:*,where.exe:*,crapper:*,dryer:*,mutator:*)
metadata:
  author: skillsGV
  version: "1.0.0"
  tier: "full"
  trigger: ["ub-mode", "uncle bob", "crapper", "crap score", "dryer", "mutator", "mutation testing", "attack the premise"]
  scope: [global, project]
---

# Clean Rigor & Deterministic Quality Gates (`ub-mode`)

> **Attribution**: Adapted from [unclebob/ub-mode](https://github.com/unclebob/ub-mode) (`0BSD`) and companion CLIs (`crapper`, `dryer`, `mutator`). TDD cycles (`testing-patterns`, `tdd`) and commit slicing (`work-unit-commits`, ODD) remain owned by their canonical skills and are intentionally omitted to avoid workflow overlap.

Run these gates after code changes are working to eliminate hidden complexity, structural clones, and weak assertions across supported languages (**TypeScript/JS, Python, Go, Java, Rust, Clojure**).

## 1. Net-New Structural Heuristics

*(For boundary validation, subtraction, and root-cause debugging, follow `solid-clean-code`, `karpathy-ponytail-simplicity`, and `systematic-debugging`.)*

1. **Attack the Premise (2-Strike Rule)**: When two fixes sharing one premise fail the same gate, write that premise in one sentence, count which actors hold the imbalance, and eliminate the faulty premise before attempting a third fix.
2. **Separate Before Serializing Shared State**: Give concurrent writers isolated state whenever possible; if sharing is mandatory, enforce a single writer structurally rather than sprinkling ad-hoc locks.
3. **Make Operations Idempotent**: Running a command or recovery step twice, or resuming after a mid-flight failure, must converge deterministically to the same final state.

## 2. Quantitative 3-Judge Gates

| Gate Tool | Threshold | Differential Invocation (`pnpm`-safe) | Exit Codes |
| :--- | :--- | :--- | :--- |
| **`crapper`** | `CRAP < 10` per function (`CC² × (1 − cov)³ + CC`) | `crapper --changed --threshold 10 --coverage-command "pnpm test:coverage"` (or `--use-existing-coverage`) | `0` pass · `2` score over threshold · `ENOENT`/`127` missing |
| **`dryer`** | Jaccard similarity `< 0.82` (`--min-lines 4 --min-nodes 20`) | `dryer --changed --threshold 0.82 --format text` | `0` report complete · `1` usage · `2` unknown format |
| **`mutator`** | `0` surviving covered mutants; delete dead code | `mutator --changed --max-workers 3 --test-command "pnpm test"` | `0` all killed · `2` baseline tests red · `3` survivor found |

### Scoping & `mutator` Guardrails

- **Before first run**: Verify exact flags with `<tool> --help`. Remember `mutator` expects a sibling checkout of `crapper` next to its tool directory when run from source.
- **When to run `mutator`**: Run **only** when baseline tests are GREEN and `git diff --name-only` modifies non-trivial business logic or branching paths (explicitly skip docs, config, generated artifacts, and pure CSS/UI markup diffs). Always keep differential scope (`--changed` or explicit source paths) and bound concurrency with `--max-workers 3`.
- **On TypeScript/JS repositories**: Always override test and coverage commands explicitly (`--test-command "pnpm test"`, `--coverage-command "pnpm test:coverage"`) so upstream Python wrappers follow the `pnpm`-only policy.

## 3. Cross-Platform Binary Probe & Graceful Fallback

Probe each binary deterministically without hardcoding POSIX-only relative paths:

```text
Probe order (run until found):
  1. PATH check:       Windows -> where.exe <tool>    | POSIX -> command -v <tool>
  2. Local venv check: Windows -> .venv\Scripts\<tool>.exe | POSIX -> .venv/bin/<tool>
  3. Module check:     python -m <tool> --help
  4. Not found (ENOENT / exit 127): execute manual fallback below and report disclosure line.

Expected snapshot artifacts (when executed):
  .metrics/crap.edn   |   .metrics/dry.edn   |   .metrics/mutate/<namespace>.edn
Sibling source layout note: ../crapper next to mutator checkout.
```

Never claim an automated gate passed when the CLI is missing or skipped:

| Missing Tool | Mandatory Fallback Audit | Required Disclosure Line |
| :--- | :--- | :--- |
| **`crapper`** | Read existing LCOV/coverage report + inspect cyclomatic branching and nesting depth manually on touched functions | `ub-quality-gates: crapper unavailable; manual fallback applied — automated gate not executed` |
| **`dryer`** | Inspect touched functions structurally across changed files for repeated control-flow blocks differing only in identifiers/literals | `ub-quality-gates: dryer unavailable; manual fallback applied — automated gate not executed` |
| **`mutator`** | Audit boundary comparisons (`<`/`<=`, `===`/`!==`), boolean branches, and error paths in tests to confirm every branch fails if inverted | `ub-quality-gates: mutator unavailable; manual fallback applied — automated gate not executed` |
