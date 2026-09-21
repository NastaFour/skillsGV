# rdd-extension-point Specification

## Purpose

Punto de extensión RDD e integración contractual con el ciclo de review nativo del runtime (Native Compact Review Orchestration, gentle-ai 3.4.0).

## Requirements

### Requirement: Contrato de integración con el ciclo de review nativo

El harness MUST integrarse con el mecanismo RDD del binario nativo sin reimplementarlo: al cerrar `apply` (por cada WU aplicada) MUST correr el preflight selectorless del ciclo de review nativo (`review status --contract gentle-ai.review-integration/v2 --next-transition`) y rutar SOLO desde el `next_transition` devuelto; al retomar una sesión MUST resolver el estado del candidato antes de continuar; nunca MUST abrir un presupuesto de review nuevo fuera de una acción nativa.

#### Scenario: Preflight post-apply

- GIVEN una WU implementada y el modo review activo en el binario
- WHEN `apply` cierra la WU
- THEN el harness corre el preflight STATUS sobre el candidato del worktree actual
- AND rutea solo desde el `next_transition` devuelto, sin abrir presupuesto propio

#### Scenario: Retoma con candidato activo

- GIVEN una sesión retomada con una transacción de review activa para el candidato
- WHEN el harness resuelve el estado
- THEN continúa el binding existente vía su `next_transition` sin relanzar review
- AND un target ya acknowledged (`target_already_acknowledged`) no se re-revisiona

### Requirement: Semántica opt-in preservada

La activación de RDD MUST permanecer opt-in y de propiedad del usuario vía el comando nativo (`review mode enable --scope global`); el catálogo MUST NOT activarlo ni desactivarlo por sí mismo. La integración opera cuando el modo está activo y no exige recibo cuando está inactivo. (Contexto: en este entorno el modo ya fue activado por el usuario; la semántica opt-in rige para entornos futuros y adopciones nuevas.)

#### Scenario: Modo activo por elección del usuario

- GIVEN el usuario activó review mode con `--scope global`
- WHEN corren cambios posteriores
- THEN el harness integra el ciclo de review nativo según este contrato

#### Scenario: Modo inactivo

- GIVEN un entorno sin review mode habilitado
- WHEN corre el pipeline
- THEN el harness no exige recibo RDD
- AND el pipeline no falla por su ausencia

### Requirement: Punto de inserción post-verify

El harness MUST integrar el punto de extensión RDD en dos posiciones activas: el preflight de review al cerrar `apply` (por WU) y el preflight de review en el gate previo a `sdd-archive` (`sdd-verify` → preflight de review → `sdd-archive`).

#### Scenario: Punto de inserción declarado

- GIVEN el pipeline SDD
- WHEN se documenta la extensión RDD
- THEN se declaran el preflight post-apply y el preflight pre-archive como posiciones activas

### Requirement: Gates informativos y acknowledgement exacto

Los comandos `review validate`/gates (`post-apply`, `pre-commit`, `pre-push`, `pre-pr`, `release`) MUST tratarse como compatibility/informational only: nunca descubren autoridad ni deciden la entrega (`invalidated/unmanaged` habilitados, `disabled/unmanaged` deshabilitados). Solo el acknowledgement exacto del ciclo nativo quema autoridad y artefactos (envelope `gentle-ai.review-acknowledged/v1`); commit, push, PR y release quedan fuera del lifecycle bajo política ordinaria del repositorio.

#### Scenario: Gate no decide entrega

- GIVEN un gate de entrega ejecutado tras un review acknowledged
- WHEN se consulta su resultado
- THEN es informational (`invalidated/unmanaged` o `disabled/unmanaged`)
- AND la decisión de entrega queda bajo política ordinaria del repositorio

#### Scenario: Acknowledgement quema autoridad

- GIVEN una transacción de review con captura final aprobada
- WHEN STATUS reofrece el acknowledgement exacto y se ejecuta
- THEN quema la autoridad y artefactos de esa transacción (envelope `gentle-ai.review-acknowledged/v1`)
- AND un target consumido no se re-revisiona

### Requirement: Mapeo de lentes existentes (informativo)

La documentación SHOULD señalar que los lentes existentes (`code-reviewer` 4R, `judgment-day` doble juez) mapean a los lentes de review nativos; la ejecución de lentes la decide la capa nativa, no el catálogo.

#### Scenario: Mapeo documentado

- GIVEN la documentación del punto de extensión
- WHEN se describe el mapeo
- THEN `code-reviewer` y `judgment-day` se referencian como mapeables a los lentes nativos
- AND queda explícito que el catálogo no ejecuta lentes propios

### Requirement: Extensión documental con diseño AHE

La documentación del punto RDD en `harness-map.md` MUST incorporar el diseño doc-only de AHE (sidecars evaluator/debugger/evolver y niveles de evidencia `static_contract`, `transcript_replay`, `live_smoke`, `manual_oracle`) como punto de extensión relacionado pero independiente.

#### Scenario: Documentación extendida

- GIVEN `harness-map.md` con el punto RDD documentado
- WHEN slice-2 aplica su delta
- THEN la sección incluye el diseño AHE doc-only referenciando el punto RDD
- AND queda explícito que activar uno no habilita al otro
