---
name: sdd-tasks
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Break an SDD change into implementation tasks. Trigger: orchestrator launches task planning for a change."
license: MIT
allowed-tools: Read Write Edit
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["tasks sdd", "desglose de tareas", "planificar tareas sdd"]
  scope: [global, project]
  delegate_only: true
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-tasks — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; no generes listas SDD separadas. Usá [`odd-workflow`](../odd-workflow/SKILL.md) y `## Tasks` en `odd/tasks/<feature>.md`.
