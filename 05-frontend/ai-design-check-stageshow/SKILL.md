---
name: ai-design-check-stageshow
description: "Trigger: ai design check, stageshow, stage show, pre-build visual preview, interactive html preview, visual audit. Synthesizes @enmera/ai-design-check and benjitaylor/skills Stageshow for archetype-partitioned visual checks (flat-surface A, B, E, F, G vs immersive C, D, H), self-contained HTML5 pre-build interactive previews, and a 5-category post-build audit rubric. Do NOT use for full brand discovery (use design-driven) or direct React/Tailwind setup without a Design Read."
license: MIT
compatibility: "Compatible with Gentle-AI 4.4.0+, React 19, Next.js 15, Tailwind CSS 4, HTML5, Playwright visual audits. Requires pnpm 9+."
allowed-tools: Read Write Edit Bash(pnpm:*,node:*) Glob Grep
metadata:
  trigger: ["ai design check", "stageshow", "stage show", "pre-build visual preview", "interactive html preview", "visual audit"]
  scope: "global, project"
  version: "1.0.0"
  author: skillsGV
---

# 🎭 AI Design Check & StageShow — Pre-Build Preview & Archetype Audit

Combines **@enmera/ai-design-check** (5-category visual quality inspection) with **benjitaylor/skills StageShow** (self-contained single-file HTML5 pre-build preview sandboxes) aligned to `design-driven` archetypes `A–H` and `taste-skill` triaxial dials.

---

## 🧭 Archetype Surface Partition (`A–H`, Floor Not Ceiling)

Before auditing or previewing, bind checks to the declared archetype from `DESIGN_SYSTEM.md` or the 3-line `Design Read`:

| Surface Class | Archetypes | Mandatory Rules (Floor) | Depth / Motion Policy |
|---|---|---|---|
| **Flat-Surface** | **A** Monograph, **B** Spec-Sheet, **E** Precision Instrument, **F** Humanist Companion, **G** System Native | Zero glassmorphism (`backdrop-blur`), zero stacked drop shadows, zero decorative gradient blobs, zero pill-badge confetti | Separation via `1px` hairlines (`var(--border-subtle)`), negative space, and crisp elevation steps (`--surface-0..3`) |
| **Immersive / Kinetic** | **C** Gallery, **D** Kinetic Utility, **H** Bespoke / Creative Exploration | Zero fake data, WCAG AA contrast, `prefers-reduced-motion`, full interactive states | Intentional glass HUDs (`<= 24px` chrome), shader/WebGL stages, and multi-axis choreography allowed with `[Beyond-Baseline: <reason>]` in the 3-line `Design Read` |

---

## 🎬 StageShow Pre-Build HTML5 Preview Workflow

When testing a complex layout, motion curve, or interactive flow *before* multi-file React/Next wiring:

1. **Emit Design Read**: State archetype (`A–H`), token hierarchy (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`), and craft signature.
2. **Generate Single-File StageShow Preview**: Create a dependency-free HTML5 preview embedding semantic CSS variables, realistic domain copy (zero `Lorem ipsum`), interactive state switches (`default`, `loading`, `empty`, `error`), and responsive viewport toggles (`375px`, `768px`, `1280px`, `1440px`).
3. **Inspect & Refine**: Validate layout proportions, keyboard tab order, and composited transitions (`transform`, `opacity` only) before porting tokens and markup into production components.

---

## 🔍 5-Category Post-Build Visual Audit Rubric

Score every candidate surface across these five objective categories before handoff:

1. **Color & Polarity**: Semantic tokens (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`) consistently applied; zero hardcoded raw hex overrides in components; text/UI contrast `>= 4.5:1` / `>= 3:1`.
2. **Typography & Rhythm**: Intentional display-to-body `clamp()` scale ratio, constrained body measure (`65–75ch`), `tabular-nums` on telemetry/metrics, and consistent vertical cadence.
3. **Layout & Viewport Budget**: Archetype-compliant surface separation (no flat-surface glass/shadow leaks; no equal-card bloat when hierarchy is needed) and clear above-the-fold entry point.
4. **Component State Completeness**: Every interactive element implements hover, visible `focus-visible`, active, disabled, loading/skeleton, empty, and error states.
5. **Accessibility & Motion**: Full keyboard reachability, semantic landmarks/labels, `prefers-reduced-motion` parity, and zero layout-thrashing animations.

Report findings as `[PASS | WARN | BLOCKER]` with concrete selector/file locations (`path:line`) and minimal token-based fixes.

---

## 🔗 Ecosystem Integration

- [`../design-driven/SKILL.md`](../design-driven/SKILL.md) — D1b interview, `A–H` archetypes, and `DESIGN_SYSTEM.md` token source of truth.
- [`../taste-skill/SKILL.md`](../taste-skill/SKILL.md) — 3-line `Design Read` (1-line Fast-Path `<50` lines) and triaxial dials.
- [`../impeccable/SKILL.md`](../impeccable/SKILL.md) — Command-driven `/impeccable critique` & `/impeccable polish` execution.
- [`../hallmark-design-study/SKILL.md`](../hallmark-design-study/SKILL.md) — Ethical structural DNA extraction and curated reference catalog.
- [`../frontend-slides-deck/SKILL.md`](../frontend-slides-deck/SKILL.md) — Narrative single-file HTML5 presentation patterns when building slide decks.
