# Delta for rdd-extension-point

> Cambio respecto a la spec vigente (`openspec/specs/rdd-extension-point/spec.md`): el cambio es ADITIVO. Los tres requisitos vigentes (punto de inserción post-verify, sin mecanismo en Slice 1, mapeo de lentes) NO cambian y no se repiten aquí; se agregan los requisitos del diseño AHE doc-only (E6).

## ADDED Requirements

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
