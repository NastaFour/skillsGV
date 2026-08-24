# Diseño: slice-2 — Media wave (3D + curaduría) y evolución del harness (E1–E5)

## Technical Approach

Dos olas en un cambio entregable por PRs encadenados. (a) Media: dos skills nuevas en `05-frontend/` siguiendo el patrón existente (cuerpo conciso + material en `references/*.md`), registro en los 3 índices el mismo PR. (b) Harness: los invariantes del kit (append-only, lock, hash de contrato, IDs idempotentes, ownership) se reimplementan como scripts Node dentro de las meta-skills ya existentes; E1 y la política E5 son configuración/documentación consumida por agentes LLM, no código runtime (precedente D6 de Slice 1: abstracción como protocolo documentado).

Restricción estructural: la propuesta fija contador 149→151 (solo las dos skills media). Por tanto NINGÚN entregable E1–E9 crea carpeta de skill nueva: viven como `scripts/` o `references/` dentro de `00-meta-skills/*`.

## Architecture Decisions

| # | Decisión | Alternativas rechazadas | Rationale |
|---|---|---|---|
| A1 (D1) | `05-frontend/three-js-web/`: `SKILL.md` + `references/{core-threejs,r3f-patterns,drei-helpers,performance-webgl,spline-no-code}.md` (5 facetas, cero enlaces huérfanos) | Skill por librería (solape forzado, triple registro); `09-media-graphics` (es raster, no WebGL) | three/R3F/drei es una cadena de dependencias usada como unidad; Spline como sección no-code, no skill aparte (spec) |
| A2 (D1) | Triggers frontmatter ≥4 chars: `["three.js","threejs","react-three-fiber","drei","webgl","3d scene"]` | `"3d"`, `"r3f"` como triggers | El router descarta triggers <4 (`MIN_TRIGGER_LENGTH`): nunca puntuarían. "3D"/"R3F" se cubren vía keywords de description y la nota del grupo unitario |
| A3 (D2) | `05-frontend/web-animation-sources/`: `SKILL.md` + `references/animation-sources.md` — exactamente 10 entradas agrupadas por tópico, formato `{título, autor/fuente, URL, propósito}`; triggers de búsqueda (`hover effects`, `loading animation`, `entrance animation`, `animate.css`) acotados para no competir como primario con motion-framer/micro-interactions | Archivo raíz compartido (no ruteable); repartir en skills de motion (las 10 no mapean 1:1) | Única opción descubrible por el router; respeta patrón por-skill; mitigación de rot: enlace curado con atribución, sin instrucciones embebidas |
| A4 (D3) | Mismo PR: `SKILLS.md` (tabla 05-frontend + contador 149→151), `AGENTS.md` (tabla + 2 filas Auto-Invoke), regen `.atl/skill-registry.md` con `skills-loader.mjs --emit-registry`; `overlap-matrix.json` grupo unitario `{id:"three-js-web", members:["three-js-web"], note}` delimitando contra motion-framer/motion-gsap/visual-effects; fixture en `overlap-smoke-tests.json`; contadores cosméticos en `harness-map.md` | Registrar en PR posterior (el validador `--strict` falla: `index-sync-missing-skill`, `registry-entry-missing`) | Gate `--strict` exige índices sincronizados en el mismo commit |
| A5 (D4) | `model-routing` como protocolo declarativo: `00-meta-skills/sdd-orchestrator/references/model-routing.md` (contrato de interfaz de catálogo) + `_shared/model-routing/profiles.schema.json` + `profiles.example.json`. Interfaz abstracta: `list()` (modelos visibles al runtime) / `resolve(phase)` (matchea alias del perfil contra el catálogo). Sin TUI, sin comandos, sin ejecutable | Skill nueva (rompe 149→151 y añade mantenimiento); script que consulte APIs de runtime (acoplamiento a proveedor) | El routing lo resuelve el agente LLM leyendo el catálogo expuesto por su runtime; mismo patrón que artifact-store-abstraction. Degradación: runtime sin catálogo → modelo default, limitación documentada |
| A6 (D5) | Corpus `00-meta-skills/skill-router/references/routing-corpus.jsonl`; línea: `{id, query, expectedPrimary, group?, source}`. Script nuevo `scripts/router-replay.mjs`: invoca el router vía `spawnSync(process.execPath, [routerPath, "--query", q, "--json"])` (args en array, sin `shell:true`, timeout), agrega `{total, exactMatches, accuracy, discrepancies:[{id,line,query,expected,got}]}` en orden estable (salida byte-idéntica entre corridas). Los casos de `overlap-smoke-tests.json` se migran al corpus; el fixture del grupo three-js-web entra también | Importar el router como módulo (refactor del CLI); LLM para evaluar queries (viola determinismo/offline) | Spawn aísla el contrato CLI existente sin tocar código validado; determinismo garantizado porque el router es puro |
| A7 (D6) | Journal en `00-meta-skills/sdd-apply/scripts/apply-journal.mjs` (módulo + CLI). Estado por cambio en `openspec/changes/{change}/journal/`: `snapshot.json` (`{version:1, change, contractHash, units:{[unitId]:{status,evidence}}, lastSeq}`), `events.jsonl` append-only (`{seq,type,unitId,payload,prevHash}`, una unidad = un evento con `\n` final para detectar escritura rota), `journal.lock` (creación exclusiva `wx` con PID+timestamp; lock huérfano >stale-timeout se recupera). IDs idempotentes: re-registrar `unitId` no muta snapshot ni efecto. Recuperación: al abrir, se hace replay de eventos sobre snapshot; línea final truncada se descarta y su unidad queda marcada `interrupted-retry` | Mantener merge en memoria (estado actual: un abort pierde trabajo); journal fuera de openspec/ | sdd-apply integra el journal en Pasos 5–6: cada tarea completada emite evento ANTES de marcar `[x]`; apply-progress persistido pasa a DERIVARSE del snapshot (el protocolo de merge del Paso 6 queda como capa de reporte, no como fuente de verdad — se endurece sin romperse) |
| A8 (D7) | Extender `install-skills.mjs`: manifest por generación en `<target>/.skills-install/manifest.json` `{generation, ts, tool, mode, entries:[{dest, src, sha256, prevState:"new"\|"overwritten", prevSha256?}]}`. Flags nuevos: `--uninstall` (elimina solo archivos cuyo hash actual coincide con el manifest; ajenos/editados se RETIENEN y listan; sin manifest → abort sin borrar nada), `--rollback` (revierte última generación: restaura prevSha o elimina si era nueva; rollback registrado en historial del manifest) | Uninstall por heurística de nombres (borraría archivos del usuario); copia del kit Bash (prohibido) | Dry-run ya existe y ya es no-mutante (todas las ramas de escritura están guardadas por `dryRun`) — se extiende para emitir el plan completo incluyendo sobrescrituras |
| A9 (D8) | `harness-map.md` nueva sección «Política de review»: disposición causal (solo lo introducido/empeorado bloquea; deuda preexistente → follow-up documentado) + perfiles opt-in (sin declaración → política base única). Reflejo SHOULD en `02-dev-roles/code-reviewer/references/review-policy.md`, consistente con el punto RDD | Nueva skill de review (rompe 149→151) | Fuente única de verdad en harness-map; la skill referencia, no duplica |
| A10 (D9) | `harness-map.md` sección «Punto de extensión AHE» junto al RDD: sidecars evaluator/debugger/evolver (responsabilidad + inserción propuesta post-verify), 4 niveles de evidencia (`static_contract`, `transcript_replay`, `live_smoke`, `manual_oracle`) con criterio de aplicación, nota explícita SIN mecanismo ejecutable + OPEN-1 diferido, relación con RDD (independientes) | Cualquier implementación (spec: MUST NOT) | Doc-only; detectar scope creep es criterio de verify |

