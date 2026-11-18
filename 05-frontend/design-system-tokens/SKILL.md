---
name: design-system-tokens
description: "Design token taxonomy for consistent visual systems — color scales (OKLCH/HSL 50-950), Better Typography modular scales with zero-CLS fallbacks, Hue monospace flags, 8pt spacing system, elevation/shadow tokens, radii, z-index layers, and motion tokens. Outputs the canonical DESIGN_SYSTEM.md specification. Trigger: DESIGN_SYSTEM.md, design_system.md, sistema de diseno, design tokens, design system, typography scale."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+."
metadata:
  trigger: ["DESIGN_SYSTEM.md", "design_system.md", "sistema de diseno", "design tokens", "design system", "color scale", "hsl palette", "oklch tokens", "8pt spacing", "typography scale", "shadow system", "elevation", "motion tokens", "css variables", "tailwind theme", "z-index", "better typography"]
  scope: [global, project]
  version: "2.1.0"
allowed-tools: Bash(node:*) Read
---

# 🎨 Design System Tokens, Typography Scale & Zero-CLS Font Architecture

The foundation of non-generic visual systems: semantic tokens in **`DESIGN_SYSTEM.md`** paired with **J. Poindexter's `Better Typography` (`/type`)** decision procedures and **Hue's** explicit monospace zoning flags (`mono_for_code` vs `mono_for_metrics`).

---

## 📋 When to Use

- Before creating components in a new app (`DESIGN_SYSTEM.md`), when migrating hardcoded values to tokens, or when tuning type hierarchy, font fallbacks (CLS = 0), and Tailwind 4 `@theme` configs.
- Do NOT use for throwaway unstyled spikes without visual surfaces.

---

## 🚦 Hard Rules (The Token & Typography Floor)

1. **Zero Hardcoded Colors or Arbitrary Spacing**: Never put raw `#hex` colors or arbitrary `px` spacing in JSX/CSS components — bind `var(--surface-*)`, `var(--text-*)`, `var(--accent-*)`, `var(--border-*)` (OKLCH default; HSL allowed for shadcn/TW3) and `4px`/`8pt` grid steps.
2. **Named Motion & Z-Index Tokens**: Never write `z-index: 9999` or magic easing/duration constants — use `z-modal`, `z-toast`, and named motion tokens (`--ease-out`, `--duration-fast`).
3. **Typography by Decision Procedure (Better Typography `/type`)**:
   - Replace folkloric defaults (`"16px / 1.5 everywhere"`) with named inputs: **`x-height` apparent size**, **reading distance** (`~35cm` mobile, `50–70cm` laptop), **density** (`1.125` Major Second / `1.200` Minor Third for dense UI + 2 explicit `display` jumps), unitless `line-height` (`1.3–1.7`), and ergonomic measure (`45–75 CPL` desktop, `~40 CPL` mobile; `<35` or `>85 CPL` is a defect). Keep `space-above > space-below` on section headings.
4. **Hue Monospace Flags (`mono_for_code` vs `mono_for_metrics`)**: Declare both flags explicitly in `DESIGN_SYSTEM.md` — consumer/editorial brands commonly set `mono_for_code: true` and `mono_for_metrics: false` (keeping prices in sans + `tabular-nums`), while quantitative tools enable both.
5. **Zero-CLS Self-Hosted `.woff2` & Metric-Matched Fallbacks**: Self-host `.woff2` (shared third-party CDN font caching is obsolete due to HTTP cache partitioning), restrict `<link rel="preload" as="font" type="font/woff2" crossorigin>` to `<= 2` critical fonts (`crossorigin` mandatory even same-origin), and provide a `@font-face` fallback calibrated with `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override`.
6. **Triple WCAG 2.2 Typography Gate**: Validate contrast (`1.4.3`), `200%` zoom without clipping (`1.4.4`), AND text-spacing override (`1.4.12`: `line-height: 1.5; word-spacing: 0.16em; letter-spacing: 0.12em; paragraph-spacing: 2em`), plus grayscale visual hierarchy and longest-locale checks.

---

## 🛠️ Workflow & References

1. Check hardcoded tokens: `node 05-frontend/design-system-tokens/scripts/check-tokens.mjs`
2. Typography decision tables, metric-matched fallback recipe & WCAG triple check: [`references/better-typography-system.md`](references/better-typography-system.md).
3. Canonical specs: [`../design-driven/references/design-system-template.md`](../design-driven/references/design-system-template.md) · [`references/token-taxonomy.md`](references/token-taxonomy.md) · [`references/color-scales.md`](references/color-scales.md) · [`references/motion-tokens.md`](references/motion-tokens.md) · [`../visual-effects/SKILL.md`](../visual-effects/SKILL.md) · [`../tailwind-4/SKILL.md`](../tailwind-4/SKILL.md) · [`../../02-dev-roles/micro-interactions/SKILL.md`](../../02-dev-roles/micro-interactions/SKILL.md).

## 🧭 Floor, Not Ceiling (`[Beyond-Baseline]`)

Tokens, metric-matched fallbacks, and triple WCAG checks define the baseline reliability floor. Variable-font optical-size axes (`opsz`), fluid container-query typography (`cqi`), and multi-brand OKLCH themes are encouraged via `[Beyond-Baseline: <reason>]`.
