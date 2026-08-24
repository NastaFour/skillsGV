# Tasks: slice-2 — Media wave (3D + curaduría) y evolución del harness (E1–E5)

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas cambiadas estimadas | Total ~1.900–2.900 · PR-1 ~700–1.300 · PR-2 ~200–320 · PR-3 ~280–420 · PR-4 ~200–320 · PR-5 ~300–520 |
| Riesgo presupuesto 400 líneas | High |
| PRs encadenados recomendados | Yes |
| Split sugerido | PR-1 → PR-2 → PR-3 → PR-4 → PR-5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Nota: presupuesto vigente del proyecto es 800 líneas/PR (`review_budget_lines`). Solo PR-1 lo excedería probablemente (material de `references/`): si el conteo dispara, recortar facetas o resolver excepción antes de apply.

### Unidades de trabajo sugeridas

| WU | Meta | PR | Test enfocado | Harness runtime | Rollback |
|---|---|---|---|---|---|
| 1 | Skills media + registro mismo PR + matriz/fixture | PR-1 | V + smoke router | Router vivo: queries 3D/hover | Borrar carpetas nuevas; revertir índices |
| 2 | Corpus + replay determinista | PR-2 | router-replay ×2, diff vacío | Offline sin modelos | Borrar corpus + script |
| 3 | Journal apply-progress | PR-3 | Abort simulado en temp dir | sdd-apply sobre cambio piloto | Restaurar SKILL.md; borrar script |
| 4 | Installer lifecycle | PR-4 | Ciclo install/dry-run/uninstall/rollback | Temp dir con archivo ajeno plantado | Restaurar script respaldado |
| 5 | Docs E1/E5/E6 + delta hooks | PR-5 | Grep sin hardcodeo + V | N/A — doc-only por inspección | Revertir diffs de docs |

Convención: `V` = `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` → exit 0 exigido en cada PR. La etiqueta `(capability)` cierra cada tarea como trazabilidad a spec.

## Fase 1: Media wave + registro (WU1→PR-1)

- [x] 1.1 Crear `05-frontend/three-js-web/SKILL.md`: triggers ≥4 chars (`three.js`,`threejs`,`react-three-fiber`,`drei`,`webgl`,`3d scene`); description menciona 3D/R3F (triggers cortos los descarta MIN_TRIGGER_LENGTH); cuerpo conciso enlazando 5 facetas; frontmatter validado con V (three-js-web)
- [x] 1.2 Crear sus `references/{core-threejs,r3f-patterns,drei-helpers,performance-webgl,spline-no-code}.md`; Spline como sección no-code dentro de la skill (no skill aparte); cero enlaces huérfanos vía V (three-js-web)
- [x] 1.3 Crear `05-frontend/web-animation-sources/SKILL.md` + `references/animation-sources.md`: exactamente 10 entradas agrupadas por tópico, formato {título, autor/fuente, URL, propósito}; lista curada SIN instrucciones embebidas; conteo = 10 (web-animation-sources)
- [x] 1.4 Registrar ambas skills en el MISMO PR: `SKILLS.md` (tabla 05-frontend + contador 149→151) y `AGENTS.md` (tabla + 2 filas Auto-Invoke) (three-js-web, web-animation-sources)
- [x] 1.5 Regenerar `.atl/skill-registry.md` con `skills-loader.mjs --emit-registry`; V exit 0 con los 3 índices sincronizados; negativo: skill sin entrada hace fallar --strict (three-js-web)
- [x] 1.6 `overlap-matrix.json`: grupo unitario `{id:"three-js-web", members:["three-js-web"], note}` delimitando vs motion-framer/motion-gsap/visual-effects (CSS 3D ≠ WebGL); fixture par en `overlap-smoke-tests.json`; smoke: query "3d scene three.js" → primario three-js-web (overlap-matrix)
- [x] 1.7 Contadores cosméticos en `harness-map.md`; gate PR-1: V exit 0 + fixtures verdes (overlap-matrix)

## Fase 2: Corpus + replay E2 (WU2→PR-2)

- [x] 2.1 RED amenaza subprocesos: query con metacaracteres de shell (`;`, `|`, `$()`) debe tratarse como texto plano, sin escape ni corrupción de ejecución; falla hasta existir 2.3 (router-replay-corpus)
- [x] 2.2 Crear `skill-router/references/routing-corpus.jsonl`, línea `{id, query, expectedPrimary, group?, source}`: migrar casos de `overlap-smoke-tests.json` + caso three-js-web (router-replay-corpus, overlap-matrix)
- [x] 2.3 Implementar `skill-router/scripts/router-replay.mjs`: spawnSync(process.execPath,[router,"--query",q,"--json"]) con args array SIN shell:true, timeout por caso y exit code capturado; salida estable `{total, exactMatches, accuracy, discrepancies[{id,line,query,expected,got}]}` (router-replay-corpus)
- [x] 2.4 Línea malformada del corpus se reporta con su número de línea (router-replay-corpus)
- [x] 2.5 Determinismo offline: 2 corridas byte-idénticas (diff vacío), cero llamadas a modelos (router-replay-corpus)
- [x] 2.6 Consistencia triple matriz↔fixture↔corpus para three-js-web; gate PR-2: V exit 0 (overlap-matrix, router-replay-corpus)

