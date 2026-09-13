# Tasks: skills-25-upgrade

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~2.710 escritas en total (generados excluidos del conteo: `catalog.json`, índices, copia del espejo, `.atl`) |
| 400-line budget risk | Low por PR tras split (High agregado pre-split) |
| Chained PRs recommended | Yes |
| Suggested split | PR0 → 1a → 1b → 2 → 3a → 3b → 4a → 4b → 5a → 5b (10 PRs, ≤400 cada uno) |
| Delivery strategy | ask-on-risk — cadena ya decidida por el usuario |
| Chain strategy | stacked-to-main |
| 800-line preflight budget | Covered by the split |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| WU0 | WIP 27 archivos + gate install-state | PR0 (~370) | `pnpm test` (15/15) | `install-skills --all-tools` + `check-install-state --strict` | revert de los 2 commits WU0 |
| WU1a | Manifiesto + generador | PR1a (~380) | `node --test test/manifest.test.mjs` | `generate-indexes.mjs --check` | revert del commit 1a |
| WU1b | Truth-up documental | PR1b (~200) | `validate-skills.mjs --strict` | `generate-indexes.mjs --check` | revert del commit 1b |
| WU2 | RDD activo | PR2 (~200) | `validate-skills.mjs --strict` | `gentle-ai review validate --gate post-apply` | revert del commit 2 |
| WU3a | Gates del validador | PR3a (~280) | `node --test test/validator-gates.test.mjs` | `validate-skills.mjs --strict` (209/209) | revert del commit 3a |
| WU3b | Evals + suites | PR3b (~320) | `pnpm test` | `scripts/run-evals.mjs --compare` | revert del commit 3b |
| WU4a | Provider custom | PR4a (~300) | suites provider (node:test) | `set-models --save-provider` + `apply.mjs --dry-run` | revert del commit 4a |
| WU4b | Tiers nativos | PR4b (~200) | suites roster (node:test) | `set-models.mjs --dry-run` | revert del commit 4b |
| WU5a | sync-addon + espejo | PR5a (~220) | `pnpm test:addon` | `sync-addon --write` + `--check` | revert del commit 5a |
| WU5b | doctor + MCP | PR5b (~240) | suites doctor (node:test) | `pnpm doctor` (PASS/FAIL) | revert del commit 5b |

Dependencias: WU0→WU1→WU2→WU3→WU4→WU5; WU5 consume manifiesto (WU1) y suites (WU3). Generados fuera del conteo de riesgo, incluidos en el snapshot de cada PR.

## WU0 — Espejo WIP + gate install-state (PR0, ~370) — `installer-lifecycle`

Gate: `validate-skills.mjs --strict` (209/209) · `pnpm test` (15/15) · `install-skills.mjs --dry-run --all-tools` (= conteo canónico) → `--all-tools` (manifest+backup) → `check-install-state.mjs --strict` PASS (missing=0, unregistered=0).

- [x] 0.1 Correr gates base sobre el árbol actual (incluye los 27 WIP): `validate --strict` + `pnpm test`; registrar evidencia para PR0.
- [x] 0.2 Crear `scripts/git-preflight.mjs`: `--paths` allowlist por WU, raíz por `__dirname`, rechaza staged fuera; sin `-A`/`commit -a`/`--no-verify`.
- [x] 0.3 Crear `scripts/check-install-state.mjs` (`--strict`): por runtime esperado/observado/faltantes, extraídas sin registro = error, ajenas = info; lee `.../.skills-install/manifest.json` (read-only).
- [x] 0.4 RED→GREEN `test/install-state.test.mjs`: staged fuera de allowlist → fail (fixture repo temporal); cwd ajeno → misma raíz; conteo divergente → fail con esperado/observado; extraída sin registro → fail; ajenas → info.
- [x] 0.5 Correr gate install-state: dry-run → `--all-tools` → `check-install-state --strict`; registrar salida por runtime.
- [x] 0.6 Commit 1 (WIP): los 27 archivos del preflight (14 canónicos + 13 espejo) vía `git-preflight --paths`; nada más entra (`openspec/` fuera).
- [x] 0.7 Commit 2: scripts + test de WU0. Cierre: RDD (`review validate --gate post-apply` → `--gate pre-commit` → `--gate pre-pr`) + PR0 (📍 WU0, Chain Context).

## WU1a — Manifiesto + generador de índices (PR1a, ~380) — `catalog-manifest`

Gate: `node --test test/manifest.test.mjs` · `generate-indexes.mjs --check` · `validate --strict`.

- [x] 1a.1 Crear `_shared/catalog-manifest.mjs`: walk/parse/build/diff compartido (raíz por `__dirname`; excluye `_shared/` y `gentle-ai-dsh/` del walk).
- [x] 1a.2 Crear `00-meta-skills/skill-registry/scripts/generate-indexes.mjs` (`--write|--check`): tablas de `SKILLS.md`, categorías de `AGENTS.md`, conteos en prosa; merge-preserve `note`/`autoInvoke`; valida Auto-Invoke contra manifiesto.
- [x] 1a.3 Generar `catalog.json` (`--write`): entrada por skill (name/path/category/tier0/note/autoInvoke) + totals/categories; total == entradas (scenario "Generación del manifiesto").
- [x] 1a.4 RED→GREEN `test/manifest.test.mjs` (fixtures temp): skill nueva sin manifiesto → falla señalando; índice divergente → falla con diff; regeneración idempotente → sin cambios.
- [x] 1a.5 Cierre: `--check` sin cambios; RDD + commit 1a + PR1a (📍).

