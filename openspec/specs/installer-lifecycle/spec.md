# installer-lifecycle Specification

## Purpose

Ciclo de vida seguro de `install-skills.mjs`: manifest de ownership de archivos instalados, dry-run, uninstall que solo elimina archivos propios, y rollback de una generación. Port del concepto del kit E4 a Node, sin copiar sus wrappers Bash.

## Requirements

### Requirement: Manifest de ownership

El instalador MUST registrar en un manifest los archivos que crea/modifica por instalación (destino, origen, hash), de modo que la propiedad de cada archivo sea verificable.

#### Scenario: Instalación registrada

- GIVEN una ejecución exitosa del instalador
- WHEN se consulta el manifest
- THEN cada archivo tocado figura con destino, origen y contenido registrado
- AND los archivos preexistentes ajenos no figuran como propios

### Requirement: Dry-run

El instalador MUST soportar modo dry-run que muestre exactamente qué haría la instalación (archivos creados/sobrescritos) sin mutar el filesystem.

#### Scenario: Simulación sin efectos

- GIVEN `--dry-run`
- WHEN corre el instalador
- THEN reporta el plan completo de cambios
- AND ningún archivo es creado, modificado ni eliminado

### Requirement: Uninstall solo archivos propios

El uninstall MUST eliminar únicamente los archivos registrados como propios en el manifest. Los archivos ajenos o modificados externamente MUST NOT eliminarse; SHOULD reportarse como retenidos.

#### Scenario: Desinstalación segura

- GIVEN una instalación previa con manifest
- WHEN se ejecuta el uninstall
- THEN solo se eliminan los archivos propios
- AND cualquier archivo ajeno o editado por el usuario permanece y se lista como retenido

#### Scenario: Uninstall sin manifest

- GIVEN ausencia de manifest de una instalación
- WHEN se solicita uninstall
- THEN aborta con error claro sin eliminar nada arbitrario

### Requirement: Rollback de una generación

El instalador MUST poder revertir la última generación de instalación al estado previo, usando la información del manifest.

#### Scenario: Reversión puntual

- GIVEN una generación instalada sobre un estado previo conocido
- WHEN se solicita rollback
- THEN los archivos propios vuelven al estado previo (restaurados o eliminados si eran nuevos)
- AND el rollback queda registrado en el historial/manifest

### Requirement: Implementación Node con invariantes preservados

La implementación MUST ser Node.js (Windows-first) y MUST preservar los invariantes del concepto fuente (ownership, journal durable, reversibilidad); MUST NOT copiar los wrappers Bash del kit.

#### Scenario: Ejecución nativa Windows

- GIVEN el entorno Windows/Node del proyecto
- WHEN se ejecutan install/uninstall/rollback/dry-run
- THEN operan sin dependencia de Bash

### Requirement: Gate de install-state por runtime

La instalación MUST verificarse con un gate de estado por runtime que compare el conteo de `SKILL.md` de cada runtime contra el manifiesto del catálogo, verifique los manifiestos de instalación sincronizados y detecte skills extraídas sin registro (failure mode explícito).

#### Scenario: Conteo divergente

- GIVEN un runtime instalado cuyo conteo de `SKILL.md` difiere del manifiesto
- WHEN corre el gate de install-state
- THEN falla indicando runtime, conteo esperado y conteo observado

#### Scenario: Skill extraída no registrada

- GIVEN una skill presente en un runtime sin registro en el manifiesto de instalación
- WHEN corre el gate
- THEN reporta el failure mode de extracción no registrada
- AND la instalación no se considera consistente

### Requirement: Mirror generado desde el catálogo canónico

El espejo del addon MUST generarse DESDE el catálogo canónico mediante el script de sync; MUST NOT editarse a mano y MUST NOT ser fuente de verdad.

#### Scenario: Regeneración del espejo

- GIVEN el catálogo canónico como fuente
- WHEN corre el script de sync
- THEN el espejo queda regenerado desde el catálogo

#### Scenario: Edición directa del espejo

- GIVEN una edición manual del espejo
- WHEN corre el gate de paridad
- THEN la divergencia se detecta y se exige regenerar desde el canónico
