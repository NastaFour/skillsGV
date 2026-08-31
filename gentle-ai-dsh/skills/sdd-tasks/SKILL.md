---
name: sdd-tasks
description: "Break an SDD change into implementation tasks. Trigger: orchestrator launches task planning for a change."
license: MIT
allowed-tools: Read Write Edit
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["tasks sdd", "desglose de tareas", "planificar tareas sdd"]
  scope: [global, project]
---

# sdd-tasks — Desglose de tareas SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-tasks` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-tasks/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-tasks` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-tasks`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-tasks` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable de crear el DESGLOSE DE TAREAS. Toma la propuesta, los specs y el diseño, y produce un `tasks.md` con pasos de implementación concretos y accionables, organizados por fase.

## Qué recibe

Del orquestador:
- Nombre del cambio
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)
- Estrategia de entrega (`ask-on-risk | auto-chain | single-pr | exception-ok`)

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: lea `sdd/{change-name}/proposal` (requerido), `sdd/{change-name}/spec` (requerido), `sdd/{change-name}/design` (requerido). Guarde como `sdd/{change-name}/tasks`.
- **openspec**: siga la convención openspec y escriba `tasks.md` en filesystem.
- **hybrid**: siga AMBAS convenciones — persista en Engram Y escriba `tasks.md` en filesystem. Recupere dependencias de Engram (primario) con respaldo en filesystem.
- **none**: devuelva solo el resultado. Nunca cree ni modifique archivos del proyecto.

## Qué hacer

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Analizar el diseño

Del documento de diseño identifique:
- Todos los archivos que deben crearse/modificarse/eliminarse
- El orden de dependencias (qué debe ir primero)
- Los requisitos de testing por componente
- Todo caso aplicable de la matriz de amenazas y su test RED planeado; ignore las filas marcadas explícitamente `N/A`

### Paso 3: Escribir tasks.md

**SI el modo es `openspec` o `hybrid`:** cree el archivo de tareas:

```
openspec/changes/{change-name}/
├── proposal.md
├── specs/
├── design.md
└── tasks.md              ← Usted crea esto
```

**SI el modo es `engram` o `none`:** NO cree directorios ni archivos `openspec/`. Componga el contenido de tareas en memoria — lo persistirá en el Paso 4.

#### Formato del archivo de tareas

```markdown
# Tasks: {Título del Cambio}

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas cambiadas estimadas | <rango o estimación> |
| Riesgo presupuesto 400 líneas | Low / Medium / High |
| PRs encadenados recomendados | Yes / No |
| Split sugerido | <single PR o PR 1 → PR 2 → PR 3> |
| Delivery strategy | <ask-on-risk / auto-chain / single-pr / exception-ok> |
| Chain strategy | <stacked-to-main / feature-branch-chain / size-exception / pending> |

Decision needed before apply: <Yes|No>
Chained PRs recommended: <Yes|No>
Chain strategy: <stacked-to-main|feature-branch-chain|size-exception|pending>
400-line budget risk: <Low|Medium|High>

### Unidades de trabajo sugeridas

| Unidad | Meta | PR probable | Comando de test enfocado | Harness runtime | Límite de rollback |
|---|---|---|---|---|---|
| 1 | <entregable autónomo> | PR 1 | <comando mínimo que pruebe> | <escenario/orden real o N/A con razón> | <archivos/comportamiento removibles sin rollback no relacionado> |
| 2 | <entregable autónomo> | PR 2 | <comando mínimo que pruebe> | <escenario/orden real o N/A con razón> | <frontera de revert independiente> |

## Fase 1: {Nombre de la fase} (p. ej. Infraestructura / Fundación)

- [ ] 1.1 {Acción concreta — qué archivo, qué cambio}
- [ ] 1.2 {Acción concreta}
- [ ] 1.3 {Acción concreta}

## Fase 2: {Nombre de la fase} (p. ej. Implementación del núcleo)

- [ ] 2.1 {Acción concreta}
- [ ] 2.2 {Acción concreta}
- [ ] 2.3 {Acción concreta}
- [ ] 2.4 {Acción concreta}
```

#### Reglas de redacción de tareas

Cada tarea DEBE ser:

| Criterio | Ejemplo ✅ | Anti-ejemplo ❌ |
|---|---|---|
| **Específica** | "Crear `internal/auth/middleware.go` con validación JWT" | "Añadir auth" |
| **Accionable** | "Añadir método `ValidateToken()` a `AuthService`" | "Manejar tokens" |
| **Verificable** | "Test: `POST /login` devuelve 401 sin token" | "Asegurarse de que funcione" |
| **Pequeña** | Un archivo o una unidad lógica de trabajo | "Implementar la feature" |

Todo caso aplicable de la matriz de amenazas DEBE convertirse en una tarea de test RED explícita antes de su tarea de producción. Conserve el caso concreto y el comportamiento seguro/fallido esperado del diseño; las filas marcadas `N/A` se omiten.

### Reglas del Review Workload Forecast

Antes de finalizar las tareas, estime si la implementación puede exceder el presupuesto de review de **400 líneas cambiadas** (`additions + deletions`). Es una guardia de planificación, no un conteo exacto de diff.

Use las señales disponibles: número de archivos, fases, puntos de integración, tests, docs, artefactos generados, migraciones y cuántos dominios cruza el cambio.

