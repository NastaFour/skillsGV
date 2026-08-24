# catalog-content-wave Specification

## Purpose

Ola de contenido: lote piloto en Slice 1 (5 híbridas MCP + pares), con la ola completa de 46 skills diferida a Slice 2.

## Requirements

### Requirement: Lote piloto de Slice 1

Slice 1 MUST incluir el lote piloto: 5 skills híbridas MCP y los pares nano-banana/banana-claude y figma-mcp/figma-implement.

#### Scenario: Piloto incluido

- GIVEN Slice 1 en ejecución
- WHEN se incorpora el lote piloto
- THEN incluye las 5 híbridas MCP y ambos pares

### Requirement: Validación del lote

El lote piloto MUST pasar `validate-skills.mjs --strict` con exit 0.

#### Scenario: Validación estricta del piloto

- GIVEN el lote piloto incorporado
- WHEN se ejecuta `validate-skills.mjs --strict`
- THEN el comando sale con 0

### Requirement: Ola completa diferida a Slice 2

La ola completa (46 skills en 09-media-graphics, 10-product-ux y 11-mcp-hybrid, con plegado de Capa 1→05-frontend, Capa 5→03-ai-ml y Capa 6→02-dev-roles) queda DIFERIDA a Slice 2; Slice 1 MUST NOT implementarla.

#### Scenario: Ola diferida

- GIVEN Slice 1
- WHEN se planifica el alcance
- THEN la ola de 46 skills no se implementa
- AND solo el lote piloto se entrega

## Decisiones abiertas

- **OPEN-3** (lote piloto): priorizar híbridas MCP vs. capa 2 para el lote piloto. Sin resolver.
