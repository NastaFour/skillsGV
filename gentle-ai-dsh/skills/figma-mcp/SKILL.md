---
name: figma-mcp
description: "Trigger: figma mcp, figma design context, get_design_context, figma node, extraer tokens figma, figma tokens, figma screenshot. Inspect and extract structured data from Figma files (design context, metadata, tokens, screenshots) through the native Figma MCP server. Use when the user wants to read or audit a Figma design, extract tokens/component data, or needs design context for implementation. Non-canonical member of the figma group."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  trigger: ["figma mcp", "figma design context", "get_design_context", "figma node", "extraer tokens figma", "figma tokens", "figma screenshot", "design audit figma"]
  scope: [global, project]
  version: "1.0.0"
---

# Figma MCP — Inspect Figma Files

> **Atribución (contenido vendored)**: adaptación catálogo-nativa de las capacidades de inspección del servidor Figma MCP reempaquetadas por [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills), licencia MIT. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io).

## Activation Contract

Run when the user wants to read, audit, or extract structured data from a Figma file (design context, metadata, variables/tokens, screenshots) through the Figma MCP server. Use this skill for the **inspection** surface; use `figma-implement` for turning designs into code.

## Hard Rules

- Always connect to the Figma MCP server first; if a call fails because it is not connected, pause and set it up.
- Prefer `get_design_context` for full node data; use `get_metadata` first when the response would be too large.
- Never mutate a design without an explicit user request to do so.

## Execution Steps

1. **Connect**: add the Figma MCP (`figma --url https://mcp.figma.com/mcp`), enable the remote MCP client, and log in with OAuth.
2. **Locate the node**: parse `fileKey` + `node-id` from the URL, or use the selected node in the desktop MCP.
3. **Fetch context**: `get_design_context(fileKey, nodeId)` for layout, typography, colors, tokens, spacing.
4. **Handle large responses**: `get_metadata(fileKey, nodeId)` for the node map, then fetch individual child nodes.
5. **Capture reference**: `get_screenshot(fileKey, nodeId)` for a visual.
6. **Extract tokens/variables** when the user needs design-system values.
7. **Report**: the extracted structure, token list, and any screenshot path.

## Decision Gates

| Situation | Action |
|---|---|
| Read/audit/inspect only | Use this skill (inspection surface) |
| Implement design as code | Use `figma-implement` (canonical for the figma group) |
| Design too large for one call | Metadata map first, then per-node context |

## References

- [`05-frontend/figma-implement`](../figma-implement/SKILL.md) — canonical implementation workflow for the figma group.
- [`04-backend/mcp-integration`](../mcp-integration/SKILL.md) — MCP server setup and security.
- Fuente original (MIT): [southleft/figma-console-mcp-skills](https://github.com/southleft/figma-console-mcp-skills).
