# Alineación skillsGV → gentle-ai v4.0.0 (ODD único) — feature doc (ODD)

- **Estado**: en curso (branch `feat/odd-v4-alignment`)
- **Fecha**: 2026-10-07
- **Mirror Engram**: OK (`obs-985e9153d6e50b2e`, id 541, project `skills-catalog`, topic `odd/gentle-ai-v4-odd-alignment/tasks`)

## Objetivo

Que el catálogo deje de ser "SDD con parches ODD" y quede **alineado a gentle-ai v4.0.0**, donde ODD es el **único** flujo y SDD/OpenSpec están retirados. El catálogo pasa a ser **capa de conocimiento**; el proceso lo manda gentle-ai (o, sin gentle-ai, una sola skill fallback `odd-workflow`).

## Hechos verificados (fuentes)

| Hecho | Fuente |
|---|---|
| v4.0.0 (2026-10-01): "ODD becomes the only development workflow as SDD and OpenSpec retire" | [release v4.0.0](https://github.com/Gentleman-Programming/gentle-ai/releases/tag/v4.0.0) |
| v4.0.0 elimina `sdd-status`, `sdd-continue`, `sdd-attempt`, `sdd-archive-compose`, `sdd-task-result`, `sdd-preflight-hook`, `--sdd-mode` | idem |
| v4.0.0: delegación por *evidence budget*: inline solo si la evidencia cabe en 1 batch paralelo (≤3 llamadas, ~10k tokens); si no, 1 explorer devuelve handoff `path:line` | idem |
| v4.0.0: test-first instalado por defecto (TDD estricto deja de ser opción aparte) | idem |
| v3.5.0: RDD pasa a **default on**; se apaga con `gentle-ai review mode disable` | [releases](https://github.com/Gentleman-Programming/gentle-ai/releases) |
| Binario local: `gentle-ai 4.0.0` (actualizado y sincronizado) | `gentle-ai --version` |
| RDD local: `on (decided by global)` | `gentle-ai review mode status` |

## Diagnóstico: dónde el catálogo todavía es SDD (verificado)

| Archivo | Problema |
|---|---|
| `00-meta-skills/skill-router/scripts/skill-router.mjs:243` | `needsSDD = 2+ categorías` → casi todo da `true`. Contradice ODD. |
| `00-meta-skills/sdd-*` (12 skills) + `_shared/sdd-phase-common.md` | Pipeline SDD completo, vivo e instalable. Upstream lo retiró. |
| `00-meta-skills/sdd-orchestrator/SKILL.md:35,40` | Dice que `sdd-status`/`sdd-continue` son la autoridad (eliminados en 4.0). |
| `professional-planner/SKILL.md:3,19,103,136` | "Activa SDD… cuando toca 2+ archivos"; dod-checker **MANDATORY**. |
| `00-meta-skills/gentle-orchestrator/SKILL.md:43-53` | Tabla de fases SDD con modelo por fase. (L18/L35 ya dicen ODD 4.0: inconsistente consigo mismo.) |
| `AGENTS.md:28,113,232` + ciclo "9 agentes con SDD" + tríada SDD/TDD/RDD | Mezcla 3.x, SDD-opcional y ciclo obligatorio. |
| `README.md:3,77,85,87,91,133,144,194,206-212` | "harness SDD nativo", Tier 0 con professional-planner, model routing por fase SDD. |
| `02-dev-roles/judgment-day/SKILL.md:29,33` | Se engancha "después de `sdd-apply`". |
| `06-code-quality/work-unit-commits/SKILL.md:24,36,69-78`, `chained-pr/SKILL.md:16,37` | Forecast de entrega atado a `sdd-tasks`. |
| `00-meta-skills/skill-loader/SKILL.md:3,72` | Tier 0 = "SDD gates, DoD…" e incluye professional-planner. |
| `00-meta-skills/agent-roster` + `test/agent-roster-tiers.test.mjs` | Tiers `sdd-strong/mid/cheap` y phases SDD. |
| `00-meta-skills/skill-validator/scripts/validate-skills.mjs:558` | Lista `openspec/config.yaml` como archivo del catálogo. |
| `test/validator.test.mjs:9` | `/228 pass/` hardcodeado: se rompe al agregar `odd-workflow`. |

**Lo que ya está bien y NO hay que romper**: `_shared/bootstrap-kernel-minimal.md` (defiere el proceso a gentle-ai), la inyección idempotente del kernel, `odd/tasks/` existente, las reglas de delegación de `gentle-orchestrator` L20-35.

## Decisión de producto

- **Decisión acordada**: **deprecar con redirect** las 12 `sdd-*` y `professional-planner` usando el mecanismo existente (`deprecated` + `redirect`).

## Restricciones (para el ejecutor)

- **pnpm only**; nunca `npm`/`npx`.
- **No editar `gentle-ai-dsh/` a mano**: regenerar con `node scripts/sync-addon.mjs --write` cuando `test/sync-addon.test.mjs` falle por paridad.
- **No borrar** skills, `openspec/` ni `odd/tasks/*` existentes. Deprecar o marcar como histórico.
- **No inventar** comandos de gentle-ai: solo los listados en "Hechos verificados".
- Commits: Conventional Commits, **sin** "Co-Authored-By" ni atribución de IA. Un commit por tarea, en branch `feat/odd-v4-alignment`.
- Idioma de artefactos: el del archivo que se edita (el catálogo usa español neutro en docs de proceso).
- ~400 líneas por tarea es orientativo, no un tope.

## Configuración ODD

- **TDD**: modo no configurado explícitamente en el repo → **off (checks funcionales)**. Runner: `pnpm test` (`node --test test/**/*.test.mjs`). Fuente: `package.json`.
- **RDD**: `on` (global). Tras cada commit: `gentle-ai review assess --cwd . --committed-only --base-ref origin/main --json` y seguir `next_transition.command` si `review_due` es true. Si el binario no lo soporta, registrar "unavailable" y tratar el commit como due (no inventar aprobación).
- **Entrega**: forecast ~1.800–2.500 líneas → supera 400. Estrategia `ask-on-risk`: cadena en feature branch (`feature-branch-chain`). Slices sugeridos: PR-A = T1–T5, PR-B = T6–T8, PR-C = T9–T11.
- **Checks por tarea** (siempre): `pnpm test` y `pnpm validate:strict`. Registrar comando + resultado en este doc.

## Tareas

- [x] **T0 — Actualizar gentle-ai a 4.0.0** (Completado: `gentle-ai 4.0.0`, `gentle-ai sync` ejecutado).
- [x] **T1 — Baseline + feature doc**
- [x] **T2 — Conteo de skills dinámico en tests**
- [x] **T3 — Skill fallback `odd-workflow`**
- [ ] **T4 — Kernels (full & minimal)**
- [ ] **T5 — Router sin `needsSDD`**
- [ ] **T6 — Deprecar SDD con redirect**
- [ ] **T7 — Docs de proceso: AGENTS.md, README.md, harness-map**
- [ ] **T8 — Skills de rol desacopladas de SDD**
- [ ] **T9 — Roster y model routing alineados a roles ODD**
- [ ] **T10 — Validador y openspec histórico**
- [ ] **T11 — Espejo sync-addon, release y verificación final**

## Progreso / evidencia

### T0: Actualización a gentle-ai 4.0.0
- Comando: `go install github.com/gentleman-programming/gentle-ai/v4/cmd/gentle-ai@latest`
- Resultado: exit code 0.
- `gentle-ai --version`: `gentle-ai 4.0.0`
- `gentle-ai sync`: 49 files changed, exit code 0.

### T1: Baseline + feature doc
- Rama: `feat/odd-v4-alignment`
- Feature doc: `odd/tasks/gentle-ai-v4-odd-alignment.md`
- Engram mirror: `obs-985e9153d6e50b2e` (id 541, project `skills-catalog`, topic `odd/gentle-ai-v4-odd-alignment/tasks`)
- `pnpm test`: 12 test suites PASS, 0 failures.
- `pnpm validate:strict`: 228 pass · 0 with issues (0 errors, 0 warnings).
- Route: direct inline.

### T2: Conteo de skills dinámico en tests
- Modificados: `test/validator.test.mjs`, `test/catalog-integrity.test.mjs`.
- Comportamiento: `test/validator.test.mjs` valida `(\d+) pass · 0 with issues` (asegurando count >= 200 y 0 errors), desacoplándolo del número exacto. `test/catalog-integrity.test.mjs` compara el recuento real contra `catalog.json`.
- `pnpm test`: 111 tests PASS (0 failures, 12 suites).
- Route: direct inline.

### T3: Skill fallback `odd-workflow`
- Creada: `00-meta-skills/odd-workflow/SKILL.md` (con precedencia explícita sobre gentle-ai, 7 pasos ODD, estructura de feature doc, evidence budget y delivery/RDD/TDD).
- Sincronizados índices: `catalog.json`, `SKILLS.md`, `AGENTS.md`, `.atl/skill-registry.md`, `README.md`, `openspec/config.yaml`, `00-meta-skills/harness-map.md`, espejo `gentle-ai-dsh`. Total: 229 skills.
- `pnpm validate:strict`: 229 pass · 0 with issues (0 errors, 0 warnings).
- `pnpm test` + `pnpm test:addon`: 111 + 3 tests PASS (0 failures).
- Router test: `pnpm router --query "implementar feature multi archivo"` resuelve `"primary": "odd-workflow"`, `"confidence": 1`.
- Route: direct inline.
