---
name: design-system-tokens
description: "Design token taxonomy for consistent visual systems — color scales (OKLCH/HSL 50-950), typography scales, 8pt spacing system, elevation/shadow tokens, border radii, z-index layers, and motion tokens. Outputs the canonical DESIGN_SYSTEM.md specification. Trigger: DESIGN_SYSTEM.md, design_system.md, sistema de diseno, design tokens, design system."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+."
metadata:
  trigger: ["DESIGN_SYSTEM.md", "design_system.md", "sistema de diseno", "design tokens", "design system", "color scale", "hsl palette", "oklch tokens", "8pt spacing", "typography scale", "shadow system", "elevation", "motion tokens", "css variables", "tailwind theme", "z-index", "design tokens setup"]
  scope: [global, project]
  version: "2.0.0"
allowed-tools: Bash(node:*) Read
---

# 🎨 Design System Tokens

The foundation of any non-generic visual system. Without tokens, every component uses hardcoded values → inconsistent, unmaintainable, "AI slop" aesthetic. This skill defines the token taxonomy, scales, and enforcement.

## 📋 When to Use

- Use when starting a new project (before writing any component)
- Use when auditing a project for visual inconsistency
- Use when migrating from hardcoded colors/spacing to a token system
- Use when setting up Tailwind theme config or CSS variables
- Do NOT use for one-off prototypes (tokens are for systems)

## 🚦 Hard Rules

- **Never** hardcode `#hex` colors in components — always use semantic CSS tokens (`var(--surface-*)`, `var(--text-*)`, `var(--accent-*)`, `var(--border-*)`) defined in `DESIGN_SYSTEM.md`
- **Never** use arbitrary `px` for spacing — always multiples of 4 (8pt system)
- **Always** define color scales as 50-950 or semantic intent (not just `primary: "#0ea5e9"`)
- **Always** define motion tokens (duration + easing) as named values, not magic numbers
- **Token Color Format**: Use **OKLCH** by default for modern CSS and Tailwind 4 projects; **HSL** is permitted when using shadcn/ui or Tailwind 3. Hex values are documentation references only, never hardcoded in JSX/CSS components.
- **Never** use `z-index: 9999` — use named z-index tokens (`z-modal`, `z-toast`)

## 🛠️ Workflow

1. Read the token taxonomy: [token-taxonomy.md](references/token-taxonomy.md)
2. Read color scale generation: [color-scales.md](references/color-scales.md)
3. Read motion token definitions: [motion-tokens.md](references/motion-tokens.md)
4. Run the checker to detect hardcoded values:
   ```bash
   node 05-frontend/design-system-tokens/scripts/check-tokens.mjs
   ```
5. Set up tokens in your project (`DESIGN_SYSTEM.md` using [design-system-template.md](../design-driven/references/design-system-template.md), CSS variables, or Tailwind config)

## 📚 References

- [Canonical `DESIGN_SYSTEM.md` Template](../design-driven/references/design-system-template.md) — unified template for tokens, chassis, and UI rules
- [Token Taxonomy](references/token-taxonomy.md) — all token categories with examples
- [Color Scales](references/color-scales.md) — HSL/OKLCH scale generation, semantic tokens
- [Motion Tokens](references/motion-tokens.md) — duration, easing, stagger scales
- [`visual-effects`](../visual-effects/SKILL.md) — shadow tokens in practice
- [`tailwind-4`](../tailwind-4/SKILL.md) — modern Tailwind theme integration
- [`micro-interactions`](../../02-dev-roles/micro-interactions/SKILL.md) — motion tokens in interactions
