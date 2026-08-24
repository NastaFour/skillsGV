# harness-bootstrap Specification

## Purpose

Instalación de un comando y arranque autónomo: instalar el catálogo, leer AGENTS.md y que el agente trabaje autónomo, idéntico en OpenCode y Antigravity.

## Requirements

### Requirement: Instalación de un comando

El sistema MUST proveer un único comando de instalación (`install-skills.mjs --target <ruta>`) que copie las skills a los directorios de los 10 agentes soportados por skill-sync: claude-code, opencode, cursor, copilot, codex, gemini-cli, antigravity, kiro, windsurf y deepseek.

#### Scenario: Instalación detecta agentes instalados

- GIVEN un proyecto de prueba y el script `install-skills.mjs`
- WHEN se ejecuta `install-skills.mjs --target <ruta>`
- THEN copia o enlaza las skills a los directorios de los agentes detectados como instalados
- AND no falla si algún agente no está instalado

### Requirement: Arranque autónomo

Tras la instalación, el agente MUST poder leer AGENTS.md y operar autónomo: Tier 0 siempre cargado y Tier 1 por ruteo del `skill-router`, sin declaración manual del usuario.

#### Scenario: Agente trabaja autónomo tras bootstrap

- GIVEN skills instaladas y AGENTS.md presente
- WHEN el agente inicia en el proyecto de prueba
- THEN carga Tier 0 siempre y rutea Tier 1 vía `skill-router`
- AND no requiere declaración manual de skills

#### Scenario: Regla de arranque presente

- GIVEN el catálogo instalado
- WHEN el agente lee AGENTS.md
- THEN encuentra una regla de arranque que lo fuerza a invocar el router antes de cada turno que pueda invocar otra skill

### Requirement: Seguridad de la API key

La API key de Context7 MUST NOT aparecer en `opencode.json`; MUST resolverse desde una variable de entorno.

#### Scenario: Sin secreto en el repositorio

- GIVEN el catálogo instalado
- WHEN se inspecciona `opencode.json`
- THEN no contiene la API key de Context7 en texto plano
- AND el harness la lee desde una variable de entorno

### Requirement: Prerrequisito de entrega (git)

La entrega y verificación del harness MUST realizarse sobre un repositorio git recuperado; el `.git` corrupto debe recuperarse antes de `apply` y `verify`.

#### Scenario: Git recuperable antes de apply

- GIVEN el repositorio con `.git` corrupto
- WHEN se intenta aplicar o verificar
- THEN se recupera el repositorio primero
- AND no se ejecutan comandos git mutantes sobre metadatos corruptos
