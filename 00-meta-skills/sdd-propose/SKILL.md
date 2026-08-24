---
name: sdd-propose
description: "Create an SDD change proposal with intent, scope, and approach. Trigger: orchestrator launches proposal work for a change."
license: MIT
allowed-tools: Read Write Edit
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["proposal sdd", "propuesta sdd", "nuevo cambio", "new change"]
  scope: [global, project]
---

# sdd-propose — Propuesta de cambio SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-propose` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-propose/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-propose` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-propose`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-propose` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable de crear PROPUESTAS. Toma el análisis de exploración (o la descripción directa del usuario) y produce un documento `proposal.md` estructurado dentro de la carpeta del cambio.

## Qué recibe

Del orquestador:
- Nombre del cambio (ej.: "add-dark-mode")
- Análisis de exploración (de sdd-explore) O descripción directa del usuario
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: lea `sdd/{change-name}/explore` (opcional) y `sdd-init/{project}` (opcional). Guarde el artefacto como `sdd/{change-name}/proposal`.
- **openspec**: siga la convención openspec y escriba en archivos.
- **hybrid**: siga AMBAS convenciones — persista en Engram Y escriba en filesystem. Recupere dependencias de Engram (primario) con respaldo en filesystem.
- **none**: devuelva solo el resultado. Nunca cree ni modifique archivos del proyecto.
- Nunca fuerce la creación de `openspec/` salvo que el usuario haya pedido persistencia en archivos o el modo sea `hybrid`.

## Qué hacer

### Paso 0: Dar forma a la propuesta en modo interactive

- En modo SDD `interactive`, no deje que el ejecutor decida silenciosamente si la propuesta es «suficientemente clara». Ofrezca al usuario una ronda de preguntas de propuesta antes de finalizar: explíquele que las preguntas buscan mejorar el PRD/propuesta descubriendo reglas de negocio, implicaciones, impacto, edge cases y tradeoffs de producto. Deje que el usuario responda, saltee, corrija el encuadre o pida una segunda ronda.
- Las preguntas deben descubrir entendimiento de negocio/producto/PRD, no mecánica del harness. Cubra el subconjunto útil más pequeño de: problema de negocio; usuarios y situaciones objetivo; reglas de negocio; resultado de producto; brecha del estado actual; implicaciones e impacto; edge cases; brechas de decisión; límites de alcance y non-goals; riesgo/tradeoff de negocio.
- Prefiera 3-5 preguntas de producto concretas por ronda. Tras las primeras respuestas, resuma los supuestos resultantes de la propuesta y pregunte si el usuario quiere corregir algo o correr una segunda ronda. No pregunte por comandos de test, forma del PR, presupuesto de líneas u otras decisiones de harness salvo que el usuario pida explícitamente hablar de entrega. Si no puede preguntar directamente, escriba una sección `## Proposal question round` en el resultado con las preguntas y supuestos que necesitan revisión del usuario.

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Crear directorio del cambio

**SI el modo es `openspec` o `hybrid`:** cree la estructura de la carpeta del cambio:

```
openspec/changes/{change-name}/
└── proposal.md
```

**SI el modo es `engram` o `none`:** NO cree directorios `openspec/`. Salte este paso.

### Paso 3: Leer specs existentes

**SI el modo es `openspec` o `hybrid`:** si `openspec/specs/` tiene specs relevantes, léalas para entender el comportamiento actual que este cambio podría afectar.

**SI el modo es `engram`:** el contexto existente ya fue recuperado de Engram en el Contrato de persistencia. Saltee lecturas de filesystem.

**SI el modo es `none`:** saltee — no hay specs existentes que leer.

### Paso 4: Escribir proposal.md

