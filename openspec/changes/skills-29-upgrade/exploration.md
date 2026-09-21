# Exploration: skills-29-upgrade — catálogo skillsGV → gentle-ai 2.9.1 (deltas 2.7 → 2.9.1)

> Fecha: 2026-09-14 · Fase: exploración previa a la propuesta · Almacén: hybrid (openspec + Engram)
> Evidencia: gates ejecutados en vivo (baseline verde), diff de assets instalados 2.9.1 vs catálogo, releases de GitHub 2.8.0→2.9.1, closures nativos de review recuperados de las sesiones OpenCode. El clon `C:\Users\j1347\gentle-ai` NO se usó (las releases API + assets instalados fueron suficientes); sigue en `a537c63` shallow.

## Estado actual (verificado con evidencia)

### Repo `C:\Users\j1347\Desktop\skills` @ `212d832` (main, working tree limpio)

| Gate | Resultado |
|---|---|
| `pnpm validate` | **210 pass · 0 with issues · 0 errors · 0 warnings · 214 info** (exit 0) |
| `validate-skills.mjs --strict` | **210 pass · 0 errors · 0 warnings · 214 info** (exit 0) |
| `generate-indexes.mjs --check` | 210 skills · 13 categorías consistentes (exit 0) |
| `sync-addon.mjs --check` | 210 skills en paridad byte a byte + `_shared/**` unión: 13 canónicos (presencia + byte-parity), 6 mirror-only permitidos (exit 0) |
| `pnpm test` | **87/87 pass** (exit 0) |
| `pnpm test:addon` | 3/3 pass (exit 0) |
| `pnpm doctor` (catalog-doctor) | 6/6 checks (exit 0) |
| `skills-loader.mjs --status` | cache 210 archivos · Tier 0 = 14 skills · `tier0-context.json` 5.0 KB |

### Runtime local (referencia 2.9.1, reinstalado hoy + `sync`)

- `gentle-ai --version` → **2.9.1**; `review mode status` → `on (decided by global)`; `sync --profile <name:provider/model>` y `--profile-phase <name:phase:model>` siguen existiendo (verificado en vivo).
- Assets refrescados por el `sync` de hoy (solo lectura, mtime 2026-09-14):
  - Batch 22:19 local — `AGENTS.md`, `commands/sdd-*.md` (9), `prompts/sdd/*.md` (11), `plugins/sdd-task-result-artifacts.ts`, `skills/_shared/*.md` (6), `sdd-research|propose|spec|tasks|apply|verify|archive/SKILL.md`, `sdd-verify/strict-tdd-verify.md`, `chained-pr/SKILL.md`, `work-unit-commits/SKILL.md`, `opencode.json`.
  - Batch 13:54 local — `sdd-init|explore|design|onboard/SKILL.md`, `judgment-day`, `go-testing`, `gentle-ai-bench`, `skill-creator`, `skill-improver`, `branch-pr`, `issue-creation`, `skill-registry`, `cognitive-doc-design`, `comment-writer`, `rdd-defect-workflow`, `systemic-issue-triage` (SKILL.md) + telemetría.
- Instalaciones consistentes con el conteo canónico 210: `~\.config\opencode\skills` = 211 directorios (210 skills + `_shared`), `~\.agents\skills` = 212 (210 + `_shared` + `.atl`), `~\.gemini\antigravity-cli\skills` = 26 (25 managed + `_shared`).
- `.atl/skill-registry.md` (69 KB, 2026-09-13 19:04, ignorado por git) declara "197 skills indexadas" — por contrato del emisor (excluye 12 `sdd-*` + `skill-registry`); NO es fuente de verdad. El conteo único sigue siendo `SKILLS.md`/`catalog.json` = 210.

## Fuentes y método

1. Releases API `v2.8.0`, `v2.8.1`, `v2.8.2`, `v2.9.0`, `v2.9.1` (fetch verificado) + releases previas para atribución.
2. Diff de contenido: assets instalados 2.9.1 vs skills del catálogo (hash por archivo, `git diff --no-index` para los archivos clave).
3. Closures nativos de los reviews quemados de `skills-25-upgrade` recuperados de la DB de OpenCode (`part`/`message`) — IDs, ubicaciones y severidades de los 14 findings advisory.

