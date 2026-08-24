# model-routing-hooks Specification

## Purpose

Hooks de routing de modelos por fase (perfiles de modelo por fase). Diferido a Slice 2.

## Requirements

### Requirement: Perfiles por fase diferidos

El routing de modelos por fase (perfil GLM en OpenCode, alias glm en Kiro) queda DIFERIDO a Slice 2; Slice 1 MUST NOT implementarlo.

#### Scenario: Sin routing de modelos en Slice 1

- GIVEN Slice 1
- WHEN se ejecuta el pipeline
- THEN no hay perfiles de modelo por fase
- AND el routing de modelos se documenta como futuro

### Requirement: GLM no es target de skill-sync

GLM MUST NOT tratarse como target de skill-sync (es un modelo, no un harness); la portabilidad es por routing de modelos (OpenCode/Kiro), diferido a Slice 2.

#### Scenario: Distinción modelo vs. harness

- GIVEN el requisito de portabilidad GLM
- WHEN se planifica
- THEN no se añade GLM como target de skill-sync
- AND se documenta que la portabilidad es por routing de modelos, diferido a Slice 2
