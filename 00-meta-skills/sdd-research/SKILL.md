---
name: sdd-research
description: "Collect auditable, source-backed evidence for the research lanes the orchestrator selected after sdd-explore; mandatory before sdd-propose when selected. Trigger: orchestrator launches SDD research, research lanes, external evidence, source-backed."
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["research lanes", "external evidence", "source-backed", "sdd research"]
  scope: [global, project]
  delegate_only: true
---

# sdd-research — Evidencia externa SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-research` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-research/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-research` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-research`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-research` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable de INVESTIGACIÓN EXTERNA. Recolecta evidencia auditable y respaldada por fuentes para las lanes de investigación que el orquestador seleccionó. La fase se ofrece después de `sdd-explore` y antes de `sdd-propose`: si el usuario la seleccionó, completarla es OBLIGATORIO antes de `sdd-propose` (gate pre-propuesta). Esta fase no escribe código.

## Qué recibe

Del orquestador:
- Nombre del cambio (ej.: "add-dark-mode")
- Las lanes de investigación seleccionadas (una lane = una pregunta concreta que requiere evidencia externa)
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: opcionalmente lea `sdd/{change-name}/explore` y `sdd-init/{project}`. Guarde el artefacto como `sdd/{change-name}/research`.
- **openspec**: siga la convención openspec y escriba en archivos.
- **hybrid**: siga AMBAS convenciones — persista en Engram Y escriba en filesystem.
- **none**: devuelva solo el resultado.

## Qué hacer

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Entender las lanes

Para cada lane seleccionada identifique:
- La pregunta exacta que la lane debe responder
- Qué decisión de la propuesta depende de esa evidencia

### Paso 3: Recolectar evidencia

Para cada lane, busque fuentes concretas y verificables:
- Documentación oficial y guías de las versiones relevantes
- Repositorios, issues y release notes
- Contratos, RFCs y especificaciones

```
INVESTIGAR:
├── Leer documentación oficial de las versiones afectadas
├── Verificar comportamiento en repositorio y release notes
├── Registrar fecha de acceso y confianza por fuente
└── Mapear la evidencia a la lane que la solicitó
```

**Reglas de evidencia**:
- Todo claim cita una fuente concreta (docs oficiales, repos, contratos, release notes) con fecha de acceso y nivel de confianza (alta/media/baja).
- Ningún claim sin fuente: un claim no respaldado SE DEBE descartar o marcar explícitamente `unverified`.
- No escriba código ni modifique archivos del proyecto.

### Paso 4: Persistir artefacto

**Este paso es OBLIGATORIO — no lo omita.** Prohibido avanzar a `sdd-propose` sin el paquete de evidencia persistido.

Siga la sección **C** del Protocolo Común.
- artifact: `research`
- topic_key: `sdd/{change-name}/research`
- type: `architecture`

### Paso 5: Devolver paquete de evidencia

Devuelva EXACTAMENTE este formato al orquestador (y escriba el mismo contenido en el archivo de research si guarda en filesystem):

```markdown
## Research: {change-name}

### Lanes
1. **{lane}** — {pregunta}
   - Evidencia: {hallazgo} — fuente: {URL o documento}, acceso: {fecha}, confianza: {alta/media/baja}
   - Unverified: {claims descartados o sin fuente, si los hay}

### Recommendation
{Qué implica la evidencia para la propuesta}

### Risks
- {Riesgo 1}

### Ready for Proposal
{Sí/No — y qué debería decirle el orquestador al usuario}
```

## Reglas

- NO modifique código ni archivos existentes.
- SIEMPRE cite fuentes concretas con fecha de acceso y confianza; nunca presente un claim no verificado como hecho.
- Mantenga el paquete CONCISO — el orquestador necesita evidencia accionable, no una novela.
- Si una lane no puede cerrarse con evidencia suficiente, márquela como abierta y diga qué falta.
- Si no hay lanes seleccionadas o falta el nombre del cambio, devuelva `status: blocked` indicando la entrada faltante y no avance.
- Envelope de retorno según la sección **D** del Protocolo Común.

## Referencias

- [Protocolo Común de Fase SDD](../../_shared/sdd-phase-common.md) — carga de skills, recuperación, persistencia y envelope de resultado.
- Contrato de fase tipado: `gentle-ai.sdd-research/v1`.
