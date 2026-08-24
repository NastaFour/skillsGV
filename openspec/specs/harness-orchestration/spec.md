# harness-orchestration Specification

## Purpose

Define el orquestador delgado y los agentes de fase del pipeline SDD, con DAG explícito, contrato de resultado por fase y modos de ejecución, idéntico en OpenCode (multi-agente) y Antigravity (single-agent).

## Requirements

### Requirement: Orquestador delgado catálogo-nativo

El catálogo MUST proveer una skill `sdd-orchestrator` que coordina las fases sin ejecutar el trabajo de fase de forma inline.

#### Scenario: El orquestador delega el trabajo de fase

- GIVEN un cambio SDD activo y un agente de fase disponible
- WHEN el orquestador debe avanzar una fase del DAG
- THEN delega el trabajo al agente de fase correspondiente
- AND no ejecuta el trabajo de la fase él mismo

### Requirement: Agentes de fase separados

El sistema MUST proveer agentes de fase `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify` y `sdd-archive` (además de `sdd-init`, `sdd-explore` y `sdd-onboard`), cada uno como ejecutor independiente.

#### Scenario: Fase propone sin invadir la siguiente

- GIVEN el agente `sdd-propose` en ejecución
- WHEN completa su fase
- THEN emite la propuesta y se detiene
- AND no ejecuta la fase de spec ni de design

### Requirement: Contrato de resultado por fase

Cada agente de fase MUST devolver un contrato con `status`, `executive_summary`, `artifacts`, `next_recommended`, `risks` y `skill_resolution`.

#### Scenario: Fase completa devuelve contrato

- GIVEN un agente de fase que completó su trabajo
- WHEN la fase termina
- THEN devuelve los seis campos del contrato de resultado
- AND el orquestador usa `next_recommended` para ruteo

#### Scenario: Fase bloqueada no avanza

- GIVEN una fase sin su dependencia satisfecha
- WHEN la fase detecta la falta de entrada
- THEN devuelve `status: blocked`
- AND el orquestador no avanza a la fase dependiente

### Requirement: DAG de dependencias

El orquestador MUST respetar el grafo `proposal → specs → tasks → apply → verify → archive`, con `design` ramificando desde `proposal`.

#### Scenario: Orden de fases

- GIVEN un cambio nuevo
- WHEN se avanza el pipeline
- THEN `proposal` precede a `specs` y `design`; `specs` y `design` preceden a `tasks`; `tasks` precede a `apply`; `apply` precede a `verify`; `verify` precede a `archive`
- AND `design` puede ramificar desde `proposal` en paralelo con `specs`

### Requirement: Modos de ejecución

El sistema MUST soportar modo `auto` (fases back-to-back con gatekeeper) y modo `interactive` (pausa y aprobación tras cada fase).

#### Scenario: Modo auto avanza sin pausa

- GIVEN modo `auto` seleccionado
- WHEN una fase termina con éxito y el gatekeeper valida
- THEN el orquestador lanza la siguiente fase sin preguntar al usuario

#### Scenario: Modo interactive pausa

- GIVEN modo `interactive` seleccionado
- WHEN una fase termina
- THEN el orquestador muestra el resumen y espera aprobación antes de continuar

### Requirement: Gatekeeper en modo auto

En modo `auto`, el orquestador MUST validar el resultado de cada fase antes de lanzar la siguiente: conformidad de contrato, existencia del artefacto, sin alucinaciones, sin deriva del alcance y coherencia de ruteo.

#### Scenario: Gatekeeper detecta artefacto faltante

- GIVEN una fase que reporta éxito pero no produjo artefacto legible
- WHEN el gatekeeper valida
- THEN el gatekeeper falla y reintenta la fase una vez
- AND si vuelve a fallar, detiene la cadena y reporta

### Requirement: Portabilidad OpenCode/Antigravity

El harness MUST funcionar de forma idéntica en OpenCode (multi-agente, delegación a sub-agentes) y en Antigravity (single-agent, el orquestador actúa como ejecutor con persistencia entre fases vía Engram).

#### Scenario: Antigravity single-agent

- GIVEN Antigravity sin sub-agentes custom
- WHEN se ejecuta el pipeline SDD
- THEN el orquestador ejecuta las fases inline
- AND usa Engram para persistir el estado entre fases

#### Scenario: OpenCode multi-agente

- GIVEN OpenCode con sub-agentes disponibles
- WHEN el orquestador avanza una fase
- THEN delega a un sub-agente de fase con contexto fresco

## Decisiones abiertas

- **OPEN-1** (alcance Slice 1): implementar los 8 agentes de fase completos, o comenzar con un piloto de dos fases (`explore`, `apply`). Sin resolver.
- **OPEN-2** (autoría): agentes de fase de autoría catálogo-nativa vs. vendored MIT del runtime gentle-ai instalado. Sin resolver.
