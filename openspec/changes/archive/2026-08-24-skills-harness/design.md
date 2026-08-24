# Diseño: skills-harness (Slice 1)

## Technical Approach

Enfoque C híbrido (propuesta aprobada): conservar router/loader/validator/sync como columna vertebral y añadir el harness SDD como skills catálogo-nativas vendored del runtime gentle-ai (MIT) con atribución — orquestador delgado + 10 agentes de fase, contrato de resultado, DAG explícito, almacén de artefactos por convención de protocolo, registro `.atl/` con delegación por paths exactos, matriz de solapamiento para el lote piloto (9 skills) y prerrequisitos de seguridad (git corrupto, API key Context7). Cubre las 8 specs: `harness-orchestration`, `harness-bootstrap`, `skill-registry-protocol`, `artifact-store-abstraction`, `overlap-matrix`, `catalog-content-wave`; `rdd-extension-point` se cubre EN Slice 1 como documentación únicamente (punto de inserción post-verify + mapeo de lenses, sin mecanismo); `model-routing-hooks` documenta el diferimiento a Slice 2.

Decisiones resueltas (binding, no se reabren): 8 fases completas desde Slice 1 (sin par piloto); autoría vendored con atribución (las 5 híbridas MCP son originales del usuario — nativas); lote piloto = categoría `11-mcp-hybrid`; professional-planner coexiste como metodología de referencia; RDD = solo punto de extensión.

## Architecture Decisions

| # | Decisión | Alternativas rechazadas | Rationale |
|---|---|---|---|
| D1 | Harness en `00-meta-skills/sdd-*` (orquestador + 10 fases) | Carpeta raíz `sdd/` (el regex de categorías del router la ignoraría); dentro de `professional-planner/` (debe seguir siendo metodología, no ejecutor) | El regex `^(\d{2}-[a-z-]+…)` del router ya clasifica `00-meta-skills` sin cambio de código (claim limitado al regex de categorías); la exclusión de `sdd-*` del registro NO es automática: se implementa en la lógica del nuevo flag `--emit-registry` (ver D5) |
| D2 | Fases vendored de `~/.config/opencode/skills/sdd-*` (MIT) con header de atribución, adaptadas a convenciones del catálogo (español, frontmatter agentskills.io) | Autoría 100% nativa (coste alto, riesgo de deriva); adopción del binario gentle-ai (out of scope) | Decisión 2 binding; paridad arquitectónica probada; MIT permite reutilización con atribución |
| D3 | Portabilidad por "executor-first": cada SKILL.md declara "eres el sub-agente de fase; si cargaste esto directo, ejecuta inline". El orquestador detecta modo: multi-agente (OpenCode) delega con contexto fresco; solo-agente (Antigravity) ejecuta las fases inline en orden DAG persistiendo estado vía Engram | Skills separadas por plataforma (duplicación) | Mismas skills, mismo DAG, mismo contrato; solo cambia el transporte de ejecución (spec `harness-orchestration`, escenarios OpenCode/Antigravity) |
| D4 | Matriz de solapamiento como archivo de datos `overlap-matrix.json` + hook mínimo (~30 líneas) en `skill-router.mjs`: si ≥2 miembros de un grupo empatan en el top-4 del scoring, `primary = canonical` y el resto degrada a `secondary` | `deprecated/redirect` existente (oculta la skill del ruteo — viola "ambas se mantienen"); campo `priority` en frontmatter (rompe contrato del validador) | Ambas skills siguen ruteables; la matriz solo des-empata; cero cambio de esquema de frontmatter |
| D5 | Registro generado por un nuevo flag `--emit-registry` añadido a `skills-loader.mjs` (hoy sus modos son `--emit-tier0/--emit-tier1/--check/--status`); el flag nuevo reutiliza el walk del catálogo y la cache de frontmatter por mtime que ya viven en ese script | Script nuevo; generación manual; skill-creator (solo siembra skills nuevas) | El loader ya posee la infraestructura de indexación; el flag es aditivo y el refresco queda idempotente tras cada lote |
| D6 | Abstracción de almacén como protocolo documentado (`_shared/sdd-phase-common.md`), no como código runtime; `openspec/config.yaml` declara `artifact_store: hybrid`; resolución: elección de sesión > config > default (engram si disponible, si no none) | Librería JS de store (no hay runtime que la ejecute: las fases son agentes LLM) | El catálogo es contenido + protocolo; las fases ejecutan la persistencia según el modo declarado |
| D7 | Piloto: `09-media-graphics/` (nano-banana, banana-claude), `11-mcp-hybrid/` (5 híbridas + figma-mcp), `figma-implement` → `05-frontend/` (plegado Capa 1); `10-product-ux` reservada a Slice 2 | Crear `10-product-ux` vacía en Slice 1 (categoría sin SKILL.md rompe invariantes del walk) | Spec `catalog-content-wave`: solo lote piloto; el layout queda documentado para la ola completa |

