# Exploration: anim-3d-wave — Referencias de animación web y skills de 3D

## Estado actual

- El catálogo tiene **149 skills** organizadas por categorías. Las skills de motion viven en `05-frontend/` (`motion-framer`, `motion-gsap`, `scroll-animations`, `page-transitions`, `visual-effects`, `lottie-animations`, `motion-accessibility`, `vercel-react-view-transitions`) y `micro-interactions` en `02-dev-roles/`.
- **Patrón de contenido establecido**: cada skill expone su material extra en `references/*.md` enlazados desde el cuerpo de su `SKILL.md` (verificado en `motion-framer`, `motion-gsap`, `scroll-animations`, `visual-effects`, etc.). No existe en el catálogo ningún patrón de "fuentes / inspiración / lista de sitios".
- **No hay ninguna skill de 3D**: búsqueda sobre todos los `SKILL.md` sin resultados para `three.js`, `react-three-fiber`, `drei`, `spline`, `blender`, `threejs` ni `webgl`. Tampoco existe carpeta `3d*`, `three*`, `webgl*` ni `react-three*`.
- **El router es auto-discoverable**: `skill-router.mjs` escanea dinámicamente el frontmatter de todos los `SKILL.md` del catálogo (no hay lista estática de skills). Una skill nueva se indexa sola; los fixtures del router (`overlap-smoke-tests.json`, `overlap-matrix.json`) solo cambian si se añade un grupo de solapamiento.
- **El validador `--strict` impone el registro en índices el mismo PR** (verificado en `validate-skills.mjs`):
  - `index-sync`: cada carpeta de skill debe aparecer en `SKILLS.md` (`index-sync-missing-skill`), el nombre en `AGENTS.md` (`agents-sync-missing-skill`) y no debe haber enlaces huérfanos en `SKILLS.md`.
  - `skill-registry-protocol`: `.atl/skill-registry.md` y `SKILLS.md` deben coincidir en nombre y path en ambos sentidos (`registry-entry-missing`, `registry-entry-path-mismatch`, etc.). Quedan excluidos del registro `_shared`, `skill-registry` y `sdd-*`.
  - El registro `.atl/skill-registry.md` se regenera con `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry`.
  - Comando de verificación del proyecto: `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict`.
- **Overlap-matrix** (`00-meta-skills/skill-router/references/overlap-matrix.json`, decisión D4): des-empata pares de skills que puntúan juntas en el top-4. Existe el patrón de "grupo unitario de delimitación" (un solo miembro con nota que lo delimita contra otras skills): `hybrid-motion-video` (contra `motion-framer`/`motion-gsap`) y `hybrid-ux-auditor` (contra `web-design-guidelines`). Cada grupo tiene su fixture en `overlap-smoke-tests.json`.
- Las skills de `09-media-graphics/` (`nano-banana`, `banana-claude`) son **generación/edición de imágenes raster** vía Gemini Nano Banana; no tocan WebGL ni 3D en tiempo real.

## Áreas afectadas

- `05-frontend/<skill-3d>/SKILL.md` + `references/*.md` — nueva skill de 3D (three.js + R3F + drei).
- `05-frontend/<skill-referencias>/SKILL.md` + `references/animation-sources.md` — nueva skill de curaduría con las 10 referencias (si se opta por skill).
- `SKILLS.md` — tabla `05-frontend` (filas nuevas) y contador "149 skills" (pasa a 150/151).
- `AGENTS.md` — tabla de categorías `05-frontend` y filas de Auto-Invoke para las skills nuevas.
- `.atl/skill-registry.md` — regenerar con `skills-loader.mjs --emit-registry` (requisito del validador).
- `00-meta-skills/skill-router/references/overlap-matrix.json` — fila de delimitación si se añade skill 3D (patrón grupo unitario).
- `00-meta-skills/skill-router/references/overlap-smoke-tests.json` — fixture opcional del nuevo grupo.
- `00-meta-skills/harness-map.md` — contador "149 skills" (cosmético).

**No se ven afectados**: `skill-router.mjs` (scan dinámico), `skill-loader.mjs` (walk dinámico), `validate-skills.mjs` (sin cambios de código), `opencode.json`, `install.mjs`.

## Enfoques

### Referencias de animación (las 10)

1. **Nueva skill de curaduría (`web-animation-sources`)** — skill en `05-frontend` con `references/animation-sources.md` agrupando las 10 referencias por tópico (hover, loading, 3D, entrance, microinteracciones, background, mouse, librerías CSS, React bits).
   - Pros: descubrible por el router (triggers tipo "hover effects", "loading animation", "entrance animation", "animate.css"); sigue el patrón por-skill de `references/`; consistente con el ethos de curaduría del catálogo (p. ej. `micro-interactions`).
   - Contras: una skill "listado de enlaces" puede parecer delgada; exige registro en los 3 índices el mismo PR.
   - Esfuerzo: Media (skill + 3 índices + validación).

