# Delta for overlap-matrix

> Cambio respecto a la spec vigente (`openspec/specs/overlap-matrix/spec.md`): el cambio es ADITIVO. Los requisitos vigentes (matriz, uso por el router, cobertura del lote piloto, smoke test) NO cambian; se agrega un requisito para el grupo unitario de delimitación de `three-js-web`, siguiendo el patrón existente (`hybrid-motion-video`, `hybrid-ux-auditor`).

## ADDED Requirements

### Requirement: Grupo unitario de delimitación three-js-web

La matriz MUST incluir un grupo unitario `{ id: "three-js-web", members: ["three-js-web"] }` cuya nota delimite la skill contra `motion-framer`, `motion-gsap` y `visual-effects` (CSS 3D transforms no es WebGL). No se requiere fila contra `nano-banana`/`banana-claude` (sin solape semántico).

#### Scenario: Query 3D resuelve al primario correcto

- GIVEN una consulta tipo "3d scene / three.js / WebGL"
- WHEN `skill-router` resuelve usando la matriz
- THEN el primario es `three-js-web`
- AND ninguna skill de motion/visual-effects resulta primario falso por menciones de "3D"

### Requirement: Fixture del grupo en smoke tests

El grupo unitario MUST tener su fixture correspondiente en `overlap-smoke-tests.json`, verificado junto con el corpus de replay (E2).

#### Scenario: Smoke test del grupo

- GIVEN el fixture agregado
- WHEN corre el smoke/replay del router
- THEN la consulta esperada resuelve a `three-js-web`
- AND el resultado coincide entre matriz, fixture y corpus