**Límite verificado**: los textos completos (claims) de 11 de los 14 findings NO son recuperables — el topic `sdd/skills-25-upgrade/review-findings` sufrió 3 revisiones por upsert y solo sobrevive la última (obs #470, WU3b). Sí se recuperaron IDs exactos, ubicaciones y severidades de los closures `gentle-ai.review-last-event-closure/v1` de las 4 lineages. Mitigación para este cambio: persistir cada finding como observación separada (no un topic acumulativo).

## Deltas 2.7.0 → 2.9.1 por área

### A. Contrato de review/RDD (2.8.0 + 2.9.0 + 2.9.1) — el delta mayor

El contrato vendoreado `_shared/review-ledger-contract.md` del catálogo (18.260 B, 69 líneas, hash `DDEB6349`) quedó **obsoleto** frente al instalado 2.9.1 (13.351 B, 95 líneas, hash `E227CE1E`): upstream lo reescribió de cero ("Native **Compact** Review Orchestration"). Cambios semánticos confirmados por diff:

- Secciones nuevas: Entry rule (preflight por candidato; el consent decide), Atomic lifecycle (4 pasos: preflight-only → freeze-once → stay-bound → acknowledge-exactly), Cross-repository lifecycle root (target anidado en repo B con retención de root), Capture and correction (`--input <path|->` para captures relayed), Consent reescrito.
- Tabla de stop codes reescrita: nuevos `managed_assets_outdated` (correr el `sync` del continuation), `unachievable_lens_slot` (re-run `review capture-unachievable --withdraw=true` o reducir scope); agrupación de terminales; `rdd_disabled` con matiz `--scope clone` vs `enable --scope global`.
- **Delivery**: los comandos `review validate`/gates pasan a ser "compatibility/informational only — never discover authority or decide delivery" (`invalidated/unmanaged` / `disabled/unmanaged`). El acknowledgement exacto quema autoridad (`gentle-ai.review-acknowledged/v1`) y commit/push/PR/release quedan fuera del lifecycle.
- Version de contrato: provider contract **1.2.0** (artefactos publicados congelados).

**Impacto en el catálogo (todos referencian la mecánica vieja)**: `_shared/review-ledger-contract.md` (re-vendor/adaptación), `_shared/sdd-phase-common.md` (§nota L96 + §G L132-149), `00-meta-skills/harness-map.md` (L88-94), `02-dev-roles/rdd-defect-workflow/SKILL.md` (L27/L33/L35/L75), `00-meta-skills/sdd-verify/SKILL.md` (L48), `00-meta-skills/sdd-archive/SKILL.md` (L49), specs `openspec/specs/rdd-extension-point/` y `review-policy/`.

### B. Chassis SDD (2.8.0 + 2.9.0)

Diff `_shared/sdd-phase-common.md` (instalado vs catálogo: **+84/−90**) — upstream cambió:

- **§B** reescrita: el orquestador inyecta store y locators desde `gentle-ai sdd-status --json --instructions`; prohibido re-detectar/branch por store; tabla de locators `openspec|engram|hybrid`; `<unresolved>` = blocker. Excepción nueva del collector `sdd-research` (no lee artefactos).
- **§C**: nueva regla `verify-report` — construir bytes exactos y correr `gentle-ai sdd-verify-validate` con conteos autoritativos ANTES de cualquier escritura; si el validador niega, cero escrituras.
- **§D**: contrato de validación de resultados de task — `gentle-ai sdd-task-result --phase <phase> --cwd <repo> --input <path|->`; fallas tipadas `sdd_task_result_empty|malformed`; handoff `GENTLE_AI_SDD_FAILURE` + `gentle-ai.sdd-task-result-failure/v1`; latch de sesión `sdd_task_dispatch_latched`; acks `background: true` de OpenCode no son terminales.
- **§E**: mismos 400 líneas; upstream NO incluye la nota de preflight 800 que el catálogo añadió (extensión propia del catálogo).
- **§F**: sin cambios semánticos (ejemplo apunta a `engram/protocol.md`).
- **§G**: upstream ELIMINÓ la sección (la integración RDD del catálogo no tiene contraparte directa en este archivo 2.9.1).

**Módulos shared nuevos del runtime, ausentes del catálogo** (verificado `Test-Path` = false): `_shared/sdd-status-contract.md` (15.592 B; status/instructions, change selection, `actionContext`, edit roots), `_shared/sdd-orchestrator-sections.md` (11.321 B; incluye el **Native SDD Dispatcher Guard** canónico), `_shared/persistence-contract.md` (11.145 B), `_shared/research-lifecycle.md` (2.563 B; contrato `gentle-ai.sdd-research/v1`). El catálogo solo vendoriza hoy `review-ledger-contract.md` + `sdd-phase-common.md` (+ `.mjs` propios).

### C. Skills `sdd-*` (drift skill por skill, catálogo vs instalado 2.9.1)

Los 12 `sdd-*` difieren (SKILL.md). Archivos presentes SOLO en el instalado:

| Archivo instalado | Tamaño | Referencia en el skill |
|---|---|---|
| `sdd-apply/strict-tdd.md` | 18.533 B | `sdd-apply` L128-137 (`STRICT TDD MODE → load strict-tdd.md`) |
| `sdd-verify/strict-tdd-verify.md` | 12.931 B | `sdd-verify` (strict-tdd ×2) |
| `sdd-verify/references/report-format.md` | 3.731 B | `sdd-verify` L101 |
| `sdd-design/references/threat-matrix.md` | 1.607 B | `sdd-design` L63/L134/L190/L195 (obligatoria para diseño con routing/shell/subprocess/VCS) |
| `sdd-init/references/init-details.md` | 7.809 B | `sdd-init` L59/L74 (descubrimiento acotado de roots) |

Semántica nueva confirmada en el instalado: `sdd-apply` L38 (status estructurado + `actionContext`), L62 (`workspace-planning` + `allowedEditRoots` vacíos → STOP), L163 (focused remediation como única excepción de `applyState: all_done`, con `failed_evidence_revision`); `sdd-verify` L42 (`sdd-verify-validate` antes de escribir), L67 (STOP workspace-planning); `sdd-archive` L107 (STOP workspace-planning); `sdd-design` (threat-matrix); `sdd-init` (init-details); `sdd-research` (collector output-only, `research-lifecycle`).

Parcialmente cubierto por el catálogo: `actionContext`/`workspace-planning` ya aparecen en `sdd-apply` L60, `sdd-verify` L57, `sdd-archive` L91 — pero sin el contrato `sdd-status-contract.md` que los define. Referencia huérfana: `sdd-apply/SKILL.md:125` cita "módulo strict-tdd (si existe en el catálogo)" y ese archivo no existe en el catálogo.

### D. Engram, tooling y plataforma

- **`ambiguous_project` (2.9.0)**: contrato de recuperación para session start y write tools, en el asset de protocolo Engram. Catálogo: 0 menciones en `01-planning-process/engram-integration/SKILL.md`, `AGENTS.md` y docs (verificado con grep).
- **Sync con config root symlinkeado (2.9.0)**: validación del runtime; nota documental opcional.
- **RTK (2.9.0)**: community tool opt-in, nunca por preset/detección; **Windows explícitamente no disponible**. Sin acción de catálogo; nota opcional en README/docs para no prometerlo.
- **Claude Code SDD dispatch (2.9.1)**: fix del hook (preflight derivado del transcript). Sin artefacto de catálogo.
- **Consent OpenCode sin control `custom` (2.9.1)**: instrucciones schema-aware en el runtime; el contrato compacto instalado ya refleja la relay de consent sin exigir `custom`.

### E. Docs y truth-up de versión

Citas "2.7.0 verificado" a actualizar a 2.9.1: `agent-roster/SKILL.md:58`, `gentle-orchestrator/SKILL.md:18`, `sdd-onboard/SKILL.md:218`, `sdd-orchestrator/SKILL.md:35`, `AGENTS.md:33`. Verificado en vivo que 2.9.1 conserva `sync --profile/--profile-phase` y que la superficie de comandos instalada ahora incluye `sdd-status` (además de `sdd-new|explore|continue|ff|status|init|apply|verify|archive|onboard|research`).

## Backlog findings advisory (14) — estado en el código actual

| # | ID | Sev. | Ubicación (revisada) | Estado hoy | Notas |
|---|---|---|---|---|---|
| 1 | R3-001 (WU1a) | WARNING | `_shared/catalog-manifest.mjs:557-560` | **Vivo** (líneas idénticas a `171c3f9`) | Claim no recuperable. Lectura propia (no del reviewer): el backfill de `autoInvoke` solo corre `if (!previous)` — no se re-deriva con manifest previo |
| 2 | R3-002 (WU1a) | WARNING | `_shared/catalog-manifest.mjs:131-138` | **Vivo** (idéntico) | Claim no recuperable. Lectura propia: `parseCatalogJson` devuelve `null` en error de parseo (falla silenciosa) |
| 3 | R3-003 (WU1a) | SUGGESTION | `generate-indexes.mjs:45` (hoy **L47**) | **Vivo** (desplazado +2 por `212d832`) | `--root` sin valor → `resolve(undefined)` lanza TypeError |
| 4 | R3-enable-scope-inconsistency (WU2) | SUGGESTION | `_shared/review-ledger-contract.md:31` | **Superado** por rewrite 2.9.1 | — |
| 5 | R3-post-apply-no-receipt-budget-contradiction (WU2) | WARNING | `_shared/sdd-phase-common.md:138` | **Vivo** | La línea existe sin cambios; §G entra en revisión por el rewrite |
| 6 | R3-rdd-disabled-enable-authority-ambiguity (WU2) | WARNING | `_shared/review-ledger-contract.md:31` | **Superado** por rewrite 2.9.1 | — |
| 7 | R3-stop-continuation-matrix-unproven (WU2) | WARNING | `_shared/review-ledger-contract.md:11` | **Superado** por rewrite 2.9.1 | La tabla nueva es más corta y agrupada |
| 8 | R3-001 (WU3a) | WARNING | `test/validator-gates.test.mjs:1-290` | Ubicación viva (hoy 304 líneas, 11 tests) | Claim no recuperable (finding a nivel archivo) |
| 9 | R3-002 (WU3a) | WARNING | `test/validator-gates.test.mjs:121-153` | Ubicación viva (test script-audit curl) | Claim no recuperable |
| 10 | R3-003 (WU3a) | SUGGESTION | `test/validator-gates.test.mjs:183-202` | Ubicación viva (test `--check-deps`) | Claim no recuperable |
| 11 | R3-004 (WU3a) | WARNING | `test/validator-gates.test.mjs:245-254` | Ubicación viva (helper `manifestFixture`) | Claim no recuperable |
| 12 | R3-live-reread-unchecked (WU3b) | WARNING | `scripts/run-evals.mjs:193-194` | **Vivo — verificado** | `readEvalJson` (`_shared/eval-harness.mjs:64-71`) devuelve `{ok:false}` sin `raw`; `runLive` desestructura sin check → `raw.evals` TypeError |
| 13 | R3-history-parse-unrecovered (WU3b) | WARNING | `scripts/run-evals.mjs:259-260` | **Vivo — verificado** | `JSON.parse(readFileSync())` sin try/catch en `runCompare` |
| 14 | R3-router-root-not-propagated (WU3b) | WARNING | `_shared/eval-harness.mjs:156-159` | **Vivo — verificado** | `spawnSync` sin `cwd: root`; `root` solo ubica el script del router |

- **11 findings vivos** (1, 2, 3, 5, 8, 9, 10, 11, 12, 13, 14), **3 superados** por el rewrite (4, 6, 7).
- Claims exactos solo para 12/13/14 (WU3b). Para 1-3 y 8-11 el fix propuesto debe re-derivarse con lectura fresca acotada — es trabajo de implementación, NO re-review de candidatos quemados.
- Tamaño estimado de cierre: WU3b ~15-25 líneas + tests; WU1a ~15-25; WU3a ~20-40 (re-derivación incluida).

## Optimizaciones acotadas (priorizadas por impacto/costo)

1. **Backlog advisory (arriba)** — impacto alto, costo bajo (~70-110 líneas con tests). Es el único trabajo con defectos concretos verificables.
2. **Contrato review/RDD 2.9.1 (área A)** — impacto alto (hoy el catálogo describe gates como decisores de entrega; el binario declara lo contrario), costo medio. Slice propia.
3. **Tensión `.atl/skill-registry` (obs #465)** — costo bajo: documentar la regla "en este repo usar `pnpm registry:sync`; `gentle-ai skill-registry refresh` escribe paths absolutos y rompe `--strict` (392 `registry-entry-path-mismatch`)". Alternativa (tolerancia en el validador) es más riesgosa; no urgente.
4. **Espejo `_shared` al añadir módulos nuevos** — costo bajo: `sync-addon.mjs --write` copia automáticamente (unión); verificar con `--check` en el mismo PR. No requiere código.
5. **Follow-ups residuales de `catalog-doctor`** (self-check del instalador; `--root` parcial en `installer-dryrun`/`loader-status`) — documentados en el ledger del change anterior; costo medio-real, urgencia baja.
6. **Notas de superficie/plataforma** — `/sdd-status` en la doc de arranque, RTK "Windows no disponible, opt-in", symlink de sync. Costo bajo.

## Áreas afectadas

- `_shared/review-ledger-contract.md`, `_shared/sdd-phase-common.md` (+ eventual alocación de `sdd-status-contract.md`, `sdd-orchestrator-sections.md`, `persistence-contract.md`, `research-lifecycle.md`).
- `00-meta-skills/`: `sdd-*` (12 SKILL.md + refs/módulos), `harness-map.md`, `gentle-orchestrator`, `agent-roster`, `skill-registry`, `catalog-doctor` (optimización).
- `02-dev-roles/rdd-defect-workflow`, `sdd-verify`/`sdd-archive` (gate pre-archive).
- `01-planning-process/engram-integration` (`ambiguous_project`), `AGENTS.md` raíz, `README.md`, `SKILLS.md`, `openspec/config.yaml` (rules/atribuciones), `openspec/specs/{rdd-extension-point,review-policy,harness-orchestration}` (deltas).
- `scripts/run-evals.mjs`, `_shared/eval-harness.mjs`, `test/validator-gates.test.mjs` (backlog), `scripts/sync-addon.mjs` (verificación), `gentle-ai-dsh/` (espejo regenerado por WU).

## Enfoques (decisiones abiertas para la propuesta)

1. **Adopción de contratos upstream**: A) byte-exacto en inglés (como el actual `review-ledger-contract.md`); B) adaptación en español (como `sdd-phase-common.md`); C) punteros al runtime sin vendorizar. Mixto es viable: contratos de orquestador byte-exacto, docs de catálogo en español.
2. **§G del catálogo**: A) mantener como extensión propia reescrita al contrato compacto (dos posiciones activas en términos "informational gates"); B) eliminarla y delegar 100% en el contrato. A es coherente con la spec `rdd-extension-point`.
3. **Módulos shared nuevos**: A) vendorizar los 4; B) subconjunto mínimo (`sdd-status-contract.md` + `research-lifecycle.md`) y punteros; C) solo §B/§D absorbidas en `sdd-phase-common.md`. B balancea valor/costo.
4. **Alineación `sdd-*`**: A) deltas semánticos seleccionados (refs + contratos nuevos); B) re-vendor completo (arrastra idioma); C) re-vendor solo los módulos TDD + refs y dejar SKILL.md como está salvo punteros. Dado `strict_tdd: false` a nivel repo, los módulos TDD son candidatos a diferirse.
5. **`sdd-status` como skill**: A) sin skill (contrato + doc); B) skill nueva → impacto en 210 (4 superficies + espejo + instaladores). A por defecto.
6. **Superación de findings 4/6/7**: A) cerrar como "superados por rewrite 2.9.1" en la propuesta; B) re-verificar contra la semántica nueva antes de cerrar. A con nota de evidencia.

