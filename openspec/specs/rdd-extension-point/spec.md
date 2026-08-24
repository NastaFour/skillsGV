# rdd-extension-point Specification

## Purpose

Punto de extensión RDD documentado post-verify, sin diseñar el mecanismo (diferido post-verify).

## Requirements

### Requirement: Punto de inserción post-verify

El harness MUST documentar un punto de inserción RDD limpio en post-verify, pre-archive (`sdd-verify` → gate de review → `sdd-archive`).

#### Scenario: Punto de inserción declarado

- GIVEN el pipeline SDD
- WHEN se documenta la extensión RDD
- THEN se declara la inserción entre `sdd-verify` y `sdd-archive`

### Requirement: Sin mecanismo en Slice 1

Slice 1 MUST NOT diseñar ni implementar el mecanismo RDD (sin congelamiento de candidato, sin recibo/receipt y sin validación en gates de entrega).

#### Scenario: Sin comportamiento RDD

- GIVEN Slice 1
- WHEN se ejecuta `verify`
- THEN no se invoca ningún mecanismo de review RDD
- AND solo existe la documentación del punto de extensión

### Requirement: Mapeo de lentes existentes (informativo)

La documentación SHOULD señalar que los lentes existentes (`code-reviewer` 4R, `judgment-day` doble juez) mapean a los lentes de review de gentle-ai, sin activar RDD.

#### Scenario: Mapeo documentado

- GIVEN la documentación del punto de extensión
- WHEN se describe el mapeo
- THEN `code-reviewer` y `judgment-day` se referencian como mapeables a los lentes de review, sin activarlos

### Requirement: Extensión documental con diseño AHE

La documentación del punto RDD en `harness-map.md` MUST incorporar el diseño doc-only de AHE (sidecars evaluator/debugger/evolver y niveles de evidencia `static_contract`, `transcript_replay`, `live_smoke`, `manual_oracle`) como punto de extensión relacionado pero independiente.

#### Scenario: Documentación extendida

- GIVEN `harness-map.md` con el punto RDD documentado
- WHEN slice-2 aplica su delta
- THEN la sección incluye el diseño AHE doc-only referenciando el punto RDD
- AND queda explícito que activar uno no habilita al otro

### Requirement: Sin mecanismo ejecutable por esta extensión

Esta extensión documental MUST NOT introducir ningún mecanismo ejecutable (ni sidecars AHE ni gates RDD). La activación de ambos puntos permanece diferida (OPEN-1).

#### Scenario: Pipeline sin comportamiento nuevo

- GIVEN slice-2 aplicado
- WHEN corre el pipeline entre `sdd-verify` y `sdd-archive`
- THEN no se ejecuta ninguna evaluación AHE ni gate RDD nuevo
- AND solo cambió la documentación del punto de extensión
