---
name: sdd-archive
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Archive a completed SDD change by syncing delta specs. Trigger: orchestrator launches archive after implementation and verification."
license: MIT
allowed-tools: Read Write Edit Bash(git:*,node:*)
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["archive sdd", "archivar cambio", "sincronizar deltas specs"]
  scope: [global, project]
  delegate_only: true
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-archive — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; no ejecutes archivados SDD. Usá [`odd-workflow`](../odd-workflow/SKILL.md) para cerrar tareas en `odd/tasks/<feature>.md`, guardar estado en Engram y cerrar con `Risk:`.
