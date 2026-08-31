---
name: sdd-apply
description: "Implement SDD tasks from specs and design. Trigger: orchestrator launches apply for one or more change tasks."
license: MIT
allowed-tools: Read Write Edit Bash(node:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["apply sdd", "implementar tareas", "aplicar cambio sdd"]
  scope: [global, project]
---

# sdd-apply — Implementación de tareas SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-apply` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-apply/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-apply` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-apply`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-apply` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable de la IMPLEMENTACIÓN. Recibe tareas específicas de `tasks.md` y las implementa escribiendo código real. Sigue los specs y el diseño estrictamente. No delegue.

## Qué recibe

Del orquestador:
- Nombre del cambio
- La(s) tarea(s) específica(s) a implementar (p. ej. "Fase 1, tareas 1.1-1.3")
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)
- Estado estructurado del Protocolo Común (contexto, paths de artefactos, progreso de tareas, estados de dependencia y contexto de acción)
- Estrategia de entrega y decisión de carga de trabajo resuelta (`ask-on-risk | auto-chain | single-pr | exception-ok`, más el slice de PR o `size:exception` cuando aplique)

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: lea `sdd/{change-name}/proposal`, `sdd/{change-name}/spec`, `sdd/{change-name}/design` y `sdd/{change-name}/tasks` (todos requeridos — conserve el ID de tasks para actualizarlo). Marque las tareas completas vía `mem_update(id: {id-de-tasks}, content: "...")`. Guarde el progreso como `sdd/{change-name}/apply-progress`.
- **openspec**: siga la convención openspec. Actualice `tasks.md` con marcas `[x]`.
- **hybrid**: siga AMBAS convenciones — persista el progreso en Engram (`mem_update` para tasks) Y actualice `tasks.md` con marcas `[x]` en filesystem.
- **none**: devuelva solo el progreso. No actualice artefactos del proyecto.

## Guardia de estado y espacio de trabajo

Antes de leer archivos de implementación o escribir código, consuma el estado estructurado provisto por el orquestador o constrúyalo desde los artefactos.

- Si `applyState` es `blocked`, DETÉNGASE y devuelva `blocked` con los artefactos faltantes o el contexto inseguro.
- Si `applyState` es `all_done`, no edite. Devuelva `success` con `next_recommended: sdd-verify` o `sdd-archive` según el estado de dependencias.
- Si `applyState` es `ready`, proceda solo con las tareas pendientes asignadas.
- Lea el contexto de `contextFiles` / `artifactPaths` en lugar de asumir nombres fijos.
- Si `actionContext.mode` es `workspace-planning` y `allowedEditRoots` está vacío, DETÉNGASE antes de editar. Trate los repos/ carpetas enlazados como contexto de planificación de solo lectura.
- Si `allowedEditRoots` está presente, edite solo archivos bajo esos roots. Si una edición necesaria cae fuera de los roots permitidos, DETÉNGASE y reporte el path inseguro.

## Qué hacer

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Leer contexto

Antes de escribir CUALQUIER código:
1. Lea el estado estructurado y confirme `applyState: ready`
2. Lea cada path/clave de artefacto aplicable en `contextFiles`
3. Lea los specs — entienda QUÉ debe hacer el código
4. Lea el diseño — entienda CÓMO estructurar el código
5. Lea el código existente en los archivos afectados — entienda los patrones actuales
6. Revise las convenciones de codificación del proyecto desde `config.yaml`

#### Paso 2a: Ejecutar la decisión de carga de review

Antes de implementar, inspeccione el artefacto de tareas por `Review Workload Forecast`.

Si el forecast indica cualquiera de los siguientes:

- `400-line budget risk: High`
- `Chained PRs recommended: Yes`
- `Decision needed before apply: Yes`

Entonces DEBE confirmar que el orquestador/usuario proveyó un camino de entrega resuelto:

1. **`auto-chain` o modo PR encadenado/apilado elegido**: implemente solo el slice de unidad de trabajo asignado, mantenga el alcance autónomo y reporte la frontera de PR prevista. Siga la `Chain strategy` del artefacto de tareas (`stacked-to-main` o `feature-branch-chain`) para el target de rama.
2. **`exception-ok` o PR único con excepción**: continúe solo si el prompt dice explícitamente que el mantenedor acepta `size:exception`.
3. **`single-pr` sobre presupuesto**: continúe solo después de que el prompt registre explícitamente `size:exception`.

También verifique `Chain strategy` en el artefacto de tareas. Si está presente y no es `pending`, sígala consistentemente:
- `stacked-to-main`: cada PR apunta a la rama del PR previo (o `main` después del merge previo).
- `feature-branch-chain`: el PR #1 apunta a la rama feature/tracker; los PRs hijos apuntan a la rama del PR inmediatamente anterior. El tracker agrega la rama feature a `main`; los diffs hijos deben permanecer enfocados en solo la unidad de trabajo actual y nunca apuntar a `main` directamente.

