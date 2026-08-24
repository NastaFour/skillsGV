# apply-progress-journal Specification

## Purpose

Journal durable en Node para el progreso de `sdd-apply` (apply-progress): snapshot JSON versionado + historial JSONL append-only + lock exclusivo + IDs idempotentes + recuperación de escrituras interrumpidas. Endurece el merge simple actual; reimplementa los invariantes del kit E3 sin Bash.

## Requirements

### Requirement: Snapshot versionado e historial append-only

El journal MUST mantener un snapshot JSON versionado del estado de apply-progress y un historial JSONL append-only de eventos. Las entradas del historial MUST NOT modificarse ni eliminarse una vez escritas.

#### Scenario: Registro de avance

- GIVEN un lote de tareas aplicadas
- WHEN se registra el progreso
- THEN el snapshot refleja el estado consolidado y el historial agrega un evento nuevo
- AND los eventos previos permanecen intactos

#### Scenario: Mutación prohibida

- GIVEN eventos históricos existentes
- WHEN cualquier operación intenta reescribirlos
- THEN la operación es rechazada (append-only)

### Requirement: Lock exclusivo

Las escrituras al journal MUST estar protegidas por un lock exclusivo que impida escritores concurrentes sobre el mismo change.

#### Scenario: Escritor concurrente

- GIVEN dos procesos intentando escribir simultáneamente
- WHEN el segundo adquiere el lock
- THEN espera o falla de forma controlada
- AND nunca corrompe el snapshot ni el historial

### Requirement: IDs idempotentes

Cada unidad de trabajo registrada MUST tener un ID idempotente: registrar dos veces la misma unidad MUST NOT duplicar su efecto en el snapshot.

#### Scenario: Re-aplicación de una WU

- GIVEN una tarea ya marcada completada con su ID
- WHEN el mismo ID se registra nuevamente
- THEN el snapshot no cambia y no aparece evento duplicado efectivo

### Requirement: Recuperación de escritura interrumpida

Ante una escritura interrumpida (abort a mitad de unidad), la siguiente apertura MUST detectar el estado inconsistente y recuperar sin pérdida de trabajo confirmado.

#### Scenario: Recuperación tras abort

- GIVEN un abort durante la escritura de una unidad de trabajo
- WHEN el journal se abre nuevamente
- THEN el estado queda en el último punto consistente
- AND las unidades confirmadas antes del abort se conservan
- AND la unidad interrumpida queda marcada para reintento, no perdida

### Requirement: Implementación Node sin Bash

El journal MUST implementarse en Node.js (Windows-first) conservando los invariantes del kit fuente (append-only, lock, hash de contrato, IDs idempotentes); MUST NOT portar wrappers Bash.

#### Scenario: Ejecución nativa Windows

- GIVEN el entorno Windows/Node del proyecto
- WHEN corre el journal
- THEN funciona sin dependencias de shell Bash
