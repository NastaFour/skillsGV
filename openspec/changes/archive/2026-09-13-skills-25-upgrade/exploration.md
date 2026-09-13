# Exploration: skills-25-upgrade — catálogo skillsGV → gentle-ai 2.5.0 (SDD + TDD + RDD)

> Fecha: 2026-09-11 · Fase: exploración previa a la propuesta · Almacén: hybrid (openspec + Engram)
> Evidencia: gates ejecutados en vivo + minería acotada de 3 sesiones dsh (muestreo dirigido; los logs no se leyeron de punta a punta).

## Estado actual (verificado con evidencia)

### Catálogo (repo `C:\Users\j1347\Desktop\skills`, remoto `NastaFour/skillsGV`)

- **209 skills activas** (no 193). `validate-skills.mjs --strict`: **209/209, 0 errores, 0 warnings, exit 0**. `pnpm test`: **15/15 PASS** (suites `test/catalog-integrity`, `test/router`, `test/validator`).
- El repo **ya tiene `package.json`** (v2.0.0, `pnpm@11.9.0`) y runner `node:test`. La observación `strict_tdd: false` ("no existe test runner", Engram #83) quedó **desactualizada** para meta-scripts.
- `sdd-apply` ya incluye `scripts/apply-journal.mjs` + `apply-journal.test.mjs` (con test propio).
- **El árbol NO está limpio**: 27 archivos modificados sin commitear (+69/−27): endurecimiento del validador (`desc-when` bilingüe, chequeo de claves duplicadas de frontmatter), `overlap-matrix.json`, 13 SKILL.md raíz + su espejo en `gentle-ai-dsh/skills/`. El preflight del orquestador asumía "clean tree" — hay que absorber esto como WU0.
- **Addon `gentle-ai-dsh/` dentro del catálogo**: es la copia más nueva (mtime 2026-09-07; bundle de 209 skills + preset + `bin/gentle-dsh.mjs` + `test/installer.test.mjs`). La copia espejo del workspace del harness quedó atrás (206 skills; le faltan `agent-roster`, `impeccable`, `taste-skill`; difieren AGENTS/README/package/bin). Sus `ISSUES.md` están desactualizados en ambos lados.

### Deltas 2.5.0 ya presentes (parcial)

| Ítem | Estado actual |
|---|---|
| Rename `/gentle-sdd-*` | Aplicado en `sdd-orchestrator`, `gentle-orchestrator`, `sdd-init`, `sdd-onboard` y addon AGENTS. Grep de `/sdd-` en el catálogo: sin residuos fuera de atribuciones/archivo histórico. |
| Regla Alan (NL > slash) | Presente en `sdd-orchestrator` y `gentle-orchestrator`. Ausente en `AGENTS.md` raíz, `README.md`, `catalog-usage`. |
| RDD | `rdd-defect-workflow` ya es binario-consciente; `_shared/sdd-phase-common.md` §nota, `harness-map.md` §RDD y `sdd-verify` refieren el mecanismo nativo (opt-in, apagado por defecto). La spec `rdd-extension-point` sigue redactada como Slice-1 ("sin mecanismo"). `_shared/review-ledger-contract.md` existe **solo** en el bundle vendored, no en `_shared/` raíz. |
| Guard 400/800 | `_shared/sdd-phase-common.md` §E completo (400 default, override por preflight, ask-on-risk); `sdd-tasks` forecast; `chained-pr` skill. Falta como regla de harness en `AGENTS.md` raíz y en addon AGENTS. |
| JD "solo code review" | `judgment-day/SKILL.md` ya declara "NO validar pasos SDD" y "solo diffs post-apply/pre-PR". Residual: addon AGENTS lo lista como paso 4 del pipeline SDD; `catalog-usage` línea 62 y la línea "phase gate inside SDD" del propio skill. |
| Economía de modelos | `agent-roster` (roster 20 agentes strong/flash) + `set-models`/`apply.mjs` + perfiles. Coherente con `gentle-orchestrator`; verificación de consistencia pendiente (sin drift detectado en tablas). |
| Codegraph-first | Documentado en addon AGENTS §7 y en `rdd-defect-workflow`. Ausente en `AGENTS.md` raíz. |
| Bug JD engram tool-prefix (upstream) | **Ausente localmente**: 0 referencias `mcp__`/`engram__` en `02-dev-roles/*` (verificado). Solo requiere nota + verificación en apply. |

### Minería de logs (3 sesiones dsh, muestreo acotado)

| Sesión | Preset | Líneas | Turnos | Tokens in/out | Señales |
|---|---|---|---|---|---|
| `_extract1` (run 1) | standard | 12.086 | 6 (5 completed, 1 **abortado por usuario**) | 210k / 333k | 1 delegado de planificación **abortado**; 57 `run_code`; retries TRANSPORT (deepseek-official); doctor exit 1 |
| `_extract2` (run 2, **con 2.5**) | gentle-ai | 7.391 | **15/15 completed** | 2.27M / 683k (incl. 13 delegados) | Pipeline SDD completo; JD rojo/azul OK; sin delegados colgados; fricciones menores (ERR_PNPM_NO_PKG_MANIFEST, 404 en localhost) |
| `session log completa` (dev del harness) | standard | 45.425 | 45 (1 abortado, resto completed) | 4.44M / 1.25M; 315 tool calls | Pico **776.192 maxTokens** (techo de contexto); 1 compactación; JD: 2 jueces OK + **3 intentos muertos (QUOTA 402 "Insufficient Balance"** y errores de turno) |

**Tokens por tarea (run 2, in/out; el dato alimenta E3/G3):**
`sdd-init` 125k/20k · `sdd-explore` 86k/15k · `sdd-propose` 65k/13k · `sdd-spec` 150k/6k · `sdd-design` 216k/42k · `sdd-tasks` 81k/15k · `sdd-apply` (strong) 190k/**113k** · `sdd-verify` 178k/27k · `review-validator` (gate final) 358k/23k · JD rojo 161k/23k · JD azul 115k/18k · `jd-fix-agent` 175k/**63k** · main 186k/153k.

**Errores reales (no los conteos crudos de substring, contaminados por código del proyecto pulse):** solo 2 `llm/retry` por sesión — TRANSPORT en run 1, TRANSPORT ("terminated"/"Connection error") en run 2, TIMEOUT 300 s + "Stream ended without finish_reason" en la sesión completa. No hay evidencia local del bug engram tool-prefix; los fallos de delegados del corpus son **cuota agotada (402)**.

**Errores propios repetidos (lecciones):** recuentos divergentes (197/206/208/209 en distintos docs y config), README afirma "No hay `package.json`" (falso), dos copias del addon divergiendo, fix del YAML `!!js` (duplicación de tag 91:18) re-trabajado, doctor con exit 1 en ambas corridas, presupuesto quemado (usuario: "de 2.25 me quedan 1.62").

### Cruce PLAN-DSH × ISSUES.md

- **E2 tests del installer**: `test/installer.test.mjs` **ya existe** en el addon; `ISSUES.md` sigue listándolo pendiente y no hay evidencia de ejecución. → cerrar con gate.
- **E3 bench journey**: pendiente real (requiere binario `gentle-ai-bench`).
- **E5 Judgment Day formal**: ejecutado en la sesión completa (2 jueces completos) pero con 3 intentos muertos por cuota; `ISSUES.md` stale. → re-validar/cerrar.
- **G1–G4**: pendientes. G3 (budget reporting) ya tiene los datos crudos de la minería → persistir en `dsh/costes`.
- **Config de entorno** (`ENGRAM_MCP_COMMAND`, `CONTEXT7_API_KEY`, `DSH_FLASH_MODEL`): pendiente del usuario; el bootstrap del addon ya lo documenta.
- **Promoción bundle-only**: el commit `6cc45b6` promovió **12 skills** de dsh (197→209). Hoy root ⊆ bundle con paridad de skills (diff = 0; único extra del bundle: `_shared`, que no es skill). El "13" del backlog parece conteo previo → verificar y cerrar como decisión documentada.

## Áreas afectadas

- `AGENTS.md` (raíz), `README.md`, `SKILLS.md`, `openspec/config.yaml` — counts, claims stale, reglas de harness (NL, guard 400, JD, codegraph, retry/re-launch).
- `_shared/sdd-phase-common.md`, `00-meta-skills/harness-map.md`, `00-meta-skills/catalog-usage/SKILL.md`, `00-meta-skills/sdd-orchestrator/*`, `00-meta-skills/gentle-orchestrator/*`.
- `02-dev-roles/rdd-defect-workflow/SKILL.md`, `02-dev-roles/judgment-day/SKILL.md`, `02-dev-roles/review-*`.
- `openspec/specs/rdd-extension-point/spec.md` (delta de activación), `openspec/specs/review-policy/`.
- `_shared/agent-roster/profiles.json` + `00-meta-skills/agent-roster/scripts/{apply,set-models}.mjs` — provider custom + tests.
- `test/*` (nuevas suites), `package.json` (scripts), `openspec/config.yaml` (testing block).
- `gentle-ai-dsh/` (AGENTS/README/package/ISSUES + bundle) y su espejo en el workspace del harness.
- WIP sin commitear: 13 SKILL.md raíz + espejo + `validate-skills.mjs` + `overlap-matrix.json`.

## Novedades 2.5.0 — alcance por ítem

| # | Novedad | Decisión propuesta | ¿Este cambio? |
|---|---|---|---|
| 1 | Rename `/gentle-sdd-*` | Casi completo; queda verificación mecánica + addon espejo. | Sí (verificación) |
| 2 | NL > slash |Propagar a `AGENTS.md` raíz, `README.md`, `catalog-usage`. | Sí |
| 3 | RDD real | Delta de spec (activación) + punteros + gate opt-in documentado; evaluar promover `review-ledger-contract.md` a `_shared/`. | Sí |
| 4 | Guard ~400 (ask; preflight 800) | Regla de harness en ambos AGENTS; el contrato §E ya existe. | Sí |
| 5 | JD solo code review | Reposicionar addon AGENTS (paso 4), `catalog-usage`, línea "phase gate" del skill. Mantener JD en roster strong. | Sí |
| 6 | Economía de modelos | Verificación de consistencia (roster/orquestador/addon); sin drift detectado. | Sí (verificación) |
| 7 | Codegraph-first | Regla en `AGENTS.md` raíz (addon ya la tiene). | Sí |
| 8 | Bug engram tool-prefix | Ausente local; nota upstream + check en verificación. | Sí (nota) |

**Backlog evaluado:**

- **TDD meta-scripts**: ya hay runner (15 tests). Faltan suites para `agent-roster` (apply/set-models con `--config` temporal), `skills-loader`, `install-skills` (dry-run/uninstall) y wire del `test:addon`. Requiere actualizar la cache de testing (obs #83) al cerrar.
- **Provider custom (`--save-provider`)**: no existe; hoy solo `--save-profile` (perfiles strong/flash) y `--profile glm`. Falta bloque provider (baseURL/apiKeyEnv/modelos) e inyección a opencode.json + env dsh. Depende de la suite de tests.
- **pnpm-only scope**: el validador escanea solo cuerpos de SKILL.md; `scripts/`, `references/`, `AGENTS.md`/`README` no se escanean. Decidir ampliar walker o documentar el límite.
- **Env vars dsh**: documentar/cerrar en addon + chequear con `doctor`.

## Enfoques (decisiones abiertas)

1. **Addon: fuente única vs doble copia.** A) Catálogo como fuente única y el workspace del harness consume por `pnpm dlx`/sync (consistencia garantizada, menos peso en el catálogo); B) mantener ambas copias con un script `sync-addon` + gate de paridad; C) archivar la copia del harness. **Recomendado: A** (el addon ya vive versionado dentro del catálogo; la copia del harness es la que divergió).
2. **TDD del catálogo.** A) Ampliar `test/` con suites de meta-scripts y `pnpm test` como gate único (menor costo, encaja con el runner existente); B) runner separado por script. **Recomendado: A**; `strict_tdd` a nivel repo sigue `false` (catálogo de contenido) pero se documenta "TDD obligatorio para meta-scripts".
3. **RDD.** A) Delta de spec + documentación y gate **opt-in** delegado al binario (no reimplementar); B) gate ejecutable propio en `sdd-verify/archive`. **Recomendado: A** (el binario ya congela/valida; el catálogo no debe duplicar mecánica).
4. **Alcance docs vs código.** Los ítems 1–8 son casi todos documentales; el código nuevo está en TDD/provider (3–4). Permite slicear por presupuesto.

## Estructura de slices recomendada (presupuesto preflight: 800 líneas)

| WU | Alcance | Líneas est. | PR |
|---|---|---|---|
| WU0 | Higiene: commitear WIP (27 archivos, +69/−27) tras verificar gates | ~100 | PR 0 |
| WU1 | Docs truth-up + reglas de harness (counts 209, README package.json, NL/guard/JD/codegraph/retry/re-launch/provider-failover en AGENTS raíz + addon) | ~350–450 | PR 1 |
| WU2 | RDD: delta spec `rdd-extension-point`, promoción/decsión `review-ledger-contract`, clarificaciones en `sdd-verify/archive` + `rdd-defect-workflow` | ~250–400 | PR 2 |
| WU3 | TDD meta-scripts: suites `agent-roster`/`skills-loader`/`install-skills` + wire `test:addon` + config testing + README | ~400–500 | PR 3 (candidato a chain interno) |
| WU4 | Provider custom: `--save-provider` + inyección opencode/dsh + schema perfiles + tests + docs | ~300–450 | PR 4 |
| WU5 | Addon alignment: fuente única + sync/archivo de la copia del harness, counts 209, ISSUES limpio, verificación installer test | ~200–400 | PR 5 |

Con `ask-on-risk`: cada WU es autónoma con inicio/fin/rollback; si el forecast excede 400, se pregunta (chain vs `size:exception`) salvo que el preflight de 800 ya cubra el WU.

## Riesgos

- **Docs tocando muchos archivos** → conteos y claims stale reaparecen (ya pasó 3 veces). Mitigar con un gate de grep de conteos y el loader `--emit-registry`.
- **Duplicación addon** → volverá a divergir si no se define fuente única en WU5.
- **Falsa sensación "ya está"**: rename/§E/RDD-notes ya presentes; el cambio debe limitarse a lo ausente verificable, no a reescribir lo existente.
- **RDD over-promise**: el mecanismo es opt-in y apagado por defecto; documentar sin prometer enforcement.
- **TDD**: los tests de `apply.mjs` deben usar `--config` temporal (regla del README) — nunca el `opencode.json` global real.
- **Cuota de proveedor**: los logs muestran que QUOTA mata delegados; documentar failover de proveedor antes de reintentos.

## Preguntas para la ronda de propuesta

1. WU0: ¿el WIP actual se comitea tal cual (tras gates) o requiere revisión previa de los cambios en `validate-skills.mjs` + 26 archivos?
2. Addon: ¿confirmás "catálogo como fuente única" (opción A) y que la copia del workspace del harness se archiva o se sincroniza?
3. RDD: ¿activación documental (delta de spec + punteros) es suficiente, y se promueve `review-ledger-contract.md` a `_shared/` raíz?
4. TDD: ¿alcance = meta-scripts del catálogo + `test:addon`? ¿Se actualiza la cache de testing (obs #83) con `strict_tdd: false` a nivel repo?
5. Provider custom: ¿estructura del bloque provider (baseURL/apiKeyEnv/modelos) y runtimes objetivo (¿OpenCode + env dsh?)?
6. ¿El "13 bundle-only" se cierra formalmente como "12 promovidas por `6cc45b6`"?
7. ¿Se registra el failover de proveedor (QUOTA → perfil alternativo) como regla del harness?

## Ready for Proposal

**Sí** — hay evidencia ejecutada de todos los gates, los deltas 2.5.0 están mapeados ítem por ítem con estado real, y los slices propuestos caben en el presupuesto de 800 líneas con `ask-on-risk`. El orquestador debería presentar al usuario la ronda de preguntas de arriba antes de `sdd-propose`.
