# 🧭 Harness Map — Skills ↔ 20 Agent Harnesses

This document maps the **192 skills** in this catalog to the **20 Agent Harnesses** framework (Gentleman Programming taxonomy, 2026). Use it to identify gaps and to understand which skill serves each operational concern.

## 🎯 The 20 Agent Harnesses

| # | Harness | Resuelve | Skill(es) del catálogo |
|---|---|---|---|
| 1 | **SDD Orchestrator** | Coordina las fases SDD sin ejecutar inline | `00-meta-skills/sdd-orchestrator` |
| 2 | **Delegation** | Decide qué tarea es inline vs subagente | `01-planning-process/agents`, `02-dev-roles/feature-implementer` |
| 3 | **SDD Init** | Calibra stack y capacidades de testing del proyecto | `01-planning-process/project-tracker`, `01-planning-process/tech-stack-advisor` |
| 4 | **Execution Mode** | Equilibrio entre velocidad y control humano | `00-meta-skills/sdd-orchestrator` (modos `auto` con gatekeeper / `interactive` con aprobación por fase) |
| 5 | **Artifact Store** | El chat NO es la fuente de verdad; los artefactos sí | `01-planning-process/engram-integration` (futuro MCP) |
| 6 | **Phase DAG** | Impide que se salten etapas del SDD | `00-meta-skills/sdd-orchestrator` (DAG de fases) |
| 7 | **Artifact Dependency** | Inputs obligatorios por fase | `00-meta-skills/sdd-*` + `_shared/sdd-phase-common.md` (dependencias de entrada por fase) |
| 8 | **Result Contract** | Estados predecibles entre fases | `_shared/sdd-phase-common.md` (sección D — envelope de 6 campos) |
| 9 | **SDD Artifact Grammar** | Lenguaje común para fases y artefactos | `_shared/sdd-phase-common.md` (topic keys y artefactos por fase) |
| 10 | **Engram Memory** | Memoria persistente entre sesiones | `01-planning-process/engram-integration` |
| 11 | **Strict TDD** | Red → Green → Triangulate → Refactor | `07-testing/testing-patterns` |
| 12 | **Verify** | Verificación con evidencia, no solo finalización | `02-dev-roles/qa-tester` |
| 13 | **Apply Continuity** | Resumir trabajo sin perder progreso | `01-planning-process/project-tracker` (fases + decision log) |
| 14 | **Skill Registry** | Índice de skills disponibles | `SKILLS.md` (raíz) |
| 15 | **Skill Digestion** | Compacta reglas para no saturar al modelo | Progressive disclosure del spec (carga por stages: metadata → instructions → resources) |
| 16 | **Skill Resolution Feedback** | Audita qué skills se aplicaron en una sesión | `00-meta-skills/sdd-orchestrator` + `_shared/sdd-phase-common.md` (campo `skill_resolution` del contrato de resultado por fase) |
| 17 | **Subagent Isolation** | Cada subagente en contexto aislado | `01-planning-process/agents` |
| 18 | **Review Workload** | Evalúa riesgo para el reviewer humano | `02-dev-roles/code-reviewer` |
| 19 | **Delivery Strategy** | Cómo se entrega el código (single PR, chained) | `02-dev-roles/technical-writer`, `02-dev-roles/performance-refactor` |
| 20 | **Chain Strategy** | Gestión de branches y PRs | *(gap — crear skill de branch strategy o integrar en ci-cd)* |

## 🚦 Coverage por categoría

| Categoría | Harnesses cubiertos |
|---|---|
| 00-meta-skills | 1, 6, 7, 8, 9, 14, 15 |
| 01-planning-process | 2, 3, 5, 6, 7, 9, 10, 13, 17 |
| 02-dev-roles | 2, 8, 12, 18, 19 |
| 03-ai-ml | _(no mapped yet)_ |
| 04-backend | _(no mapped yet)_ |
| 05-frontend | _(no mapped yet)_ |
| 06-code-quality | _(no mapped yet)_ |
| 07-testing | 11 |
| 08-devops | 20 |
| professional-planner | _(metodología de referencia — ver `00-meta-skills/sdd-*`)_ |

**Harnesses extendidos (no core 20):**