## Data Flow

```
Usuario ──▶ sdd-orchestrator (delgado: rutea, no ejecuta)
                │  [multi-agente: delega | solo-agente: ejecuta inline]
                ▼
 sdd-init ▶ sdd-explore ▶ sdd-propose ─┬─▶ sdd-spec ───┐
                                       └─▶ sdd-design ─┴─▶ sdd-tasks ▶ sdd-apply ▶ sdd-verify ▶ (ext RDD) ▶ sdd-archive
                │  contrato: {status, executive_summary, artifacts, next_recommended, risks, skill_resolution}
                ▼
 Artifact Store ── engram | openspec | hybrid | none ── topic keys sdd/{change}/{artifact}
                │                              │
                └── .atl/skill-registry.md ────┘  (delegación por paths exactos, refresco por --emit-registry)
```

### Agentes de fase (roles / lee / escribe)

| Agente | Rol | Lee | Escribe |
|---|---|---|---|
| `sdd-orchestrator` | Coordina, gatekeeper, dedup de lanzamientos, resolución de skills | Todos los artefactos (referencias) | — (solo ruteo) |
| `sdd-init` | Detecta stack/capacidades de testing | — | `sdd-init/{project}` |
| `sdd-explore` | Mapea el área, compara enfoques | — | `sdd/{change}/explore` |
| `sdd-propose` | Propuesta (intent, scope, approach) | explore (opcional) | `sdd/{change}/proposal` |
| `sdd-spec` | Specs delta Given/When/Then | proposal (req) | `sdd/{change}/spec` |
| `sdd-design` | Diseño técnico (este documento) | proposal (req), spec (opc) | `sdd/{change}/design` |
| `sdd-tasks` | Desglose + forecast de entrega (400 líneas) | spec + design (req) | `sdd/{change}/tasks` |
| `sdd-apply` | Implementa por lotes | tasks + spec + design + apply-progress | `sdd/{change}/apply-progress` (merge) |
| `sdd-verify` | Valida contra specs | spec + tasks + apply-progress | `sdd/{change}/verify-report` |
| `sdd-archive` | Cierra y sincroniza deltas | Todos | `sdd/{change}/archive-report` |
| `sdd-onboard` | Guía el ciclo completo (docente) | Todos (lectura) | — |

**Gatekeeper (modo auto)**: tras cada fase valida conformidad del contrato, existencia y legibilidad del artefacto (read-back), ausencia de alucinaciones (los paths citados resuelven), ausencia de deriva de alcance y coherencia de `next_recommended`. Fallo → re-ejecuta la fase una vez con feedback específico; segundo fallo → detiene la cadena y reporta. **Dedup**: la sesión mantiene `(fase, fingerprint-de-tarea)`; una sola ejecución por tarea distinta.

**Modos de ejecución**: `auto` (fases back-to-back con gatekeeper) e `interactive` (resumen + aprobación por fase); cacheado por sesión; default `interactive`.

## File Changes

| Archivo | Acción | Descripción |
|---|---|---|
| `00-meta-skills/sdd-orchestrator/SKILL.md` | Create | Orquestador delgado catálogo-nativo (D3) |
| `00-meta-skills/sdd-{init,explore,propose,spec,design,tasks,apply,verify,archive,onboard}/SKILL.md` | Create | 10 fases vendored con header de atribución MIT (D2) |
| `_shared/sdd-phase-common.md` | Create | Protocolo común: carga de skills, retrieval (mem_get_observation), persistencia por modo (engram: `mem_save` con `capture_prompt: false`), envelope, guard de 400 líneas |
| `00-meta-skills/skill-router/references/overlap-matrix.json` | Create | Matriz de solapamiento (D4) |
| `00-meta-skills/skill-router/references/overlap-smoke-tests.json` | Create | Fixtures query → primary esperado |
| `09-media-graphics/{nano-banana,banana-claude}/SKILL.md` | Create | Par piloto, vendored con atribución |
| `11-mcp-hybrid/{component-scrapper-mcp,oklch-theme-injector,motion-video-pipeline,ux-auditor-agent,asset-generator-mcp,figma-mcp}/SKILL.md` | Create | 5 híbridas nativas + figma-mcp vendored |
| `05-frontend/figma-implement/SKILL.md` | Create | Plegado Capa 1 (D7) |
| `references/git-recovery-runbook.md` | Create | Runbook de recuperación (ver Migration) |
| `00-meta-skills/skill-router/scripts/skill-router.mjs` | Modify | Hook de resolución por matriz (D4) |
| `00-meta-skills/skill-loader/scripts/skills-loader.mjs` | Modify | Añade el modo nuevo `--emit-registry` (actuales: `--emit-tier0/--emit-tier1/--check/--status`); genera `.atl/skill-registry.md` desde el walk + cache mtime, excluyendo `_shared`, `skill-registry` y `sdd-*` (D5) |
| `00-meta-skills/skill-validator/scripts/validate-skills.mjs` | Modify | Check consistencia `SKILLS.md` ↔ `.atl/skill-registry.md` (nombre + path) |
| `.atl/skill-registry.md` | Modify | Regenerado; añade columna scope; excluye `_shared`, `skill-registry`, `sdd-*` |
| `AGENTS.md` | Modify | Regla de arranque (router antes de cada turno; orquestador para trabajo >1 archivo) + filas de categoría piloto |
| `SKILLS.md` | Modify | +9 skills del piloto |
| `openspec/config.yaml` | Modify | `artifact_store: hybrid` + convención de topic keys |
| `opencode.json` | Modify | `api_key` → `${CONTEXT7_API_KEY}` |
| `00-meta-skills/harness-map.md` | Modify | Cierra brechas #16 (Skill Resolution Feedback) y #4 (Execution Mode); documenta el punto de extensión RDD post-verify (doc-only, Slice 1) y el model routing diferido a Slice 2 |

