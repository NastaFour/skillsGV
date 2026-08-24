# ahe-extension-point Specification

## Purpose

Diseño exclusivamente documental (doc-only) del punto de extensión AHE (Agentic Harness Evaluation): sidecars evaluator/debugger/evolver y niveles de evidencia. SIN ningún mecanismo ejecutable — su activación está diferida (decisión OPEN-1).

## Requirements

### Requirement: Diseño documental de sidecars AHE

La documentación MUST describir el diseño de tres sidecars AHE — evaluator (evalúa resultados), debugger (diagnostica fallos) y evolver (propone mejoras del harness) — como punto de extensión del pipeline SDD.

#### Scenario: Sidecars descritos

- GIVEN la documentación del punto AHE
- WHEN se revisa
- THEN los tres sidecars están definidos con su responsabilidad y momento de inserción propuesto
- AND ninguno tiene implementación asociada

### Requirement: Niveles de evidencia definidos

El diseño MUST definir cuatro niveles de evidencia para las evaluaciones AHE: `static_contract`, `transcript_replay`, `live_smoke` y `manual_oracle`, con su criterio de aplicación.

#### Scenario: Niveles enumerados

- GIVEN la sección de niveles de evidencia
- WHEN se revisa
- THEN los cuatro niveles están documentados con cuándo aplica cada uno

### Requirement: Sin mecanismo ejecutable en slice-2

Slice 2 MUST NOT implementar sidecars AHE ni niveles de evidencia ejecutables. El entregable es solo documentación; la decisión de activación queda abierta (OPEN-1).

#### Scenario: Entregable doc-only

- GIVEN slice-2 aplicado
- WHEN se ejecuta cualquier fase SDD
- THEN ningún componente AHE se ejecuta ni intercepta el pipeline
- AND solo existe el diseño documentado

#### Scenario: Detección de scope creep

- GIVEN una tarea derivada de esta spec
- WHEN propone código ejecutable AHE
- THEN queda fuera de alcance por esta restricción doc-only

### Requirement: Ubicación documental junto al punto RDD

La documentación AHE SHOULD ubicarse junto a la documentación del punto RDD en `harness-map.md`, dejando claro que son puntos de extensión relacionados pero independientes.

#### Scenario: Relación documentada

- GIVEN `harness-map.md`
- WHEN se leen los puntos de extensión
- THEN AHE y RDD aparecen como puntos distintos, con su relación explicada
- AND ninguno habilita al otro automáticamente