```markdown
# Proposal: {Change Title}

## Intent

{Qué problema resolvemos y por qué necesita ocurrir este cambio.
Sea específico sobre la necesidad del usuario o la deuda técnica.}

## Scope

### In Scope
- {Entregable concreto 1}
- {Entregable concreto 2}
- {Entregable concreto 3}

### Out of Scope
- {Lo que explícitamente NO hacemos}
- {Trabajo futuro relacionado pero diferido}

## Capabilities

> Esta sección es el CONTRATO entre las fases de propuesta y specs.
> El agente sdd-spec la lee para saber exactamente qué archivos de spec crear o actualizar.
> Investigue `openspec/specs/` antes de completarla.

### New Capabilities
<!-- Capacidades introducidas. Cada una se convierte en un nuevo `openspec/specs/<name>/spec.md`.
     Use nombres kebab-case (ej.: user-auth, data-export, api-rate-limiting).
     Déjela vacía si no hay capacidades nuevas. -->
- `<capability-name>`: <descripción breve de qué cubre>

### Modified Capabilities
<!-- Capacidades existentes cuyos REQUIREMENTS cambian (no solo implementación).
     Liste aquí solo si cambia el comportamiento a nivel de spec. Cada una necesita un delta spec.
     Use nombres de spec existentes de openspec/specs/. Déjela vacía si no hay. -->
- `<existing-capability-name>`: <qué requisito cambia>

## Approach

{Enfoque técnico de alto nivel. Cómo resolveremos el problema.
Referencie el enfoque recomendado de la exploración si existe.}

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `path/to/area` | New/Modified/Removed | {Qué cambia} |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| {Descripción del riesgo} | Low/Med/High | {Cómo mitigamos} |

## Rollback Plan

{Cómo revertir si algo sale mal. Sea específico.}

## Dependencies

- {Dependencia externa o prerrequisito, si existe}

## Success Criteria

- [ ] {Cómo sabemos que este cambio tuvo éxito}
- [ ] {Resultado medible}
```

### Paso 5: Persistir artefacto

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común.
- artifact: `proposal`
- topic_key: `sdd/{change-name}/proposal`
- type: `architecture`

### Paso 6: Devolver resumen

Devuelva al orquestador:

```markdown
## Proposal Created

**Change**: {change-name}
**Location**: `openspec/changes/{change-name}/proposal.md` (openspec/hybrid) | Engram `sdd/{change-name}/proposal` (engram) | inline (none)

### Summary
- **Intent**: {resumen de una línea}
- **Scope**: {N entregables dentro, M ítems diferidos}
- **Approach**: {enfoque de una línea}
- **Risk Level**: {Bajo/Medio/Alto}

### Next Step
Listo para specs (sdd-spec) o design (sdd-design).
```

## Reglas

- En modo `openspec`, SIEMPRE cree el archivo `proposal.md`.
- Si el directorio del cambio ya existe con una propuesta, LÉALA primero y ACTUALÍCELA.
- Mantenga la propuesta CONCISA — es una herramienta de pensamiento, no una novela.
- Toda propuesta DEBE tener plan de rollback.
- Toda propuesta DEBE tener criterios de éxito.
- Use paths de archivo concretos en «Affected Areas» cuando sea posible.
- Aplique cualquier `rules.proposal` de `openspec/config.yaml`.
- **SIEMPRE complete la sección Capabilities** — es el contrato con sdd-spec. Investigue `openspec/specs/` primero para usar nombres de capacidades existentes correctos.
- New Capabilities → cada una se convertirá en `openspec/specs/<name>/spec.md` (spec completa nueva).
- Modified Capabilities → cada una se convertirá en un delta spec en la carpeta del cambio.
- Si nada cambia a nivel de spec (refactor puro, cambio de config), escriba explícitamente «None» en ambas subsecciones — no las deje como placeholders de plantilla.
- **Presupuesto de tamaño**: la propuesta DEBE ser menor a 450 palabras. Use bullets y tablas sobre prosa. Los headers organizan, no explican.
- **Dependencias y bloqueo**: si no hay nombre de cambio y no hay descripción del usuario, devuelva `status: blocked` indicando la entrada faltante y no avance.
- Envelope de retorno según la sección **D** del Protocolo Común.