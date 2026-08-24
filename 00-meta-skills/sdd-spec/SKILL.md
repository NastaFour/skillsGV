---
name: sdd-spec
description: "Write SDD delta specs with requirements and scenarios. Trigger: orchestrator launches spec work for a change."
license: MIT
allowed-tools: Read Write Edit
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["spec sdd", "especificaciones", "delta specs", "requisitos"]
  scope: [global, project]
---

# sdd-spec — Specs delta SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-spec` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-spec/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-spec` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-spec`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-spec` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable de escribir SPECIFICACIONES. Toma la propuesta y produce delta specs — requisitos y escenarios estructurados que describen qué se AGREGA, MODIFICA, ELIMINA o RENOMBRA del comportamiento del sistema.

## Qué recibe

Del orquestador:
- Nombre del cambio
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: lea `sdd/{change-name}/proposal` (requerido). Si los specs abarcan múltiples dominios, concaténelos en un único artefacto con headers de dominio. Guarde como `sdd/{change-name}/spec`.
- **openspec**: siga la convención openspec y escriba en archivos.
- **hybrid**: siga AMBAS convenciones — persista en Engram (artefacto único concatenado) Y escriba archivos de dominio en filesystem.
- **none**: devuelva solo el resultado. Nunca cree ni modifique archivos del proyecto.

## Qué hacer

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Identificar dominios afectados

Lea la sección **Capabilities** de la propuesta — es su contrato primario:

```
POR CADA entrada en "New Capabilities":
├── Se convierte en una spec COMPLETA nueva: openspec/specs/<capability-name>/spec.md
└── Escriba una spec completa (no un delta) — no hay comportamiento existente al que referirse

POR CADA entrada en "Modified Capabilities":
├── Se convierte en un DELTA spec: openspec/changes/{change-name}/specs/<capability-name>/spec.md
└── Lea primero el openspec/specs/<capability-name>/spec.md existente — su delta lo modifica
```

Si la propuesta no tiene sección Capabilities (formato antiguo), infiera de «Affected Areas». Pero prefiera siempre el mapeo explícito de Capabilities cuando esté presente.

### Paso 3: Leer specs existentes

**SI el modo es `openspec` o `hybrid`:** si `openspec/specs/{domain}/spec.md` existe, léalo para entender el comportamiento ACTUAL. Sus delta specs describen CAMBIOS a ese comportamiento.

**SI el modo es `engram`:** los specs existentes ya fueron recuperados de Engram en el Contrato de persistencia. Saltee lecturas de filesystem.

**SI el modo es `none`:** saltee — no hay specs existentes que leer.

### Paso 4: Escribir delta specs

**SI el modo es `openspec` o `hybrid`:** cree los specs dentro de la carpeta del cambio:

```
openspec/changes/{change-name}/
├── proposal.md              ← (ya existe)
└── specs/
    └── {domain}/
        └── spec.md          ← Delta spec
```

**SI el modo es `engram` o `none`:** NO cree directorios ni archivos `openspec/`. Componga el contenido del spec en memoria — lo persistirá en el Paso 5.

#### Flujo de trabajo para REQUIREMENTS MODIFICADOS (CRÍTICO — lea antes de escribir deltas)

```
1. Localice el requirement en openspec/specs/{domain}/spec.md
2. COPIE el bloque COMPLETO del requirement — desde `### Requirement:` hasta TODOS sus escenarios
3. PÉGUELO bajo `## MODIFIED Requirements`
4. EDITE la copia para reflejar el nuevo comportamiento
5. Agregue "(Previously: {resumen de una línea de qué cambió})" bajo el texto del requirement

Por qué copiar-completo-y-editar:
→ El paso de archive REEMPLAZA el requirement en los specs principales con su bloque MODIFIED
→ Si su bloque es parcial, el archive perderá escenarios que no copió
→ Error común: escribir solo el escenario cambiado y perder el resto
→ Si agrega comportamiento NUEVO sin cambiar el existente, use ADDED en su lugar
```

#### Formato de delta spec

```markdown
# Delta for {Domain}

## ADDED Requirements

### Requirement: {Nombre del Requirement}

{Descripción usando palabras clave RFC 2119: MUST, SHALL, SHOULD, MAY}

El sistema {MUST/SHALL/SHOULD} {hacer algo específico}.

#### Scenario: {Escenario feliz}

- GIVEN {precondición}
- WHEN {acción}
- THEN {resultado esperado}
- AND {resultado adicional, si existe}

#### Scenario: {Escenario edge case}

- GIVEN {precondición}
- WHEN {acción}
- THEN {resultado esperado}

## MODIFIED Requirements

