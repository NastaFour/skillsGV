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

### Requirement: Tiers por fase (economía de modelos)

El roster del catálogo MUST declarar un tier por fase SDD siguiendo la nomenclatura nativa (`sdd-strong`/`sdd-mid`/`sdd-cheap`) con modelo y reasoning effort; `sdd-research` y los jueces MUST quedar en strong; `apply` y fix-agent en mid.

#### Scenario: Tier declarado por fase

- GIVEN una fase del pipeline con su perfil
- WHEN se consulta el roster
- THEN la fase tiene tier y reasoning effort declarados
- AND research y jueces figuran en strong, y apply/fix en mid

### Requirement: Provider personalizado en perfiles

El sistema MUST soportar un bloque provider por perfil (baseURL, apiKeyEnv, modelos) persistido en `profiles.json`, con comando `--save-provider` para guardarlo y su inyección al bloque de providers de la configuración del runtime (OpenCode) y al entorno (dsh). Las credenciales MUST referenciarse por variable de entorno (`apiKeyEnv`); MUST NOT almacenarse la clave en claro.

#### Scenario: Guardar provider

- GIVEN un provider custom con baseURL, apiKeyEnv y modelos
- WHEN se ejecuta `--save-provider`
- THEN el bloque queda persistido en el perfil
- AND la clave no aparece en claro en ningún artefacto

#### Scenario: Inyección del provider

- GIVEN un perfil con bloque provider
- WHEN se aplica el perfil a un runtime soportado
- THEN el bloque provider se inyecta en la configuración del runtime (opencode.json) o el entorno (dsh)
- AND un runtime sin soporte reporta la limitación sin fallar

### Requirement: Alineación con perfiles nativos (`sync --profile/--profile-phase`)

El catálogo MUST alinearse con el mecanismo nativo de perfiles (`gentle-ai sync --profile <nombre>:<modelo>` y `--profile-phase <perfil>:<fase>:<modelo>`) y MUST NOT duplicar su mecánica de aplicación; la mecánica concreta de integración se define en design.

#### Scenario: Sin duplicación

- GIVEN el mecanismo nativo de perfiles disponible
- WHEN el catálogo expone su routing por fase
- THEN los nombres de tier/perfil son compatibles con los alias nativos
- AND no existe un motor de perfiles duplicado en el catálogo

