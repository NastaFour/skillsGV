---
name: ui-diff
description: "Trigger: ui-diff, /ui-diff, visual diff, screenshot diff, dom geometry audit, visual regression, review ui, before after screenshots. Runs zero-dependency Playwright DOM-geometry checks, captures 2x2 light/dark desktop & mobile contact sheets, and highlights changed pixels between base and head states with a concise UX summary. Do NOT use for backend-only APIs or static unit testing without rendered UI."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+ (Playwright optional in target app)."
allowed-tools: Bash(node:*,pnpm:*,git:*,taskkill:*) Read Write
allows-script-exec: "ui-diff.mjs optionally launches user dev server and browser binary via node:child_process"
metadata:
  trigger: ["ui-diff", "/ui-diff", "visual diff", "screenshot diff", "dom geometry audit", "visual regression", "review ui", "before after screenshots"]
  scope: [global, project]
  version: "1.0.0"
---

# 🖼️ ui-diff — Visual Diff, Contact Sheet & DOM Geometry Probe

> *"Review the UI, not just the code."* — Runs live browser geometry checks at `0` LLM vision tokens, stitches a single `2×2` Contact Sheet (`desktop 1280×800` + `mobile 390×844`, `light` & `dark`), and computes zero-dependency `<canvas>` pixel-diff masks on UI PRs or refactors.

## 🚦 Modes & Execution Contract

1. **`capture` (Greenfield / Baseline)**: Captures desktop & mobile light/dark screenshots into `.ui-diff/baseline/`, generates `.ui-diff/contact-sheet-2x2.png`, and runs quantitative `evaluateDomGeometry` checks (`horizontal-overflow`, `above-fold-clipping`, `sibling-alignment-drift > 4px`, `grid-height-variance > 16px` on `[data-uniform-grid]` rows, `small-tap-target < 40px mobile / < 24px desktop`, `broken-image`, `mono-prose`, `console-error`).
2. **`diff` (PRs & Refactors)**: Compares `--url <after>` against `--before-url <before>` (or saved `.ui-diff/baseline/`) with `animations: "disabled"` and `reducedMotion: "reduce"`, writing red-highlighted pixel masks under `.ui-diff/diff/`.
3. **`auto` (Default)**: Uses `diff` if `.ui-diff/baseline/` or `--before-url` exists; otherwise runs `capture` (greenfield-safe, never crashes).
4. **Degraded Fallback**: If Playwright is absent from the workspace, emits `{ "status": "degraded", "reason": "playwright-unavailable" }` and exits `0` (or `3` under `--strict-browser`) so builds fall back cleanly to static gates.

## 🛠️ Usage

```bash
node 05-frontend/ui-diff/scripts/ui-diff.mjs --url http://localhost:4321 --mode auto --json
```

Report a concise 3-line **UX Diff Summary**: (1) Geometry pass/fail, (2) `%` changed pixels per viewport, (3) Notable UX impact or `[PASS]` clearance. Ensure `.ui-diff/` stays gitignored in target projects.
