---
name: design-driven
description: "Trigger: design-driven, design gate, D1b, DESIGN_SYSTEM.md, design read, think outside the box, chasis arquetipico, verify-frontend-gates. Use before generating or refactoring any UI/frontend to run the 3-Phase Frontend Engine (Phase 1 Interactive D1b & DESIGN_SYSTEM.md, Phase 2 Capability-Matched Build, Phase 3 Post-Build Polish + verify-frontend-gates.mjs). Do NOT use for backend-only services without visual surfaces."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*,pnpm:*,git:*) Read Write
allows-script-exec: "verify-frontend-gates.mjs spawns sibling skill audit scripts via node:child_process"
metadata:
  trigger: ["design-driven", "design driven", "DESIGN_SYSTEM.md", "design system", "ui mockup", "ux validation", "color palette", "stitch", "d1b", "think outside the box", "verify-frontend-gates"]
  scope: [global, project]
  version: "3.2.0"
---

# 🎨 Design-Driven Development (3D) — 3-Phase Frontend Engine & Think-Outside-the-Box

Enforces intentional, anti-slop UI architecture across **3 proportional phases** (`<= 5` skills/turn, zero context overload) anchored on **`DESIGN_SYSTEM.md`**, the **3-Line `Design Read`**, and the unified post-build gate **`verify-frontend-gates.mjs`**.

---

## 🚫 Hard Invariants vs Open Creative Upper-Bound (`Floor, Not Ceiling`)

- **Hard Invariants (Floor)**:
  1. Never emit greenfield UI without a prior **3-Line `Design Read`** (or **1-Line Fast-Path** for tweaks `< 50` lines).
  2. Never use fake data (`Lorem ipsum`, `John Doe`, fake sparklines) or omit interactive states (`hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`).
  3. Always consume semantic CSS tokens (`--color-surface-*`, `--color-text-*`, `--color-accent-*`, `--color-border-*` in `@theme inline`; OKLCH default for Tailwind 4; HSL supported for TW3).
  4. Enforce WCAG 2.2 AA contrast, `@media (prefers-reduced-motion: reduce)`, and **zero wireframe box-wall cosplay**: rejecting generic rounded SaaS cards means using **negative space, typographic hierarchy, and tonal surface steps** — NEVER wrapping every label, tutorial note, badge, or link in `0–2px` `1px`-bordered rectangles.
- **Open Creative Upper-Bound (`[Beyond-Baseline]`)**:
  - Archetypes `A–G` are launchpads, **never cages**. Activate **Archetype H (`Bespoke / Think Outside the Box`)** via `[Beyond-Baseline: <creative/domain rationale>]` whenever a domain calls for a bold lateral aesthetic.

---

## 🔄 The 3-Phase Frontend Engine (Full Arsenal, Zero Context Overload)

