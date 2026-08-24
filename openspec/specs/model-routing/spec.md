# model-routing Specification

## Purpose

Routing de modelos por fase del pipeline SDD mediante una interfaz de catálogo de modelos del runtime (OpenCode, Antigravity, Codex). Provider-agnostic: se define por interfaz de catálogo, nunca por comandos hardcodeados. Sin TUI obligatoria.

## Requirements

### Requirement: Routing por interfaz de catálogo

El sistema MUST definir el routing de modelos por fase a través de una interfaz de catálogo de modelos expuesta por el runtime. El diseño MUST NOT acoplarse a un runtime ni depender de comandos específicos hardcodeados.

#### Scenario: Resolución por fase

- GIVEN el pipeline SDD ejecutándose en un runtime con catálogo de modelos
- WHEN una fase requiere su modelo asignado
- THEN el perfil de esa fase se resuelve vía la interfaz de catálogo
- AND no existe ningún comando de runtime embebido en la definición del routing

#### Scenario: Runtime alternativo

- GIVEN un segundo runtime con catálogo distinto (p. ej. Codex)
- WHEN se aplica el mismo routing por fase
- THEN el mapeo se resuelve contra el catálogo propio de ese runtime
- AND no se reescribe la lógica de routing

### Requirement: Perfiles por fase declarados

El sistema MUST soportar perfiles de modelo por fase SDD (propose, spec, design, tasks, apply, verify), declarados como configuración y persistidos según el mecanismo del runtime.

#### Scenario: Selección persistida

- GIVEN un perfil elegido para una fase
- WHEN la sesión se retoma
- THEN el perfil sigue vigente vía el estado persistido del runtime
- AND no exige re-selección manual

### Requirement: Sin TUI obligatoria

El routing MUST poder operarse sin TUI dedicada; la selección y el estado MAY vivir en configuración/estado del runtime. Una TUI MAY agregarse después sin romper el contrato de catálogo.

#### Scenario: Operación sin TUI

- GIVEN un agente sin interfaz TUI disponible
- WHEN se activa un perfil de fase
- THEN el routing opera igualmente vía configuración y catálogo

### Requirement: Degradación documentada sin catálogo

Si el runtime no expone catálogo de modelos, el sistema MUST degradar de forma documentada (comportamiento actual sin routing) y MUST NOT fallar el pipeline.

#### Scenario: Runtime sin catálogo expuesto

- GIVEN un runtime que no expone catálogo de modelos
- WHEN corre el pipeline
- THEN las fases usan el modelo por defecto del runtime
- AND la limitación queda registrada en la documentación
