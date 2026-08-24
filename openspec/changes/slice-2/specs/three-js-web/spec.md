# three-js-web Specification

## Purpose

Skill de desarrollo web 3D en `05-frontend/` que cubre three.js + react-three-fiber (R3F) + drei como una sola unidad, con Spline documentado como sección de alternativa no-code. Material extendido por faceta en `references/`.

## Requirements

### Requirement: Skill única para el stack 3D web

El catálogo MUST incluir una única skill `three-js-web` en `05-frontend/` que cubra three.js, react-three-fiber y drei como unidad cohesiva (cadena de dependencias usada junta en React).

#### Scenario: Cobertura como unidad

- GIVEN una tarea de 3D web en React (escena, modelos, helpers)
- WHEN `skill-router` resuelve la consulta
- THEN `three-js-web` es el primario único para el stack three/R3F/drei
- AND no existen skills separadas por librería (three-js, react-three-fiber, drei)

#### Scenario: Ubicación de categoría

- GIVEN la creación de la skill
- WHEN se ubica en el árbol del catálogo
- THEN vive en `05-frontend/`
- AND no se crea en `09-media-graphics/` (generación raster, no 3D en tiempo real)

### Requirement: Material por faceta en references/

El `SKILL.md` MUST enlazar material extraído en `references/*.md` cubriendo al menos: core three.js, patrones R3F, helpers drei, performance/WebGL y Spline.

#### Scenario: Facetas enlazadas

- GIVEN el cuerpo del `SKILL.md`
- WHEN se revisan los enlaces
- THEN cada faceta tiene su archivo en `references/`
- AND ningún enlace está huérfano (validador `--strict`)

### Requirement: Spline como sección no-code, no skill aparte

Spline MUST documentarse como sección de alternativa no-code dentro de `three-js-web`. El cambio MUST NOT crear una skill separada de Spline.

#### Scenario: Alternativa no-code

- GIVEN un usuario que no escribe código WebGL
- WHEN consulta la skill
- THEN encuentra la sección Spline como alternativa
- AND no existe duplicación de cobertura en otra skill

### Requirement: Cumplimiento agentskills.io y registro mismo PR

La skill MUST cumplir la spec agentskills.io (frontmatter válido, nombre lowercase-hyphen, carpeta == nombre) y MUST registrarse en `SKILLS.md`, `AGENTS.md` y `.atl/skill-registry.md` en el mismo PR.

#### Scenario: Registro completo

- GIVEN el PR que agrega la skill
- WHEN se ejecuta `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict`
- THEN exit 0 con los tres índices sincronizados y contador actualizado (149→151 junto con `web-animation-sources`)

#### Scenario: PR sin registro

- GIVEN la skill creada sin tocar los índices
- WHEN corre el validador `--strict`
- THEN falla señalando la entrada faltante en cada índice