## Estructura de slices recomendada

| WU | Alcance | Líneas est. | PR |
|---|---|---|---|
| WU1 | Review/RDD 2.9.1: re-vendor/adaptación del contrato + §G + `harness-map` §RDD + `rdd-defect-workflow` + `sdd-verify`/`sdd-archive` + delta specs | ~220–300 | PR1 |
| WU2 | Chassis: `sdd-phase-common` (B/C/D/E/G) + reglas de harness en `AGENTS.md` + truth-up 2.9.1 (versiones, `/sdd-status`) | ~230–300 | PR2 |
| WU3 | Contratos shared nuevos elegidos (min. `sdd-status-contract` + `research-lifecycle`) + delta `sdd-research` + punteros en orquestadores | ~350–500 → candidato a chain 3a/3b | PR3 |
| WU4 | `persistence-contract` + `sdd-orchestrator-sections` (decisión vendor vs puntero) | ~200–550 | PR4 |
| WU5 | Alineación `sdd-*` (deltas semánticos + refs `threat-matrix`/`init-details`/`report-format`; módulos TDD según decisión) | ~300–1.100 → chain por grupos | PR5+ |
| WU6 | Backlog advisory: WU3b (3) + WU1a (3) + WU3a (re-derivar/fix) | ~70–110 | PR6 |
| WU7 (opcional) | Optimizaciones: regla registry + follow-ups doctor + notas docs/RTK | ~40–80 | PR7 |

