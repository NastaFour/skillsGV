# Apply Progress: skills-harness (Slice 1)

**Change**: skills-harness
**Modo**: Standard (strict TDD desactivado — catálogo de contenido, sin test runner)
**Batch**: PR-2 / WU2 (Núcleo del harness)
**Rama**: `slice/pr2-wu2-harness-core` (base `8df8c1b`, stacked-to-main; PR-1 mergeado a main)

## Tareas completadas en este batch

- [x] 2.1 Crear `_shared/sdd-phase-common.md`: carga de skills, retrieval `mem_search`→`mem_get_observation`, persistencia por modo (engram/openspec/hybrid/none, topic keys `sdd/{change}/{artifact}`, `capture_prompt: false`), envelope de 6 campos, guard de 400 líneas (artifact-store-abstraction)
- [x] 2.2 Crear `00-meta-skills/sdd-orchestrator/SKILL.md`: orquestador delgado (rutea, no ejecuta), DAG proposal→specs→tasks→apply→verify→archive (design ramifica de proposal), modos auto/interactive con gatekeeper, dedup, executor-first para Antigravity (harness-orchestration)
- [x] 2.3 Crear `00-meta-skills/sdd-{init,explore,propose,spec,design}/SKILL.md`: vendored MIT con header de atribución, frontmatter agentskills.io, contrato de resultado; dependencia insatisfecha → `status: blocked` sin avanzar (harness-orchestration)
- [x] 2.4 `harness-map.md`: documentar punto de inserción RDD post-verify pre-archive + mapeo de lentes code-reviewer/judgment-day, sin mecanismo (rdd-extension-point)

## Archivos cambiados (batch PR-2 / WU2)

| Archivo | Acción | Detalle |
|---|---|---|
| `_shared/sdd-phase-common.md` | Creado | Protocolo común de fase SDD (2.1): carga de skills, recuperación `mem_search`→`mem_get_observation`, persistencia por modo con topic keys `sdd/{change}/{artifact}` y `capture_prompt: false`, envelope de 6 campos, guard de 400 líneas |
| `00-meta-skills/sdd-orchestrator/SKILL.md` | Creado | Orquestador delgado catálogo-nativo (2.2): rutea no ejecuta, DAG con design ramificando de proposal, modos auto/interactive con gatekeeper, dedup, executor-first para Antigravity, resolución de skills con paths exactos |
| `00-meta-skills/sdd-init/SKILL.md` | Creado | Fase vendored MIT con header de atribución (2.3), adaptada a español neutral y frontmatter agentskills.io (`allowed-tools` añadido para strict) |
| `00-meta-skills/sdd-explore/SKILL.md` | Creado | Ídem (2.3) |
| `00-meta-skills/sdd-propose/SKILL.md` | Creado | Ídem (2.3) |
| `00-meta-skills/sdd-spec/SKILL.md` | Creado | Ídem (2.3) |
| `00-meta-skills/sdd-design/SKILL.md` | Creado | Ídem (2.3) |
| `00-meta-skills/harness-map.md` | Modificado | Punto de extensión RDD post-verify pre-archive + mapeo de lentes code-reviewer/judgment-day, sin mecanismo (2.4) |
| `SKILLS.md` | Modificado | Registro de las 6 skills nuevas del harness (requisito del sync de índice del validador); contador 129 → 135 |
| `AGENTS.md` | Modificado | Fila de categoría Meta-Skills con los 6 nombres nuevos (requisito del sync de índice del validador) |
| `openspec/changes/skills-harness/tasks.md` | Modificado | Tareas 2.1-2.4 marcadas `[x]` |
| `openspec/changes/skills-harness/apply-progress.md` | Actualizado | Este artefacto (merge con batch PR-1/WU1) |

## Evidencia de unidad de trabajo (Work Unit Evidence)

| Evidencia | Valor requerido | Resultado |
|---|---|---|
| Comando de test enfocado y resultado exacto | `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` (raíz del catálogo) | PASS — exit 0; 135 skills escaneadas, 0 errores, 0 warnings; las 6 skills nuevas pasan la spec agentskills.io (incluye `allowed-tools` requerido en strict, sin referencias rotas) |
| Comando/scenario de harness runtime | N/A con razón — el piloto E2E SDD (fases emitiendo contrato en OpenCode/Antigravity) requiere un runtime de agente y está planificado en la fase de verificación (tarea 6.3); este batch verifica el protocolo y el frontmatter con el validador del catálogo | N/A con razón |
| Límite de rollback | Eliminar `_shared/sdd-phase-common.md` + `00-meta-skills/sdd-{orchestrator,init,explore,propose,spec,design}/` y revertir los commits de `harness-map.md`, `SKILLS.md`, `AGENTS.md`, `tasks.md` y `apply-progress.md` (`git revert` de la rama) | Sin afectar trabajo no relacionado (WU1/WU3-WU5 intactos) |

