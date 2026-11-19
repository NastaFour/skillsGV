# Hallmark v2.0 Gates, 21 Macrostructures, Hue Stage Physics & Stitch Extraction Reference

Companion reference for [`../SKILL.md`](../SKILL.md).

---

## 1. Hallmark v2.0 — 21 Macrostructures (6-Axis Fingerprint Matrix)

Fingerprint axes: **`Heading placement` | `Body composition` | `Divider language` | `Button voice` | `Image treatment` | `Reveal pattern`**

| # | Macrostructure | Core Architectural Pattern | Best Fit Archetype |
|---|---|---|---|
| 1 | **Broadsheet Editorial** | Multi-column rule grid, dominant lead deck, hairline rules | A · Monograph |
| 2 | **Specimen Sheet** | Live interactive typographic/UI specimen right at `y = 0` | A · Monograph / H |
| 3 | **Sticky Index Monograph** | Sticky left TOC rail + deep scrollable technical narrative | A · Monograph |
| 4 | **Command Workbench** | Live CLI/calculator/instrument above the fold (no banner) | E · Precision |
| 5 | **Bento Telemetry Matrix** | Asymmetric span grid (`2x2`, `8+4`) pairing live widget + metrics | B · Spec-Sheet / E |
| 6 | **Full-Bleed Monolith** | Edge-to-edge focal media hero, compressed floating nav, wide margins | C · Gallery |
| 7 | **Index Catalogue / Shelf** | Numbered scannable rows with hover preview thumbnails (no equal boxes) | C · Gallery / A |
| 8 | **Split-Screen Studio** | 50/50 pinned manifesto left + scrolling visual stack right | C · Gallery / H |
| 9 | **Tabbed Comparison Deck** | Inline switcher comparing before/after architecture or pricing tiers | E · Precision / G |
| 10 | **Chapter Scrollytelling** | Pinned viewport canvas driven by discrete scroll narrative chapters | D · Kinetic / H |
| 11 | **Receipt / Ledger Folio** | Vertical archival column, `tabular-nums`, stamped status markers | B · Spec-Sheet / H |
| 12 | **Floating Instrument HUD** | `100dvh` locked canvas + `<= 24px` peripheral toolbars | D · Kinetic |
| 13 | **Swiss Poster Asymmetric** | Oversized bipolar display headline (`1:3` asymmetric split) | C · Gallery / H |
| 14 | **Hardware Datasheet Grid** | 12-col hairline cells, spec codes, dual diagrams | B · Spec-Sheet |
| 15 | **Field Journal / Almanac** | Date-indexed entries, inline callout marginalia, warm paper polarity | F · Humanist |
| 16 | **Changelog Stream** | Reverse-chronological release ribbon with inline interactive diffs | E · Precision / F |
| 17 | **Curated Directory Matrix** | Compact dense filter rail + crisp hairline rows/cards | G · System Native |
| 18 | **Pricing & Tier Matrix Hero** | Interactive calculator + tier table promoted directly into the hero | E · Precision / G |
| 19 | **Side-by-Side Diff Proof** | Interactive real code/UI before-after toggle at hero center | E · Precision |
| 20 | **Diptych Pair Gallery** | Balanced asymmetric image + concise caption pairs (`>= 45%` whitespace) | C · Gallery |
| 21 | **Minimal Terminal Folio** | Focused command palette hero + crisp keyboard-driven list | B · Spec-Sheet / E |

**SaaS Section Deck ("Deviate Twice")**: Start from a coherent section progression (`Hero -> Live Proof -> Mechanism -> Details -> Pricing/Action -> Footer`), then **deviate twice**: delete 1 cliché strip (e.g., redundant bottom gradient CTA) and relocate 1 substantive section upward (e.g., move spec matrix or interactive sandbox above the fold).

---

## 2. Hallmark v2.0 Critical Quality Gates & 26 Finish Checks (`F1–F26`)

### Anti-Slop Tell Gates (Context-Harmonized)
- **Gate 19 (Zero Faux Copy)**: Zero `Lorem ipsum`, zero placeholder stats, zero unlinked template metrics.
- **Gate 38i / 38iii (Mixed Headline Ornamentation)**: Never color-highlight or italicize a lone mid-headline buzzword just for "visual pop".
- **Gate 44b / 58 (Above-the-Fold Budget)**: Hero copy stays `<= 80` words at `1280x800` (`<= 7`-word headline + `<= 12`-word sub + 1–2 CTAs), completely visible without vertical scroll.
- **Gate 46a / 47c (Card Bloat & Wireframe Box-Walls)**: Never stack 3–4 identical bordered boxes when a single hairline table, numbered list, or asymmetric split works cleanly. Equally ban **wireframe box-walls** (replacing rounded SaaS cards with dozens of sharp `0–2px` `1px`-bordered rectangles around labels, links, inline keywords, and tutorial boxes) and **pill confetti** (`> 2` badges per card or `15+` ungrouped filter pills).
- **Gate 50 (Equal-Height Uniformity)**: Avoid mechanical 3-up cards or long flat grids of 10+ identical cards with identical padding, 1 icon + 1 bold line + 2-line blurb. Break visual monotony by promoting focal items or switching secondary rows to lighter scannable strips.
- **Gate 54 (Eyebrow Ban)**: Remove decorative pill/text eyebrows sitting above headings merely announcing the section topic (including `• Live status` pills above `<h1>`).
- **Gate 63 (Template Punctuation — Middots & Slashes)**: Ban `Meta A · Meta B · Meta C` chains, `"A / B"` slash-concatenated metadata labels (`"Application Layer / Hypertext Transfer"`, `"0 notes / 0 highlights"`), inline `→`/`↗`/`↘` arrows appended to buttons, and decorative green/orange pulse dots on non-live labels.
- **Gate 64 (Monospace Zoning)**: Never set body prose, brand pills, or decorative `[P01]` gutter codes in `font-mono`. Allow/mandate `font-mono` + `tabular-nums` for `<code>`/`<kbd>`, quantitative metrics, financial values, CVE/RFC IDs, timestamps, and Archetypes B & E.
- **Gate 65 ("The Named Look")**: Do not reflexively reach for the overused cream paper + high-contrast serif + terracotta accent combo unless the brand explicitly demands it.
- **Gate 67 (Tracked-Caps Discipline, Context-Scoped)**: Ban decorative tracked-caps (`uppercase`, `letter-spacing >= 0.08em`, `<= 15px`) on hero tags and marketing UI; permit inside SaaS B2B `<th>` table headers (`ui-ux-pro-max`) and Archetype B (`Spec-Sheet`) labels.
- **Gate 70 (Fake Send Ban)**: Forms without wired submission logic must never display fake `"Sent!"` or `"Subscribed"` toast states.
- **Gates 77–85 (Structural Rigor)**: Flag thin empty filler bands, section headlines `< 40px` where display authority is expected, dead vertical gaps `> 160px`, crude inline SVG illustrations `>= 120px`, counting tickers with generic decorative icons, and fake product mockups when real UI can be rendered.

