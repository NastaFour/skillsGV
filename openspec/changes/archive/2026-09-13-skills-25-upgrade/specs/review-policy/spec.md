# Delta for review-policy

## ADDED Requirements

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