## Desviaciones del diseño

1. **Registro en `SKILLS.md`/`AGENTS.md` adelantado desde WU4 (requerido por el gate de verificación)**: el validador `--strict` incluye checks de sync de índice (`index-sync-missing-skill`, `agents-sync-missing-skill`) que fallan con exit 1 si las 6 skills nuevas no están en `SKILLS.md` y `AGENTS.md`. Para que PR-2 pase `validate-skills.mjs --strict` exit 0 (test enfocado de WU2 en tasks.md), se añadieron SOLO las filas de registro mínimas (tabla `00-meta-skills` + fila de categoría Meta-Skills y contador 129→135). NO se incluye la regla de arranque ni las filas piloto de la tarea 4.4 (WU4), ni la regeneración de `.atl/skill-registry.md` (4.3, WU4).
2. **Adaptación vendored**: las fases vendered eliminan referencias a `references/init-details.md`, `references/threat-matrix.md`, `../_shared/engram-convention.md` y `../_shared/openspec-convention.md` porque esos archivos no existen en el catálogo (referencias rotas = warning en strict). El contenido se inlinó o se reemplazó por el enlace al protocolo común local `../../_shared/sdd-phase-common.md`. Se añadió `allowed-tools: Read` (requerido en strict) y `metadata.version` semver. Se eliminaron los campos runtime-específicos `disable-model-invocation`/`user-invocable`/`delegate_only` (el patrón executor-first se conserva en el cuerpo).

## Problemas encontrados

1. **Sin remoto git configurado** (heredado de PR-1): `git remote -v` vacío. PR-2 no puede abrirse; la rama `slice/pr2-wu2-harness-core` queda lista para push cuando exista remoto.
2. **Checks de sync de índice del validador**: el validador exige que toda skill del catálogo esté en `SKILLS.md` y `AGENTS.md`. El design repartía ese registro en WU4; ver desviación 1. Impacto futuro: WU3 (fases tasks→archive) y WU5 (lote piloto) necesitarán el mismo registro mínimo por PR para mantener el validador verde.

## Tareas completadas acumuladas (todos los batches)

- [x] 1.1 `opencode.json`: reemplazar `api_key` de Context7 por `${CONTEXT7_API_KEY}` (PR-1/WU1)
- [x] 1.2 Crear `references/git-recovery-runbook.md` (PR-1/WU1)
- [x] 2.1 Crear `_shared/sdd-phase-common.md` (PR-2/WU2)
- [x] 2.2 Crear `00-meta-skills/sdd-orchestrator/SKILL.md` (PR-2/WU2)
- [x] 2.3 Crear `00-meta-skills/sdd-{init,explore,propose,spec,design}/SKILL.md` (PR-2/WU2)
- [x] 2.4 `harness-map.md`: punto de extensión RDD post-verify + mapeo de lentes (PR-2/WU2)

## Tareas restantes

- [ ] 3.1 a 3.3 (WU3 → PR-3): fases tasks→archive, model routing, brechas #16 y #4
- [ ] 4.1 a 4.5 (WU4 → PR-4): `--emit-registry`, consistencia, regla de arranque AGENTS.md, filas piloto SKILLS.md, config.yaml
- [ ] 5.1 a 5.5 (WU5 → PR-5): lote piloto, matriz de solapamiento, hook del router, smoke tests
- [ ] 6.1 a 6.4 (Verificación)

## Frontera de workload / PR

- **Modo**: PR encadenado (chained PR slice, stacked-to-main)
- **Unidad actual**: WU2 — protocolo común + orquestador + fases init→design + doc RDD
- **Frontera**: PR-2 comienza en `8df8c1b` (main, PR-1 mergeado) y termina en el último commit de esta rama; no incluye nada de WU3-WU5
- **Impacto en presupuesto de revisión**: ~950 líneas añadidas (protocolo + 6 SKILL.md + registro + doc RDD), por encima del guard de 400 — justificado por el split en work units por commit; cada commit es una unidad de trabajo revisable independiente

## Estado

6/6 tareas acumuladas completadas (1.1, 1.2, 2.1-2.4). PR-2 listo para revisión; siguiente batch (WU3 → PR-3).