## WU1b — Truth-up documental (PR1b, ~200) — `catalog-manifest`, `harness-orchestration`, `review-policy`

Gate: `generate-indexes.mjs --check` · `validate --strict`.

- [x] 1b.1 Verificar rename con evidencia (`gentle-ai --version`, listar `~/.claude/commands` (read-only), `sync --dry-run`); reemplazar menciones `/gentle-sdd-*` por NL-primario + "alias slash según runtime (2.7.0: `/sdd-*`)".
- [x] 1b.2 `AGENTS.md`: bullet NL-primero + gatekeeper auto "SEGUNDO fallo detiene y escala; sin tercer intento automático".
- [x] 1b.3 `sdd-orchestrator` (prohibir 3er reintento) y `gentle-orchestrator` retry ("2 fallos → reportar y parar") alineados — scenario "Segundo fallo escala y detiene".
- [x] 1b.4 Conteos == `totals.skills` en `SKILLS.md`, `AGENTS.md`, `README.md`, `openspec/config.yaml`, `00-meta-skills/harness-map.md` y docs del addon.
- [x] 1b.5 JD fuera de planning: `judgment-day` L112 + `catalog-usage` L62 + `gentle-ai-dsh/AGENTS.md` §1/§6 (JD = post-apply/pre-PR; guard 400/800 documentado).
- [x] 1b.6 Cierre: gates + RDD + commit 1b + PR1b. (commit 1dd91b6; review burned)

## WU2 — RDD activo (PR2, ~200) — `rdd-extension-point`, `review-policy`

Gate: `validate --strict` (paridad de espejo se valida recién en WU5a).

- [x] 2.1 Promover `review-ledger-contract.md` desde `gentle-ai-dsh/skills/_shared/review-ledger-contract.md` (read-only, hoy solo en el bundle) a `_shared/review-ledger-contract.md` canónico.
- [x] 2.2 `_shared/sdd-phase-common.md`: contrato RDD — chequeo de recibo post-apply por WU; retoma resuelve recibo sin re-review; sin recibo → acción del gate nativo, nunca presupuesto nuevo; opt-in intacto.
- [x] 2.3 `00-meta-skills/harness-map.md`: dos posiciones activas (post-apply, pre-archive) + lentes mapeables; el catálogo no ejecuta lentes.
- [x] 2.4 `02-dev-roles/rdd-defect-workflow/SKILL.md`: semántica opt-in (`review mode enable --scope global`), comandos nativos, punteros; `sdd-verify`/`sdd-archive` referencian el gate pre-archive.
- [x] 2.5 Cierre: gates + RDD + commit 2 + PR2. (Commiteado: `f22c970`; gates PASS registrados en `apply-progress.md`; PR2 a cargo del orquestador.)

## WU3a — Gates del validador (PR3a, ~280) — `skill-quality-gates`

Gate: `node --test test/validator-gates.test.mjs` · `validate-skills.mjs --strict` (209/209 real).

- [x] 3a.1 RED `test/validator-gates.test.mjs` (fixtures temp): 501 líneas → error strict / 500 → pasa; Tier 0 > ~2K → warning sin error; SKILL.md > ~5K → guidance; exclusión ausente → warning; `scripts/x.mjs` con `curl` → error y `.md` con `curl` → no error; `child_process` sin allowlist → error, con `allows-script-exec` → info.
- [x] 3a.2 Implementar en `validate-skills.mjs`: `skill-lines-budget`, `tier0-token-budget`, `skill-token-guidance`, `desc-exclusion` (warning; error en strict donde corresponde).
- [x] 3a.3 Implementar `manifest-*` (árbol↔manifiesto, huérfanas, tablas, conteos en prosa, Auto-Invoke) + `script-audit` (solo `scripts/`/`bin/` por extensión) + `requires-mcp-*` (top-level → error; sin fallback → error; paridad bidireccional).
- [x] 3a.4 Implementar `--check-deps`: `metadata.requires` (`bin:`, `env:`, `node:`) con fallback a `compatibility`; reporta skill/dependencia/causa; exit 1 si hay no satisfechas.
- [x] 3a.5 GREEN + cierre: suite verde, `--strict` 209/209; RDD + commit 3a + PR3a.

## WU3b — Evals + suites (PR3b, ~320) — `skill-eval-harness`

Gate: `pnpm test` verde (offline; jamás red ni modelo).

