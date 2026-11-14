---
name: sdd-verify
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Validate the implementation against specs, design and tasks. Trigger: orchestrator launches verification for a change."
license: MIT
allowed-tools: Read Write Bash(node:*)
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["verify sdd", "verificar cambio", "validación contra specs"]
  scope: [global, project]
  delegate_only: true
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-verify — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; no ejecutes fases de verificación SDD. Usá [`odd-workflow`](../odd-workflow/SKILL.md) y [`../../02-dev-roles/gentle-ai-review-4r/SKILL.md`](../../02-dev-roles/gentle-ai-review-4r/SKILL.md).
