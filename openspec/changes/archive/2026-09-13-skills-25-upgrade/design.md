# Design: skills-25-upgrade

> Inputs: proposal + 10 specs (5 nuevos, 5 deltas) + research rev3 + exploration. Evidencia viva verificada: `gentle-ai 2.7.0` con `sync --profile/--profile-phase`; `review mode status` = **on (global)**; completitud runtime 162–206/209; sin `/gentle-sdd-*` instalado (assets 2.7.0 = `/sdd-*` en `~/.claude/commands`); opencode.json con `provider.humain` (`options.baseURL`).

## Enfoque técnico

Fuente única declarativa (`catalog.json`) + gates mecanizados en el validador + harness de evals + integración con el binario nativo (RDD, perfiles, mirror). Todo con Node puro, pnpm-only, Windows-first; ningún gate escribe salvo `--write`/`--apply` explícito. El catálogo conserva la gobernanza cognitiva; el binario conserva la mecánica determinista.

## Decisiones de arquitectura

| Decisión | Opciones | Elección y rationale |
|---|---|---|
| Fuente de conteos/índices | (a) compensar con index-sync; (b) manifiesto generado `catalog.json` | **(b)**. El drift 197/206/208/209 es evidencia de fallo del modelo (a). `catalog.json` generado por walk (misma lib compartida) y consumido por validador, generador de índices, doctor y check de instalación. |
| Generación de índices | (a) regenerar todo, incl. Auto-Invoke; (b) generar tablas + validar Auto-Invoke | **(b)**. Genera: tablas de `SKILLS.md`, tabla de categorías de `AGENTS.md`, conteos en prosa. Verifica: entradas del Auto-Invoke existen en manifiesto. El Auto-Invoke es prosa acción→skill; generarlo completo inventaría formato. |
| Preservación de datos curados | (a) sobrescribir; (b) merge-preserve | **(b)**. El generador preserva `note`/`autoInvoke` por skill; las nuevas entran con defaults. |
| Ubicación de la lib compartida | (a) duplicar walk en cada script; (b) `_shared/catalog-manifest.mjs` | **(b)**. Walk/parse/compare únicos evitan que validador, loader, generador y doctor discrepen sobre qué es una skill. |
| Gates de calidad en validador | (a) script aparte; (b) extender `validate-skills.mjs` | **(b)**. Un solo gate ejecutable (`--strict`) + flags (`--check-deps`); reglas severidad warning por defecto y error en strict (mecanismo existente). |
| Eval runner | (a) runner con LLM en CI; (b) node:test determinista + modo live opcional | **(b)**. `pnpm test` nunca depende de red ni de un modelo; `contains/not-contains/regex/routes-to` se evalúan offline (`routes-to` invoca skill-router real); `--live/--compare` documentado con historial sin bloquear el gate. |
| `requires-mcp` | (a) campo top-level; (b) anidado en metadata | **(b)** (spec agentskills.io: 6 campos permitidos). `metadata.requires-mcp` + `metadata.mcp-fallback`; top-level = error. |
| Doctor | (a) orquestar `pnpm` scripts; (b) meta-skill nueva `catalog-doctor` | **(b)**. Solicita `validate --strict --json`, `install --dry-run`, `loader --status`, manifest check, `--check-deps`, paridad MCP; read-only (solo modos no mutantes, argv construidos desde tabla constante testeable). |
| RDD | (a) motor propio; (b) contrato sobre el recibo nativo | **(b)**. Verifica existencia/validez con comandos nativos; nunca abre presupuesto; opt-in intacto. |
| Model routing (canónico) | (a) motor propio por fase; (b) perfiles nativos `sync --profile-phase` | **(b) para perfiles de fase** (spec prohíbe duplicar su mecánica; flags verificados en 2.7.0). El catálogo declara fases con nombres nativos `sdd-strong/sdd-mid/sdd-cheap` y **emite** los args exactos de `sync`; no los aplica. Para el tier de los 20+1 agentes, `set-models/apply.mjs` sigue siendo el mecanismo (parchea `agent.<n>.model` y preset dsh), alineado a la misma nomenclatura. |
| Install-state | (a) conteo crudo por runtime; (b) registro vs manifiesto | **(b)**. Los runtime dirs contienen skills gestionadas por gentle-ai y ajenas; el conteo crudo no es comparable. PASS = todas las skills del manifiesto presentes + ninguna skill del catálogo extraída sin registro en `.skills-install/manifest.json`; ajenas = listadas, no fatales. |

