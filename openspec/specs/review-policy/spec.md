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

### Requirement: Judgment Day fuera de la validación SDD

Judgment Day (y los jueces adversariales) MUST limitarse a review de código post-apply/pre-PR; MUST NOT validar pasos de planificación SDD (proposal, spec, design, tasks) ni usarse como gate de fase SDD. Los residuales de documentación que lo describían como paso del pipeline SDD MUST corregirse.

#### Scenario: JD sobre planning rechazado

- GIVEN una invocación de Judgment Day para validar proposal/spec/design/tasks
- WHEN se evalúa el alcance
- THEN se rechaza o redirige al gate correspondiente
- AND no se ejecuta como validación de planning

#### Scenario: JD sobre código

- GIVEN un diff de código post-apply/pre-PR
- WHEN corre Judgment Day
- THEN los dos jueces evalúan el diff según la política adversarial

### Requirement: Guard de líneas 400/800

El presupuesto de review por defecto MUST ser 400 líneas cambiadas (adiciones+deleciones; goldens excluidos del conteo de riesgo); al excederlo MUST consultarse (ASK) la estrategia de entrega (chain/stacked/`size:exception`). El presupuesto por usuario de 800 líneas MUST quedar documentado como techo de preflight con `ask-on-risk`.

#### Scenario: Exceso del default

- GIVEN un cambio proyectado de más de 400 líneas cambiadas
- WHEN se planifica el apply
- THEN se consulta al usuario la estrategia de entrega
- AND no se inicia trabajo sobredimensionado sin resolución

#### Scenario: Preflight de 800 documentado

- GIVEN el presupuesto por usuario de 800 líneas
- WHEN se consulta la documentación de la política
- THEN el techo de preflight y su relación con el default 400 quedan explícitos