### Requirement: {Nombre del Requirement Existente}

{Texto completo actualizado del requirement — reemplaza al existente por completo}
(Previously: {cómo era antes, en una línea})

#### Scenario: {Escenario sin cambios — mantener si sigue válido}

- GIVEN {precondición}
- WHEN {acción}
- THEN {resultado}

#### Scenario: {Escenario actualizado o nuevo}

- GIVEN {precondición actualizada}
- WHEN {acción actualizada}
- THEN {resultado actualizado}

## REMOVED Requirements

### Requirement: {Requirement que se elimina}

(Razón: {por qué se deprecia/elimina})
(Migración: {qué lo reemplaza, o "None" si no se necesita migración})

## RENAMED Requirements

### Requirement: {Nombre Antiguo} → {Nombre Nuevo}

(Razón: {por qué se renombra})
(Migración: {cómo deben actualizarse referencias/tests/docs, o "None"})
```

#### Para specs NUEVAS (sin spec existente)

Si es un dominio completamente nuevo, cree una spec COMPLETA (no un delta):

```markdown
# {Domain} Specification

## Purpose

{Descripción de alto nivel del dominio de esta spec.}

## Requirements

### Requirement: {Nombre}

El sistema {MUST/SHALL/SHOULD} {comportamiento}.

#### Scenario: {Nombre}

- GIVEN {precondición}
- WHEN {acción}
- THEN {resultado}
```

### Paso 5: Persistir artefacto

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común.
- artifact: `spec`
- topic_key: `sdd/{change-name}/spec`
- type: `architecture`

### Paso 6: Devolver resumen

Devuelva al orquestador:

```markdown
## Specs Created

**Change**: {change-name}

### Specs Written
| Domain | Type | Requirements | Scenarios |
|--------|------|-------------|-----------|
| {domain} | Delta/New | {N agregados, M modificados, K eliminados} | {total escenarios} |

### Coverage
- Happy paths: {cubiertos/faltantes}
- Edge cases: {cubiertos/faltantes}
- Error states: {cubiertos/faltantes}

### Next Step
Listo para design (sdd-design). Si design ya existe, listo para tasks (sdd-tasks).
```

## Reglas

- SIEMPRE use formato Given/When/Then para escenarios.
- SIEMPRE use palabras clave RFC 2119 (MUST, SHALL, SHOULD, MAY) para la fuerza del requisito.
- Lea la sección **Capabilities** de la propuesta primero — le dice exactamente qué archivos de spec crear.
- Si existen specs, escriba DELTA specs (secciones ADDED/MODIFIED/REMOVED).
- Si NO existen specs para el dominio, escriba una spec COMPLETA.
- Todo requirement DEBE tener al menos UN escenario.
- Incluya escenarios happy path Y edge case.
- Mantenga los escenarios TESTEABLES — alguien debe poder escribir un test automatizado desde cada uno.
- NO incluya detalles de implementación en los specs — los specs describen QUÉ, no CÓMO.
- **Los requirements MODIFICADOS DEBEN ser el bloque COMPLETO** — copie el requirement entero + todos los escenarios del spec principal, luego edite. Los bloques MODIFIED parciales pierden contenido en el archive.
- Si agrega comportamiento nuevo sin cambiar el existente → use ADDED, no MODIFIED.
- Los requirements REMOVED DEBEN incluir Razón y DEBEN incluir Migración cuando afecten consumidores, comportamiento persistido, docs o tests.
- Los requirements RENAMED DEBEN declarar nombre antiguo y nuevo explícitamente y DEBEN incluir guía de Migración para referencias/tests/docs.
- Aplique cualquier `rules.specs` de `openspec/config.yaml`.
- **Presupuesto de tamaño**: el artefacto de spec DEBE ser menor a 650 palabras. Prefiera tablas de requisitos sobre descripciones narrativas. Cada escenario: 3-5 líneas máximo.
- **Dependencias y bloqueo**: la propuesta es REQUERIDA. Si `sdd/{change-name}/proposal` no existe (ni archivo `openspec/changes/{change-name}/proposal.md`), devuelva `status: blocked` sin escribir specs y no avance.
- Envelope de retorno según la sección **D** del Protocolo Común.

## Referencia rápida de palabras clave RFC 2119

| Palabra clave | Significado |
|---|---|
| **MUST / SHALL** | Requisito absoluto |
| **MUST NOT / SHALL NOT** | Prohibición absoluta |
| **SHOULD** | Recomendado, pero pueden existir excepciones con justificación |
| **SHOULD NOT** | No recomendado, pero puede ser aceptable con justificación |
| **MAY** | Opcional |