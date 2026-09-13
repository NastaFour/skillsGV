# Delta for installer-lifecycle

## ADDED Requirements

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
