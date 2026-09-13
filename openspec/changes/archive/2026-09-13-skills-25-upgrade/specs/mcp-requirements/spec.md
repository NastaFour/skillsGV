# mcp-requirements Specification

## Purpose

Requisitos MCP declarados por skill, manifiesto de servidores MCP y fallback determinista para las skills híbridas (`11-mcp-hybrid`), respetando el frontmatter agentskills.io (6 campos permitidos).

## Requirements

### Requirement: Declaración `requires-mcp` en metadata

Las skills dependientes de un servidor MCP MUST declarar sus requisitos en `metadata.requires-mcp` (nunca como campo top-level); el validador MUST rechazar la declaración top-level.

#### Scenario: Declaración válida

- GIVEN una skill de `11-mcp-hybrid` con `metadata.requires-mcp` listando su servidor
- WHEN corre el validador
- THEN la declaración es válida y queda registrada

#### Scenario: Campo top-level inválido

- GIVEN una skill que declara `requires-mcp` como campo top-level
- WHEN corre el validador
- THEN falla por campo no permitido en el frontmatter

### Requirement: Manifiesto MCP

El catálogo MUST mantener `mcp-manifest.json` con los servidores MCP (id, propósito, skills requirentes), validado contra los frontmatters.

#### Scenario: Paridad manifiesto↔skills

- GIVEN un servidor requerido por una skill y ausente del manifiesto
- WHEN corre el gate
- THEN falla indicando la inconsistencia

### Requirement: Fallback determinista sin MCP

Cada skill con `requires-mcp` MUST declarar el comportamiento de fallback cuando el servidor no está disponible (degradación documentada, sin fallar el pipeline).

#### Scenario: Servidor MCP ausente

- GIVEN un runtime sin el servidor MCP requerido
- WHEN la skill se activa
- THEN aplica el fallback declarado
- AND el pipeline no falla por la ausencia del servidor