Total ~1.400–2.900 líneas autoradas según profundidad elegida (generados — `catalog.json`, espejo, `.atl` — fuera del conteo de riesgo). Con `ask-on-risk`: WU1/WU2/WU6 caben en 400; WU3/WU4/WU5 requieren chain o `size:exception`.

## Riesgos

- **Contrato rewrite desalineado**: tocar `review-ledger-contract` + §G + `harness-map` + skills + specs en el mismo slice; si se parte, el catálogo queda un tiempo con dos semánticas contradictorias.
- **Claims perdidos (WU3a/WU1a)**: riesgo de "arreglar" algo distinto al finding original; mitigación: re-derivación acotada con lente fresca de implementación (no re-review) y evidencia en el PR.
- **Idioma/registro**: mezclar contratos EN byte-exacto con docs ES puede confundir; decidir contrato idiomático por archivo en la propuesta.
- **Conteo 210**: cualquier skill nueva rompe 4 superficies + espejo + instaladores; gobernar con decisión explícita (recomendado: no añadir skills en este cambio).
- **Espejo/espejo-unión**: al vendorizar `_shared` nuevos, correr `sync-addon --write` en el mismo PR y dejar `--check` en el gate.
- **Plataforma**: RTK no disponible en Windows y sin binarios oficiales Windows (Go install); no prometer tooling no soportado en docs.
- **Presupuesto**: el alcance máximo no cabe en un solo PR; el forecast por WU debe declararse ANTES de apply (guard 400/800).