`professional-planner/` y `frontend-design` NO se modifican (non-goals).

**Deferrido explícito (Slice 2)**: `01-planning-process/agents/` figura en las áreas afectadas de la propuesta ("separar los delegation triggers del contexto [APP] y fusionarlos en el orquestador"). Slice 1 NO la modifica: el `sdd-orchestrator` nuevo define sus propios triggers de delegación catálogo-nativos, y la separación/fusión de los triggers de `agents/` (hoy ligados a [APP]) queda explícitamente diferida a Slice 2 junto con la ola de contenido. No se elimina silenciosamente del alcance.

## Interfaces / Contracts

**Contrato de resultado por fase** (obligatorio, seis campos): `status` (`success|partial|blocked`), `executive_summary`, `artifacts`, `next_recommended`, `risks`, `skill_resolution` (`paths-injected|fallback-registry|fallback-path|none`). `blocked` sin dependencia satisfecha → el orquestador no avanza.

**Topic keys**: `sdd/{change}/{proposal|explore|spec|design|tasks|apply-progress|verify-report|archive-report|state}` — upsert por topic_key, nunca duplicar. En modo `engram` cada fase persiste vía `mem_save` con `capture_prompt: false` (obligatorio: artefactos de pipeline automatizados, no memoria humana). En modo `hybrid`, el archivo openspec y el `mem_save` (también con `capture_prompt: false`) llevan la misma versión. Recuperación SIEMPRE vía `mem_search` → `mem_get_observation` (contenido completo).

**Modelo de datos de la matriz** (`overlap-matrix.json`):

```json
{ "groups": [
    { "id": "figma", "canonical": "figma-implement",
      "members": ["figma-implement", "figma-mcp"] },
    { "id": "banana-image-gen", "canonical": "nano-banana",
      "members": ["nano-banana", "banana-claude"] }
] }
```

Regla de resolución: si ≥2 `members` de un grupo aparecen entre los top-4 del scoring, `primary = canonical`; los otros miembros permanecen en `secondary`/`tier1toLoad` (ambas skills se mantienen ruteables). Si solo puntúa el no-canonical, se respeta el scoring normal. Las 5 híbridas MCP se registran en la matriz como grupos unitarios con nota de delimitación de triggers (evitan falsos primarios contra `mcp-integration` y `design-system-tokens`).

**Entrada de registro**: `| nombre | descripción completa | scope | path exacto SKILL.md |` — el orquestador inyecta paths exactos en `## Skills to load before work`; nunca resúmenes digeridos.

## Bootstrap de un comando

1. `node 00-meta-skills/skill-sync/scripts/install-skills.mjs --target <ruta>` — ya existe; copia/enlaza a los directorios de los 10 agentes detectados (claude-code, opencode, cursor, copilot, codex, gemini-cli, antigravity, kiro, windsurf, deepseek); no falla si un agente no está.
2. Tras instalar, el agente lee `AGENTS.md` y encuentra la regla de arranque: (a) invocar `skill-router` antes de cada turno que pueda usar otra skill; (b) trabajo >1 archivo → `sdd-orchestrator`. Tier 0 siempre cargado; Tier 1 por `tier1toLoad`. Sin declaración manual del usuario.
3. Comportamiento idéntico OpenCode/Antigravity por D3: mismas skills y DAG; en Antigravity el orquestador ejecuta inline y persiste el estado entre fases en Engram (topic key `sdd/{change}/state`).