## Data Flow

```
D5: corpus.jsonl ─▶ router-replay.mjs ─spawnSync─▶ skill-router.mjs --json ─┐
     (offline)          métricas agregadas ◀────────────────────────────────┘
D6: sdd-apply (tarea ok) ─▶ apply-journal: lock ▶ events.jsonl(+) ▶ snapshot.json
                                abort a mitad ─▶ replay al abrir ▶ interrupted-retry
D7: install-skills (--uninstall/--rollback) ─ lee .skills-install/manifest.json
     ─▶ borra/restaura SOLO entries con hash vigente; retiene ajenos
```

## File Changes

| Archivo | Acción | Descripción |
|---|---|---|
| `05-frontend/three-js-web/**` | Create | Skill 3D (A1) |
| `05-frontend/web-animation-sources/**` | Create | Skill curaduría (A3) |
| `SKILLS.md`, `AGENTS.md`, `.atl/skill-registry.md`, `harness-map.md` | Modify | Registro mismo PR + contadores (A4) |
| `00-meta-skills/skill-router/references/overlap-matrix.json` | Modify | Grupo unitario three-js-web (A4) |
| `00-meta-skills/skill-router/references/overlap-smoke-tests.json` | Modify | Fixture del grupo (A4) |
| `00-meta-skills/skill-router/references/routing-corpus.jsonl` | Create | Corpus replay (A6) |
| `00-meta-skills/skill-router/scripts/router-replay.mjs` | Create | Replay + métricas (A6) |
| `00-meta-skills/sdd-orchestrator/references/model-routing.md`, `_shared/model-routing/profiles.{schema,example}.json` | Create | E1 (A5) |
| `00-meta-skills/sdd-apply/SKILL.md` + `scripts/apply-journal.mjs` | Modify/Create | E3 (A7) |
| `00-meta-skills/skill-sync/scripts/install-skills.mjs` | Modify | E4 (A8) |
| `02-dev-roles/code-reviewer/references/review-policy.md` | Create | E5 (A9) |

