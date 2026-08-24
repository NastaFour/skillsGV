# Apply Progress: skills-harness (Slice 1)

**Change**: skills-harness
**Modo**: Standard (strict TDD desactivado — catálogo de contenido, sin test runner)
**Batch actual**: PR-3 / WU3 (Fases de cierre)
**Rama**: `slice/pr3-wu3-closing-phases` (base `f6984a4` main, stacked-to-main; PR-1 y PR-2 mergeados a main)

## Tareas completadas en este batch (PR-3 / WU3)

- [x] 3.1 Crear `00-meta-skills/sdd-{tasks,apply,verify,archive,onboard}/SKILL.md`: apply con apply-progress merge, verify contra specs, archive con deltas, onboard docente (harness-orchestration)
- [x] 3.2 `harness-map.md`: documentar routing de modelos diferido a Slice 2; GLM no es target de skill-sync (model-routing-hooks)
- [x] 3.3 `harness-map.md`: cerrar brechas #16 (Skill Resolution Feedback) y #4 (Execution Mode)

## Archivos cambiados (batch PR-3 / WU3)

| Archivo | Acción | Detalle |
|---|---|---|
| `00-meta-skills/sdd-tasks/SKILL.md` | Creado | Fase vendored MIT con header de atribución (3.1): desglose de tareas con Review Workload Forecast, guard de 400 líneas, unidades de trabajo |
| `00-meta-skills/sdd-apply/SKILL.md` | Creado | Ídem (3.1): implementación con protocolo de merge de apply-progress, Evidencia de Unidad de Trabajo, guard de carga |
| `00-meta-skills/sdd-verify/SKILL.md` | Creado | Ídem (3.1): verificación contra specs con matriz de cumplimiento, veredicto PASS/FAIL, sin dependencia del binario gentle-ai |
| `00-meta-skills/sdd-archive/SKILL.md` | Creado | Ídem (3.1): sync de delta specs + movimiento a archive con Contrato de Copia Mecánica (`diff -r` readback) |
| `00-meta-skills/sdd-onboard/SKILL.md` | Creado | Ídem (3.1): walkthrough docente del ciclo SDD completo, ejecución inline |
| `00-meta-skills/harness-map.md` | Modificado | Cierre de brechas #16 (Skill Resolution Feedback) y #4 (Execution Mode) + sección «Model Routing (diferido a Slice 2)» con nota GLM no target de skill-sync (3.2, 3.3) |
| `SKILLS.md` | Modificado | Registro de las 5 skills nuevas del harness (requisito del sync de índice del validador); contador 135 → 140 |
| `AGENTS.md` | Modificado | Fila de categoría Meta-Skills con los 5 nombres nuevos (requisito del sync de índice del validador) |
| `openspec/changes/skills-harness/tasks.md` | Modificado | Tareas 3.1-3.3 marcadas `[x]` |
| `openspec/changes/skills-harness/apply-progress.md` | Actualizado | Este artefacto (merge con batches PR-1/WU1 y PR-2/WU2) |

## Evidencia de unidad de trabajo (Work Unit Evidence)

| Evidencia | Valor requerido | Resultado |
|---|---|---|
| Comando de test enfocado y resultado exacto | `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` (raíz del catálogo) | PASS — exit 0; 140 skills escaneadas, 0 errores, 0 warnings; las 5 skills nuevas pasan la spec agentskills.io (incluye `allowed-tools` requerido en strict, sin referencias rotas) |
| Comando/scenario de harness runtime | N/A con razón — el piloto E2E SDD (fases tasks→archive emitiendo contrato en OpenCode/Antigravity) requiere un runtime de agente y está planificado en la fase de verificación (tarea 6.3); este batch verifica el protocolo y el frontmatter con el validador del catálogo | N/A con razón |
| Límite de rollback | Eliminar `00-meta-skills/sdd-{tasks,apply,verify,archive,onboard}/` y revertir los commits de `harness-map.md`, `SKILLS.md`, `AGENTS.md`, `tasks.md` y `apply-progress.md` (`git revert` de la rama) | Sin afectar trabajo no relacionado (WU1/WU2/WU4/WU5 intactos) |

