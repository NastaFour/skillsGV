# model-routing-hooks Specification

## Purpose

Hooks de routing de modelos por fase (perfiles de modelo por fase). Activado desde Slice 2 mediante la capability `model-routing`.

## Requirements

### Requirement: Perfiles por fase diferidos

El routing de modelos por fase queda ACTIVADO a partir de Slice 2 mediante la capability `model-routing`. Slice 2 MUST implementar perfiles de modelo por fase resueltos vía interfaz de catálogo de modelos del runtime (OpenCode/Antigravity/Codex), sin comandos hardcodeados.
(Previously: el routing de modelos por fase quedaba DIFERIDO a Slice 2 y Slice 1 MUST NOT implementarlo.)

#### Scenario: Activación en Slice 2

- GIVEN slice-2 aplicado
- WHEN el pipeline SDD corre en un runtime con catálogo de modelos expuesto
- THEN cada fase resuelve su modelo vía perfiles declarados y la interfaz de catálogo
- AND ningún comando de runtime aparece hardcodeado en la definición del routing

#### Scenario: Runtime sin catálogo expuesto

- GIVEN slice-2 aplicado sobre un runtime sin catálogo de modelos
- WHEN corre el pipeline
- THEN las fases usan el modelo por defecto del runtime (degradación documentada)
- AND el pipeline no falla por ausencia de routing

#### Scenario: Distinción modelo vs. harness preservada

- GIVEN el requisito vigente de portabilidad GLM
- WHEN se implementa E1
- THEN GLM sigue sin ser target de skill-sync (es un modelo, no un harness)
- AND la portabilidad se logra por routing de modelos, ahora activo

### Requirement: GLM no es target de skill-sync

GLM MUST NOT tratarse como target de skill-sync (es un modelo, no un harness); la portabilidad es por routing de modelos (OpenCode/Kiro), diferido a Slice 2.

#### Scenario: Distinción modelo vs. harness

- GIVEN el requisito de portabilidad GLM
- WHEN se planifica
- THEN no se añade GLM como target de skill-sync
- AND se documenta que la portabilidad es por routing de modelos, diferido a Slice 2