Si no hay decisión de entrega ni chain strategy presentes, DETÉNGASE antes de escribir código y devuelva `blocked` con: `Workload decision required before apply: el trabajo estimado puede exceder 400 líneas cambiadas. Pregunte al usuario qué estrategia de cadena usar (stacked-to-main, feature-branch-chain o size-exception).`

#### Paso 2b: Leer apply-progress previo (si existe)

Antes de empezar, verifique si existe apply-progress:

1. `mem_search(query: "sdd/{change-name}/apply-progress", project: "{project}")`
2. Si existe: `mem_get_observation(id)` → lea el contenido completo
3. Parse qué tareas ya están marcadas completas
4. Salte esas tareas — comience desde la primera tarea incompleta
5. Al guardar su apply-progress en el Paso 6, MERGE: incluya todas las tareas completadas previamente MÁS sus nuevas completaciones en un único artefacto combinado

**CRÍTICO**: si el orquestador le dijo que existe progreso previo, DEBE leerlo. Si sobrescribe sin leer, el trabajo completado de lotes previos se pierde permanentemente.

### Paso 3: Leer capacidades de testing y resolver modo

Lea las capacidades de testing cacheadas para determinar el modo de implementación:

```
Lea las capacidades de testing desde:
├── engram: mem_search("sdd/{project}/testing-capabilities") → mem_get_observation(id)
├── openspec: openspec/config.yaml → strict_tdd + sección testing
└── Respaldo: revise los archivos del proyecto directamente (package.json, go.mod, etc.)

Resuelva el modo:
├── SI strict_tdd: true Y existe test runner
│   └── MODO STRICT TDD → siga el módulo strict-tdd (si existe en el catálogo)
├── SI strict_tdd: false O sin test runner
│   └── MODO STANDARD → use el Paso 4 (sin módulo TDD)
└── Cachee el modo resuelto para el resumen de retorno
```

**Principio clave**: si Strict TDD no está activo, no se cargan instrucciones TDD.

#### Gate duro (Strict TDD solamente)

Si Strict TDD está activo:
- DEBE producir una tabla de Evidencia de Ciclo TDD en su apply-progress
- Cada fila de tarea DEBE tener columnas RED (test escrito primero) → GREEN (implementación pasa) → REFACTOR
- Si completa una tarea SIN escribir tests primero, márquela como FAILED en la tabla de evidencia
- La fase verify RECHAZARÁ su trabajo si la tabla de evidencia TDD falta o está incompleta

#### Gate duro (todos los modos): Evidencia de unidad de trabajo

Cada unidad de trabajo asignada DEBE producir una tabla de **Evidencia de Unidad de Trabajo** antes de marcar sus tareas completas:

| Evidencia | Valor requerido |
|---|---|
| Comando de test enfocado y resultado exacto | Comando más pequeño que pruebe la unidad; comando, exit/resultado y conteos relevantes |
| Comando/scenario de harness runtime y resultado exacto | Camino de integración/runtime real; `N/A` explícito solo cuando no hay frontera de runtime, con razón |
| Límite de rollback | Archivos/comportamiento exactos que pueden revertirse sin eliminar trabajo no relacionado |

Si el diseño/las tareas contienen casos aplicables de la matriz de amenazas, escriba y corra cada test RED mapeado ANTES del cambio de producción correspondiente, incluso en modo standard. No marque la unidad de trabajo completa si los tests enfocados o un harness runtime aplicable fallan.

Cuando terminen todas las unidades de trabajo de implementación, devuelva el control al orquestador padre. El ejecutor nunca lanza 4R, Judgment Day, refuter, actor de corrección o validador scoped.

### Paso 4: Implementar tareas (flujo standard)

Este paso se usa cuando Strict TDD NO está activo:

```
POR CADA TAREA:
├── Lea la descripción de la tarea
├── Lea los escenarios relevantes de la spec (sus criterios de aceptación)
├── Lea las decisiones de diseño (restringen su enfoque)
├── Lea los patrones de código existentes (respete el estilo del proyecto)
├── Escriba el código
├── Marque la tarea completa [x] en el artefacto de tareas persistido inmediatamente
└── Anote cualquier problema o desviación
```

### Paso 5: Marcar tareas completas

Actualice `tasks.md` — cambie `- [ ]` a `- [x]` para las tareas completadas:

```markdown
## Fase 1: Fundación

- [x] 1.1 Crear `internal/auth/middleware.go` con validación JWT
- [x] 1.2 Añadir `AuthConfig` struct a `internal/config/config.go`
- [ ] 1.3 Añadir rutas de auth a `internal/server/server.go`  ← aún pendiente
```

**Orden obligatorio (journal durable, E3)**: antes de cambiar una tarea a `[x]`, registre la unidad en el journal del cambio. Si el registro falla, NO marque la tarea y repórtela como bloqueada: un `[x]` sin evento previo es pérdida silenciosa de trazabilidad.

```
node 00-meta-skills/sdd-apply/scripts/apply-journal.mjs record --change {change-name} --unit {tarea} --evidence "{\"comando\":\"...\", \"resultado\":\"exit 0\"}"
```

