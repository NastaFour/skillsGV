---
schema: gentle-ai.sdd-preproposal/v1
revision: 3
change: skills-25-upgrade
project: skills-catalog
artifact_store: hybrid
exploration:
  outcome: ready-for-proposal
  reference:
    openspec: openspec/changes/skills-25-upgrade/exploration.md
    engram: sdd/skills-25-upgrade/explore
research:
  selected: true
  request: "L1 deltas oficiales gentle-ai 2.5.0 -> 2.7.0; L2 respaldo con fuentes de las 9 mejoras adoptadas; L3 evidencia de install-state runtime (WU0)"
  classes: [documentation, open-web]
  admission: granted
  outcome: done
  notes: "Revisión 3: admisión concedida con clases canónicas; L1/L2 completadas con fuentes (S1-S20; claims C1-C14). L3 retirada a handoff de apply/verify. Preguntas abiertas declaradas en el research (engram bug, managed-assets, umbrales 500/2K, 800, atribución por versión)."
  references:
    openspec: openspec/changes/skills-25-upgrade/research.md
    engram: sdd/skills-25-upgrade/research
product_decisions: pending
proposal_ready: false
---

# Pre-propuesta (revisión 3) — skills-25-upgrade

Estado del gate de investigación: **admisión concedida** (clases canónicas `documentation` y
`open-web`) y **research `done`** con evidencia mapeada. La propuesta AÚN no es invocable:
`product_decisions: pending` (7 preguntas de la exploración, propiedad del orquestador) y, por
contrato, `proposal_ready: false` hasta que las decisiones se confirmen y las referencias de
evidencia se validen.

## Consecuencias

- No invocar `sdd-propose`: el gate exige investigación seleccionada `done` **y** decisiones de
  producto confirmadas.
- L3 (install-state / WU0) queda como handoff a apply/verify; no genera claims en research.
- Preguntas abiertas del research (engram bug, managed-assets, umbrales) deben resolverse antes o
  durante la propuesta según impacto.

## Recuperación / continuación

1. Orquestador: presentar la ronda de decisiones de producto y registrar `confirmed`.
2. Validar referencias de evidencia (research.md + Engram, misma revisión) y este preproposal.
3. Recién entonces invocar `sdd-propose` con el handoff confirmado.

## Referencias

- Exploración: `openspec/changes/skills-25-upgrade/exploration.md`
- Engram (exploración): `sdd/skills-25-upgrade/explore`
- Investigación (`done`): `openspec/changes/skills-25-upgrade/research.md` | Engram `sdd/skills-25-upgrade/research`
