# catalog-doctor Specification

## Purpose

Comando doctor unificado del catálogo: valida, simula la instalación, reporta el estado del loader Tier 0 y chequea el entorno.

## Requirements

### Requirement: Comando doctor unificado

El catálogo MUST exponer un comando doctor (script Node ejecutable vía pnpm) que agregue: validación `--strict`, dry-run del instalador, estado del loader (Tier 0/caché) y chequeo de entorno/dependencias.

#### Scenario: Doctor PASS

- GIVEN un catálogo consistente e instalable
- WHEN corre el doctor
- THEN cada chequeo reporta pass y el exit es 0

#### Scenario: Doctor FAIL accionable

- GIVEN un catálogo con al menos un chequeo en fallo
- WHEN corre el doctor
- THEN reporta el chequeo fallido con su causa
- AND el exit es distinto de 0

### Requirement: Doctor read-only

El doctor MUST NOT mutar el filesystem ni el estado de instalación; solo el dry-run simula el plan del instalador sin efectos.

#### Scenario: Sin efectos laterales

- GIVEN una ejecución del doctor
- WHEN finaliza
- THEN ningún archivo ni manifest fue modificado

### Requirement: Doctor como self-check de instalación

El doctor SHOULD integrarse como self-check del flujo de instalación del addon.

#### Scenario: Self-check post-instalación

- GIVEN una instalación recién aplicada
- WHEN corre el self-check
- THEN se ejecuta el doctor y su resultado se reporta al instalador