- [x] 3b.1 Crear `evals.json` en `skill-router`, `sdd-orchestrator`, `judgment-day`, `agent-roster` (≥2 evals reales; expectations `contains:`/`not-contains:`/`regex:`/`routes-to:`).
- [x] 3b.2 RED→GREEN `test/evals.test.mjs`: esquema inválido → falla señalando eval/campo; expectativa incumplida → suite roja; `routes-to` invoca `skill-router --query --json` real.
- [x] 3b.3 Crear `scripts/run-evals.mjs --live|--compare` (`EVAL_AGENT_CMD`; historial `evals/results/<ts>.json`), sin bloquear gate.
- [x] 3b.4 `package.json`: evals en `pnpm test` (offline) + script `test:addon`; cierre: gates + RDD + commit 3b + PR3b.

## WU4a — Provider custom (PR4a, ~300) — `model-routing`

Gate: suites provider (node:test, fixtures temp; jamás el home real).

- [x] 4a.1 `_shared/agent-roster/profiles.json`: bloque `providers` (`baseURL`, `apiKeyEnv`, `models`) + ajuste de `_shared/model-routing/profiles.schema.json`.
- [x] 4a.2 `set-models.mjs --save-provider <id> --base-url <u> --api-key-env <VAR> --models m1,m2 [--apply]`: persiste; nunca clave en claro.
- [x] 4a.3 `apply.mjs`: merge quirúrgico textual del bloque `"provider"` en opencode.json (brace-matching; `apiKey: "{env:<VAR>}"`; backup `.roster.bak-<ts>`; sin cambios no escribe); literales `DSH_*`; runtime sin soporte → limitación sin fallar.
- [x] 4a.4 RED→GREEN tests: guardar provider, inyección, backup, no-write sin cambios, degradación dsh. Cierre: gates + RDD + commit 4a + PR4a. (RED 6/6 fail → GREEN 7/7; gates PASS; commit en esta corrida.)

## WU4b — Tiers nativos + roster (PR4b, ~200) — `model-routing`

Gate: suites roster (node:test).

- [x] 4b.1 `_shared/agent-roster/roster.json`: tier por fase (`sdd-strong`/`sdd-mid`/`sdd-cheap`) + reasoning effort; `+sdd-research`; research y jueces strong; apply/fix mid.
- [x] 4b.2 Emitir args exactos `sync --profile`/`--profile-phase` (nombres nativos; sin motor propio) y documentar la no-duplicación.
- [x] 4b.3 Alinear `set-models.mjs`/`apply.mjs` a la nomenclatura (agentes 20+1) + tests de coherencia; cierre: gates + RDD + commit 4b + PR4b.

## WU5a — sync-addon + espejo (PR5a, ~220) — `installer-lifecycle`

Gate: `scripts/sync-addon.mjs --check` (primera corrida posible del gate install-state completo del design) · `pnpm test:addon` · `validate --strict`.

- [x] 5a.1 Crear `scripts/sync-addon.mjs --write|--check`: copia canónico→`gentle-ai-dsh/skills/`, paridad de conteo; `--check` falla ante edición directa del espejo.
- [x] 5a.2 `--write`: regenerar espejo (refleja canónicos WU1–WU4); `ISSUES.md` del addon.
- [x] 5a.3 Cierre: gates + RDD + commit 5a + PR5a.

## WU5b — doctor + MCP (PR5b, ~240) — `catalog-doctor`, `mcp-requirements`

Gate: `pnpm doctor` (PASS/FAIL) · `check-install-state --strict` · cadena completa de gates.

- [x] 5b.1 Crear `00-meta-skills/catalog-doctor/SKILL.md` + `scripts/catalog-doctor.mjs` (agrega validate `--strict --json`, install `--dry-run`, loader `--status`, manifest check, `--check-deps`, paridad MCP; read-only; argv de tabla constante; exit≠0 con causa).
- [x] 5b.2 RED→GREEN tests doctor: PASS exit 0; FAIL accionable exit≠0; sin efectos laterales (ningún archivo/manifest modificado).
- [x] 5b.3 Leer las 8 skills de `11-mcp-hybrid` (read-only) para confirmar ids/install; crear `mcp-manifest.json` (`servers[].requiredBy`).
- [x] 5b.4 Declarar `metadata.requires-mcp` + `metadata.mcp-fallback` solo donde hay servidor real (figma-mcp→figma); frontmatter agentskills.io (6 campos).
- [x] 5b.5 Verificar paridad MCP bidireccional + doctor como self-check post-instalación.
- [x] 5b.6 Cierre de cadena: `validate --strict` + `pnpm test` + install dry-run/real + `check-install-state --strict` + `sync-addon --check`; RDD + commit 5b + PR5b.

## Riesgos detectados en el diseño (no se re-planifica)

- `sync-addon.mjs --check` figura en el gate WU0 del design, pero el script nace en WU5a → primera corrida posible al cierre de WU5a.
- Proposal WU1 menciona "codegraph, failover"; specs/design no los cubren → sin tareas aquí; decidir como cambio aparte.
- Nombres de suites no fijados en design (WU0/WU4) → convención propuesta, ajustable en apply sin re-plan.
- `{env:VAR}` del provider a confirmar contra el build OpenCode del usuario (open question); fallback: documentar la env-var.
- Reinstalación `--all-tools` toca runtimes reales: manifest+backup obligatorios; ajenas no fatales.
