---
name: sdd-init
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Trigger: sdd init, iniciar sdd, openspec init. Initialize SDD context, testing capabilities, registry, and persistence."
license: MIT
allowed-tools: Read Write Edit
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["sdd init", "iniciar sdd", "openspec init"]
  scope: [global, project]
  delegate_only: true
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-init — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; no inicialices directorios `openspec/` o contexto SDD. Usá [`odd-workflow`](../odd-workflow/SKILL.md) y `odd/tasks/<feature>.md`.
