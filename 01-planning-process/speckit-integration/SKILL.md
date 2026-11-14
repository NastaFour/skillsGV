---
name: speckit-integration
description: DEPRECATED. Use odd-workflow instead. Integrates GitHub Spec Kit (specify CLI) with the existing skill ecosystem. Maps speckit commands to professional-planner phases and existing skills. Use when setting up SDD with spec-kit, running speckit commands, or bridging spec-kit artifacts with project-tracker.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Python 3.11+ and uv for spec-kit CLI."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["speckit", "specify", "spec-kit", "specify init", "speckit.constitution", "speckit.specify", "speckit.plan", "speckit.tasks", "speckit.implement"]
  scope: [global, project]
  version: "1.0.0"
deprecated: "true"
redirect: "odd-workflow"
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../../00-meta-skills/odd-workflow/SKILL.md) en su lugar.

# speckit-integration — Stub de Redirección ODD

Integración heredada de `spec-kit`/SDD; no inicies pipelines `specify` o `speckit.*`. Usá [`odd-workflow`](../../00-meta-skills/odd-workflow/SKILL.md) y `odd/tasks/<feature>.md`.