El journal (`openspec/changes/{change}/journal/`) mantiene un snapshot JSON versionado, un historial `events.jsonl` append-only con hash encadenado y un lock exclusivo: IDs idempotentes (re-registrar una unidad no duplica efecto) y recuperación determinista de escrituras interrumpidas (la unidad afectada queda `interrupted-retry`, lista para reintentar). Implementado en Node puro, Windows-first, sin Bash.

### Paso 6: Persistir progreso

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común de Fase SDD.
- artifact: `apply-progress`
- topic_key: `sdd/{change-name}/apply-progress`
- type: `architecture`
- También actualice el artefacto de tareas con marcas `[x]` vía `mem_update` (engram) o edición de archivo (openspec/hybrid).

**Fuente de verdad (E3)**: el estado durable del apply-progress vive en el journal del cambio (`openspec/changes/{change}/journal/`: snapshot versionado replegable desde `events.jsonl`). Genere la vista consolidada con:

```
node 00-meta-skills/sdd-apply/scripts/apply-journal.mjs report --change {change-name}
```

El protocolo de merge siguiente queda como **capa de reporte** entre lotes (narrativa y evidencia por batch); ante discrepancia entre el archivo derivado y el snapshot, gana el snapshot.

#### Protocolo de merge (capa de reporte)

Al guardar apply-progress:
1. Si leyó progreso previo en el Paso 2b, su artefacto DEBE incluir TODAS las tareas completadas previamente (copie su estado y evidencia) MÁS sus nuevas completaciones
2. El artefacto final debe mostrar el estado acumulado de TODAS las tareas de TODOS los lotes
3. Formato: conserve la misma estructura pero asegúrese de que ninguna tarea completada se pierda de lotes previos

### Paso 7: Devolver resumen

Antes de devolver, re-lea el artefacto de tareas persistido y confirme que cada tarea que reporta como completada está marcada `[x]` ahí. Si el artefacto aún muestra una tarea completada como `- [ ]`, corrija el checkbox antes de devolver. No reporte `Ready for verify` mientras el trabajo completado solo esté reflejado en todos internos o apply-progress.

Devuelva al orquestador:

```markdown
## Implementation Progress

**Change**: {change-name}
**Mode**: {Strict TDD | Standard}

### Completed Tasks
- [x] {tarea 1.1 descripción}
- [x] {tarea 1.2 descripción}

### Files Changed
| Archivo | Acción | Qué se hizo |
|---|---|---|
| `path/to/file.ext` | Creado | {descripción breve} |
| `path/to/other.ext` | Modificado | {descripción breve} |

{SI Strict TDD → incluya la tabla de Evidencia de Ciclo TDD}

### Desviaciones del diseño
{Liste los lugares donde la implementación se desvió de design.md y por qué.
Si no hay ninguna, diga "None — implementation matches design."}

### Problemas encontrados
{Liste los problemas descubiertos durante la implementación.
Si no hay ninguno, diga "None."}

### Tareas restantes
- [ ] {siguiente tarea}
- [ ] {siguiente tarea}

### Frontera de workload / PR
- Modo: {single PR | chained PR slice | stacked PR slice | size:exception}
- Unidad de trabajo actual: {nombre de la unidad o "N/A"}
- Frontera: {dónde empieza y dónde termina este batch de apply}
- Impacto estimado en presupuesto de review: {nota breve}

### Status
{N}/{total} tareas completas. {Ready for next batch / Ready for verify / Blocked by X}
```

## Reglas

- SIEMPRE lea los specs antes de implementar — los specs son sus criterios de aceptación.
- SIEMPRE siga las decisiones de diseño — no improvise un enfoque distinto.
- SIEMPRE respete los patrones y convenciones de código existentes del proyecto.
- SIEMPRE consuma o produzca estado estructurado antes de implementar; no infiera readiness solo desde la conversación.
- DETÉNGASE en `applyState: blocked` y no edite; DETÉNGASE en `actionContext` o edit roots inseguros.
- En modo `openspec`, marque las tareas completas en `tasks.md` A MEDIDA que avanza, no al final.
- Antes de devolver, re-lea el artefacto de tareas persistido y asegúrese de que las tareas completadas estén visibles como `[x]`; los todos internos no son evidencia de completitud.
- Si descubre que el diseño está mal o incompleto, NÓTELO en su resumen de retorno — no se desvíe en silencio.
- Si una tarea está bloqueada por algo inesperado, DETÉNGASE y reporte.
- Si el forecast de carga requiere una decisión y no se proveyó, DETÉNGASE antes de escribir código.
- Al aplicar un slice de PR encadenado/apilado, mantenga el batch autónomo: un alcance entregable, verificación incluida y límite de rollback claro.
- Al aplicar `size:exception`, declárelo explícitamente en apply-progress y el resumen de retorno.
- NUNCA implemente tareas que no le fueron asignadas.
- La carga de skills se maneja en el Paso 1 — siga cualquier skill cargada estrictamente al escribir código.
- Aplique cualquier `rules.apply` de `openspec/config.yaml`.
- Si Strict TDD está activo (Paso 3), siga su ciclo EN LUGAR del Paso 4.
- Envelope de retorno según la sección **D** del Protocolo Común.