## Interfaces / contratos

**`catalog.json`** (raíz, generado, commiteado):
```json
{ "version": 1,
  "totals": { "skills": 209 },
  "categories": [{ "id": "00-meta-skills", "title": "Meta-Skills", "count": 25 }],
  "skills": [
    { "name": "skill-router", "path": "00-meta-skills/skill-router/SKILL.md",
      "category": "00-meta-skills", "tier0": true, "note": "← …", "autoInvoke": true }
  ] }
```
Campos derivados del frontmatter/tree: `name`, `path`, `category`, `tier0` (set del loader). Campos preservados: `note`, `autoInvoke`. CLI: `generate-indexes.mjs --write|--check` (`pnpm manifest:sync|manifest:check`).

**Reglas exactas del validador** (nuevas):
| Check | Regla | Severidad |
|---|---|---|
| `skill-lines-budget` | líneas del body (frontmatter excluido, sin la última línea vacía) `> 500` → warning (error en strict). 500 exactas pasan. | warning/strict-error |
| `tier0-token-budget` | `ceil(len(tier0-context.md)/4) > 2048` → warning; si el archivo no existe, estimar desde las 14 descriptions del set (misma fórmula del loader). | warning |
| `skill-token-guidance` | `ceil((front+body)/4) > 5120` → guidance/warning. | warning |
| `desc-exclusion` | description sin marcador de exclusión (`Do NOT use`, `Don't use`, `not for`, `no usar`, `no para`) → warning. Nunca error. | warning |
| `manifest-*` | skill en árbol ausente del manifiesto / entrada huérfana / tablas `SKILLS.md` o categorías `AGENTS.md` ≠ manifiesto / conteos en prosa (`SKILLS.md`, `AGENTS.md`, `README.md`, `openspec/config.yaml`, `harness-map.md`, docs del addon) ≠ `totals.skills` / referencias Auto-Invoke fuera del manifiesto → error con diff resumido. | error |
| `script-audit` | en `<skill>/scripts/**` + `<skill>/bin/**` (.mjs/.js/.cjs/.ps1/.sh/.py): `curl`, `eval(`, `new Function(`, `child_process` → error salvo allowlist frontmatter `allows-curl: <motivo>` / `allows-script-exec: <motivo>` (demota a info). No escanea docs/`references` (fences no son código). | error/info |
| `requires-mcp-*` | `requires-mcp` top-level → error; `metadata.requires-mcp` sin `metadata.mcp-fallback` → error; paridad bidireccional con `mcp-manifest.json` (`servers[].requiredBy`) → error. | error |

`--check-deps`: resuelve `metadata.requires` (lista `bin:<n>`, `env:<NAME>`, `node:>=20`); sin campo, best-effort sobre `compatibility` (`Node \d+\+`, `pnpm \d+\+`). Reporta skill/dependencia/causa; exit 1 si hay no satisfechas. Fuera de `--check-deps` no corre.

**`evals.json`** (por skill, `<skill>/evals.json`): `{ "evals": [{ "id", "prompt", "files": [], "expected_output", "expectations": [] }] }`, ≥2 evals. `expectations`: `contains:`, `not-contains:`, `regex:`, `routes-to:<skill>`. Runner `test/evals.test.mjs` (node:test): valida esquema + evalúa offline (`routes-to` contra `skill-router --query <prompt> --json`; el resto contra `expected_output` como sanity estática). `scripts/run-evals.mjs --live|--compare` ejecuta contra agente configurado (`EVAL_AGENT_CMD`), con historial en `evals/results/<ts>.json`. Top skills iniciales: `skill-router`, `sdd-orchestrator`, `judgment-day`, `agent-roster`. CI hook: incluido en `pnpm test` (solo modo offline).

