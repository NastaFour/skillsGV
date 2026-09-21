---
schema: gentle-ai.sdd-research/v1
revision: 1
outcome: blocked
change: skills-29-upgrade
project: skills-catalog
artifact_store: openspec
admission:
  decision: denied
  denial_reason: "Runtime capability declaration supplied no evidence grants: documentation=[]; open-web=[]."
  declaration:
    schema: gentle-ai.sdd-research-capability/v1
    granted_by: runtime
    declared_classes: []
    observed_grants:
      documentation: []
      open-web: []
  requested_classes: [documentation, open-web]
  consent_source: "Orchestrator: user selected 'Sí, research acotado' in the research round (2026-09-14)."
  consent_note: "Consent is not a capability grant; evidence capability is never inferred from consent, Bash, generic MCP, persistence access, filenames, or inherited unnamed tools."
intent:
  request_id: null
  revision: null
  lanes:
    - id: L1
      title: "Deltas oficiales 2.7→2.9.1 con fuentes primarias citadas"
      requested_classes: [open-web, documentation]
      scope: "Releases API v2.8.0/v2.8.1/v2.8.2/v2.9.0/v2.9.1 con quotes por claim; refinamiento verificado de las áreas A–E de la exploración."
    - id: L2
      title: "Contrato de review compact-v2 (1.2.0): mapeo sección por sección"
      requested_classes: [open-web, documentation]
      scope: "Artefacto publicado review-provider-contract-1.2.0 vs. instalado 2.9.1 vs. contrato del catálogo; mapa de tratamiento por sección."
sources: []
claims: []
gaps:
  - "Sin grant para la clase `documentation`: la lectura de assets instalados y artefactos locales no es una clase de evidencia admitida en esta corrida."
  - "Sin grant para la clase `open-web`: consultas a la releases API y descarga de artefactos publicados no son una clase de evidencia admitida en esta corrida."
  - "Pedido incompleto para admisión: no se suministró request ID inmutable ni revisión."
recovery:
  - "El orquestador re-emite el pedido inmutable completo (request ID + revisión + lanes + clases solicitadas)."
  - "Adjuntar la declaración `gentle-ai.sdd-research-capability/v1` con grants exactos por clase (p. ej. `open-web` para releases API + artefacto publicado; `documentation` para assets instalados + contrato del catálogo)."
  - "Re-lanzar `sdd-research` solo con la declaración adjunta; la intención retenida (lanes L1/L2) en este artefacto se reutiliza sin re-derivación."
---

# Research — skills-29-upgrade (bloqueado en admisión)

> Estado: `blocked` · Revisión 1 · 2026-09-14 · Almacén: openspec (+ espejo Engram)
> Sin evidencia recolectada y sin claims emitidos. Este artefacto **no debe consumirse como respaldo de proposal ni design**.

## 1 · Resultado y causa

La fase no recolectó evidencia. Dos causas, ambas de admisión:

1. **Declaración de capacidades sin grants**: el runtime suministró `gentle-ai.sdd-research-capability/v1` con `documentation=[]` y `open-web=[]` — ninguna clase de evidencia fue concedida. Las clases que los lanes L1/L2 requieren (`open-web` para las releases API y el artefacto publicado; `documentation` para los assets instalados 2.9.1 y el contrato del catálogo) quedan **no declaradas**.
2. **Pedido incompleto**: no se suministraron request ID inmutable ni revisión, requeridos para correr la fase.

## 2 · Regla aplicada

Del contrato `sdd-research` (Hard Rules / Decision Gates):

- "Admit only `gentle-ai.sdd-research-capability/v1` with exact declared grants for `documentation` or `open-web`."
- "Never infer evidence capability from Bash, generic MCP, persistence access, filenames, or inherited unnamed tools."
- "Denial, partial evidence, or invalid sources emit no unvalidated claim."
- "Admission fails or the immutable request is absent" → `blocked`.

Directiva del runtime para este caso: retener la intención seleccionada y persistir el estado bloqueado sin claims de fuentes.

**Consentimiento ≠ grant**: la selección del usuario ("Sí, research acotado") habilita la fase a nivel producto, pero no sustituye la declaración de capacidades. Sin grant, ni la lectura de assets locales ni el fetch web podían ejecutarse como evidencia, aunque hubiera canales técnicamente disponibles (Bash, MCP genérico).

## 3 · Intención retenida (para recuperación)

| Lane | Título | Clases requeridas |
|---|---|---|
| L1 | Deltas oficiales 2.7→2.9.1 con fuentes primarias citadas (releases v2.8.0–v2.9.1; refinamiento verificado de las áreas A–E de la exploración) | open-web, documentation |
| L2 | Contrato de review compact-v2 (1.2.0): mapeo sección por sección (artefacto publicado vs. instalado 2.9.1 vs. contrato del catálogo) | open-web, documentation |

Ningún extremo del alcance de los lanes fue ejecutado: sin consultas a la releases API, sin descargas del artefacto publicado, sin comparaciones de archivos como evidencia, sin claims.

Nota de trazabilidad: el pedido del orquestador referenciaba `exploration.md` y el research archivado de `skills-25-upgrade` como contexto y formato; se consultaron antes de verificar la admisión. Su contenido no se usa como evidencia ni sustenta claims en esta entrega.

## 4 · Recuperación

1. El orquestador re-emite el pedido inmutable: request ID + revisión + preguntas + clases solicitadas.
2. Adjunta la declaración `gentle-ai.sdd-research-capability/v1` con grants exactos por clase — p. ej. `open-web` (releases API + artefacto publicado) y `documentation` (assets instalados + contrato del catálogo).
3. Re-lanza `sdd-research` con esa declaración; la intención retenida en este artefacto se reutiliza tal cual.

## 5 · Estado persistido

- Este artefacto: `openspec/changes/skills-29-upgrade/research.md` (`outcome: blocked`).
- Espejo Engram: topic key `sdd/skills-29-upgrade/research` (estado bloqueado; sin claims).
