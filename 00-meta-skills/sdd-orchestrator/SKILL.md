---
name: sdd-orchestrator
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Trigger: sdd new, sdd continue, sdd ff, SDD change, hacé un SDD, spec-driven development. Thin orchestrator that routes SDD phases without executing them: DAG, auto/interactive modes, gatekeeper, dedup, gates de entrevista (el orquestador pregunta al usuario, nunca un delegado). Load ONLY on explicit SDD request — ODD is the default flow since gentle-ai 3.x; never route into SDD by file count."
license: MIT
allowed-tools: Read Task Bash(git:*,gh:*)
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["sdd new", "sdd continue", "sdd ff", "spec-driven development", "cambio SDD"]
  scope: [global, project]
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../odd-workflow/SKILL.md) en su lugar.

# sdd-orchestrator — Stub de Redirección ODD

Skill heredada del pipeline SDD de referencia histórica; sus subcomandos CLI (`sdd-status`, `sdd-continue`) están retirados. Delegá toda orquestación en [`odd-workflow`](../odd-workflow/SKILL.md) y [`gentle-orchestrator`](../gentle-orchestrator/SKILL.md).
