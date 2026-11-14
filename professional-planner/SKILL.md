---
name: professional-planner
description: "DEPRECATED. Use odd-workflow instead. Retirada en gentle-ai 4.0.0; usar odd-workflow. Activates the Spec-Driven Development (SDD) flow in 6 phases with approval gates, versioned artifacts, and skill-ecosystem integration. Use when starting a new module, complex feature, or refactor touching 2+ files or 2+ business domains."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  deprecated: "true"
  redirect: "odd-workflow"
  trigger: ["planificar una nueva funcionalidad", "crear especificaciones", "iniciar arquitectura", "analizar requerimientos", "diseñar sistema", "PRD", "documento de requerimientos", "sdd flow", "spec-driven", "planning"]
  scope: [global, project]
  version: "2.0.0"
---

> ⚠️ **DEPRECATED (Gentle-AI 4.0.0+)**: Retirada en favor de **ODD exclusivo**. Usá [`odd-workflow`](../00-meta-skills/odd-workflow/SKILL.md) en su lugar.

# professional-planner — Stub de Redirección ODD

Orquestador SDD de 6 fases retirado; no generes artefactos SDD legacy. Usá [`odd-workflow`](../00-meta-skills/odd-workflow/SKILL.md) (`odd/tasks/<feature>.md`), [`brainstorming`](../01-planning-process/brainstorming/SKILL.md) o [`idea-to-prd-express`](../01-planning-process/idea-to-prd-express/SKILL.md).
