# overlap-matrix Specification

## Purpose

Matriz de solapamiento que guía la prioridad del `skill-router` para resolver skills nuevas que solapan semánticamente con skills existentes.

## Requirements

### Requirement: Matriz de solapamiento

El sistema MUST mantener una matriz que mapea skills solapadas a su primario canónico.

#### Scenario: Matriz cubre pares solapados

- GIVEN skills nuevas que solapan con existentes (motion, visual-effects, design-system-tokens, prompt-engineering, dod-checker)
- WHEN se consulta la matriz
- THEN cada par solapado mapea a un primario canónico

### Requirement: El router usa la matriz

`skill-router` MUST usar la matriz para resolver pares solapados al primario correcto.

#### Scenario: Ruteo resuelve al primario correcto

- GIVEN una tarea que dispara skills solapadas
- WHEN `skill-router` resuelve
- THEN devuelve como primario la skill canónica de la matriz
- AND no devuelve primarios falsos por triggers duplicados

### Requirement: Cobertura del lote piloto

La matriz MUST cubrir los pares del lote piloto: nano-banana/banana-claude y figma-mcp/figma-implement, además de las 5 skills híbridas MCP.

#### Scenario: Piloto cubierto

- GIVEN el lote piloto definido
- WHEN se valida la matriz
- THEN los pares piloto y las 5 híbridas MCP están mapeados

### Requirement: Smoke test del router

Cada lote nuevo MUST pasar un smoke test del router (`skill-router.mjs --query`) para verificar que no degrada el ruteo.

#### Scenario: Smoke test del lote

- GIVEN un lote nuevo incorporado
- WHEN se ejecuta el smoke test del router
- THEN el primario resuelto coincide con el esperado de la matriz
