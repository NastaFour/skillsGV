---
name: open-design
description: "Trigger: open design, open-design, od, prototipo, landing page, dashboard, slides, pitch, imagen de marca, video de diseno, design deliverable. Drive OpenDesign via MCP (tools mcp__open-design__*) to produce prototypes, landing pages, dashboards, slides, images and video as real files (HTML/PDF/PPTX/MP4 export); fall back to the od CLI when the MCP tools are unavailable."
license: Apache-2.0
allowed-tools: Read Bash(pwsh:*)
metadata:
  author: nexu-io
  version: "1.1"
---

## Activation Contract

Load when the user asks for a design deliverable - prototype, landing page,
dashboard, slides, images or video - that should be produced as real files
rather than hand-coded UI.

## Hard Rules

- OpenDesign está cableado en el preset gentle-ai como servidor MCP
  (`mcp-open-design`): sus herramientas aparecen como **mcp__open-design__***.
  Usalas PRIMERO.
- Si esas herramientas no existen (host sin reiniciar o server no arrancado),
  avisá al usuario y caé al CLI **od**: `od --version` (o `where od`). Si
  tampoco está el CLI: **pnpm add -g open-design**.
- Nunca afirmes un output de diseño sin haberlo ejecutado y sin las rutas de los
  archivos producidos.
- OpenDesign produce archivos reales (HTML/PDF/PPTX/MP4). Recolectá las rutas y
  reportalas al usuario.
- Usá OpenDesign para deliverables generados/"vibe"; para UI hecha a mano usá
  frontend-design / frontend-designer.

## Execution Steps

1. Listá las herramientas MCP de open-design y elegí la que matchee el deliverable.
2. Invocá la herramienta con el brief; dejá que genere los archivos.
3. Recolectá las rutas exportadas y reportalas al usuario.
