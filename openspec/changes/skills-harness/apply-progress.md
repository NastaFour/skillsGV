# Apply Progress: skills-harness (Slice 1)

**Change**: skills-harness
**Modo**: Standard (strict TDD desactivado — catálogo de contenido, sin test runner)
**Batch actual**: PR-5 / WU5 (Lote piloto y matriz)
**Rama**: `slice/pr5-wu5-pilot-matrix` (base `35679a7` main, stacked-to-main; PR-1, PR-2, PR-3 y PR-4 mergeados a main)

## Tareas completadas en este batch (PR-5 / WU5)

- [x] 5.1 Crear 5 híbridas nativas `11-mcp-hybrid/{component-scrapper-mcp,oklch-theme-injector,motion-video-pipeline,ux-auditor-agent,asset-generator-mcp}/SKILL.md` (catalog-content-wave)
- [x] 5.2 Crear `11-mcp-hybrid/figma-mcp`, `09-media-graphics/{nano-banana,banana-claude}` (vendored con atribución) y `05-frontend/figma-implement` (plegado Capa 1) (catalog-content-wave)
- [x] 5.3 Crear `skill-router/references/overlap-matrix.json` (grupos figma, banana-image-gen, híbridas unitarias con nota de delimitación) + `overlap-smoke-tests.json` (overlap-matrix)
- [x] 5.4 `skill-router/scripts/skill-router.mjs`: hook ~30 líneas — si ≥2 members en top-4, `primary = canonical`, resto `secondary` (overlap-matrix)
- [x] 5.5 Regenerar `tier0-context.json`; correr smoke tests: primary resuelto = esperado de la matriz (overlap-matrix)
- [x] 4.4 (parte diferida): filas piloto en `AGENTS.md` (filas de categoría 09-media-graphics y 11-mcp-hybrid, figma-implement en Frontend, +7 filas auto-invoke) y +9 filas en `SKILLS.md` — completadas acá ahora que las 9 skills existen (harness-bootstrap)

## Archivos cambiados (batch PR-5 / WU5)

| Archivo | Acción | Detalle |
|---|---|---|
| `11-mcp-hybrid/{component-scrapper-mcp,oklch-theme-injector,motion-video-pipeline,ux-auditor-agent,asset-generator-mcp}/SKILL.md` | Creados | 5 híbridas MCP nativas (5.1): frontmatter agentskills.io, triggers acotados (notas de delimitación en la matriz), referencias cruzadas a mcp-integration/design-system-tokens/motion-framer/motion-gsap |
| `11-mcp-hybrid/figma-mcp/SKILL.md` | Creado | Vendored MIT con header de atribución (southleft/figma-console-mcp-skills), superficie de inspección del grupo figma (5.2) |
| `09-media-graphics/{nano-banana,banana-claude}/SKILL.md` | Creados | Vendored MIT con atribución (kkoppenhaver/cc-nano-banana; AgriciDaniel/banana-claude), par banana-image-gen (5.2) |
| `05-frontend/figma-implement/SKILL.md` | Creado | Plegado Capa 1 (5.2): vendored Apache-2.0 con atribución (followba/figma-implement-design), canónico del grupo figma |
| `00-meta-skills/skill-router/references/overlap-matrix.json` | Creado | Matriz de solapamiento (5.3): grupos figma y banana-image-gen con canonical, +5 grupos unitarios de delimitación para las híbridas MCP (nota por grupo) |
| `00-meta-skills/skill-router/references/overlap-smoke-tests.json` | Creado | Fixtures query → expectedPrimary (5.3): 10 tests (2 por par + tie-break + 5 unitarios) |
| `00-meta-skills/skill-router/scripts/skill-router.mjs` | Modificado | Hook D4 (5.4): si ≥2 members de un grupo en top-4 Y el grupo lidera el scoring (top-1 es miembro), `primary = canonical`; resto en secondary/tier1toLoad. Guard de líder para no secuestrar primarios genuinos con kw-noise |
| `00-meta-skills/skill-router/SKILL.md` | Modificado | Docs D4 sincronizadas con el guard (trigger de uso + paso 7 del flujo) |
| `00-meta-skills/skill-loader/scripts/skills-loader.mjs` | Modificado | `CATEGORY_TITLES` +2 (`09-media-graphics`, `11-mcp-hybrid`) para que el registro regenerado mantenga el formato de títulos |
| `.atl/skill-registry.md` | Regenerado | `--emit-registry`: 138 skills indexadas, 12 categorías (129 + 9 piloto) |
| `00-meta-skills/skill-loader/tier0-context.json` | Regenerado | `--emit-tier0`: 12 skills, ~940 tokens (el set Tier 0 no cambia; el piloto es Tier 1 vía router) |
| `AGENTS.md` | Modificado | Filas piloto (4.4 diferida): categorías 09-media-graphics y 11-mcp-hybrid, figma-implement en Frontend, +7 filas auto-invoke |
| `SKILLS.md` | Modificado | +9 filas (secciones 09-media-graphics y 11-mcp-hybrid nuevas, figma-implement en 05-frontend), header «140 skills» → «149 skills» |
| `00-meta-skills/harness-map.md` | Modificado | Header «140 skills» → «149 skills» (consistencia de conteo, mismo criterio que el fix autorizado de WU4) |
| `openspec/changes/skills-harness/tasks.md` | Modificado | Tareas 5.1-5.5 marcadas `[x]`; 4.4 anotada con la finalización de las filas en WU5 |
| `openspec/changes/skills-harness/apply-progress.md` | Actualizado | Este artefacto (merge con batches PR-1/WU1 a PR-4/WU4) |