**`mcp-manifest.json`** (raíz): `{ "version": 1, "servers": { "figma": { "purpose": "…", "install": "figma --url https://mcp.figma.com/mcp", "spec": "https://…", "requiredBy": ["figma-mcp"] } } }`. Skills `11-mcp-hybrid` (8): declaran `metadata.requires-mcp: ["<serverId>"]` + `metadata.mcp-fallback:"<condición → acción degradada → límite; el pipeline no falla>"` solo si su SKILL.md referencia un servidor real (ej. `figma-mcp`→`figma`); ids/install exactos se confirman leyendo cada skill en WU5.

**Provider custom** (en `_shared/agent-roster/profiles.json`):
```json
"providers": { "opencode-go": { "baseURL": "https://…", "apiKeyEnv": "OPENCODE_GO_API_KEY", "models": ["…"] } }
```
`set-models.mjs --save-provider <id> --base-url <u> --api-key-env <VAR> --models m1,m2 [--apply]` persiste (nunca la clave en claro). Inyección opencode (en `apply.mjs`): merge quirúrgico textual del bloque `"provider"` (brace-matching, misma técnica que `agent`), insertando/actualizando `"<id>": { "options": { "baseURL": …, "apiKey": "{env:<VAR>}" }, "models": {…} }`; backup `<config>.roster.bak-<ts>`; sin cambios no escribe. dsh: se actualizan literales `DSH_*` del preset; un runtime sin soporte reporta limitación sin fallar.

## Data flow

```
frontmatter + tree ──shared walk──▶ catalog.json ──▶ SKILLS.md tablas
                                      │               AGENTS.md tabla categorías
                                      │               (docs conteos verificados)
                                      ▼
validate-skills.mjs (--strict) ── gate ──▶ pnpm test (suites + evals offline)
                                      │
gentle-ai-dsh/skills ◀── sync-addon.mjs (--write|--check) ── canónico
```

## Plan de archivos (principal)

| Archivo | Acción | Qué |
|---|---|---|
| `_shared/catalog-manifest.mjs` | Crear | Walk/parse/build/diff compartido |
| `catalog.json` | Crear (generado) | Manifiesto |
| `00-meta-skills/skill-registry/scripts/generate-indexes.mjs` | Crear | `--write/--check` índices |
| `00-meta-skills/skill-validator/scripts/validate-skills.mjs` | Modificar | Gates nuevos + `--check-deps` |
| `scripts/check-install-state.mjs`, `scripts/git-preflight.mjs` | Crear | Gate WU0 |
| `scripts/sync-addon.mjs` | Crear | Mirror canónico→espejo |
| `00-meta-skills/catalog-doctor/{SKILL.md,scripts/catalog-doctor.mjs}` | Crear | Doctor |
| `mcp-manifest.json`, `<11-mcp-hybrid skills>/SKILL.md` (8) | Crear/Mod | requires-mcp + fallback |
| `<top skills>/evals.json`, `test/evals.test.mjs`, `scripts/run-evals.mjs` | Crear | Harness |
| `_shared/agent-roster/{roster.json,profiles.json}`, `apply.mjs`, `set-models.mjs` | Modificar | +sdd-research, tiers nativos, provider |
| `AGENTS.md`, `README.md`, `harness-map.md`, `SKILLS.md`, `openspec/config.yaml`, `00-meta-skills/{sdd-orchestrator,gentle-orchestrator,skill-router,skill-creator,skill-validator,catalog-usage}/SKILL.md`, `02-dev-roles/{judgment-day,rdd-defect-workflow}/SKILL.md`, `_shared/sdd-phase-common.md` | Modificar | Truth-up, NL, corte 2º fallo, JD, doctor, RDD |
| `gentle-ai-dsh/{AGENTS.md,README.md,ISSUES.md}`, `package.json` | Modificar | Espejo, scripts (`manifest:*`, `doctor`, `test:addon`) |

