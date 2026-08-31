---
name: asset-generator-mcp
description: "Trigger: asset generator, generar assets, generar icono, generar logo, generate icon, generate logo, generate asset, generar grafico. Generate visual assets (icons, logos, illustrations, backgrounds) via MCP-based generation tools with consistent style. Use when the user needs production-ready image assets matching a style brief instead of hand-drawn placeholders."
license: MIT
allowed-tools: Read Write Bash(node:*)
metadata:
  trigger: ["asset generator", "generar assets", "generar icono", "generar logo", "generate icon", "generate logo", "generate asset", "generar grafico", "asset pack"]
  scope: [global, project]
  version: "1.0.0"
---

# Asset Generator (MCP hybrid)

Produces a consistent set of visual assets (icons, logos, illustrations, backgrounds) through MCP-based generation, normalized to the project's style brief.

## Activation Contract

Run when the user wants generated image assets at scale with a coherent style (icon sets, logo explorations, hero backgrounds, social graphics). For pixel-perfect hand-coded SVG from a design spec, prefer the frontend design skills instead.

## Hard Rules

- Lock a style brief (palette, shapes, stroke weight, mood) before generating any asset.
- Generate a first pass, then iterate on the strongest direction — do not ship the first random output.
- Verify each asset's dimensions/format meet the usage spec; export the required sizes.
- Document the model/prompt used so the style is reproducible.

## Decision Gates

| Situation | Action |
|---|---|
| Single icon/logo | Generate 3+ directions from the same brief, pick one, refine |
| Full asset pack | Define the set list + shared style, generate per asset, batch export |
| Precise geometric SVG needed | Hand-code SVG with `frontend-designer` instead of generation |

## Execution Steps

1. Gather the style brief: palette, iconography style, formats, and target sizes.
2. Select the MCP generation tool/model and write a consistent prompt template.
3. Generate candidates; review against the brief; refine the chosen direction.
4. Normalize output (backgrounds, sizing, naming) and export required formats.
5. Deliver the asset paths and the style/prompt reference.

## Output Contract

- The generated asset file(s) and their paths.
- The style brief used and the generation settings for reproducibility.
- Any size/format conversions applied.

## References

- [`05-frontend/design-system-tokens`](../design-system-tokens/SKILL.md) — palette and token alignment for generated assets.
- [`02-dev-roles/frontend-designer`](../frontend-designer/SKILL.md) — hand-coded SVG when generation is not the right tool.