## Evidencia de unidad de trabajo (Work Unit Evidence) — WU5

| Evidencia | Valor requerido | Resultado |
|---|---|---|
| Comando de test enfocado y resultado exacto | `node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<fixture>" --json` × 10 fixtures de `overlap-smoke-tests.json` | PASS — 10/10: `primary` resuelto == `expectedPrimary` de la matriz. Incluye el empate real (`figma-tiebreak-promotes-canonical`: figma-mcp lidera por triggers y la matriz promueve figma-implement) y el caso de guard (`hybrid-asset-generator`: los miembros banana en top-4 con kw-score no secuestran a asset-generator-mcp). Test negativo confirmado: sin el guard, `hybrid-asset-generator` fallaba (primary null) |
| Comando/scenario de harness runtime | `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` (raíz del catálogo) + `skills-loader.mjs --emit-registry` + `--emit-tier0` | PASS — strict: exit 0, 149 SKILL.md escaneados, 0 errores, 0 warnings (incluye checks index-sync SKILLS.md/AGENTS.md y consistencia SKILLS.md ↔ registro). `--emit-registry`: «138 skills indexed, 12 categories»; re-ejecución idempotente (working tree limpio tras el commit). `--emit-tier0`: «up to date (no source changes)» |
| Límite de rollback | Revertir la rama `slice/pr5-wu5-pilot-matrix` (`git revert` o `git reset --hard main`) para restaurar: `09-media-graphics/`, `11-mcp-hybrid/`, `05-frontend/figma-implement/`, `skill-router/references/`, hook + docs del router, `skills-loader.mjs` (CATEGORY_TITLES), `.atl/skill-registry.md`, `tier0-context.json`, `AGENTS.md`, `SKILLS.md`, `harness-map.md` | Sin afectar trabajo no relacionado (WU1-WU4 intactos); `.atl/` está trackeado |

## Desviaciones del diseño

1. **Hook D4 con guard de líder del scoring (endurecimiento requerido por los smoke tests)**: el literal del diseño «si ≥2 members de un grupo aparecen entre los top-4, primary = canonical» producía primarios falsos: para «generate an app icon and logo with the asset generator», los miembros del grupo banana (nano-banana y banana-claude) entraban al top-4 con kw-score puro y el hook promovía nano-banana por encima de asset-generator-mcp (trigger hit 1.0), dejando primary=null. Se añadió la condición «el top-1 actual debe ser miembro del grupo»: la matriz des-empata solo cuando el grupo lidera el ruteo; los miembros que son ruido de keywords nunca desplazan un primario genuino. Es fiel a la intención de la spec (`overlap-matrix`: «no devuelve primarios falsos por triggers duplicados»; «si solo puntúa el no-canónico, se respeta el scoring normal») y queda documentado en `skill-router/SKILL.md`.
2. **Fixture extra de smoke test (`figma-tiebreak-promotes-canonical`)**: los 9 fixtures heredados del run parcial pasaban por scoring normal (la rama de promoción nunca se ejercitaba — p. ej. `figma-implement-resolve` pasaba porque figma-implement ya era top-1). Se añadió un fixture con empate real (figma-mcp lidera por 3 triggers, figma-implement en top-4 por «figma url») que ejercita la promoción del canónico; sin él, romper el hook no rompería ningún test.
3. **`CATEGORY_TITLES` del loader +2**: sin los títulos, el registro regenerado mostraba los folders crudos (`## 09-media-graphics`) como header de sección; se añadieron títulos para mantener el formato del registro (aditivo, 2 líneas).

## Problemas encontrados

