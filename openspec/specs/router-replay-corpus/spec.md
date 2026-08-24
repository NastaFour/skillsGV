# router-replay-corpus Specification

## Purpose

Benchmark determinista del `skill-router`: corpus JSONL de casos de ruteo (consulta → primario esperado) + replay sin llamar modelos + métricas agregadas. Extiende los smoke tests existentes (`overlap-smoke-tests.json`) sin costo de modelos.

## Requirements

### Requirement: Corpus JSONL de ruteo

El sistema MUST mantener un corpus en formato JSONL donde cada línea es un caso con consulta de entrada y primario esperado. El corpus SHOULD incluir los casos existentes de `overlap-smoke-tests.json` y los nuevos grupos (incluido `three-js-web`).

#### Scenario: Caso bien formado

- GIVEN cualquier línea del corpus
- WHEN se valida su estructura
- THEN contiene consulta, primario esperado y metadatos mínimos
- AND una línea malformada se reporta con su número de línea

### Requirement: Replay determinista sin modelos

El replay MUST ejecutar el router sobre el corpus completo sin invocar ningún modelo de lenguaje, y MUST producir resultados idénticos ante entradas idénticas (determinismo).

#### Scenario: Ejecución offline

- GIVEN el corpus cargado
- WHEN se corre el replay sin red ni credenciales de modelos
- THEN todos los casos se evalúan y el proceso termina exitosamente
- AND no se realiza ninguna llamada a un modelo

#### Scenario: Determinismo

- GIVEN dos ejecuciones consecutivas sobre el mismo corpus
- WHEN se comparan sus salidas
- THEN ambas son idénticas byte a byte en métricas y coincidencias

### Requirement: Métricas agregadas

El replay MUST emitir métricas agregadas: total de casos, coincidencias exactas, discrepancias (consulta, esperado vs. obtenido) y tasa de acierto.

#### Scenario: Reporte de discrepancias

- GIVEN un caso cuyo primario obtenido difiere del esperado
- WHEN se genera el resumen
- THEN la discrepancia aparece listada con consulta, esperado y obtenido
- AND la tasa de acierto refleja el fallo

### Requirement: Integración con verificación existente

El corpus y el replay SHOULD integrarse con la verificación del proyecto (`validate-skills.mjs --strict` / smoke del router), de modo que un grupo nuevo de overlap-matrix tenga su caso en el corpus.

#### Scenario: Grupo nuevo cubierto

- GIVEN la incorporación del grupo `three-js-web` a la matriz
- WHEN corre el replay
- THEN existe al menos un caso cuya consulta esperada resuelve a `three-js-web`
