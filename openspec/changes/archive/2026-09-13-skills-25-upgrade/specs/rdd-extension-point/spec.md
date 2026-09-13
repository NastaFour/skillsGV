# Delta for rdd-extension-point

## ADDED Requirements

### Requirement: Contrato de integración con el recibo RDD nativo

El harness MUST integrarse con el mecanismo RDD del binario nativo sin reimplementarlo: al cerrar `apply` (por cada WU aplicada) MUST verificar la existencia del recibo de review nativo; al retomar una sesión MUST resolver el estado del recibo antes de continuar; sin recibo válido MUST seguir las acciones del gate nativo, sin abrir un presupuesto de review nuevo.

#### Scenario: Chequeo de recibo post-apply

- GIVEN una WU implementada y el modo review activo en el binario
- WHEN `apply` cierra la WU
- THEN el harness verifica la existencia del recibo RDD nativo
- AND si no existe, aplica la acción del gate nativo correspondiente

#### Scenario: Retoma con recibo válido

- GIVEN una sesión retomada con un recibo RDD vigente
- WHEN el harness resuelve el estado
- THEN reutiliza el recibo sin relanzar review
- AND no se crea un presupuesto nuevo

### Requirement: Semántica opt-in preservada

La activación de RDD MUST permanecer opt-in y de propiedad del usuario vía el comando nativo (`review mode enable --scope global`); el catálogo MUST NOT activarlo ni desactivarlo por sí mismo. La integración opera cuando el modo está activo y no exige recibo cuando está inactivo. (Contexto: en este entorno el modo ya fue activado por el usuario; la semántica opt-in rige para entornos futuros y adopciones nuevas.)

#### Scenario: Modo activo por elección del usuario

- GIVEN el usuario activó review mode con `--scope global`
- WHEN corren cambios posteriores
- THEN el harness integra el recibo nativo según este contrato

#### Scenario: Modo inactivo

- GIVEN un entorno sin review mode habilitado
- WHEN corre el pipeline
- THEN el harness no exige recibo RDD
- AND el pipeline no falla por su ausencia

## MODIFIED Requirements

### Requirement: Punto de inserción post-verify

El harness MUST integrar el punto de extensión RDD en dos posiciones activas: el chequeo de existencia del recibo al cerrar `apply` (por WU) y la validación del recibo en el gate previo a `sdd-archive` (`sdd-verify` → gate de review → `sdd-archive`).
(Previously: solo documentaba el punto de inserción entre `sdd-verify` y `sdd-archive`, sin integración activa)

#### Scenario: Punto de inserción declarado

- GIVEN el pipeline SDD
- WHEN se documenta la extensión RDD
- THEN se declaran la verificación post-apply y la validación pre-archive como posiciones activas

### Requirement: Mapeo de lentes existentes (informativo)

La documentación SHOULD señalar que los lentes existentes (`code-reviewer` 4R, `judgment-day` doble juez) mapean a los lentes de review nativos; la ejecución de lentes la decide la capa nativa, no el catálogo.
(Previously: el mapeo se describía "sin activar RDD"; ahora RDD es activo y el catálogo no implementa lentes)

#### Scenario: Mapeo documentado

- GIVEN la documentación del punto de extensión
- WHEN se describe el mapeo
- THEN `code-reviewer` y `judgment-day` se referencian como mapeables a los lentes nativos
- AND queda explícito que el catálogo no ejecuta lentes propios

## REMOVED Requirements

### Requirement: Sin mecanismo en Slice 1

(Reason: la restricción de Slice-1 quedó superada; el mecanismo RDD nativo está activo y este cambio integra su contrato)
(Migration: reemplazado por "Contrato de integración con el recibo RDD nativo")

### Requirement: Sin mecanismo ejecutable por esta extensión

(Reason: superado; la integración con el recibo nativo es activa. La diferición de AHE se mantiene por su propio requisito)
(Migration: la independencia RDD/AHE se conserva en el requisito "Extensión documental con diseño AHE")