1. **Phase 1 — Direction & Foundation (Pre-Code, pick `<= 5` skills total)**:
   - Load `design-driven` (+ [`references/d1b-questionnaire.md`](references/d1b-questionnaire.md)) + stack (`tailwind-4`, `react-19`/`react-vite`/`nextjs-15`) + `ui-ux-pro-max` or `design-system-tokens` / `oklch-theme-injector`.
   - **Default for greenfield interactive requests**: send **1 single concise D1b message** (combining mood/personality, geometry/radii & space-vs-borders, polarity/accent, typography, and signature detail — respecting ODD's 1-question rule) even if the user mentioned a theme/material, and wait for their reply before writing code.
   - **One-Shot Auto-Inference** is used ONLY when the user explicitly writes `"one-shot" / "sin preguntas" / "sorprendeme"` or inside autonomous parallel swarms.
   - Emit `DESIGN_SYSTEM.md` + 3-line `Design Read` before TSX.

2. **Phase 2 — Capability-Matched Construction (`<= 5` skills/turn, on-demand)**:
   - Load ONLY skills (and their relevant `references/*.md`) matching features this app actually builds (e.g., Forms → `forms-validation-react`; Motion/Micro-interactions → `emil-kowalski` + `motion-framer` + `micro-interactions`; View Transitions → `vercel-react-view-transitions` + `page-transitions`; Visual depth → `visual-effects`; SaaS/Dashboard → `interface-design` + `vercel-react-best-practices`; Landing/SEO → `scroll-world-storytelling` + `page-cro` + `openseo`; Non-SPA → Angular/Mobile/Electron). Delegate long-tail discovery to `skill-router`.

3. **Phase 3 — Proportional Post-Build Polish & Visual Gate (Mandatory Before Delivery)**:
   - **All UI edits (`< 50` lines included)**: run the unified mechanical gate (zero doc-token cost):
     ```bash
     node 05-frontend/design-driven/scripts/verify-frontend-gates.mjs --srcDir src --webDir .
     ```
     *(In installed target projects, run `node .agents/skills/design-driven/scripts/verify-frontend-gates.mjs --srcDir src --webDir .`.)*
   - **Greenfield / major UI builds**: run **1 focused Post-Build Polish pass** (inline or fresh subagent) loading **2–3 non-overlapping critique skills** — [`hallmark-design-study`](../hallmark-design-study/SKILL.md) (+ [`hallmark-v2-hue-stitch.md`](../hallmark-design-study/references/hallmark-v2-hue-stitch.md)), [`impeccable`](../impeccable/SKILL.md) (`critique` → `polish`/`distill`/`quieter`), and [`ai-design-check-stageshow`](../ai-design-check-stageshow/SKILL.md) or [`interface-design`](../interface-design/SKILL.md) (`design-deslop`) — plus live browser inspection (desktop `1280x800` + mobile `375–390px`, light/dark) whenever browser tooling & dev server are available (note degraded fallback explicitly if headless). Fix AI tells (eyebrow pills, decorative arrows, `"A / B"` slash metadata, pill confetti, equal-height card walls, hit targets `< 40px`) and re-run `verify-frontend-gates.mjs` until `0` errors.

---

## 🏛️ The 8 Archetypal Chassis & "Think Outside the Box" Protocol

Select `A–G` or unlock lateral creation via `H` (radii, borders, and elevation must fit the chosen chassis — never default everything to `0–2px` sharp boxes):

- **A. `Technical Monograph`** (`[7, 2, 8]`): Editorial documentation & research (1:3 asymmetric grid, subtle structural hairlines between sections, zero boxed card walls).
- **B. `Industrial Spec-Sheet`** (`[3, 1, 9]`): Telemetry, DevOps, quantitative finance (12-col hairline matrix, `tabular-nums`, compact density).
- **C. `The Gallery`** (`[9, 4, 2]`): Luxury, architecture, portfolios (`>= 45%` open canvas, bipolar typographic scale, separation by whitespace).
- **D. `The Kinetic Utility`** (`[4, 8, 7]`): Spatial editors, 3D/WebGL, audio/video tools (`100dvh` locked viewport, floating HUDs).
- **E. `The Precision Instrument`** (`[4, 5, 7]`): High-velocity productivity (Linear/Raycast style, keyboard-first, `6-8px` micro-radii).
- **F. `The Humanist Companion`** (`[5, 4, 5]`): Consumer, health, education, publishing (warm editorial surfaces, organic `10-16px` radii, soft elevation).
- **G. `The System Native`** (`[3, 2, 7]`): Multi-team enterprise SaaS (disciplined Radix/Shadcn/Tailwind primitives).
- **H. `Bespoke / Creative Exploration ("Think Outside the Box")`**:
  1. **Cliché Inversion**: Name the 3 most overused visual clichés of the target industry and invert them.
  2. **Cross-Domain Metaphor & `study` DNA**: Borrow physical/editorial structural metaphors or extract DNA via [`hallmark-design-study`](../hallmark-design-study/SKILL.md).
  3. **3 Mechanical Generative Rules**: Translate the metaphor into 3 CSS/layout laws (grid proportions, surface/elevation physics, motion curve) and declare `[Beyond-Baseline: <lateral thesis>]`.

---

## 📋 Unified 3-Line `Design Read` & `DESIGN_SYSTEM.md` Contract

Before writing UI code, emit:
```text
Design Read:
1. Direction/Chassis: [Archetype A-H] — [Target audience & Think-Outside-the-Box thesis]
2. Hierarchy & Tokens: [--surface-*, --text-*, --accent-*, --border-* in OKLCH/HSL + typographic scale]
3. Craft Signature: [3 mechanical rules + memorable micro-detail [Beyond-Baseline: <reason>]]
```

Persist the full specification in `DESIGN_SYSTEM.md` (and place `/* @design-archetype: <name> */` only in the root entry file when `DESIGN_SYSTEM.md` is absent). Token files matching `*token*`, `*theme*`, or `*variables*` are allowlisted by `token-audit.mjs` (as are single- and multiline `--*:` CSS custom properties). Cross-reference [`references/d1b-questionnaire.md`](references/d1b-questionnaire.md) for the full D1b template.