## Ediciones concretas (NL + corte + rename)

- **Rename (verificar, no propagar a ciegas)**: WU1 ejecuta `gentle-ai --version` + `Get-ChildItem ~/.claude/commands` + `gentle-ai sync --dry-run` y registra evidencia. Evidencia ya recogida aquí: assets 2.7.0 = `/sdd-*` (claude), meta-comandos `/sdd-new|continue|ff` (asset opencode); **no existe `/gentle-sdd-*` instalado**. WU1 reemplaza las menciones `/gentle-sdd-*` por: NL primario + "alias slash según lo que exponga tu runtime (2.7.0 verificado: `/sdd-*`)". No se inventa superficie.
- **AGENTS.md raíz (arranque)**: agregar bullet: "Superficie NL-primero: pedir un cambio SDD en lenguaje natural es la vía primaria; los slash son alias opcionales, nunca requisito." Y en gatekeeper auto: "…un SEGUNDO fallo detiene la cadena y escala; no existe un tercer intento automático."
- **`sdd-orchestrator` gatekeeper**: agregar frase explícita "Prohibido un tercer reintento automático" (spec harness-orchestration). **`gentle-orchestrator` retry**: alinear "2 fallos → reportar y parar; sin tercer intento". **Addon AGENTS §1/§6**: misma regla + quitar JD del paso 4 del pipeline (JD = code post-apply/pre-PR) + `catalog-usage` línea 62 y `judgment-day` línea 112 ("phase gate inside SDD" → "post-apply/pre-PR; no valida planning").

## RDD activo (por WU)

1. Cerrar `apply` de la WU → `gentle-ai review validate --gate post-apply --cwd <repo>` (con `--lineage` de `review status`); sin recibo → reportar la acción nativa (`review start`) y **no** abrir presupuesto.
2. Antes de cada commit: stage selectivo (`git preflight` valida paths) → `gentle-ai review validate --gate pre-commit --cwd <repo>`.
3. Antes de PR: `--gate pre-pr`. Retoma post-fix: reutilizar recibo; corrección única según reglas nativas; nunca re-review espontáneo. Modo ya globalmente ON; el catálogo no lo enciende/apaga.

## Testing strategy

| Capa | Qué | Cómo |
|---|---|---|
| Unit | Reglas validador nuevas, manifest diff, evals schema | `test/validator-gates.test.mjs`, `test/manifest.test.mjs` con fixtures temporales |
| Integración | install-skills dry-run, loader, agent-roster apply/set-models, check-install-state | suites node:test con `--config`/`--dsh-home`/`--agents-home` temporales; jamás el home real |
| E2E | doctor PASS/FAIL, sync-addon `--check`, gate WU0 en runtime real (solo lectura) | `pnpm doctor`, `pnpm test` (15+ nuevas), `test:addon` |

## Threat matrix

| Boundary | Aplica | Respuesta de diseño | RED tests |
|---|---|---|---|
| Documentation-like paths | Aplicable | `SKILL.md` = skill; audit de scripts solo en `scripts/`/`bin/` por extensión; fences en docs no se auditan; `_shared`/`gentle-ai-dsh` fuera del walk | fixture: `scripts/x.mjs` con `curl` → error; `.md` con `curl` → no |
| Git repository selection | Aplicable | Scripts resuelven raíz por `__dirname` (no cwd); commits con `git -C <repo>`; `git-preflight.mjs --paths` rechaza staged fuera de la lista de la WU | invocar desde cwd ajeno → misma raíz; staged extra → fail |
| Commit state | Aplicable | `git add` selectivo por WU; nunca `-A`/`commit -a`/`--no-verify`; stage verificable antes de `pre-commit` | fixture repo temporal: staged fuera de allowlist → fail |
| Push state | N/A: no hay push en el alcance del cambio; la entrega (PRs encadenados) la gobiernan `chained-pr`/`branch-pr` en apply |
| PR commands | N/A: sin automatización de PR nueva; boundaries en la cadena de WUs y ejecución delegada a las skills de PR |

