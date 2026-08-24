# 🧭 Harness Map — Skills ↔ 20 Agent Harnesses

This document maps the **51 skills** in this catalog to the **20 Agent Harnesses** framework (Gentleman Programming taxonomy, 2026). Use it to identify gaps and to understand which skill serves each operational concern.

## 🎯 The 20 Agent Harnesses

| # | Harness | Resuelve | Skill(es) del catálogo |
|---|---|---|---|
| 1 | **SDD Orchestrator** | Coordina las fases SDD sin ejecutar inline | `professional-planner` |
| 2 | **Delegation** | Decide qué tarea es inline vs subagente | `01-planning-process/agents`, `02-dev-roles/feature-implementer` |
| 3 | **SDD Init** | Calibra stack y capacidades de testing del proyecto | `01-planning-process/project-tracker`, `01-planning-process/tech-stack-advisor` |
| 4 | **Execution Mode** | Equilibrio entre velocidad y control humano | _(implícito en `AGENTS.md` reglas globales)_ |
| 5 | **Artifact Store** | El chat NO es la fuente de verdad; los artefactos sí | `01-planning-process/engram-integration` (futuro MCP) |
| 6 | **Phase DAG** | Impide que se salten etapas del SDD | `professional-planner` (con `references/sdd-methodology.md`) |
| 7 | **Artifact Dependency** | Inputs obligatorios por fase | `professional-planner` (con `references/templates.md`) |
| 8 | **Result Contract** | Estados predecibles entre fases | `professional-planner` (define contrato de artefactos entre fases) |
| 9 | **SDD Artifact Grammar** | Lenguaje común para fases y artefactos | `professional-planner` |
| 10 | **Engram Memory** | Memoria persistente entre sesiones | `01-planning-process/engram-integration` |
| 11 | **Strict TDD** | Red → Green → Triangulate → Refactor | `07-testing/testing-patterns` |
| 12 | **Verify** | Verificación con evidencia, no solo finalización | `02-dev-roles/qa-tester` |
| 13 | **Apply Continuity** | Resumir trabajo sin perder progreso | `01-planning-process/project-tracker` (fases + decision log) |
| 14 | **Skill Registry** | Índice de skills disponibles | `SKILLS.md` (raíz) |
| 15 | **Skill Digestion** | Compacta reglas para no saturar al modelo | Progressive disclosure del spec (carga por stages: metadata → instructions → resources) |
| 16 | **Skill Resolution Feedback** | Audita qué skills se aplicaron en una sesión | _(gap — pendiente para v2.1)_ |
| 17 | **Subagent Isolation** | Cada subagente en contexto aislado | `01-planning-process/agents` |
| 18 | **Review Workload** | Evalúa riesgo para el reviewer humano | `02-dev-roles/code-reviewer` |
| 19 | **Delivery Strategy** | Cómo se entrega el código (single PR, chained) | `02-dev-roles/technical-writer`, `02-dev-roles/performance-refactor` |
| 20 | **Chain Strategy** | Gestión de branches y PRs | *(gap — crear skill de branch strategy o integrar en ci-cd)* |

## 🚦 Coverage por categoría

| Categoría | Harnesses cubiertos |
|---|---|
| 00-meta-skills | 14, 15 |
| 01-planning-process | 2, 3, 5, 6, 7, 9, 10, 13, 17 |
| 02-dev-roles | 2, 8, 12, 18, 19 |
| 03-ai-ml | _(no mapped yet)_ |
| 04-backend | _(no mapped yet)_ |
| 05-frontend | _(no mapped yet)_ |
| 06-code-quality | _(no mapped yet)_ |
| 07-testing | 11 |
| 08-devops | 20 |
| professional-planner | 1, 6, 7, 9 |

**Harnesses extendidos (no core 20):**

| Harness ext. | Resuelve | Skill |
|---|---|---|
| Model Routing | Asigna modelo por fase SDD | _(futuro)_ |
| Permission Security | Sandbox de comandos | `AGENTS.md` reglas |
| Backup/Rollback | Snapshots antes de cambios | _(manual)_ |
| Compaction Recovery | Recupera contexto post-compact | `01-planning-process/project-tracker` |
| Cross-Tool Distribution | Distribuye skills a múltiples tools | `00-meta-skills/skill-sync` |
| Spec Compliance Check | Valida spec agentskills.io | `00-meta-skills/skill-validator` |

## 🔍 Gaps Identificados

1. **#16 Skill Resolution Feedback** — No hay skill que audite qué skills se aplicaron realmente. Pendiente.
2. **#4 Execution Mode** — Configurable en `AGENTS.md` pero sin skill dedicada. Pendiente.
3. **03-ai-ml y 04-05-frontend** — No mapeadas explícitamente. Las skills existen pero no están referenciadas a un harness concreto.

## 🔌 Punto de extensión RDD (documentación, Slice 1)

> Documentación únicamente — el mecanismo RDD NO se implementa en Slice 1: sin congelamiento de candidato, sin recibo/receipt y sin validación en gates de entrega.

- **Inserción**: entre `sdd-verify` y `sdd-archive` en el pipeline SDD del harness:
  `sdd-verify → gate de review (extensión RDD) → sdd-archive`.
- **Propósito**: dejar declarado el punto donde, en un slice futuro, podrá insertarse una revisión acotada con recibo (receipt) y validación en gates de entrega (pre-commit/pre-push/pre-pr/release), sin activarla hoy.
- **Mapeo de lentes existentes (informativo)**: los lentes de review de gentle-ai se corresponden con skills ya presentes en el catálogo — `02-dev-roles/code-reviewer` (lentes 4R: readability, reliability, resilience, risk) y `02-dev-roles/judgment-day` (doble juez adversarial). El mapeo es informativo: no activa ningún mecanismo RDD.
- **Regla Slice 1**: el pipeline continúa de `sdd-verify` a `sdd-archive` sin gate de review; no se ejecuta ningún mecanismo de review RDD.

## 📚 Referencias externas

- [Gentleman Programming: 20 Agent Harnesses](https://www.youtube.com/@GentlemanProgramming) (video original)
- [Prowler Cloud](https://github.com/prowler-cloud/prowler) — implementación de referencia
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — implementación de #6, #7, #9