| Harness ext. | Resuelve | Skill |
|---|---|---|
| Model Routing | Asigna modelo por fase SDD | `00-meta-skills/sdd-orchestrator` (protocolo declarativo `references/model-routing.md` + perfiles `_shared/model-routing/`; activo desde Slice 2) |
| Permission Security | Sandbox de comandos | `AGENTS.md` reglas |
| Backup/Rollback | Snapshots antes de cambios | _(manual)_ |
| Compaction Recovery | Recupera contexto post-compact | `01-planning-process/project-tracker` |
| Cross-Tool Distribution | Distribuye skills a múltiples tools | `00-meta-skills/skill-sync` |
| Spec Compliance Check | Valida spec agentskills.io | `00-meta-skills/skill-validator` |

## 🔍 Gaps Identificados

**Cerrados en Slice 1 (WU3):**

- ~~**#16 Skill Resolution Feedback**~~ — **Cerrada**: el contrato de resultado por fase incluye el campo `skill_resolution` (`paths-injected | fallback-registry | fallback-path | none`) y el orquestador lo consume tras cada fase para verificar cómo se resolvieron las skills (ver sección D de `_shared/sdd-phase-common.md` y la skill `sdd-orchestrator`).
- ~~**#4 Execution Mode**~~ — **Cerrada**: el harness define los modos de ejecución `auto` (fases back-to-back con gatekeeper que valida contrato, existencia de artefacto, ausencia de alucinación y coherencia de ruteo) e `interactive` (resumen + aprobación por fase), cacheados por sesión con default `interactive` (ver la skill `sdd-orchestrator`).

**Pendientes:**

1. **03-ai-ml y 04-05-frontend** — No mapeadas explícitamente. Las skills existen pero no están referenciadas a un harness concreto.

## 🚀 Model Routing (activo desde Slice 2)

> Documentación de protocolo — el routing lo resuelve el agente LLM leyendo el catálogo del runtime. Sin comandos hardcodeados, sin TUI obligatoria, sin ejecutable.

- **Perfiles de modelo por fase**: cada fase SDD (propose, spec, design, tasks, apply, verify) puede declarar su modelo vía alias lógico; el contrato completo (interfaz `list()`/`resolve(phase)`, formato declarativo y algoritmo de resolución) vive en `00-meta-skills/sdd-orchestrator/references/model-routing.md`, con perfiles validados contra `_shared/model-routing/profiles.schema.json`.
- **Resolución por catálogo del runtime**: OpenCode, Antigravity y Codex exponen catálogos distintos; el mismo protocolo se aplica contra el catálogo propio de cada runtime sin reescribir la definición del routing.
- **Degradación documentada**: si el runtime no expone catálogo, las fases usan el modelo por defecto y el pipeline no falla (limitación registrada en el protocolo).
- **GLM no es target de skill-sync**: GLM 5.3 es un **modelo**, no un harness de agente con directorio de configuración propio. La portabilidad a GLM NO se resuelve añadiendo un target a `install-skills.mjs`; se resuelve por **routing de modelos** (proveedor GLM en OpenCode multi-mode por fase, o alias `glm` en Kiro), ahora activo.
- **Delta `model-routing-hooks`**: el requisito «Perfiles por fase diferidos» pasó de DIFERIDO (Slice 1: MUST NOT implementarlo) a ACTIVADO por esta capability desde Slice 2.

## ⚖️ Política de review

> Fuente única de verdad de la política de revisión del harness. La skill de review (`02-dev-roles/code-reviewer/references/review-policy.md`) la REFLEJA como SHOULD y referencia esta sección; no la duplica.

- **Disposición causal**: solo bloquean la aprobación los hallazgos **introducidos o empeorados** por el cambio bajo revisión (con evidencia en el diff o en comportamiento activado por él).
- **Deuda preexistente aparte**: defectos que ya existían fuera del diff se reportan como **follow-up documentado** (issue/nota del cambio) y NO bloquean el PR actual.
- **Perfiles opt-in**: los perfiles de arquitectura de review (p. ej. conjuntos adicionales de lentes) SOLO aplican cuando se declaran explícitamente en la configuración del cambio; **sin declaración → política base única** (causalidad + reporte aparte). Un perfil declarado agrega reglas pero nunca relaja la causalidad como criterio de bloqueo.
- **Consistencia con RDD**: esta disposición es la misma que documenta el punto de extensión RDD (sección siguiente): una revisión futura con recibo clasificaría hallazgos bajo este mismo criterio causal.

