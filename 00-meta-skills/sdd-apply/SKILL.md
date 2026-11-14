---
name: sdd-apply
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Implement SDD tasks from specs and design. Trigger: orchestrator launches apply for one or more change tasks."
license: MIT
allows-script-exec: "apply-journal.test.mjs spawns the journal CLI inside temp fixtures"
allowed-tools: Read Write Edit Bash(node:*)
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["apply sdd", "implementar tareas", "aplicar cambio sdd"]
  scope: [global, project]
  delegate_only: true
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-apply — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; no inicies ni ejecutes flujos SDD con ella. Usá [`odd-workflow`](../odd-workflow/SKILL.md) (autorización, exploración, tracking en `odd/tasks/<feature>.md`, micro-blueprint de 5 líneas, slices de `~400` líneas y cierre con `Risk:`).