Si la estimación es **High** o probablemente superior a 400 líneas:

1. Marque `Chained PRs recommended` como `Yes`.
2. Divida las tareas en **unidades de trabajo** que puedan convertirse en PRs encadenados o apilados.
3. Cada PR sugerido debe tener inicio claro, fin claro, verificación, alcance autónomo, comando de test enfocado, harness runtime y límite de rollback.
4. Recomiende la estrategia de cadena (decisión de equipo): apilados a main, cadena de feature branch, o `size:exception`.
5. El `Decision needed before apply` deriva de la estrategia de entrega: `ask-on-risk` → `Yes`; `auto-chain` → `No` (procede con el primer slice); `single-pr` → `Yes` (requiere `size:exception`); `exception-ok` → `No`.

No entierre esto en prosa. Ponga el forecast cerca del inicio del artefacto de tareas para que el usuario lo vea antes de que empiece la implementación.

El forecast DEBE incluir estas líneas en texto plano para que las guardias descendentes puedan hacer match literal:

```text
Decision needed before apply: Yes|No
Chained PRs recommended: Yes|No
Chain strategy: stacked-to-main|feature-branch-chain|size-exception|pending
400-line budget risk: Low|Medium|High
```

Puede conservar la tabla para legibilidad, pero las líneas en texto plano son el contrato de la guardia.

Para `feature-branch-chain`, las unidades de trabajo sugeridas DEBEN nombrar la frontera de base prevista: PR #1 base = rama feature/tracker; PR #2 base = rama del PR #1; PR #3 base = rama del PR #2. Si un PR hijo mostrara cambios de PRs previos, la base es incorrecta y debe retarget/rebasar antes de review.

### Guías de organización de fases

```
Fase 1: Fundación / Infraestructura
  └─ Tipos nuevos, interfaces, cambios de BD, config
  └─ Cosas de las que dependen otras tareas

Fase 2: Implementación del núcleo
  └─ Lógica principal, reglas de negocio, comportamiento central
  └─ La parte sustantiva del cambio

Fase 3: Integración / Cableado
  └─ Conectar componentes, rutas, wiring de UI
  └─ Hacer que todo funcione en conjunto

Fase 4: Testing
  └─ Tests unitarios, de integración, e2e
  └─ Verificar contra escenarios de specs

Fase 5: Limpieza (si aplica)
  └─ Documentación, eliminar código muerto, pulido
```

### Paso 4: Persistir artefacto

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común.
- artifact: `tasks`
- topic_key: `sdd/{change-name}/tasks`
- type: `architecture`

### Paso 5: Devolver resumen

Devuelva al orquestador:

```markdown
## Tasks Created

**Change**: {change-name}
**Location**: `openspec/changes/{change-name}/tasks.md` (openspec/hybrid) | Engram `sdd/{change-name}/tasks` (engram) | inline (none)

### Breakdown
| Fase | Tareas | Foco |
|------|--------|------|
| Fase 1 | {N} | {Nombre de la fase} |
| Fase 2 | {N} | {Nombre de la fase} |
| Total | {N} | |

### Orden de implementación
{Descripción breve del orden recomendado y por qué}

### Review Workload Forecast
- Líneas cambiadas estimadas: {estimación o rango}
- Riesgo presupuesto 400 líneas: {Low | Medium | High}
- PRs encadenados recomendados: {Yes | No}
- Delivery strategy: {ask-on-risk | auto-chain | single-pr | exception-ok}
- Decision needed before apply: {Yes | No}
- Split sugerido por work units: {lista breve o "Not needed"}

### Next Step
{Listo para implementación (sdd-apply) O preguntar al usuario si usar PRs encadenados antes de sdd-apply.}
```

## Reglas

- SIEMPRE referencie paths de archivo concretos en las tareas.
- Las tareas DEBEN ordenarse por dependencia — las tareas de la Fase 1 no dependen de las de la Fase 2.
- Las tareas de testing DEBEN referenciar escenarios específicos de los specs.
- Cada tarea debe poder completarse en UNA sesión (si una tarea se siente demasiado grande, divídala).
- Use numeración jerárquica: 1.1, 1.2, 2.1, 2.2, etc.
- NUNCA incluya tareas vagas como "implementar feature" o "añadir tests".
- Aplique cualquier `rules.tasks` de `openspec/config.yaml`.
- Si el proyecto usa TDD, integre tareas test-first: tarea RED (escribir test que falla) → GREEN (hacerlo pasar) → REFACTOR (limpiar).
- **Presupuesto de tamaño**: el artefacto de tareas DEBE ser menor a 530 palabras. Cada tarea: 1-2 líneas máximo. Use formato checklist, no párrafos.
- **Guard de carga de review**: SIEMPRE incluya el Review Workload Forecast. Si es probable que supere las 400 líneas, recomiende PRs encadenados y honre la estrategia de entrega recibida para decidir si se necesita una decisión/excepción antes de apply.
- **Evidencia de unidad de trabajo**: toda unidad de trabajo sugerida DEBE nombrar su comando de test enfocado, su comando/scenario de harness runtime (o razón `N/A` explícita) y su límite de rollback.
- Envelope de retorno según la sección **D** del Protocolo Común.