## 🔌 Punto de extensión RDD (documentación, Slice 1)

> Documentación únicamente — el mecanismo RDD NO se implementa en Slice 1: sin congelamiento de candidato, sin recibo/receipt y sin validación en gates de entrega.

- **Inserción**: entre `sdd-verify` y `sdd-archive` en el pipeline SDD del harness:
  `sdd-verify → gate de review (extensión RDD) → sdd-archive`.
- **Propósito**: dejar declarado el punto donde, en un slice futuro, podrá insertarse una revisión acotada con recibo (receipt) y validación en gates de entrega (pre-commit/pre-push/pre-pr/release), sin activarla hoy.
- **Mapeo de lentes existentes (informativo)**: los lentes de review de gentle-ai se corresponden con skills ya presentes en el catálogo — `02-dev-roles/code-reviewer` (lentes 4R: readability, reliability, resilience, risk) y `02-dev-roles/judgment-day` (doble juez adversarial). El mapeo es informativo: no activa ningún mecanismo RDD.
- **Regla Slice 1**: el pipeline continúa de `sdd-verify` a `sdd-archive` sin gate de review; no se ejecuta ningún mecanismo de review RDD.

## 🔬 Punto de extensión AHE (diseño doc-only, Slice 2)

> **Documentación únicamente** — AHE (Agentic Harness Evaluation) es DISEÑO, no mecanismo: slice-2 MUST NOT implementar sidecars ni niveles de evidencia ejecutables. Su activación está DIFERIDA (decisión abierta OPEN-1). Ningún componente AHE se ejecuta ni intercepta el pipeline hoy.

**Relación con RDD**: puntos de extensión relacionados pero **independientes** — RDD observa el cambio de código antes de archivar; AHE observaría la salud del propio harness SDD. Activar uno NO habilita al otro; cada uno requiere su propia decisión.

### Sidecars propuestos (responsabilidad e inserción)

| Sidecar | Responsabilidad | Inserción propuesta |
|---|---|---|
| **Evaluator** | Evalúa resultados de las fases contra criterios objetivos (contratos, evidencia de verificación) | Post-`sdd-verify`, pre-`sdd-archive` (mismo vecindario que el gate RDD, pero evaluando el proceso, no el diff) |
| **Debugger** | Diagnostica fallos recurrentes del pipeline (fases bloqueadas, gates que fallan sin causa clara) | On-demand tras un fallo de fase; no tiene posición fija en el flujo feliz |
| **Evolver** | Propone mejoras del harness a partir de patrones observados (nuevos lentes, ajustes de presupuesto, gaps de cobertura) | Periódico/offline; sus propuestas entran al catálogo por el flujo normal de cambios (SDD), nunca como mutación directa |

### Niveles de evidencia (con criterio de aplicación)

| Nivel | Qué produce | Cuándo aplica |
|---|---|---|
| `static_contract` | Chequeo estructural de artefactos (existencia, forma, campos del contrato de resultado) | Siempre disponible y barato; primer nivel ante cualquier duda de salud del pipeline |
| `transcript_replay` | Reproducción offline de una sesión pasada sobre corpus/entradas grabadas | Cuando se quiere regresión determinista sin ejecutar modelos (precedente: router-replay) |
| `live_smoke` | Ejecución acotada en vivo de una fase o query real | Para validar integración con un runtime concreto cuando lo estático/replay no alcanza |
| `manual_oracle` | Juicio humano explícito como fuente de verdad | Cuando el criterio es subjetivo o no hay oráculo mecanizable; documenta la decisión humana |

Cada evaluación AHE futura declararía qué nivel usa y por qué; los niveles son acumulativos (un `live_smoke` puede apoyarse en `static_contract` previo).

## 📚 Referencias externas

- [Gentleman Programming: 20 Agent Harnesses](https://www.youtube.com/@GentlemanProgramming) (video original)
- [Prowler Cloud](https://github.com/prowler-cloud/prowler) — implementación de referencia
- [OpenSpec](https://github.com/Fission-AI/OpenSpec) — implementación de #6, #7, #9
