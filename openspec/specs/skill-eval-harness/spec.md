# skill-eval-harness Specification

## Purpose

Harness de evals por skill con el esquema Anthropic (`evals.json`), ejecutado con `node:test` e integrado a `pnpm test`.

## Requirements

### Requirement: Esquema de evals por skill

Cada skill con evals MUST declarar `evals.json` conforme al esquema `{ id, prompt, files, expected_output, expectations }`, con al menos 2 prompts reales.

#### Scenario: Eval válido

- GIVEN una skill con `evals.json` con 2+ evals bien formados
- WHEN corre el runner
- THEN ejecuta cada eval y reporta pass/fail por expectativa

#### Scenario: Eval inválido

- GIVEN un `evals.json` con campos faltantes o menos de 2 evals
- WHEN corre el runner
- THEN falla señalando eval y campo inválidos

### Requirement: Runner node:test integrado a pnpm test

El runner de evals MUST ejecutarse con `node:test` y MUST integrarse a `pnpm test`; una expectativa incumplida MUST poner la suite en rojo.

#### Scenario: Expectativa incumplida

- GIVEN un eval cuya salida no cumple una expectativa declarada
- WHEN corre `pnpm test`
- THEN la suite de evals falla identificando eval y expectativa

### Requirement: Loop de optimización documentado

El flujo de evals SHOULD documentar el loop de optimización con historial de resultados por corrida, sin bloquear el gate.

#### Scenario: Historial de corridas

- GIVEN corridas sucesivas de los evals de una skill
- WHEN se consulta el historial
- THEN los resultados quedan registrados por corrida para comparación
