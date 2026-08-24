# Apply Progress: skills-harness (Slice 1)

**Change**: skills-harness
**Modo**: Standard (strict TDD desactivado — catálogo de contenido, sin test runner)
**Batch actual**: PR-4 / WU4 (Registro y bootstrap)
**Rama**: `slice/pr4-wu4-registry-bootstrap` (base `ee37a36` main, stacked-to-main; PR-1, PR-2 y PR-3 mergeados a main)

## Tareas completadas en este batch (PR-4 / WU4)

- [x] 4.1 `skill-loader/scripts/skills-loader.mjs`: modo `--emit-registry` (reutiliza walk + cache mtime; excluye `_shared`, `skill-registry`, `sdd-*`) (skill-registry-protocol)
- [x] 4.2 `skill-validator/scripts/validate-skills.mjs`: check de consistencia `SKILLS.md` ↔ `.atl/skill-registry.md` (nombre + path) (skill-registry-protocol)
- [x] 4.3 Regenerar `.atl/skill-registry.md` (columna scope; excluye `_shared`/`skill-registry`/`sdd-*`); validar con `validate-skills.mjs --strict` exit 0 (skill-registry-protocol)
- [x] 4.4 `AGENTS.md`: regla de arranque (router antes de cada turno; orquestador si >1 archivo); filas piloto DIFERIDAS a WU5 (ver Desviaciones)
- [x] 4.5 `openspec/config.yaml`: `artifact_store: hybrid` + convención de topic keys (artifact-store-abstraction)
- [x] Fix de consistencia autorizado: header de `harness-map.md` corregido de «51 skills» a «140 skills» (bug de doc pre-existente en el tema de consistencia de índices)

## Archivos cambiados (batch PR-4 / WU4)

| Archivo | Acción | Detalle |
|---|---|---|
| `00-meta-skills/skill-loader/scripts/skills-loader.mjs` | Modificado | Modo nuevo `--emit-registry` (4.1): reutiliza `walkSkills` + `buildIndex` (cache mtime), excluye `_shared`/`skill-registry`/`sdd-*`, agrupa por categoría top-level y escribe `.atl/skill-registry.md` con columna scope. Además endurece el parseo de frontmatter para YAML block scalars (`>`) y strings con comillas (casos `jira-epic`, `brainstorming`, `vercel-composition-patterns`) |
| `00-meta-skills/skill-validator/scripts/validate-skills.mjs` | Modificado | Nuevo check de consistencia `SKILLS.md` ↔ `.atl/skill-registry.md` (4.2): cada entrada del registro debe existir en SKILLS.md con mismo nombre+path, y cada skill no excluida de SKILLS.md debe estar indexada en el registro; excluye `_shared`/`skill-registry`/`sdd-*`. Corre bajo el mismo guard `--skip-index-sync` |
| `.atl/skill-registry.md` | Regenerado | Regenerado con `--emit-registry` (4.3): columna scope, 129 skills indexadas, excluye `_shared`/`skill-registry`/`sdd-*`, descripciones completas (block scalars y quotes resueltos) |
| `AGENTS.md` | Modificado | Sección «🚀 Regla de arranque (harness)» (4.4): router antes de cada turno, orquestador si >1 archivo/dominio, contrato por fase + topic keys. Filas piloto NO añadidas (diferidas a WU5) |
| `openspec/config.yaml` | Modificado | `artifact_store: hybrid` + `topic_keys` `sdd/{change}/{artifact}` (4.5) |
| `00-meta-skills/harness-map.md` | Modificado | Header «51 skills» → «140 skills» (fix autorizado) |
| `openspec/changes/skills-harness/tasks.md` | Modificado | Tareas 4.1-4.5 marcadas `[x]` |
| `openspec/changes/skills-harness/apply-progress.md` | Actualizado | Este artefacto (merge con batches PR-1/WU1, PR-2/WU2 y PR-3/WU3) |

## Evidencia de unidad de trabajo (Work Unit Evidence)