Sin npm/npx; ningún `rm -rf`/`git clean`/force-push; todo script mutante exige `--apply/--write` y backup.

## Cadena de work units (commit-per-WU, gates antes de commit)

| WU | Alcance | Est. líneas (escritas) | Specs | PR |
|---|---|---|---|---|
| WU0 | Commit WIP (27 arch., ~96) + `check-install-state` + `git-preflight` + test | ~370 | installer-lifecycle | PR0 |
| WU1 | Manifiesto+generador+drift (~380) / truth-up docs (~200) | ~580 | catalog-manifest, harness-orchestration, review-policy | PR1a/1b |
| WU2 | RDD: `sdd-phase-common` + harness-map + `rdd-defect-workflow` + promoción `review-ledger-contract.md` + punteros verify/archive | ~200 | rdd-extension-point, review-policy | PR2 |
| WU3 | Gates validador+tests (~280) / evals+TDD suites+`test:addon` (~320) | ~600 | skill-quality-gates, skill-eval-harness | PR3a/3b |
| WU4 | Provider+profiles+tests (~300) / tiers nativos+21 agentes+tests (~200) | ~500 | model-routing | PR4a/4b |
| WU5 | sync-addon+espejo+ISSUES (~220) / doctor+mcp (~240) | ~460 | installer-lifecycle, catalog-doctor, mcp-requirements | PR5a/5b |

Total ≈ 2 700 líneas escritas > 800 (preflight) y > 400/PR → **cadena obligatoria** (ask-on-risk ya cacheado). Recomendación: `stacked-to-main` con 10 PRs (cada uno ≤400 escritas); generados (`catalog.json`, `SKILLS.md`, `AGENTS.md` tabla, `.atl`, copia del espejo) van en el snapshot pero **excluidos del conteo de riesgo** (regla de goldens nativa), declarado en cada PR. Dependencias: WU0→WU1→WU2→WU3→WU4→WU5; WU5 consume manifiesto (WU1) y tests (WU3). Estrategia final la elige el usuario en tasks/apply.

## Gate install-state WU0 (comandos exactos)

```
node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict   # 209/209, exit 0
pnpm test                                                                  # 15/15
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --dry-run --all-tools  # plan por tool = conteo canónico
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --all-tools      # reinstala (manifest+backup)
node scripts/check-install-state.mjs --strict                              # PASS: missing=0, unregistered=0
node scripts/sync-addon.mjs --check                                        # espejo == canónico
```
`check-install-state` reporta por runtime: esperado (manifest), observado, faltantes, extraídas sin registro (error), ajenas (info). Mirror flow: `sync-addon.mjs --write` copia canónico→`gentle-ai-dsh/skills/` + paridad de conteo; `--check` falla ante edición directa del espejo.

## Migración / rollout

Sin migraciones de datos. Rollback por WU: revert del commit + `manifest:sync` + `sync-addon --write` (todo regenerable). Cada WU arranca/termina autónoma; gates PASS y paso RDD antes de cada commit. `git-preflight --paths` acota el stage.

## Open questions

- [ ] `--save-provider`: confirmar interpolación `{env:VAR}` de apiKey contra el build OpenCode del usuario al aplicar (fallback: omitir literal y documentar la env-var).
- [ ] WU5: ids/install de cada servidor MCP de `11-mcp-hybrid` se confirman leyendo cada SKILL.md (solo `figma` está verificado).
- [ ] Atribución 2.6/2.7: sin CHANGELOG; se mantiene como assumption documentada (no bloquea).