2. **Archivo raíz compartido `references/animation-sources.md`** — como `references/git-recovery-runbook.md`.
   - Pros: costo mínimo; no es skill → el validador no lo exige en índices.
   - Contras: el router NO lo descubre (solo escanea `SKILL.md`); queda como peso muerto salvo que se enlace desde `AGENTS.md` o una skill; rompe la unicidad del patrón (referencias por-skill).
   - Esfuerzo: Baja.

3. **Repartir las 10 referencias en las skills de motion existentes** — hover → `micro-interactions`, entrance → `page-transitions`, background/mouse → `visual-effects`/`motion-gsap`, librerías CSS → `motion-gsap`, reactbits → `motion-framer`.
   - Pros: el contenido vive donde se usa; sin skill nueva.
   - Contras: las 10 no mapean 1:1 (loading, background, mouse y 3D no tienen dueño claro); dispersa la lista que el usuario pidió como unidad; toca muchas skills (más diff y más superficie de sync).
   - Esfuerzo: Media.

### Skills de 3D

4. **Una skill única `three-js-web`** (three.js + react-three-fiber + drei como unidad, con sección Spline como alternativa no-code).
   - Pros: three/R3F/drei son una cadena de dependencias que en React se usa como una sola unidad; evita forzar a la overlap-matrix a colapsar un grupo de misma familia; un solo registro en índices.
   - Contras: skill amplia (requiere `references/` por faceta: core, patrones R3F, helpers drei, performance/WebGL, Spline).
   - Esfuerzo: Media.

5. **Varias skills (una por librería)** — `three-js`, `react-three-fiber`, `drei` por separado.
   - Pros: granularidad.
   - Contras: solapamiento forzado dentro del mismo flujo (exactamente el caso que D4 existe para colapsar); triplica registro y mantenimiento. No recomendado.
   - Esfuerzo: Alta.

6. **Ubicación: `05-frontend` vs `09-media-graphics`** — recomendado `05-frontend` (rendering React/Web junto a `motion-*`); `09-media-graphics` es para generación de imagen raster (banana), no para 3D en tiempo real.
   - Esfuerzo: N/A (decisión de ruta).

7. **Overlap-matrix: añadir fila de delimitación** — grupo unitario `{ id: "three-js-web", members: ["three-js-web"], note: ... }` delimitando contra `motion-framer`/`motion-gsap`/`visual-effects` (cuyo `visual-effects` menciona "CSS 3D transforms", que no es WebGL). Sin fila contra banana (sin solape semántico).
   - Pros: evita falsos primarios en queries "3d".
   - Contras: agrega fixture en `overlap-smoke-tests.json`.
   - Esfuerzo: Baja.

## Recomendación

1. **Referencias**: nueva skill de curaduría `web-animation-sources` en `05-frontend` con `references/animation-sources.md` con las 10 referencias agrupadas por tópico. Es la única opción descubrible por el router y respeta el patrón por-skill. Fallback si se quiere costo mínimo: archivo raíz `references/animation-sources.md` enlazado desde `AGENTS.md`, asumiendo que no será ruteable.
2. **3D**: UNA skill `three-js-web` en `05-frontend` que abarque three.js + react-three-fiber + drei como unidad, con sección para Spline como alternativa no-code. NO en `09-media-graphics`.
3. **Overlap**: añadir grupo unitario de delimitación en `overlap-matrix.json` (+ fixture) contra motion/visual-effects. Sin fila contra banana.
4. **Registro (mismo PR)**: `SKILLS.md` (tabla `05-frontend` + contador), `AGENTS.md` (tabla + Auto-Invoke), `.atl/skill-registry.md` (regenerar con `skills-loader.mjs --emit-registry`). Validar con `--strict`.

## Riesgos

- El validador `--strict` falla si una skill nueva no se registra en los 3 índices (`SKILLS.md`, `AGENTS.md`, `.atl/skill-registry.md`) en el mismo PR; olvidar la regeneración del registro rompe el gate.
- Contadores "149 skills" en `SKILLS.md` y `harness-map.md` quedan desactualizados si no se tocan.
- Las 10 URLs son referencias externas sin verificar en esta exploración de solo lectura; riesgo de rot de enlaces (el artefacto debe ser una lista curada con autor/propósito, no instrucciones embebidas).
- Naming: nombre `lowercase-hyphen`, carpeta == nombre, único; `three-js-web` y `web-animation-sources` no chocan con skills existentes.
- Spline es no-code (SaaS): tratarlo como sección de alternativa, no como skill aparte, para no duplicar cobertura con `three-js-web`.

## Listo para propuesta

Sí. El orquestador debe confirmar con el usuario: (a) ¿skill de curaduría o archivo raíz para las 10 referencias? (b) que el stack 3D se apile en UNA skill `three-js-web` (three.js + R3F + drei) con Spline como sección, ubicada en `05-frontend`, y (c) que se añada la fila de delimitación en la overlap-matrix.
