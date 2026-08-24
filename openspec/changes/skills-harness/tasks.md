# Tasks: skills-harness (Slice 1)

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas cambiadas estimadas | ~3.500-4.500 total; 50-1.400 por PR |
| Riesgo presupuesto 400 líneas | High |
| PRs encadenados recomendados | Yes |
| Split sugerido | PR-1 → PR-2 → PR-3 → PR-4 → PR-5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending (design sugiere stacked-to-main; confirmar con usuario) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Unidades de trabajo sugeridas

| WU | Meta | PR | Test enfocado | Harness runtime | Límite de rollback |
|---|---|---|---|---|---|
| WU1 | API key → env + runbook git | PR-1 | Grep CONTEXT7 en `opencode.json`: solo `${CONTEXT7_API_KEY}` | N/A — cambio de config verificable por inspección | Restaurar `opencode.json` respaldado |
| WU2 | Protocolo común + orquestador + fases init→design | PR-2 | `validate-skills.mjs --strict` exit 0 | E2E: piloto SDD hasta design en proyecto de prueba | Eliminar `_shared/sdd-phase-common.md` + `sdd-{orchestrator,init,explore,propose,spec,design}` |
| WU3 | Fases tasks→archive + doc routing | PR-3 | `validate-skills.mjs --strict` exit 0 | E2E: piloto SDD tasks→archive | Eliminar `sdd-{tasks,apply,verify,archive,onboard}` |
| WU4 | `--emit-registry` + consistencia + arranque | PR-4 | `skills-loader.mjs --emit-registry` + diff; `validate-skills.mjs --strict` | `install-skills.mjs --target <proyecto de prueba>` | Revertir scripts respaldados; regenerar `.atl` |
| WU5 | Lote piloto (9) + matriz + hook router | PR-5 | `skill-router.mjs --query --json` con fixtures `overlap-smoke-tests.json` | Router en vivo sobre las 9 skills nuevas | Eliminar `09/11/figma-implement` + revertir hook |

## Fase 1: Fundación (WU1)

- [x] 1.1 `opencode.json`: reemplazar `api_key` de Context7 por `${CONTEXT7_API_KEY}`; verificar que el secreto no queda en texto plano (harness-bootstrap: Sin secreto en el repositorio)
- [x] 1.2 Crear `references/git-recovery-runbook.md` con los pasos ejecutados (backup → `git init` → commit `c62bcac`) para regeneración futura

## Fase 2: Núcleo del harness (WU2)

- [x] 2.1 Crear `_shared/sdd-phase-common.md`: carga de skills, retrieval `mem_search`→`mem_get_observation`, persistencia por modo (engram/openspec/hybrid/none, topic keys `sdd/{change}/{artifact}`, `capture_prompt: false`), envelope de 6 campos, guard de 400 líneas (artifact-store-abstraction)
- [x] 2.2 Crear `00-meta-skills/sdd-orchestrator/SKILL.md`: orquestador delgado (rutea, no ejecuta), DAG proposal→specs→tasks→apply→verify→archive (design ramifica de proposal), modos auto/interactive con gatekeeper, dedup, executor-first para Antigravity (harness-orchestration)
- [x] 2.3 Crear `00-meta-skills/sdd-{init,explore,propose,spec,design}/SKILL.md`: vendored MIT con header de atribución, frontmatter agentskills.io, contrato de resultado; dependencia insatisfecha → `status: blocked` sin avanzar (harness-orchestration)
- [x] 2.4 `harness-map.md`: documentar punto de inserción RDD post-verify pre-archive + mapeo de lentes code-reviewer/judgment-day, sin mecanismo (rdd-extension-point)

## Fase 3: Fases de cierre (WU3)

- [x] 3.1 Crear `00-meta-skills/sdd-{tasks,apply,verify,archive,onboard}/SKILL.md`: apply con apply-progress merge, verify contra specs, archive con deltas, onboard docente (harness-orchestration)
- [x] 3.2 `harness-map.md`: documentar routing de modelos diferido a Slice 2; GLM no es target de skill-sync (model-routing-hooks)
- [x] 3.3 `harness-map.md`: cerrar brechas #16 (Skill Resolution Feedback) y #4 (Execution Mode)

## Fase 4: Registro y bootstrap (WU4)

- [x] 4.1 `skill-loader/scripts/skills-loader.mjs`: añadir modo `--emit-registry` (reutiliza walk + cache mtime; excluye `_shared`, `skill-registry`, `sdd-*`) (skill-registry-protocol)
- [x] 4.2 `skill-validator/scripts/validate-skills.mjs`: check de consistencia `SKILLS.md` ↔ `.atl/skill-registry.md` (nombre + path) (skill-registry-protocol)
- [x] 4.3 Regenerar `.atl/skill-registry.md` (columna scope; excluye `_shared`/`skill-registry`/`sdd-*`); validar con `validate-skills.mjs --strict` exit 0 (skill-registry-protocol)
- [x] 4.4 `AGENTS.md`: regla de arranque (router antes de cada turno; orquestador si >1 archivo) + filas piloto; `SKILLS.md`: +9 filas (harness-bootstrap) — regla de arranque en WU4; filas piloto y +9 filas completadas en WU5/PR-5 (ver apply-progress)
- [x] 4.5 `openspec/config.yaml`: `artifact_store: hybrid` + convención de topic keys (artifact-store-abstraction)

## Fase 5: Lote piloto y matriz (WU5)

- [x] 5.1 Crear 5 híbridas nativas `11-mcp-hybrid/{component-scrapper-mcp,oklch-theme-injector,motion-video-pipeline,ux-auditor-agent,asset-generator-mcp}/SKILL.md` (catalog-content-wave)
- [x] 5.2 Crear `11-mcp-hybrid/figma-mcp`, `09-media-graphics/{nano-banana,banana-claude}` (vendored con atribución) y `05-frontend/figma-implement` (plegado Capa 1) (catalog-content-wave)
- [x] 5.3 Crear `skill-router/references/overlap-matrix.json` (grupos figma, banana-image-gen, híbridas unitarias con nota de delimitación) + `overlap-smoke-tests.json` (overlap-matrix)
- [x] 5.4 `skill-router/scripts/skill-router.mjs`: hook ~30 líneas — si ≥2 members en top-4, `primary = canonical`, resto `secondary` (overlap-matrix)
- [x] 5.5 Regenerar `tier0-context.json`; correr smoke tests: primary resuelto = esperado de la matriz (overlap-matrix)

## Fase 6: Verificación

- [ ] 6.1 RED (threat Git selection): `git -C <root> status` limpio, `git fsck` sin errores, `.git.corrupt-*` sin mutación (harness-bootstrap)
- [ ] 6.2 RED (threat Commit state): primer commit contiene el árbol completo; staged paths = paths revisados
- [ ] 6.3 E2E: `install-skills.mjs --target <proyecto de prueba>`; arranque autónomo (Tier 0 + router); piloto SDD con las 8 fases emitiendo contrato en OpenCode y Antigravity (estado vía Engram) (harness-bootstrap, harness-orchestration)
- [ ] 6.4 Validar todos los SKILL.md nuevos/modificados con `validate-skills.mjs --strict` exit 0 (rules.tasks de config.yaml)