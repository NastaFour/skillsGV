---
name: oklch-theme-injector
description: "Trigger: oklch, color space, perceptual color, theme injector, paleta perceptiva, okhsl. Generate and inject OKLCH (perceptual) color themes into a design system, complementing HSL-based tokens. Use when the user wants perceptually uniform color scales, better light/dark theme contrast, or to migrate an HSL/hex palette to OKLCH via MCP-driven tooling."
license: MIT
allowed-tools: Read Write Bash(node:*)
metadata:
  trigger: ["oklch", "okhsl", "perceptual color", "color space", "theme injector", "paleta perceptiva", "oklch theme"]
  scope: [global, project]
  version: "1.0.0"
---

# OKLCH Theme Injector (MCP hybrid)

Builds and injects OKLCH-based color themes into the project's design tokens, keeping the existing HSL surface where it must remain compatible.

## Activation Contract

Run when the task involves perceptual color, OKLCH/OKHSL, generating accessible light/dark palettes, or converting an existing hex/HSL palette. Complements `design-system-tokens` (HSL taxonomy) — this skill owns the OKLCH layer.

## Hard Rules

- Keep every generated color within WCAG AA contrast for text on its background; compute contrast in OKLCH, not HSL.
- Never silently replace existing tokens: emit the new scale as an additive override file first.
- Preserve the project's token naming convention; do not introduce a parallel naming scheme.
- Validate the theme with the project's color/token checker before finishing.

## Decision Gates

| Situation | Action |
|---|---|
| Existing tokens are HSL/hex | Generate OKLCH equivalents + optional HSL shims |
| Need dark mode | Derive dark scale from the OKLCH lightness axis, not hue rotation |
| MCP color tool available | Use it for interpolation/gamut mapping; else compute in-node |

## Execution Steps

1. Read the current token file and the project's color conventions.
2. Convert the base palette to OKLCH; build the scale (e.g. 50–950) along perceptual axes.
3. Compute WCAG contrast pairs for each foreground/background combination.
4. Emit the additive override file (`*.oklch.css` / tokens file) and wire the toggle.
5. Run the token/color validator and report the contrast matrix.

## Output Contract

- The OKLCH theme file(s) and their paths.
- The contrast matrix (AA/AAA pass/fail per pair).
- The migration note: what was kept as HSL shims and what switched to OKLCH.

## References

- [`05-frontend/design-system-tokens`](../design-system-tokens/SKILL.md) — token taxonomy this skill feeds into.
- [`04-backend/mcp-integration`](../mcp-integration/SKILL.md) — MCP color tooling setup when used.
