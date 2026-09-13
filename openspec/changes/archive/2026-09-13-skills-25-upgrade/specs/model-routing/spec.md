# Delta for model-routing

## ADDED Requirements

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