## Preguntas para la ronda de propuesta

1. ¿El contrato de review se re-vendoriza byte-exacto (EN) o se adapta a ES como el resto de `_shared/`?
2. §G: ¿se mantiene como extensión propia reescrita al contrato compacto, o se elimina y se delega todo al contrato?
3. Módulos shared nuevos: ¿los 4, el subconjunto `sdd-status-contract` + `research-lifecycle`, o solo las secciones B/C/D absorbidas?
4. `sdd-*`: ¿deltas semánticos seleccionados o re-vendor completo? ¿Se incluyen los módulos TDD (`strict-tdd.md`, `strict-tdd-verify.md`) pese a `strict_tdd: false`?
5. ¿Se documenta `sdd-status` como contrato sin skill (sin tocar el conteo 210)?
6. Findings 4/6/7 de WU2: ¿se cierran como superados por el rewrite 2.9.1 con nota de evidencia?
7. Backlog WU3a sin claims: ¿se acepta re-derivación acotada como trabajo de implementación (sin re-review)?
8. ¿Las optimizaciones 3-6 (registry, doctor, notas RTK/symlink) entran en este cambio o se difieren?

## Ready for Proposal

**Sí** — baseline verde verificado en vivo, deltas 2.7→2.9.1 mapeados por área con evidencia (releases + diff de instalados + grep de ausencias), backlog de 14 findings clasificado (11 vivos / 3 superados, claims recuperados donde existen y motivo documentado donde no), y slices candidatos con estimaciones que caben en el presupuesto con `ask-on-risk`/chain. El orquestador debe presentar las preguntas de arriba antes de `sdd-propose`.
