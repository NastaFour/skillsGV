# review-policy Specification

## Purpose

Política de review única y documentada (E5): solo lo introducido o empeorado por el cambio bloquea; la deuda preexistente se reporta aparte; los perfiles de arquitectura solo aplican si se declaran explícitamente.

## Requirements

### Requirement: Disposición causal de hallazgos

La política MUST establecer que solo los hallazgos causados por el cambio bajo revisión bloquean su aprobación. La deuda preexistente MUST reportarse aparte (follow-up) sin bloquear.

#### Scenario: Deuda preexistente no bloquea

- GIVEN un cambio en revisión con un defecto preexistente fuera del diff
- WHEN se clasifican los hallazgos
- THEN el defecto preexistente se registra como follow-up documentado
- AND el cambio puede aprobarse si sus hallazgos propios están resueltos

#### Scenario: Hallazgo introducido bloquea

- GIVEN un defecto introducido o empeorado por el diff del cambio
- WHEN se clasifica
- THEN bloquea la aprobación hasta su corrección

### Requirement: Perfiles de arquitectura opt-in

Los perfiles de arquitectura de review (p. ej. conjuntos de lentes adicionales) SOLO aplican cuando se declaran explícitamente; sin declaración, MUST usar la política base única.

#### Scenario: Sin perfil declarado

- GIVEN una revisión sin perfil declarado
- WHEN corre el review
- THEN aplica únicamente la política base (causalidad + reporte aparte)

#### Scenario: Perfil declarado

- GIVEN un perfil declarado explícitamente en la configuración del cambio
- WHEN corre el review
- THEN se aplican las reglas adicionales del perfil declarado
- AND la causalidad de lo introducido/empeorado se mantiene como criterio de bloqueo

### Requirement: Documentación en harness-map

La política MUST quedar documentada en `00-meta-skills/harness-map.md` y SHOULD reflejarse en la skill de review correspondiente, siendo consistente con la disposición causal documentada del punto RDD.

#### Scenario: Fuente única de verdad

- GIVEN `harness-map.md`
- WHEN se consulta la política de review
- THEN la política causal está descrita con sus reglas de bloqueo y reporte
- AND coincide con la documentación de la skill de review y del punto RDD
