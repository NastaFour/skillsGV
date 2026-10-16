---
name: idea-to-prd-express
description: Compress Briefing→Spec→PRD into a 20-minute session for technical decisions that need fast turnaround. Use when the user has a concrete technical decision to make (not a full feature) and tracked multi-task ODD is overkill.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["PRD.md", "product requirements document", "crear PRD", "idea to prd", "prd express", "fast prd", "20 minute prd", "idea a prd", "briefing express"]
  scope: [global, project]
  version: "2.0.0"
  time_budget_sec: 1200
---

# Idea → PRD Express (Generador Canónico de PRD.md)

Modo ágil para estructurar requerimientos de producto y sintetizarlos en el artefacto canónico **`PRD.md`** en la raíz del proyecto.

> **Integración ODD**: Genera la especificación funcional canónica (`PRD.md`) que alimenta el flujo de pantallas (`APP_FLOW.md`), la especificación técnica (`TRD.md`) y las tareas rastreadas en `odd/tasks/<feature>.md`.

## When to Use

- ✅ Generación del documento maestro de requerimientos de producto (`PRD.md`).
- ✅ Decisión técnica o funcional rápida: pasar de idea a PRD estructurado en 20 minutos.
- ✅ Spike: validar factibilidad y definir criterios de aceptación verificables antes de codificar.
- ❌ **Do NOT use** para arquitectura técnica profunda de sistemas (usar `architecture-designer` para `TRD.md`).
- ❌ **Do NOT use** para modelado de pantallas y navegación (usar `app-flow-spec` para `APP_FLOW.md`).

## The 20-Minute Budget

| Min | Phase | Output |
|---|---|---|
| 0-3 | **Brief** | Una frase de objetivo + una de persona objetivo + una de criterio observable de éxito |
| 3-8 | **Constraints surface** | Lista de restricciones técnicas, seguridad y presupuesto operativo |
| 8-14 | **Options sketch** | 2-3 opciones de solución con trade-offs explícitos y recomendación fundamentada |
| 14-18 | **Spec delta** | Alcance de cambios (requisitos funcionales `FR-01..FR-n`, APIs y contratos) |
| 18-20 | **PRD output** | Generación de `PRD.md` siguiendo la plantilla canónica [references/prd-template.md](references/prd-template.md) |

## Phase 1 — Brief (3 min)

Responde en texto, **no más de 3 frases**:

```
Idea:      <qué se quiere construir o resolver>
Target:    <para quién / qué roles o sistemas afecta>
Success:   <cómo se ve el "done" — observable, no ambiguo>
```

Reglas:
- Si no puedes expresar la idea en una frase, aclárala primero con `brainstorming`.
- "Success" debe ser observable ("latencia < 200ms en p95", "tasa de error < 0.1%").

## Phase 2 — Constraints surface (5 min)

Lista de restricciones y condiciones de contorno:

```
Stack:         <el del proyecto o propuesto según tech-stack-advisor>
Forbidden:     any, secrets en código, bypass de seguridad, datos falsos
Integraciones: <APIs de terceros, eventos, colas, base de datos>
Budget:        <latencia p95, bundle size, límites de concurrencia>
Security:      <validación de esquemas con Zod, tokens httpOnly, auth>
```

Si una restricción es ambigua → **pregunta al humano**, no inventes.

## Phase 3 — Options sketch (6 min)

Dos o tres opciones **máximo**. Para cada opción:

```
Option A: <nombre>
  What:     <qué enfoque adoptar>
  Pros:     <2-3 puntos fuertes concretos>
  Cons:     <2-3 desventajas o trade-offs>
  Cost:     <tiempo estimado / dependencias / migraciones>
  Risk:     <bajo|medio|alto> + justificación
```

Recomienda una opción justificando por qué es superior para el objetivo.

## Phase 4 — Spec delta (4 min)

Identifica los requisitos funcionales (`FR-01..FR-n`) y no funcionales (`NFR-01..NFR-n`):

```
FRs:             <lista de requerimientos numerados y verificables>
Files touched:   <lista de componentes, rutas o módulos afectados>
Migrations:      <si toca esquemas de persistencia>
API surface:     <contratos de endpoints o eventos>
```

## Phase 5 — PRD Canónico (`PRD.md`) (2 min)

Genera el archivo canónico **`PRD.md`** en la raíz del proyecto basándote en la plantilla:
👉 [Plantilla Canónica de PRD](references/prd-template.md)

Estructura requerida de `PRD.md`:
1. **Resumen Ejecutivo**: problema, valor y métricas de éxito.
2. **Personas y Dolores**: perfiles de usuario y necesidades insatisfechas.
3. **Alcance**: `IN-SCOPE` y `OUT-OF-SCOPE`.
4. **Requisitos Funcionales**: `FR-01..FR-n` numerados con criterios de aceptación verificables.
5. **Requisitos No Funcionales**: `NFR-01..NFR-n` (rendimiento, seguridad, a11y).
6. **Criterios de Aceptación Globales**: Definition of Done.
7. **Riesgos y Preguntas Abiertas**: supuestos explícitos.


## Rules

1. **20 min hard cap.** Si te pasas, escala a `odd-workflow` — express mode que se desborda requiere tracking estructurado.
2. **Una decisión por sesión.** Multi-decision → `odd-workflow`.
3. **No implementes.** El output es un PRD, no código. Implementation va en sesión/phase siguiente.
4. **Recomienda, no te escondas.** Un PRD sin recomendación es un survey, no una decisión.
5. **Constraints hardcoded.** Asumir constraints es la causa #1 de PRDs express que fallan en implementación.
6. **Human gate obligatorio.** Nunca procedas a implement sin el "go" del humano. Express ≠ autónomo.

## When to escalate

| Síntoma | Escala a |
|---|---|
| Te pasaste de 20 min | `odd-workflow` |
| Specs toca 2+ dominios | `odd-workflow` |
| Opciones compiten a nivel arquitectura | `tech-escalation-adr` |
| Necesitas research antes de decidir | `research-first` |
| Humano quiere validar visualmente | `ai-ui-generation` (si es UI) |
| Decisión requiere memoria previa | `engram-integration` (`mem_search`) |
| No estás seguro de qué skill invocar | `tech-stack-advisor` |

## Integration

- [`odd-workflow`](../../00-meta-skills/odd-workflow/SKILL.md) — flujo estructurado para features y trabajo sustancial.
- [`tech-escalation-adr`](../tech-escalation-adr/SKILL.md) — cuando la decisión es arquitectónica mayor.
- [`research-first`](../../03-ai-ml/research-first/SKILL.md) — cuando necesitas investigar antes.
- [`engram-integration`](../engram-integration/SKILL.md) — buscar decisiones previas relacionadas.
- [`session-notes`](../session-notes/SKILL.md) — guardar el PRD express en memoria.

## Keywords
idea to prd, prd express, fast prd, technical decision, 20 minute prd, decisión técnica