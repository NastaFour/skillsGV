# Delta for harness-orchestration

## ADDED Requirements

### Requirement: Superficie NL-primero

El harness MUST aceptar la invocación en lenguaje natural como superficie primaria de las meta-operaciones SDD; los slash commands (`/gentle-sdd-*`, meta-comandos) MUST ser alias opcionales, nunca requisito.

#### Scenario: NL sin slash

- GIVEN un usuario que pide en lenguaje natural iniciar un cambio SDD sin usar slash command
- WHEN el orquestador interpreta la intención
- THEN la meta-operación corre igual que vía slash

#### Scenario: Slash como alias

- GIVEN un slash command equivalente disponible
- WHEN el usuario lo invoca
- THEN ejecuta la misma meta-operación que la ruta NL
- AND la documentación presenta el NL como forma primaria

## MODIFIED Requirements

### Requirement: Gatekeeper en modo auto

En modo `auto`, el orquestador MUST validar el resultado de cada fase antes de lanzar la siguiente: conformidad de contrato, existencia del artefacto, sin alucinaciones, sin deriva del alcance y coherencia de ruteo. Ante fallo del gate, el orquestador MUST re-ejecutar la MISMA fase exactamente UNA vez con feedback correctivo; un SEGUNDO fallo MUST detener la cadena (corte al segundo fallo) y escalar el reporte al usuario; MUST NOT existir un tercer reintento automático.
(Previously: definía solo el retry único y "si vuelve a fallar, detiene la cadena y reporta", sin semántica explícita de corte al segundo fallo ni prohibición de tercer intento)

#### Scenario: Gatekeeper detecta artefacto faltante

- GIVEN una fase que reporta éxito pero no produjo artefacto legible
- WHEN el gatekeeper valida
- THEN el gatekeeper falla y reintenta la fase una vez
- AND si vuelve a fallar, detiene la cadena y reporta

#### Scenario: Segundo fallo escala y detiene

- GIVEN una fase que falló el gate y ya fue re-ejecutada una vez
- WHEN el segundo resultado vuelve a fallar el gate
- THEN la cadena se detiene y se escala el reporte al usuario
- AND no se lanza un tercer intento automático
