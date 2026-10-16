# Interface Design — Craft Principles, Deep Dive & Reference

This reference document preserves the in-depth essays, architectural rationale, and extended examples for high-craft digital interface design.

---

## 1. The Core Problem: Overcoming AI Defaults

AI models naturally gravitate toward shared defaults: warm colors on cold structures, generic font stacks on predictable 3-column dashboard grids.
Process alone does not guarantee craft. You must actively break generic patterns by understanding:

- **Typography is not a container**: The weight, letter-spacing, and optical scale are the visual identity.
- **Navigation is the product**: How users orient and transition defines application usability.
- **Data requires editorial purpose**: Numbers must communicate meaning, hierarchy, and urgency, not just occupy space.
- **Tokens tell a story**: Semantic token names (`--surface-canvas`, `--surface-raised`, `--accent-primary`) reinforce design coherence across platforms.

---

## 2. Product Domain Exploration

Before committing to layout or aesthetics, define four anchors:
1. **Domain Vocabulary**: Concepts, physical metaphors, and terms specific to the product's world (minimum 5).
2. **Color World**: Colors that naturally exist in that world (materials, environments, lighting).
3. **Signature Element**: One unique structural or interactive touch that belongs exclusively to this product.
4. **Rejected Defaults**: Three generic patterns explicitly rejected in favor of crafted alternatives.

---

## 3. Visual Hierarchy & Spatial Ratios

### One Focal Point Per View
Every screen has a single primary task. That element must win unmistakably through size, contrast, or surrounding whitespace. Demote secondary actions into quiet structural tiers.

### Weight and Contrast Over Pure Font Size
A single font size (e.g. 14px) provides three distinct tiers using weight and opacity alone:
- Primary value: `font-weight: 600`, full contrast.
- Supporting label: `font-weight: 500`, medium contrast.
- Metadata: `font-weight: 400`, muted opacity.

### Spatial Rhythm & Density
- Pick an 8px or 4px baseline grid and stick to it (`4, 8, 12, 16, 24, 32, 48, 64px`).
- Do not space everything equally: dense control zones (tables, inspector bars) should contrast with open content canvases.
- Maintain concentric border radii: `outerRadius = innerRadius + padding`.

---

## 4. Surfaces, Depth & Elevation

- **Elevation Progression**: Stacking surfaces (canvas -> card -> popover/modal) should rely on subtle lightness shifts (dark mode: +4% to +8% per tier) or layered ambient shadows (light mode: 1px subtle ring + soft blur), never harsh solid black borders.
- **Inset Controls**: Inputs, search boxes, and textareas should be slightly darker or inset relative to their parent container.
- **High-End Contrast Squint Test**: Blur your eyes; you should clearly distinguish sections and depth tiers without visual clutter or harsh dividers jumping out.

---

## 5. Polish & Motion Essentials

- **Tabular Numbers**: Apply `font-variant-numeric: tabular-nums` to financial data, counters, clocks, and data tables.
- **Hit Areas**: Minimum 44×44px (WCAG AAA) or 40×40px (WCAG AA), expanding pseudo-elements if visual controls are smaller.
- **Meaningful Motion**:
  - Keep durations under 250ms for interactive micro-feedback.
  - Use custom ease-out curves (`cubic-bezier(0.23, 1, 0.32, 1)`).
  - Never animate layout properties (`width`, `height`, `margin`). Animate only GPU-composited `transform` and `opacity`.
  - Strictly observe `prefers-reduced-motion` media queries.

---

## 6. Anti-Patterns to Avoid

- Monotone layouts with identical cards and zero hierarchy.
- Missing interactive states (`hover`, `focus-visible`, `active`, `disabled`, `empty`, `loading`, `error`).
- Mixing multiple unrelated accent colors without functional meaning.
- Purely decorative gradients that distract from content legibility.

---

## 7. Canonical `DESIGN_SYSTEM.md` Persistence & Legacy Fallback

To maintain visual consistency across sessions without fragmenting project documentation:

1. **Read First**: Always inspect `DESIGN_SYSTEM.md` at the repository root before designing or modifying views. If `DESIGN_SYSTEM.md` does not exist yet, check for a legacy `.interface-design/system.md` file as a backward-compatible fallback.
2. **Persist Decisions**: Whenever a new semantic token (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`), typographic scale, elevation rule, or component pattern is established, record it in the canonical **`DESIGN_SYSTEM.md`** (or migrate `.interface-design/system.md` into `DESIGN_SYSTEM.md`).
3. **Single Source of Truth**: Keep token definitions, archetype selection, and spacing rhythm unified in `DESIGN_SYSTEM.md` so `design-driven`, `design-system-tokens`, `taste-skill`, and `interface-design` operate on the same contract.
