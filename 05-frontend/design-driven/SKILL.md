---
name: design-driven
description: "Trigger: design-driven, design gate, D1b, DESIGN_SYSTEM.md, design read, think outside the box, chasis arquetipico. Use before generating or refactoring any UI/frontend to run the D1b Uniqueness Interview (or One-Shot Auto-Inference), lock an Archetypal Chassis or Think-Outside-the-Box lateral direction, and emit DESIGN_SYSTEM.md. Do NOT use for backend-only services without visual surfaces."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*,pnpm:*,git:*) Read Write
metadata:
  trigger: ["design-driven", "design driven", "design system", "ui mockup", "ux validation", "color palette", "stitch", "d1b", "think outside the box"]
  scope: [global, project]
  version: "3.1.0"
---

# 🎨 Design-Driven Development (3D) & Think-Outside-the-Box Engine

Enforces intentional, anti-slop UI architecture before a single line of JSX/CSS is emitted. Harmonizes the entire frontend ecosystem (`taste-skill`, `impeccable`, `ui-ux-pro-max`, `hallmark-design-study`, `scroll-world-storytelling`, `frontend-slides-deck`) around a single source of truth: **`DESIGN_SYSTEM.md`** and the **3-Line `Design Read`**.

---

## 🚫 Hard Invariants vs Open Creative Upper-Bound (`Floor, Not Ceiling`)

- **Hard Invariants (Floor)**:
  1. Never emit greenfield UI without a prior **3-Line `Design Read`** (or **1-Line Fast-Path** for minor maintenance `< 50` lines).
  2. Never use fake data (`Lorem ipsum`, `John Doe`, fake sparklines) or omit interactive states (`hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`).
  3. Always consume semantic CSS tokens (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`) defined in `DESIGN_SYSTEM.md` (OKLCH default for Tailwind 4/modern CSS; HSL supported for shadcn/Tailwind 3; `#hex` only as visual reference in docs).
  4. Enforce WCAG 2.2 AA contrast and `@media (prefers-reduced-motion: reduce)`.
- **Open Creative Upper-Bound (Ceiling — `[Beyond-Baseline]`)**:
  - The 8 Archetypal Chassis below are proven launchpads, **never cages**. When a domain calls for a bold lateral aesthetic, activate **Archetype H (`Bespoke / Think Outside the Box`)** and annotate `[Beyond-Baseline: <creative/domain rationale>]`.

---

## ⚡ Execution Modes (Token-Optimized One-Shot vs Interactive)

| Mode | When to Use | Token Cost & Behavior |
|---|---|---|
| **1. Fast-Path (1-Line `Design Read`)** | Bugfix, tweak, or maintenance `< 50` lines on an existing project with `DESIGN_SYSTEM.md` | Emit 1 line: `Design Read: [Chassis] — inheriting tokens from DESIGN_SYSTEM.md; [targeted change].` Zero interview rounds. |
| **2. One-Shot Auto-Inference (`auto` / One-Shot Prompt)** | User requests a complete app/screen in one shot or says `"sorprendeme"`, `"auto"`, `"one-shot"` | Synthesize the 8 core D1b dimensions + **Think-Outside-the-Box Lateral Protocol** inline in a compact 8-line block, write/update `DESIGN_SYSTEM.md`, emit the 3-line `Design Read`, and build immediately. |
| **3. Interactive D1b Interview** | Greenfield project where user wants collaborative design exploration | Run the 5 conversational blocks in [`references/d1b-questionnaire.md`](references/d1b-questionnaire.md). |

---

## 🏛️ The 8 Archetypal Chassis & "Think Outside the Box" Protocol

Select one of `A–G` or unlock lateral creation via `H`:

- **A. `Technical Monograph`** (`[7, 2, 8]`): Editorial documentation & research (1:3 asymmetric grid, 1px exposed hairlines, zero cards).
- **B. `Industrial Spec-Sheet`** (`[3, 1, 9]`): Telemetry, DevOps, quantitative finance (12-col hairline matrix, `tabular-nums`, zero shadows).
- **C. `The Gallery`** (`[9, 4, 2]`): Luxury, architecture, portfolios (`>= 45%` open canvas, bipolar typographic scale).
- **D. `The Kinetic Utility`** (`[4, 8, 7]`): Spatial editors, 3D/WebGL, audio/video tools (`100dvh` locked viewport, floating HUDs).
- **E. `The Precision Instrument`** (`[4, 5, 7]`): High-velocity productivity (Linear/Raycast style, keyboard-first, `6-8px` micro-radii).
- **F. `The Humanist Companion`** (`[5, 4, 5]`): Consumer, health, education, publishing (warm editorial surfaces, organic rhythm).
- **G. `The System Native`** (`[3, 2, 7]`): Multi-team enterprise SaaS (disciplined Radix/Shadcn/Tailwind primitives).
- **H. `Bespoke / Creative Exploration ("Think Outside the Box")`**:
  When standard SaaS templates feel predictable, run the **3-Step Lateral Design Inversion**:
  1. **Cliché Inversion**: Name the 3 most overused visual clichés of the target industry (e.g., *"fintech = dark blue + neon green crypto cards"*) and invert them (e.g., *"Swiss archival ledger on warm cotton paper with stamped vermilion ink"*).
  2. **Cross-Domain Metaphor & `study` DNA**: Borrow physical or cross-industry structural metaphors (e.g., Braun industrial dials, Teenage Engineering tactile grids, railway timetables, museum catalog cards) or extract structural DNA via [`hallmark-design-study`](../hallmark-design-study/SKILL.md).
  3. **3 Mechanical Generative Rules**: Translate the metaphor into 3 strict CSS/layout laws (grid proportions, border/surface physics, motion curve) and declare `[Beyond-Baseline: <lateral thesis>]`.

---

## 📋 Unified 3-Line `Design Read` & `DESIGN_SYSTEM.md` Contract

Before writing UI code, emit:
```text
Design Read:
1. Direction/Chassis: [Archetype A-H] — [Target audience & Think-Outside-the-Box thesis]
2. Hierarchy & Tokens: [--surface-*, --text-*, --accent-*, --border-* in OKLCH/HSL + typographic scale]
3. Craft Signature: [3 mechanical rules + memorable micro-detail [Beyond-Baseline: <reason>]]
```

Persist the full specification in `DESIGN_SYSTEM.md` (and place `/* @design-archetype: <name> */` only in the root entry file when `DESIGN_SYSTEM.md` is absent). Cross-reference [`references/d1b-questionnaire.md`](references/d1b-questionnaire.md) for the full D1b interview and One-Shot synthesis template.