## Fase 3: Journal apply-progress E3 (WU3→PR-3)

- [x] 3.1 Implementar `sdd-apply/scripts/apply-journal.mjs` (módulo+CLI), estado en `openspec/changes/{change}/journal/`: snapshot.json `{version:1, change, contractHash, units{id:{status,evidence}}, lastSeq}`; events.jsonl append-only `{seq,type,unitId,payload,prevHash}` con `\n` final; journal.lock exclusivo `wx`+PID con recuperación de huérfanos >stale-timeout (apply-progress-journal)
- [x] 3.2 Idempotencia (re-registrar unitId no muta snapshot ni duplica evento efectivo); append-only (mutar eventos históricos rechazado); escritor concurrente espera o falla controlado sin corromper estado (apply-progress-journal)
- [x] 3.3 Recuperación: al abrir, replay de eventos sobre snapshot; última línea truncada se descarta y su unidad queda `interrupted-retry`; unidades confirmadas se conservan; simular abort en temp dir (apply-progress-journal)
- [x] 3.4 Integrar en `sdd-apply/SKILL.md` Pasos 5–6: evento emitido ANTES de marcar `[x]`; apply-progress DERIVADO del snapshot; merge queda como capa de reporte; Node puro Windows-first sin Bash; gate PR-3: V exit 0 (apply-progress-journal)

## Fase 4: Installer lifecycle E4 (WU4→PR-4)

- [x] 4.1 RED amenaza filesystem destructivo: archivo ajeno plantado en temp target sobrevive al uninstall y figura como retenido; uninstall sin manifest → abort exit≠0 sin borrar nada; falla hasta existir 4.3 (installer-lifecycle)
- [x] 4.2 Manifest por generación `<target>/.skills-install/manifest.json` `{generation, ts, tool, mode, entries[{dest, src, sha256, prevState:"new"|"overwritten", prevSha256?}]}`; archivos preexistentes ajenos no figuran como propios (installer-lifecycle)
- [x] 4.3 Flags en `install-skills.mjs`: `--uninstall` borra solo entries con hash vigente y retiene/lista ajenos o editados; `--rollback` restaura prevSha o elimina si era nuevo, registrado en historial; `--dry-run` emite plan completo incl. sobrescrituras sin mutar FS (installer-lifecycle)
- [x] 4.4 Ciclo completo en temp dir sin Bash: install → dry-run → uninstall → rollback; gate PR-4: V exit 0 (installer-lifecycle)

## Fase 5: Docs E1/E5/E6 + delta hooks (WU5→PR-5)

- [x] 5.1 Crear `sdd-orchestrator/references/model-routing.md`: protocolo declarativo con interfaz list()/resolve(phase) sobre catálogo del runtime; degradación documentada sin catálogo (modelo default, pipeline no falla); grep confirma cero comandos runtime hardcodeados ni TUI obligatoria (model-routing)
- [x] 5.2 Crear `_shared/model-routing/profiles.schema.json` + `profiles.example.json` (fases propose/spec/design/tasks/apply/verify); example valida contra schema (model-routing, model-routing-hooks)
- [x] 5.3 `harness-map.md` sección «Política de review»: solo lo introducido/empeorado bloquea; deuda preexistente → follow-up aparte; perfiles opt-in (sin declaración → política base); actualizar nota E1 de diferido a activo en Slice 2 (review-policy, model-routing-hooks)
- [x] 5.4 Crear `02-dev-roles/code-reviewer/references/review-policy.md` (SHOULD), consistente con la disposición causal RDD; cross-check textual harness-map ↔ skill (review-policy)
- [x] 5.5 `harness-map.md` sección «Punto de extensión AHE» junto al RDD: sidecars evaluator/debugger/evolver (responsabilidad + inserción post-verify propuesta); niveles static_contract/transcript_replay/live_smoke/manual_oracle con criterio de aplicación; SIN mecanismo ejecutable; OPEN-1 diferido; activar uno no habilita al otro (ahe-extension-point, rdd-extension-point)
- [x] 5.6 Gate PR-5 doc-only: cero carpetas de skill nuevas (contador permanece en 151); V exit 0 (ahe-extension-point)

## Fase 6: Verificación final (E2E/RED)

- [x] 6.1 Query "3d"/three.js → primario three-js-web en smoke y corpus (overlap-matrix, router-replay-corpus)
- [x] 6.2 Replay determinista ×2 byte-idéntico, offline (router-replay-corpus)
- [x] 6.3 Journal recupera escritura interrumpida sin pérdida (temp dir) (apply-progress-journal)
- [x] 6.4 Dry-run/uninstall/rollback en temp dir con archivo ajeno retenido (installer-lifecycle)
- [x] 6.5 E1 activa perfiles vía catálogo en OpenCode sin comandos hardcodeados; runtime sin catálogo degrada según lo documentado (model-routing-hooks)
- [x] 6.6 Los 7 success criteria de proposal.md verificados + V global exit 0 (proposal)
