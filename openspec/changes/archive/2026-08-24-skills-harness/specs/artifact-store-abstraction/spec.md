# artifact-store-abstraction Specification

## Purpose

Abstracción del almacén de artefactos en runtime con modos engram/openspec/hybrid/none y topic keys `sdd/{change}/{artifact}`.

## Requirements

### Requirement: Modos de almacén

El runtime MUST soportar modos `engram`, `openspec`, `hybrid` y `none`.

#### Scenario: Selección de modo

- GIVEN una sesión SDD
- WHEN se elige el modo de almacén
- THEN las fases persisten y recuperan según ese modo

### Requirement: Topic keys

Los artefactos MUST usar topic keys `sdd/{change}/{artifact}`: proposal, explore, spec, design, tasks, apply-progress, verify-report, archive-report y state.

#### Scenario: Topic key por artefacto

- GIVEN un cambio y un tipo de artefacto
- WHEN una fase persiste su salida
- THEN usa la topic key `sdd/{change}/{artifact}` correspondiente
- AND re-salvar actualiza (upsert), no duplica

### Requirement: Contrato de persistencia por modo

Cada fase MUST persistir su artefacto según el modo: `engram` → mem_save con `capture_prompt: false`; `openspec` → archivos; `hybrid` → ambos; `none` → solo en línea.

#### Scenario: Hybrid persiste en ambos

- GIVEN modo `hybrid`
- WHEN una fase termina
- THEN escribe el archivo openspec y guarda en Engram la misma versión

### Requirement: Recuperación de contenido completo

Los sub-agentes MUST recuperar artefactos vía `mem_search` + `mem_get_observation` (contenido completo, no previews truncadas).

#### Scenario: Recuperación no truncada

- GIVEN un artefacto guardado en Engram
- WHEN un sub-agente lo recupera
- THEN usa `mem_get_observation` para el contenido completo
- AND no usa previews truncadas como fuente
