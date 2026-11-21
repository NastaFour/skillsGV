---
name: karpathy-ponytail-simplicity
description: "Trigger: karpathy, ponytail, code bloat, over-abstraction, surgical diffs, anti-overengineering, simplicidad radical. Synthesizes Andrej Karpathy's anti-stumble coding guidelines, Ponytail veteran simplicity, Caveman terse execution discipline, and Addy Osmani pragmatic quality to prevent speculative bloat, surface assumptions early, and keep diffs surgical. Do NOT use for runtime CPU/RAM/GPU telemetry tuning (use app-resource-efficiency) or adversarial multi-agent spec critiques (use egm-spec-review)."
license: MIT
compatibility: "Compatible with Gentle-AI 4.4.0+, TypeScript, Python, Go, Rust, Claude Code, OpenCode, Cursor, Gemini CLI, Antigravity."
allowed-tools: Read Write Edit Glob Grep
metadata:
  tier: "full"
  version: "1.0.0"
  author: skillsGV
  scope: "global, project"
  trigger: ["karpathy", "ponytail", "code bloat", "over-abstraction", "surgical diffs", "anti-overengineering", "simplicidad radical"]
---

# ✂️ Karpathy & Ponytail Simplicity — Surgical Diffs & Anti-Bloat

Eliminates premature abstraction, silent assumptions, unrequested drive-by rewrites, and verbose token waste while keeping code clear, testable, and grounded in existing repository helpers.

---

## 🧭 The 4 Simplicity Rules

1. **Think Before Coding — Surface Ambiguity (`Karpathy #1`)**:
   State non-obvious assumptions and alternative interpretations *before* editing. Never invent silent fallbacks over an unclear contract; ask one crisp question when behavior is genuinely ambiguous.
2. **Simplicity First — Fight Lasagna Layers (`Karpathy #2` + `Ponytail`)**:
   Prefer direct functions, plain data structures, and existing repo helpers over single-use abstractions, strategy factories, or configuration knobs nobody asked for (`Rule of Three`). If 200 lines collapse to 50 clear lines, simplify.
3. **Surgical Diffs & Terse Prose (`Karpathy #3` + `Caveman`)**:
   Modify strictly the target execution path. Preserve unrelated comments, formatting, and adjacent logic. Clean up unused imports/variables created by your own edit, leave pre-existing dead code untouched unless asked, and report tersely with zero filler.
4. **Goal-Driven Verification (`Karpathy #4` + `Addy Osmani`)**:
   Translate every requirement into an observable verification criterion (`input -> assertion / test`) first, prove failure or gap cleanly, then implement until green.

---

## ⚠️ Anti-Patterns to Reject Immediately

- Wrapping a 1-call helper inside an interface + class + factory + config schema.
- Catching and swallowing unexpected errors silently with fake defaults (`return []`).
- Rewriting working neighboring functions cosmetically just to match personal style.
- Deleting docstrings or comments needed by callers to save arbitrary lines.
- **AI Code-Diff Slop (`deslop`)**:
  - Narration comments that merely restate the next line (`// Return the filtered array`, `// Initialize user state`). Comment *why*, never *what*.
  - Single-use passthrough wrapper helpers/hooks that add indirection without isolating an invariant.
  - Redundant defensive `null`/`typeof` cascades inside trusted internal modules already validated at the boundary.

## 🔗 Cross-References

- [`../solid-clean-code/SKILL.md`](../solid-clean-code/SKILL.md) — Hexagonal vs Vertical Slice proportionality
- [`../app-resource-efficiency/SKILL.md`](../app-resource-efficiency/SKILL.md) — Measured CPU/RAM/GPU/IO/LLM resource optimization