## Migration / Rollout

**Git recovery runbook (prerrequisito; requiere confirmación del usuario en apply)**. Diagnóstico verificado: `HEAD` y `config` contienen solo espacios en blanco (git reporta "not a git repository"), `refs/heads` y `refs/tags` vacíos, `index.lock` de 0 bytes presente. Pasos: (1) respaldar `.git` → `.git.corrupt-<fecha>` (sin borrar); (2) `git init` nuevo en la raíz del catálogo; (3) si `objects/` del respaldo contiene packs, intentar rescate copiando objetos + `git fsck --lost-found`; (4) commit inicial del árbol de trabajo actual; (5) `git status` limpio = recuperado. Comandos git mutantes SOLO tras confirmación explícita del usuario y SOLO sobre metadatos nuevos (nunca sobre el corrupto). Alternativa C si existe remoto: re-clone + copia del árbol de trabajo.

**API key Context7**: `opencode.json` reemplaza la key en texto plano por `${CONTEXT7_API_KEY}`; el usuario define la variable de entorno (Windows: env de usuario). Se recomienda rotar la key ya expuesta.

**Entrega (work units → PRs encadenados, stacked-to-main; guard de 400 líneas)**:

| WU | Contenido | Specs cubiertas |
|---|---|---|
| WU0 (pre-repo, sin PR) | Recuperación git (runbook + confirmación) | harness-bootstrap (git) |
| WU1 → PR-1 | Migración API key + rotación | harness-bootstrap (seguridad) |
| WU2 → PR-2 | `_shared/sdd-phase-common.md` + orquestador + fases init/explore/propose/spec/design | harness-orchestration, artifact-store-abstraction, rdd-extension-point (doc) |
| WU3 → PR-3 | Fases tasks/apply/verify/archive/onboard + doc de model routing (futuro) | harness-orchestration, model-routing-hooks (doc) |
| WU4 → PR-4 | `--emit-registry`, check de consistencia, regla de arranque AGENTS.md, SKILLS.md, config.yaml, harness-map | harness-bootstrap, skill-registry-protocol |
| WU5 → PR-5 | Lote piloto (9 skills) + overlap-matrix.json + hook del router + smoke tests + regen tier0 | catalog-content-wave, overlap-matrix |

## Testing Strategy

| Capa | Qué | Cómo |
|---|---|---|
| Unit (scripts) | Hook de matriz resuelve al primario correcto; matriz consistente (members existen, un canonical por grupo) | Fixtures `overlap-smoke-tests.json` con `skill-router.mjs --query --json`; assert primary |
| Integration | Piloto pasa spec agentskills.io; consistencia SKILLS.md ↔ registro; bootstrap detecta agentes | `validate-skills.mjs --strict` exit 0; `--emit-registry` + diff; `install-skills.mjs --target <proyecto-de-prueba>` |
| E2E | Piloto SDD: las 8 fases emiten contrato; modo hybrid escribe archivo Y Engram con la misma versión; arranque autónomo en OpenCode y Antigravity | Cambio de prueba end-to-end en proyecto de prueba |

## Threat Matrix

| Boundary | Aplicabilidad | Respuesta de diseño | RED tests |
|---|---|---|---|
| Documentation-like paths | N/A — solo se añaden SKILL.md y scripts .mjs ya existentes como patrón; no hay clasificación de ejecutables nueva | — | — |
| Git repository selection | **Applicable** — runbook opera `git init`/`git -C` sobre la raíz del catálogo | Autoridad: raíz del catálogo únicamente; comandos mutantes prohibidos sobre `.git` corrupto; respaldo previo obligatorio | Post-recuperación: `git -C <root> status` limpio; `git fsck` sin errores; ninguna mutación sobre `.git.corrupt-*` |
| Commit state | **Applicable** — commit inicial post-recuperación y flujo de PRs encadenados | Sin `commit -a` sobre índice corrupto; el `index.lock` huérfano queda dentro del respaldo (nunca se borra in-place); commits solo tras `git status` operativo | Verificar que el primer commit contiene el árbol completo; staged paths = paths revisados |
| Push state | N/A — sin automatización de push en Slice 1; remoto desconocido hasta recuperar | — | — |
| PR commands | N/A — la entrega es un sketch ejecutado por el orquestador con el usuario; no hay comando PR automatizado | — | — |

## Open Questions

- [ ] ¿Existe remoto git del catálogo? (decide entre alternativa C del runbook vs. historial nuevo) — confirmar con el usuario en apply.
- [ ] ¿Rotar la API key de Context7 ya expuesta en el archivo de trabajo? (recomendado: sí) — confirmar con el usuario en apply.
