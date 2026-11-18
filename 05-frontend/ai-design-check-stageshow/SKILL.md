---
name: ai-design-check-stageshow
description: "Trigger: ai design check, stageshow, stage show, pre-build visual preview, interactive html preview, visual audit. Synthesizes @enmera/ai-design-check and benjitaylor/skills Stageshow v1.1.1 for archetype-partitioned visual checks (flat-surface A, B, E, F, G vs immersive C, D, H), self-contained HTML5 pre-build interactive previews, 24 geometric film-gate invariants, and a 5-category post-build audit rubric. Do NOT use for full brand discovery (use design-driven) or direct React/Tailwind setup without a Design Read."
license: MIT
compatibility: "Compatible with Gentle-AI 4.5.0+, React 19, Next.js 15, Tailwind CSS 4, HTML5, Playwright visual audits. Requires pnpm 9+."
allowed-tools: Read Write Edit Bash(pnpm:*,node:*) Glob Grep
metadata:
  trigger: ["ai design check", "stageshow", "stage show", "pre-build visual preview", "interactive html preview", "visual audit"]
  scope: "global, project"
  version: "1.1.0"
  author: skillsGV
---

# 🎭 AI Design Check & StageShow v1.1.1 — Pre-Build Preview & Geometric Gate Audit

Combines **@enmera/ai-design-check** (5-category visual quality inspection) with **Benji Taylor's `Stageshow` v1.1.1** (dependency-free interactive previews & geometric `film.mjs --gate` invariants), bound to the canonical archetypes `A–H` and 3-line `Design Read` in [`../design-driven/SKILL.md`](../design-driven/SKILL.md).

---

## 🧭 Archetype Surface Partition (`A–H`, Floor Not Ceiling)

| Surface Class | Archetypes | Mandatory Rules (Floor) | Depth / Motion Policy |
|---|---|---|---|
| **Flat-Surface** | **A** Monograph, **B** Spec-Sheet, **E** Precision Instrument, **F** Humanist Companion, **G** System Native | Zero decorative `backdrop-blur`, zero stacked drop shadows, zero gradient blobs, zero pill confetti | Separation via `1px` hairlines (`var(--border-subtle)`), negative space, and crisp elevation steps (`--surface-0..3`) |
| **Immersive / Kinetic** | **C** Gallery, **D** Kinetic Utility, **H** Bespoke / Creative Exploration | Zero fake data, WCAG AA contrast, `prefers-reduced-motion`, full interactive states | Intentional glass HUDs (`<= 24px` chrome), shader/WebGL stages, and multi-axis choreography via `[Beyond-Baseline: <reason>]` |

---

## 🎬 StageShow v1.1.1 Craft Rules & Geometric Gate (`What you see → What you fix`)

1. **No AI Sparkles or Purple**: AI features get ZERO sparkle/wand/star icons and ZERO default purple — visually demonstrate what the AI actually produces.
2. **Scene Copy Budget (3–7 Real Strings)**: Keep `3–7` sharp real strings per preview scene; render secondary lines as varied-width `Bar` abstractions (`60, 45, 70, 52`) matching real line-box height, never blank gray boxes where the eye lands first.
3. **Optical Currency Centering**: When centering display amounts (`$45`), center ONLY the digits and hang `$` left with `position: absolute; right: 100%`.
4. **Cap-Height Box Trimming**: Apply `text-box: trim-both cap alphabetic` inside compact pills, badges, icon buttons, avatars, and inputs so text sits visually centered.
5. **Deterministic Gate Defects (`film.mjs --gate` Audit Table)**:
   - `tight stack` (`< 3px` title-to-subtitle gap) → fix to `4–6px`.
   - `tight inset` (copy `< 8px` from frame edge) → fix to `>= 12px`.
   - `tight control` (`< 8px` between button and input) → widen gap cleanly.
   - `fat row` (single-line list item `> 3x` its text height) → compact row rhythm or add secondary density.
   - `onion skin` (translucent overlapping panels visible at rest) → clean state handoffs.
   - `unit wrapped` / `clipped glyph` / `mixed icons` (filled + outline mixed in one bar) / `anchor drift` / `empty pane` / `avatar alignment` → fix alignment, enforce `whitespace-nowrap` on units, and standardize one icon variant per bar.

---

## 🔍 5-Category Post-Build Audit & Floor-Not-Ceiling (`[Beyond-Baseline]`)

Score every candidate surface across **Color & Polarity**, **Typography & Rhythm**, **Layout & Viewport Budget**, **Component State Completeness**, and **Accessibility & Motion** (`[PASS | WARN | BLOCKER]` with exact `path:line` selectors). Beyond these structural checks, bespoke interactive sandboxes or Playwright visual-regression harnesses are encouraged via `[Beyond-Baseline: <reason>]`.

- Links: [`../design-driven/SKILL.md`](../design-driven/SKILL.md) · [`../taste-skill/SKILL.md`](../taste-skill/SKILL.md) · [`../impeccable/SKILL.md`](../impeccable/SKILL.md) · [`../hallmark-design-study/SKILL.md`](../hallmark-design-study/SKILL.md) · [`../frontend-slides-deck/SKILL.md`](../frontend-slides-deck/SKILL.md).
