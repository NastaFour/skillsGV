---
name: figma-implement
description: "Trigger: figma implement, implementar figma, figma url, node id, design to code, pixel perfect figma, traducir diseno figma. Translate Figma nodes into production-ready code with 1:1 visual fidelity using the Figma MCP workflow (design context, screenshots, assets, and project-convention translation). Use when the user provides a Figma URL or node ID, or asks to implement designs or components that must match Figma specs. Canonical for the figma group."
license: Apache-2.0
allowed-tools: Read Bash(node:*) Write
metadata:
  trigger: ["figma implement", "implementar figma", "figma url", "node id", "design to code", "pixel perfect figma", "traducir diseno", "implement design"]
  scope: [global, project]
  version: "1.0.0"
---

# Figma Implement — 1:1 Design-to-Code

> **Atribución (contenido vendored)**: adaptación catálogo-nativa (plegado Capa 1 → `05-frontend`) de la skill `figma-implement-design` de [followba/figma-implement-design](https://github.com/followba/figma-implement-design), licencia Apache-2.0. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `SKILL.md` de `followba/figma-implement-design`.

## Activation Contract

Run when the user provides a Figma URL (`https://figma.com/design/:fileKey/:fileName?node-id=1-2`) or node ID and wants it implemented as code. Requires a working Figma MCP server connection.

## Hard Rules

- Never implement based on assumptions: always fetch `get_design_context` and `get_screenshot` first.
- Use the project's design system tokens/components over literal Figma values when they conflict.
- Assets come from the Figma MCP payload; do not import new icon packages or placeholders.
- Validate against the screenshot before marking complete.

## Execution Steps

1. **Get node ID**: parse `fileKey` and `node-id` from the URL (or use the selected node in the desktop MCP).
2. **Fetch design context**: `get_design_context(fileKey, nodeId)` for layout, typography, colors, tokens, spacing. If truncated, use `get_metadata` + fetch child nodes.
3. **Capture visual reference**: `get_screenshot(fileKey, nodeId)` — source of truth for visual validation.
4. **Download assets**: use `localhost` sources returned by the MCP server directly; no placeholders.
5. **Translate to project conventions**: treat MCP output as design/behavior representation; reuse existing components; map Figma tokens to project tokens.
6. **Achieve 1:1 visual parity**: prioritize Figma fidelity; avoid hardcoded values; respect WCAG.
7. **Validate**: layout, typography, colors, interactive states, responsive behavior, assets, accessibility.

## Decision Gates

| Situation | Action |
|---|---|
| Design output truncated | Use `get_metadata` to map nodes, then fetch each child node |
| Token conflict | Prefer project tokens; adjust spacing/sizing minimally for visual parity |
| New component needed | Extend an existing one first; create only if none matches |

## References

- [`11-mcp-hybrid/figma-mcp`](../figma-mcp/SKILL.md) — Figma MCP inspection surface (both stay routable; `figma-implement` is canonical for the figma group).
- Fuente original (Apache-2.0): [followba/figma-implement-design](https://github.com/followba/figma-implement-design).