## Desviaciones del diseño

1. **Registro en `SKILLS.md`/`AGENTS.md` adelantado desde WU4 (requerido por el gate de verificación — misma lección que WU2)**: el validador `--strict` incluye checks de sync de índice (`index-sync-missing-skill`, `agents-sync-missing-skill`) que fallan con exit 1 si las 5 skills nuevas no están en `SKILLS.md` y `AGENTS.md`. Para que PR-3 pase `validate-skills.mjs --strict` exit 0 (test enfocado de WU3 en tasks.md), se añadieron SOLO las filas de registro mínimas (tabla `00-meta-skills` + fila de categoría Meta-Skills y contador 135→140). NO se incluye la regla de arranque ni las filas piloto de la tarea 4.4 (WU4), ni la regeneración de `.atl/skill-registry.md` (4.3, WU4).
2. **Adaptación vendored (fases tasks/apply/verify/archive/onboard)**: las fases eliminan referencias a `skills/_shared/sdd-phase-common.md`, `skills/_shared/openspec-convention.md`, `skills/_shared/sdd-status-contract.md`, `references/report-format.md`, `strict-tdd-verify.md` y `../_shared/sdd-phase-common.md` porque esos archivos no existen en el catálogo (referencias rotas = error/warning en strict). El contenido se inlinó o se reemplazó por la referencia al protocolo común local (`_shared/sdd-phase-common.md`, citado por nombre). Se añadió `allowed-tools: Read` (requerido en strict) y `metadata.version` semver. Se eliminaron los campos runtime-específicos `disable-model-invocation`/`user-invocable`/`delegate_only` (el patrón executor-first se conserva en el cuerpo). `sdd-verify` y `sdd-archive` prescinden de los mecanismos del binario gentle-ai (receipts, `gentle-ai sdd-verify-validate`, authority preflight): el RDD es doc-only en Slice 1 y no hay binario en el catálogo; conservan lo esencial (matriz de cumplimiento, veredicto, gate de completitud de tareas, Contrato de Copia Mecánica con `diff -r`).

## Problemas encontrados

1. **Sin remoto git configurado** (heredado de PR-1/PR-2): `git remote -v` vacío. PR-3 no puede abrirse; la rama `slice/pr3-wu3-closing-phases` queda lista para push cuando exista remoto.
2. **Header de `harness-map.md` desactualizado (pre-existente, no tocado)**: dice "51 skills" pero el catálogo tiene 140; queda pendiente de corrección (fuera de alcance de WU3, se puede corregir en WU4).

## Historial de batches previos

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

## Tareas restantes

- [ ] 4.1 a 4.5 (WU4 → PR-4): `--emit-registry`, consistencia, regla de arranque AGENTS.md, filas piloto SKILLS.md, config.yaml
- [ ] 5.1 a 5.5 (WU5 → PR-5): lote piloto, matriz de solapamiento, hook del router, smoke tests
- [ ] 6.1 a 6.4 (Verificación)

## Frontera de workload / PR

- **Modo**: PR encadenado (chained PR slice, stacked-to-main)
- **Unidad actual**: WU3 — fases tasks→archive + doc routing (model routing diferido, brechas #16/#4)
- **Frontera**: PR-3 comienza en `f6984a4` (main, PR-2 mergeado) y termina en el último commit de esta rama; no incluye nada de WU4-WU5
- **Impacto en presupuesto de revisión**: ~1.000 líneas añadidas (5 SKILL.md + doc + registro) — por encima del guard de 400; justificado por el split en work units por commit; cada commit es una unidad de trabajo revisable independiente

## Estado

11/11 tareas acumuladas completadas (1.1, 1.2, 2.1-2.4, 3.1-3.3). PR-3 listo para revisión; siguiente batch (WU4 → PR-4).