### 26 Finish Checks (`F1–F26`) Summary Checklist
- **Contrast & Surfaces (`F1–F6`)**: WCAG AA/AAA text ratios, distinct `--surface-0..3` luminance steps, zero pure `#000000` crush in dark mode unless intentional, clean focus rings, hairline borders aligned to theme polarity, zero unintended alpha washout.
- **Typography (`F7–F13`)**: Clear display-to-body ratio (`clamp()`), tight negative headline tracking (`-0.02em` to `-0.035em`), line-length `45–75ch`, orphan/widow prevention (`text-wrap: balance/pretty`), tabular numbers (`tabular-nums`), matched icon stroke weights, honest fallback font stack.
- **Layout & Spacing (`F14–F20`)**: Consistent 4/8px spacing rhythm, single primary alignment grid, responsive collapse checked from `375px` to `1440px`, no clipped overflow at mobile widths, optical button/badge padding, concentric nested radii, sticky nav clearance.
- **Interactive Polish (`F21–F26`)**: Complete state matrix (`default/hover/focus-visible/active/disabled` + `loading/empty/error`), `prefers-reduced-motion` parity, zero horizontal page overflow, zero fake interactive affordances, semantic HTML landmarks (`header/main/nav/footer`), clean console (`0` hydration/runtime errors).

### 35 Material Themes & Pre-Emit `P-H-E-S-R-V` Rubric
- **35 Material Themes (Color + Font + Photo Treatment Only — Never Dictate Layout)**: Curated tonal worlds across archival paper (`almanac`, `editorial`, `vellum`, `terrazzo`), technical instruments (`blueprint`, `console`, `terminal`, `wayfind`), and expressive galleries (`atelier`, `darkroom`, `cobalt`, `riso`, `ultraviolet`, `werkstatt`). Always pair with explicit photo treatments (`natural | warm | muted | mono | duotone | tint`).
- **Pre-Emit Critique (`P-H-E-S-R-V`, 1–5 each)**: Before handoff, grade **Philosophy**, **Hierarchy**, **Execution**, **Specificity**, **Restraint**, and **Variety**; fix any axis scoring `< 4` before declaring complete.

---

## 3. Hue (`dominikmartn/hue`) Two-Layer Hero Stage & Compatibility Matrix

| Subject Type | Allowed `relation_layer` | Forbidden `relation_layer` (Physical Law) |
|---|---|---|
| **`none`** | `flat`, `bleed` background gradient/mesh/noise | `shadow-only`, `reflection` without subject |
| **`luminous`** (CSS sphere/disc/ring/torus) | `glow`, `halo`, `emissive`, `flat` | **NO floor contact `shadow-only`** (light sources do not cast opaque floor shadows) |
| **`object`** (Physical hardware / product cutout) | `shadow-only`, `reflection`, `flat` | **NO `emissive` plasma**, **NO faking intricate 3D hardware in raw CSS** |
| **`device` / `photo-cutout`** | `shadow-only`, subtle `halo` backdrop, `reflection` | Heavy overlapping text crossing focal lens/UI chrome |

**9 Stage Presets**: `luminous-on-gradient`, `device-on-mesh`, `painterly-no-hero`, `grid-on-dark`, `object-on-spotlight`, `editorial-photo`, `shader-ambient`, `flat-blank`, `sculptural-field`.

---

## 4. Google Stitch `extract-design-md` & UIZZE `image-to-ui` Quick Protocol

1. **Stitch 4-Phase Static Extraction (No Build Needed)**:
   - *Step 1*: Parse design-system configs (`tokens/`, `tailwind.config.*`, `@theme`, `:root`, component variants across React/Vue/Svelte/Angular/CSS).
   - *Step 2*: Merge near-duplicate colors (`ΔE < 3`), assign functional roles + descriptive human names, record typography scale, radii, elevation, and layout grid.
   - *Step 3*: Emit/update `DESIGN_SYSTEM.md` (with `colors` + token roles + framework classes).
   - *Step 4*: Run 8-point consistency check against rendered components.
2. **UIZZE `image-to-ui` Loop**:
   - Pre-scan any untrusted reference asset via `prompt-shield` → Extract proportions & surface hierarchy → Implement with semantic tokens → Inspect desktop/mobile crops → Fix spacing/type/state drifts iteratively until faithful.
