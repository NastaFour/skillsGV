---
name: sdd-propose
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Create an SDD change proposal with intent, scope, and approach. Trigger: orchestrator launches proposal work for a change."
license: MIT
allowed-tools: Read Write Edit
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["proposal sdd", "propuesta sdd", "nuevo cambio", "new change"]
  scope: [global, project]
  delegate_only: true
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-propose — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; no crees archivos `proposal.md` SDD. Usá [`odd-workflow`](../odd-workflow/SKILL.md) y `odd/tasks/<feature>.md`.
