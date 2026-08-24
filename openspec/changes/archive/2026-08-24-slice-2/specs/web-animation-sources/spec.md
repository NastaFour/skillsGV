# web-animation-sources Specification

## Purpose

Skill de curaduría en `05-frontend/` que centraliza las 10 referencias de animación web agrupadas por tópico, con autor y propósito por entrada. Lista curada de fuentes, no instrucciones embebidas.

## Requirements

### Requirement: Skill de curaduría descubrible

El catálogo MUST incluir una skill `web-animation-sources` en `05-frontend/`, con triggers orientados a búsqueda de referencias (p. ej. "hover effects", "loading animation", "entrance animation", "animate.css") para que el router la descubra.

#### Scenario: Descubrimiento por router

- GIVEN una tarea de búsqueda de inspiración/referencias de animación
- WHEN `skill-router` resuelve la consulta
- THEN `web-animation-sources` aparece entre las candidatas
- AND no compite como falso primario con skills de implementación (motion-framer, micro-interactions)

### Requirement: Archivo de referencias agrupadas por tópico

La skill MUST exponer `references/animation-sources.md` con las 10 referencias agrupadas por tópico (hover, loading, 3D, entrance, microinteracciones, background, mouse, librerías CSS, React bits), cada entrada con autor y propósito.

#### Scenario: Contenido curado

- GIVEN el archivo `references/animation-sources.md`
- WHEN se revisa su contenido
- THEN contiene exactamente 10 referencias agrupadas por tópico
- AND cada referencia declara autor y propósito

### Requirement: Lista curada, no instrucciones embebidas

Las referencias externas MUST presentarse como lista curada con atribución; la skill MUST NOT embeber instrucciones paso a paso del contenido externo (mitiga rot de URLs y respeta el vendoring con atribución del catálogo).

#### Scenario: Formato de entrada

- GIVEN cualquier entrada de la lista
- WHEN se compara contra el patrón de vendoring del catálogo
- THEN es un enlace curado con autor/propósito
- AND no contiene código ni procedimientos copiados del sitio fuente

### Requirement: Registro mismo PR

La skill MUST registrarse en `SKILLS.md` (tabla `05-frontend` + contador), `AGENTS.md` (tabla + Auto-Invoke) y `.atl/skill-registry.md` (regen con `skills-loader.mjs --emit-registry`) en el mismo PR.

#### Scenario: Validación estricta

- GIVEN el PR que agrega la skill
- WHEN se ejecuta `validate-skills.mjs --strict`
- THEN exit 0 con los tres índices sincronizados

#### Scenario: Contador desactualizado

- GIVEN la skill agregada sin actualizar contadores
- WHEN corre el validador `--strict`
- THEN falla indicando la inconsistencia de índice
