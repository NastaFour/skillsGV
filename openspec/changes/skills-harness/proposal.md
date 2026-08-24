# Propuesta: skills-harness

## Intent

El catálogo (129 skills) solo funciona por convención: sin orquestador, fases, registro de delegación ni almacén en runtime; SDD vive en el monolito professional-planner. Objetivo: instalar el catálogo, leer AGENTS.md y que el agente trabaje autónomo con la metodología — idéntico en OpenCode (multi-agente) y Antigravity (single-agent). Audiencia sin definir (no condiciona el diseño).

## Scope

### Slice 1 — Harness + bootstrap + lote piloto (este cambio)

- Orquestador `sdd-orchestrator` + agentes de fase `sdd-*` (propose→spec→design→tasks→apply→verify→archive) con DAG y contrato de resultado.
- Abstracción de almacén: engram/openspec/hybrid/none + topic keys `sdd/{change}/{artifact}`.
- Bootstrap de un comando: `install-skills.mjs` + regla de arranque en AGENTS.md.
- Registro `.atl/skill-registry.md` + delegación por paths exactos.
- Matriz de solapamiento del router.
- Lote piloto: 5 híbridas MCP + pares nano-banana/banana-claude y figma-mcp/figma-implement.
- Seguridad: API key de Context7 → variable de entorno.
- Prerrequisito: recuperación del git corrupto.

### Slice 2+ (diferido)

- Ola de contenido: 46 skills en 09-media-graphics, 10-product-ux, 11-mcp-hybrid; plegado de capas en categorías existentes.
- Routing de modelos (GLM en OpenCode, alias glm en Kiro); telemetría; harness-map; professional-planner como metodología de referencia.
- RDD: solo punto de extensión documentado (post-verify); sin diseñar mecanismo.

### Out of Scope / Non-goals

- GLM como target de skill-sync (es modelo, no harness).
- Modificar `frontend-design` (INTACTA) o contenido de [APP].
- Adoptar el binario gentle-ai (el catálogo ES el harness).
- Definir audiencia del producto.

## Capabilities

### Nuevas

- `harness-orchestration`: orquestador, fases, contrato, DAG, modos.
- `harness-bootstrap`: instalación + arranque autónomo.
- `skill-registry-protocol`: registro `.atl/` + delegación.
- `artifact-store-abstraction`: almacén runtime.
- `overlap-matrix`: matriz del router.
- `catalog-content-wave`: 46 skills + categorías.
- `model-routing-hooks`: perfiles por fase.
- `rdd-extension-point`: contrato post-verify diferido.

### Modificadas

- Ninguna (no existen specs previas en `openspec/specs/`).

## Approach

Enfoque C híbrido + ola E: router/loader/validator/sync/creator como columna; orquestador y fases por etapas; el router auto-descubre las 46 skills por frontmatter (sin cambios de código); validación continua con `validate-output.mjs`.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `00-meta-skills/skill-{router,loader,sync,creator}`, `harness-map.md` | Modificado | Matriz, tier0, bootstrap, registro |
| `00-meta-skills/sdd-orchestrator/` + `sdd-*` | Nuevo | Orquestador y fases |
| `AGENTS.md`, `SKILLS.md`, `professional-planner/`, `01-planning-process/agents/` | Modificado | Arranque, +46 filas, rol metodología, triggers |
| `opencode.json`, `openspec/config.yaml` | Modificado | API key → env; topic keys |
| `.atl/skill-registry.md`, `09-media-graphics/`, `10-product-ux/`, `11-mcp-hybrid/` | Nuevo | Registro y categorías (slice 2) |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Volumen >400 líneas | Alta | Chained PRs desde tasks |
| Solapamiento degrada router | Alta | Matriz previa + smoke tests |
| Doble fuente SDD | Media | professional-planner = metodología |
| Git corrupto bloquea entrega | Alta | Recuperación previa a apply |
| Enforcement por convención | Media | Regla de arranque en AGENTS.md |

## Rollback

Contenido nuevo: aditivo, se elimina. Meta-skills: respaldo previo de router/loader/sync. professional-planner intacto en Slice 1. AGENTS.md: se restaura la tabla actual si falla el arranque.

## Dependencias

- Engram disponible; Node 20+; validación con `validate-skills.mjs --strict`.

## Criterios de éxito

- [ ] Bootstrap en proyecto de prueba: agente autónomo con la metodología (OpenCode y Antigravity).
- [ ] Piloto end-to-end: las 8 fases emiten contrato de resultado.
- [ ] `skill-router` resuelve pares solapados al primario correcto.
- [ ] Lote piloto: `validate-skills.mjs --strict` exit 0.
- [ ] Sin API key de Context7 en `opencode.json`.
- [ ] `tier0-context.json` regenerado; `.atl/` consistente con `SKILLS.md`.

## Preguntas abiertas

- Slice 1: 8 fases completas o piloto (explore, apply).
- Autoría nativa vs. vendored MIT.
- Lote piloto: híbridas vs. capa 2.