1. **Sin remoto git configurado** (heredado de PR-1 a PR-4): `git remote -v` vacío. PR-5 no puede abrirse; la rama `slice/pr5-wu5-pilot-matrix` queda lista para push cuando exista remoto.
2. **El run parcial abortado dejó el hook sin guard**: 1 de 9 smoke tests fallaba (`hybrid-asset-generator`); corregido en este batch (ver Desviación 1). El resto del trabajo parcial (9 SKILL.md, matriz, fixtures, docs del router) se revisó y se conservó sin cambios.

## Historial de batches previos

### Batch PR-4 / WU4 (Registro y bootstrap) — `slice/pr4-wu4-registry-bootstrap`

- [x] 4.1 `skill-loader/scripts/skills-loader.mjs`: modo `--emit-registry` (reutiliza walk + cache mtime; excluye `_shared`, `skill-registry`, `sdd-*`) (skill-registry-protocol)
- [x] 4.2 `skill-validator/scripts/validate-skills.mjs`: check de consistencia `SKILLS.md` ↔ `.atl/skill-registry.md` (nombre + path) (skill-registry-protocol)
- [x] 4.3 Regenerar `.atl/skill-registry.md` (columna scope; excluye `_shared`/`skill-registry`/`sdd-*`); validar con `validate-skills.mjs --strict` exit 0 (skill-registry-protocol)
- [x] 4.4 `AGENTS.md`: regla de arranque (router antes de cada turno; orquestador si >1 archivo); filas piloto DIFERIDAS a WU5 (ver Desviaciones)
- [x] 4.5 `openspec/config.yaml`: `artifact_store: hybrid` + convención de topic keys (artifact-store-abstraction)
- [x] Fix de consistencia autorizado: header de `harness-map.md` corregido de «51 skills» a «140 skills» (bug de doc pre-existente en el tema de consistencia de índices)

Archivos: `skills-loader.mjs` (modo `--emit-registry` + endurecimiento `getField` para block scalars/quotes), `validate-skills.mjs` (check de consistencia), `.atl/skill-registry.md` (regenerado, 129 skills), `AGENTS.md` (regla de arranque), `openspec/config.yaml` (hybrid), `harness-map.md` (header). Evidencia WU4: strict exit 0 (140 skills); `--emit-registry` idempotente. Desviaciones WU4: filas piloto diferidas a WU5; `getField` endurecido; `config.yaml` context sigue diciendo «129 skills» (nota, no modificado).

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
- [x] 4.4 `AGENTS.md`: regla de arranque + filas piloto; `SKILLS.md`: +9 filas — regla en WU4, filas completadas en WU5/PR-5
- [x] 4.5 `openspec/config.yaml`: `artifact_store: hybrid` + topic keys (PR-4/WU4)
- [x] Fix autorizado: header `harness-map.md` «51» → «140» (PR-4/WU4); ajustado a «149» en PR-5/WU5
- [x] 5.1 5 híbridas MCP nativas en `11-mcp-hybrid/` (PR-5/WU5)
- [x] 5.2 figma-mcp, nano-banana, banana-claude (vendored) + figma-implement (plegado Capa 1) (PR-5/WU5)
- [x] 5.3 `overlap-matrix.json` + `overlap-smoke-tests.json` (PR-5/WU5)
- [x] 5.4 Hook D4 en `skill-router.mjs` con guard de líder (PR-5/WU5)
- [x] 5.5 Regen `tier0-context.json` + smoke tests 10/10 verdes (PR-5/WU5)

## Tareas restantes

- [ ] 6.1 a 6.4 (Verificación): RED git status/fsck, RED commit state, E2E install + arranque autónomo + piloto SDD, validación strict final

## Frontera de workload / PR

- **Modo**: PR encadenado (chained PR slice, stacked-to-main)
- **Unidad actual**: WU5 — lote piloto (9 skills) + matriz de solapamiento + hook del router + smoke tests + regen tier0 + filas piloto diferidas de 4.4
- **Frontera**: PR-5 comienza en `35679a7` (main, PR-4 mergeado) y termina en el último commit de `slice/pr5-wu5-pilot-matrix`; no incluye nada de WU6 (verificación)
- **Impacto en presupuesto de revisión**: ~740 líneas netas (491 de los 9 SKILL.md + 162 matriz/hook/smoke + 54 índices/registro + 10 filas AGENTS + 21 SKILLS) — por encima del guard de 400, por eso es un slice encadenado propio (PR-5); dividido en 3 commits por unidad de trabajo

## Estado

20/20 tareas acumuladas completadas (1.1, 1.2, 2.1-2.4, 3.1-3.3, 4.1-4.5, 5.1-5.5 + fix). PR-5 listo para revisión; siguiente batch (WU6 → verificación 6.1-6.4).