## Testing Strategy

| Capa | Qué | Cómo |
|---|---|---|
| Unit | Router: query «3d scene three.js» → primary `three-js-web`; corpus bien formado (línea mala → número de línea) | `skill-router.mjs --json`; validador de corpus en el replay |
| Integration | Índices sincronizados; replay determinista (2 corridas byte-idénticas, 0 llamadas a modelos); journal recupera abort sin pérdida; installer dry-run no muta / uninstall retiene ajenos / rollback restaura | `validate-skills.mjs --strict` exit 0; `router-replay.mjs` ×2 + diff; simulación de escritura truncada en temp dir; instalación en `<temp>` con archivo ajeno plantado |
| E2E | Success criteria de la propuesta (los 7 checks) | Comandos de verificación del proyecto |

## Threat Matrix

| Frontera | Aplicabilidad | Respuesta / RED tests |
|---|---|---|
| Ejecución de subprocesos | **Aplicable** — `router-replay.mjs` hace spawnSync del router | Args en array sin `shell:true` (anti-inyección desde queries del corpus), timeout por caso, captura de exit code; RED: query con metacaracteres de shell no escapa ni corrompe ejecución |
| Operaciones destructivas de filesystem | **Aplicable** — uninstall/rollback borran/restauran archivos | Solo entries del manifest con hash vigente; sin manifest → abort exit≠0 sin borrar; RED: archivo ajeno plantado sobrevive al uninstall y figura como retenido |
| Shell/Bash | N/A — todo es Node puro (decisión binding del usuario) | — |
| Automatización VCS/PR | N/A — la entrega la maneja el orquestador | — |
| Clasificación de ejecutables / routing de rutas | N/A — el router ya existe; solo cambian datos JSON | — |

## Work Units (orden sugerido)

| WU | Contenido | Depende de |
|---|---|---|
| WU1→PR-1 | D1+D2 skills media + registro completo (D3) + matriz/fixture | — |
| WU2→PR-2 | D5 corpus + replay (incluye casos del fixture WU1) | WU1 |
| WU3→PR-3 | D6 journal + integración sdd-apply | — |
| WU4→PR-4 | D7 installer-lifecycle | — |
| WU5→PR-5 | Docs: D4 model-routing + delta hooks, D8 review-policy, D9 AHE doc-only en harness-map | WU1 (contadores) |

Desglose fino y forecast de 400 líneas: sdd-tasks.

## Migration / Rollout

Aditivo. Rollback por PR: eliminar carpetas/archivos nuevos y revertir diff de índices (regen `--emit-registry`). Para D7, el propio manifest habilita reversión verificable. Respaldo previo de `install-skills.mjs`, `overlap-matrix.json` y `harness-map.md`.

## Open Questions

None — OPEN-1 y OPEN-2 están resueltos por el usuario (doc-only / fuera de alcance) y no se reabren.
