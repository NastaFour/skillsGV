# skill-registry-protocol Specification

## Purpose

Registro `.atl/skill-registry.md` como índice (no resumen) y protocolo de delegación por paths exactos.

## Requirements

### Requirement: Registro como índice

El sistema MUST mantener `.atl/skill-registry.md` con, por skill: nombre, descripción completa, scope y path exacto.

#### Scenario: Registro indexa cada skill

- GIVEN el catálogo instalado
- WHEN se genera o refresca el registro
- THEN cada skill aparece con nombre, descripción completa, scope y path exacto
- AND excluye `_shared`, `skill-registry` y `sdd-*`

### Requirement: Delegación por paths exactos

El orquestador MUST pasar paths exactos de SKILL.md (no resúmenes digeridos) a los sub-agentes mediante `## Skills to load before work`.

#### Scenario: Delegación inyecta paths

- GIVEN un sub-agente de fase que debe cargar skills
- WHEN el orquestador delega
- THEN inyecta los paths exactos de los SKILL.md en el prompt
- AND el sub-agente lee esos archivos antes de trabajar

### Requirement: Feedback de resolución de skills

Cada resultado de fase MUST reportar `skill_resolution` con uno de: `paths-injected`, `fallback-registry`, `fallback-path` o `none`.

#### Scenario: Reporte de resolución

- GIVEN una fase que terminó
- WHEN devuelve su contrato
- THEN incluye `skill_resolution`
- AND un valor distinto de `paths-injected` indica al orquestador que re-lea el registro

### Requirement: Consistencia con SKILLS.md

El registro `.atl/` MUST mantenerse consistente con `SKILLS.md` (índice del catálogo).

#### Scenario: Consistencia verificada

- GIVEN `SKILLS.md` y `.atl/skill-registry.md`
- WHEN se valida el catálogo
- THEN ambos índices coinciden en nombre y path por skill
