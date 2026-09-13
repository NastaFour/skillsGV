# catalog-manifest Specification

## Purpose

Manifiesto único (`catalog.json`) como fuente de verdad de skills, categorías y conteos; los índices del catálogo se generan y validan contra él para eliminar el drift de conteos (197/206/208/209).

## Requirements

### Requirement: Manifiesto único de skills

El catálogo MUST mantener un manifiesto `catalog.json` generado por script, con una entrada por skill (id, path, categoría) y los conteos derivados; MUST ser el único origen de verdad de conteos.

#### Scenario: Generación del manifiesto

- GIVEN el árbol completo de skills del catálogo
- WHEN corre el generador del manifiesto
- THEN `catalog.json` lista cada skill con id, path y categoría
- AND el total declarado coincide con las entradas

#### Scenario: Skill nueva sin manifiesto

- GIVEN una skill agregada al árbol sin regenerar el manifiesto
- WHEN corre el gate de paridad
- THEN falla señalando la skill ausente del manifiesto

### Requirement: Índices derivados del manifiesto

`SKILLS.md` y las tablas de skills de `AGENTS.md` MUST generarse desde `catalog.json`; una divergencia MUST fallar el gate de validación.

#### Scenario: Divergencia de índice

- GIVEN un índice con conteo o entrada distinta al manifiesto
- WHEN corre el gate
- THEN falla mostrando el diff índice↔manifiesto

#### Scenario: Regeneración idempotente

- GIVEN índices ya consistentes con el manifiesto
- WHEN se regeneran
- THEN no hay cambios

### Requirement: Conteos declarados verificados

Los conteos de skills declarados en documentación (`AGENTS.md`, `README.md`, `openspec/config.yaml`) MUST validarse contra el manifiesto; el drift de conteos MUST fallar el gate.

#### Scenario: Drift de conteo detectado

- GIVEN un doc que declara 197 skills y un manifiesto con 209
- WHEN corre el gate
- THEN falla indicando doc, valor declarado y valor real

### Requirement: Scoping de targets en validación de manifiesto

`checkCatalog` y los checks `manifest-*` MUST ejecutarse únicamente sobre la raíz del catálogo (`REPO_ROOT` o explícitamente forzado vía `--catalog-root`/`SKILLS_CATALOG_OVERRIDE`). Sobre targets externos (directorios de skills fuera de `REPO_ROOT`), los checks `manifest-*` MUST omitirse retornando cero incidencias para evitar falsos positivos (`manifest-missing`, `manifest-tier0-source-missing`, `manifest-index-orphan-section`). La raíz del catálogo MUST mantener fail-closed estricto ante un `catalog.json` faltante (`manifest-missing`).

#### Scenario: Validación de target externo sin marcadores de catálogo

- GIVEN un directorio de skills externo fuera de `REPO_ROOT` (ej. `skills-roblox`)
- WHEN se ejecuta el validador con `--strict`
- THEN no se ejecutan los checks `manifest-*` y el resultado no contiene errores `manifest-*`

#### Scenario: Validación de la raíz del catálogo sin fail-open

- GIVEN la raíz del catálogo (`REPO_ROOT`) donde falta `catalog.json`
- WHEN se ejecuta el validador
- THEN falla obligatoriamente con `manifest-missing`