| Evidencia | Valor requerido | Resultado |
|---|---|---|
| Comando de test enfocado y resultado exacto | `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` (raíz del catálogo) | PASS — exit 0; 140 skills escaneadas, 0 errores, 0 warnings; incluye el nuevo check de consistencia SKILLS.md ↔ registro sin hallazgos. Test negativo confirmado: romper un path en `.atl/skill-registry.md` produce `registry-entry-path-mismatch` (error), y restaurar vuelve a exit 0 |
| Comando/scenario de harness runtime | `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry` (raíz del catálogo) | PASS — exit 0; «Emitted .atl/skill-registry.md (129 skills indexed, 10 categories)»; re-ejecución idempotente (working tree limpio tras el commit; sin diff nuevo). Output bien formado: columna scope, paths exactos, UTF-8 correcto |
| Límite de rollback | Revertir la rama `slice/pr4-wu4-registry-bootstrap` (`git revert` o `git reset --hard main`) para restaurar: `skills-loader.mjs`, `validate-skills.mjs`, `.atl/skill-registry.md`, `AGENTS.md`, `openspec/config.yaml`, `harness-map.md` | Sin afectar trabajo no relacionado (WU1/WU2/WU3/WU5 intactos); `.atl/` no está en `.gitignore` (está trackeado) |

## Desviaciones del diseño

1. **Filas piloto de AGENTS.md y +9 filas de SKILLS.md DIFERIDAS a WU5 (decisión del procedimiento de 4.4)**: la tarea 4.4 pedía agregar la regla de arranque + filas piloto en AGENTS.md y +9 filas en SKILLS.md. Las 9 skills piloto (5 híbridas MCP + figma-mcp + nano-banana + banana-claude + figma-implement) se crean en WU5 (tareas 5.1/5.2) y NO existen todavía. Se probó que agregar una fila en SKILLS.md que apunte a un path inexistente rompe `validate-skills.mjs --strict` (check `index-sync-orphan`, error exit 1). Por el procedimiento de decisión de 4.4 («NUNCA dejar el validador en rojo»), en este batch se agregó SOLO la regla de arranque de AGENTS.md; las filas piloto y las +9 filas de SKILLS.md quedan diferidas a WU5 (PR-5) cuando las skills existan.
2. **`getField` del loader endurecido (requerido por la regeneración correcta)**: el parseo original de frontmatter no manejaba YAML block scalars (`description: >`) ni strings con comillas dobles, lo que producía descripciones incorrectas en el registro (p. ej. `jira-epic` con descripción `>`, `brainstorming` con comillas). Se mejoró `getField` en `skills-loader.mjs` (fold de líneas indentadas para `>`/`|`, strip de comillas) — cambio aditivo dentro de 4.1, sin alterar el comportamiento de los modos existentes.
3. **`openspec/config.yaml` context sigue diciendo «129 skills»**: el contexto describe el catálogo indexado (129, sin las 11 `sdd-*`), no el total de SKILL.md (140). No se modificó porque el fix autorizado de conteo era únicamente el header de `harness-map.md`; se registra como nota.

## Problemas encontrados

1. **Sin remoto git configurado** (heredado de PR-1/PR-2/PR-3): `git remote -v` vacío. PR-4 no puede abrirse; la rama `slice/pr4-wu4-registry-bootstrap` queda lista para push cuando exista remoto.
2. **Header de `harness-map.md` desactualizado**: corregido en este batch (51 → 140) como fix de consistencia autorizado; ya no es un problema abierto.

## Historial de batches previos

### Batch PR-3 / WU3 (Fases de cierre) — `slice/pr3-wu3-closing-phases`

- [x] 3.1 Crear `00-meta-skills/sdd-{tasks,apply,verify,archive,onboard}/SKILL.md`
- [x] 3.2 `harness-map.md`: routing de modelos diferido a Slice 2; GLM no es target de skill-sync
- [x] 3.3 `harness-map.md`: cerrar brechas #16 (Skill Resolution Feedback) y #4 (Execution Mode)

### Batch PR-2 / WU2 (Núcleo del harness) — `slice/pr2-wu2-harness-core`

