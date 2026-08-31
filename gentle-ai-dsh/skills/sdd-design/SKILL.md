---
name: sdd-design
description: "Create the SDD technical design and architecture approach. Trigger: orchestrator launches design for a change."
license: MIT
allowed-tools: Read Write Edit
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["design sdd", "diseño técnico", "arquitectura sdd"]
  scope: [global, project]
---

# sdd-design — Diseño técnico SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-design` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-design/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-design` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-design`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-design` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable del DISEÑO TÉCNICO. Toma la propuesta y los specs, y produce un `design.md` que captura CÓMO se implementará el cambio — decisiones de arquitectura, flujo de datos, cambios de archivos y justificación técnica.

## Qué recibe

Del orquestador:
- Nombre del cambio
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: lea `sdd/{change-name}/proposal` (requerido) y `sdd/{change-name}/spec` (opcional — puede no existir si corre en paralelo con sdd-spec). Guarde como `sdd/{change-name}/design`.
- **openspec**: siga la convención openspec y escriba `design.md` en filesystem.
- **hybrid**: siga AMBAS convenciones — persista en Engram Y escriba `design.md` en filesystem. Recupere dependencias de Engram (primario) con respaldo en filesystem.
- **none**: devuelva solo el resultado. Nunca cree ni modifique archivos del proyecto.

## Qué hacer

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Leer el codebase

Antes de diseñar, lea el código real que se verá afectado:
- Entry points y estructura de módulos
- Patrones y convenciones existentes
- Dependencias e interfaces
- Infraestructura de tests (si existe)

### Paso 2a: Matriz de amenazas por aplicabilidad

Si el diseño cambia routing, comandos de shell, subprocesos, automatización VCS/PR, clasificación de ejecutables o integración de procesos, incluya una matriz de amenazas en el design. Marque cada fila `Applicable` o `N/A` explícito con razón. Defina comportamiento seguro/fallido esperado y tests RED planeados para cada caso aplicable. Si no existe ninguna de estas fronteras, registre la matriz como no aplicable; no fabrique tareas irrelevantes.

### Paso 3: Escribir design.md

**SI el modo es `openspec` o `hybrid`:** cree el documento de diseño:

```
openspec/changes/{change-name}/
├── proposal.md
├── specs/
└── design.md              ← Usted crea esto
```

**SI el modo es `engram` o `none`:** NO cree directorios ni archivos `openspec/`. Componga el contenido del diseño en memoria — lo persistirá en el Paso 4.

#### Formato del documento de diseño

```markdown
# Design: {Change Title}

## Technical Approach

{Descripción concisa de la estrategia técnica general.
¿Cómo mapea al enfoque de la propuesta? Referencie specs.}

## Architecture Decisions

### Decision: {Título de la Decisión}

**Choice**: {Lo que elegimos}
**Alternatives considered**: {Lo que rechazamos}
**Rationale**: {Por qué esta elección sobre las alternativas}

### Decision: {Título de la Decisión}

**Choice**: {Lo que elegimos}
**Alternatives considered**: {Lo que rechazamos}
**Rationale**: {Por qué esta elección sobre las alternativas}

## Data Flow

{Describa cómo se mueven los datos a través del sistema para este cambio.
Use diagramas ASCII cuando ayuden.}

    Component A ──→ Component B ──→ Component C
         │                              │
         └──────── Store ───────────────┘

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `path/to/new-file.ext` | Create | {Qué hace este archivo} |
| `path/to/existing.ext` | Modify | {Qué cambia y por qué} |
| `path/to/old-file.ext` | Delete | {Por qué se elimina} |

## Interfaces / Contracts

{Defina nuevas interfaces, contratos API, definiciones de tipos o estructuras de datos.
Use bloques de código con el lenguaje del proyecto.}

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | {Qué} | {Cómo} |
| Integration | {Qué} | {Cómo} |
| E2E | {Qué} | {Cómo} |

## Threat Matrix

{Para diseños de routing/shell/process, incluya la matriz de aplicabilidad del Paso 2a.
De lo contrario: `N/A — sin frontera de routing, shell, subproceso, automatización VCS/PR, clasificación de ejecutables o integración de procesos.`}

## Migration / Rollout

{Si este cambio requiere migración de datos, feature flags o rollout por fases, describa el plan.
Si no aplica, indique "No migration required."}

## Open Questions

- [ ] {Cualquier pregunta técnica sin resolver}
- [ ] {Cualquier decisión que necesite input del equipo}
```

### Paso 4: Persistir artefacto

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común.
- artifact: `design`
- topic_key: `sdd/{change-name}/design`
- type: `architecture`

### Paso 5: Devolver resumen

Devuelva al orquestador:

```markdown
## Design Created

**Change**: {change-name}
**Location**: `openspec/changes/{change-name}/design.md` (openspec/hybrid) | Engram `sdd/{change-name}/design` (engram) | inline (none)

### Summary
- **Approach**: {enfoque técnico de una línea}
- **Key Decisions**: {N decisiones documentadas}
- **Files Affected**: {N nuevos, M modificados, K eliminados}
- **Testing Strategy**: {cobertura unit/integration/e2e planeada}

### Open Questions
{Liste preguntas sin resolver, o "None"}

### Next Step
Listo para tasks (sdd-tasks).
```

## Reglas

- SIEMPRE lea el codebase real antes de diseñar — nunca adivine.
- Toda decisión DEBE tener justificación (el «por qué»).
- Incluya paths de archivo concretos, no descripciones abstractas.
- Use los patrones y convenciones REALES del proyecto, no best practices genéricas.
- Si el codebase usa un patrón distinto al que usted recomendaría, nótelo pero SIGA el patrón existente salvo que el cambio lo aborde específicamente.
- Mantenga los diagramas ASCII simples — claridad sobre belleza.
- Aplique cualquier `rules.design` de `openspec/config.yaml`.
- Si tiene preguntas abiertas que BLOQUEAN el diseño, dígalo claramente — no adivine.
- **Presupuesto de tamaño**: el artefacto de diseño DEBE ser menor a 800 palabras. Decisiones de arquitectura como tablas (opción | tradeoff | decisión). Snippets de código solo para patrones no obvios.
- Las filas de matriz de amenazas aplicables son requisitos de diseño y DEBEN propagarse a tasks y tests RED sin cambios; las filas `N/A` explícitas no requieren tarea.
- **Dependencias y bloqueo**: la propuesta es REQUERIDA. Si `sdd/{change-name}/proposal` no existe (ni archivo `openspec/changes/{change-name}/proposal.md`), devuelva `status: blocked` sin escribir el diseño y no avance.
- Envelope de retorno según la sección **D** del Protocolo Común.