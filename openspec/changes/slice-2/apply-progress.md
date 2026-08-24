# Apply Progress: slice-2

> Fuente de reporte (no de verdad): el estado acumulado de unidades completadas por lote. Lote actual: WU1 → PR-1 (Fase 1 completa).

## Estado acumulado

| Fase | Tareas | Estado |
|---|---|---|
| 1 — Media wave + registro (WU1→PR-1) | 1.1–1.7 | ✅ Completas (7/7) |
| 2 — Corpus + replay E2 (WU2→PR-2) | 2.1–2.6 | ⬜ Pendientes |
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

## Commits (rama `slice2/pr1-media-wave`, stacked-to-main desde `main` @ 3e1c76a)

| Commit | Unidad | Contenido |
|---|---|---|
| `09d92fb` | D1 + registro parcial + matriz/fixture | three-js-web (SKILL.md + 5 referencias), SKILLS.md/AGENTS.md/registro regen (149→150), grupo unitario overlap-matrix + fixture smoke, harness-map 149→150 |
| `dc4d4b8` | D2 + registro final | web-animation-sources (SKILL.md + animation-sources.md ×10 entradas), índices sincronizados (150→151) |

## Decisiones y hallazgos de implementación

- **Triggers cortos**: `"3d"` y `"r3f"` (<4 chars, `MIN_TRIGGER_LENGTH`) no pueden ser triggers (A2); cubiertos vía keywords de la description y nota del grupo unitario. Verificado empíricamente que las queries objetivo resuelven sin ellos.
- **Colisión con micro-interactions**: ya existía trigger `hover effect` (singular) y `entrance animation`. El split natural funciona: queries plurales («hover effects») solo disparan web-animation-sources por word-boundary regex; «entrance animation» empata en triggers y lo resuelven las keywords de description (queries de referencia ganan; queries de implementación mantienen a micro-interactions como primario — escenario de spec cumplido).
- **Curaduría de URLs (desviación menor documentada)**: los artefactos del cambio traían título+autor de las 10 referencias pero ninguna URL. Se verificaron por búsqueda: Tim Quirino (timq.xyz, portafolio 3D con Spline), Animate.css (animate.style), AniJS (anijs.github.io, autor Dariel Noel — interpretación de la entrada «Animajs.css»), Reactbits.dev. Las fuentes no ubicables públicamente (Unifiers of Japan, Coding for Designers, Tellet, Ozone, Yuna, Gitbook) se curaron con enlace sustituto canónico del mismo tópico, marcado como tal en cada entrada: Codrops HoverEffectIdeas, Webflow loading-animation, AOS, microinteractions.com (Dan Saffer), FreeFrontend background effects, Codrops Custom Cursor Effects (Stefan Kaltenegger).
- **Registro atómico por commit**: cada commit deja el repo verde bajo `--strict` (registro incluido en el mismo commit que su skill), mejorando bisectabilidad dentro del PR.
- **Presupuesto**: ~410 líneas cambiadas en los 2 commits de skills (299+109+4 del) + ~15 en tasks/progress; muy por debajo del techo de 800 — sin necesidad de recortar facetas.

## Desviaciones del diseño

Ninguna estructural. Única nota: sustitución de enlaces en 6 entradas de la lista curada (documentada arriba y en el propio archivo), habilitada por la instrucción de apply («curala igual y anotalo») y consistente con la mitigación de rot de A3.