- [x] 2.1 Crear `_shared/sdd-phase-common.md` (protocolo común, topic keys, envelope de 6 campos, guard de 400 líneas)
- [x] 2.2 Crear `00-meta-skills/sdd-orchestrator/SKILL.md` (orquestador delgado, DAG, modos auto/interactive con gatekeeper, dedup, executor-first)
- [x] 2.3 Crear `00-meta-skills/sdd-{init,explore,propose,spec,design}/SKILL.md` (vendored MIT con atribución, frontmatter agentskills.io)
- [x] 2.4 `harness-map.md`: punto de extensión RDD post-verify pre-archive + mapeo de lentes (doc-only)

### Batch PR-1 / WU1 (Fundación) — `slice/pr1-wu1-foundation`

- [x] 1.1 `opencode.json`: `api_key` de Context7 → `${CONTEXT7_API_KEY}`
- [x] 1.2 Crear `references/git-recovery-runbook.md`

## Tareas completadas acumuladas (todos los batches)

- [x] 1.1 `opencode.json`: reemplazar `api_key` de Context7 por `${CONTEXT7_API_KEY}` (PR-1/WU1)
- [x] 1.2 Crear `references/git-recovery-runbook.md` (PR-1/WU1)
- [x] 2.1 Crear `_shared/sdd-phase-common.md` (PR-2/WU2)
- [x] 2.2 Crear `00-meta-skills/sdd-orchestrator/SKILL.md` (PR-2/WU2)
- [x] 2.3 Crear `00-meta-skills/sdd-{init,explore,propose,spec,design}/SKILL.md` (PR-2/WU2)
- [x] 2.4 `harness-map.md`: punto de extensión RDD post-verify + mapeo de lentes (PR-2/WU2)
- [x] 3.1 Crear `00-meta-skills/sdd-{tasks,apply,verify,archive,onboard}/SKILL.md` (PR-3/WU3)
- [x] 3.2 `harness-map.md`: routing de modelos diferido a Slice 2; GLM no es target de skill-sync (PR-3/WU3)
- [x] 3.3 `harness-map.md`: cerrar brechas #16 (Skill Resolution Feedback) y #4 (Execution Mode) (PR-3/WU3)
- [x] 4.1 `skills-loader.mjs`: modo `--emit-registry` (PR-4/WU4)
- [x] 4.2 `validate-skills.mjs`: check de consistencia SKILLS.md ↔ registro (PR-4/WU4)
- [x] 4.3 Regenerar `.atl/skill-registry.md` con columna scope; validar strict exit 0 (PR-4/WU4)
- [x] 4.4 `AGENTS.md`: regla de arranque (filas piloto diferidas a WU5) (PR-4/WU4)
- [x] 4.5 `openspec/config.yaml`: `artifact_store: hybrid` + topic keys (PR-4/WU4)
- [x] Fix autorizado: header `harness-map.md` «51» → «140» (PR-4/WU4)

## Tareas restantes

- [ ] 5.1 a 5.5 (WU5 → PR-5): lote piloto (9 skills), overlap-matrix.json, hook del router, smoke tests, regen tier0. Incluye las filas piloto de AGENTS.md y las +9 filas de SKILLS.md diferidas desde 4.4
- [ ] 6.1 a 6.4 (Verificación)

## Frontera de workload / PR

- **Modo**: PR encadenado (chained PR slice, stacked-to-main)
- **Unidad actual**: WU4 — registro + bootstrap (--emit-registry, consistencia, regla de arranque, config.yaml)
- **Frontera**: PR-4 comienza en `ee37a36` (main, PR-3 mergeado) y termina en el último commit de esta rama; no incluye nada de WU5-WU6 (skills piloto, matriz, hook del router)
- **Impacto en presupuesto de revisión**: ~280 líneas netas (117 loader + 94 validator + registro regenerado + 11 AGENTS + 1 harness-map + 20 config) — por debajo del guard de 400; dividido en 6 commits por unidad de trabajo

## Estado

15/15 tareas acumuladas completadas (1.1, 1.2, 2.1-2.4, 3.1-3.3, 4.1-4.5 + fix). PR-4 listo para revisión; siguiente batch (WU5 → PR-5).
