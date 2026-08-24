# Propuesta: slice-2 — Media wave (3D + curaduría de animación) y evolución del harness (E1-E5)

## Intent

El catálogo (149 skills) no cubre 3D ni curaduría de referencias de animación, y el harness SDD (Slice 1) dejó diferidas cinco extracciones del kit opencode-agent-orchestration-kit (v1.0.40, Apache-2.0). Este cambio unifica la media wave con la evolución del harness en un solo cambio entregable por PRs encadenados.

## Alcance

### Entregables (In Scope)

Media:
- D1 `three-js-web` — skill única en `05-frontend/` (three.js + R3F + drei como unidad; Spline como sección alternativa no-code), con `references/` por faceta.
- D2 `web-animation-sources` — skill de curaduría en `05-frontend/` con `references/animation-sources.md` (10 referencias agrupadas por tópico, curadas con autor/propósito).
- D3 Registro mismo PR: `SKILLS.md` (tabla + contador 149→151), `AGENTS.md` (tabla + Auto-Invoke), `.atl/skill-registry.md` (regen `--emit-registry`); fila de delimitación en `overlap-matrix.json` + fixture.

Harness (invariantes del kit, reimplementados en Node — Windows/Node-first, sin Bash):
- D4 E1 `model-routing` — routing de modelos por interfaz de catálogo del runtime (provider-agnostic, sin TUI), activa `model-routing-hooks`.
- D5 E2 `router-replay-corpus` — corpus JSONL + replay determinista sin llamar modelos + métricas agregadas.
- D6 E3 `apply-progress-journal` — journal Node: snapshot JSON versionado + historial JSONL append-only + lock + IDs idempotentes + recuperación de escrituras interrumpidas.
- D7 E4 `installer-lifecycle` — manifest de ownership, dry-run, uninstall solo-archivos-propios, rollback de una generación en `install-skills.mjs`.
- D8 E5 `review-policy` — política documentada en `harness-map.md` + skill de review (solo lo introducido/empeorado bloquea; deuda preexistente se reporta aparte; perfiles solo si se declaran).
- D9 E6 `ahe-extension-point` — diseño doc-only del punto AHE (sidecars evaluator/debugger/evolver; niveles static_contract/transcript_replay/live_smoke/manual_oracle), SIN mecanismo ejecutable.

### Non-goals

- Sidecars AHE/RDD ejecutables (diferidos; ver OPEN-1).
- E7 Open Design/Impeccable (ver OPEN-2).
- Spline como skill separada; `09-media-graphics/` intacta.
- Código Bash; adopción del binario gentle-ai.

## Decisiones OPEN

- **OPEN-1 (E6)**: ¿activar los sidecars AHE ahora o seguir diferido? Hasta la decisión, solo existe el diseño doc-only (D9).
- **OPEN-2 (E7)**: Open Design/Impeccable. Tradeoff: workspace de diseño local + checks deterministas de frontend (complementa figma-mcp/figma-implement) vs. costo de mantenimiento y solape con la curaduría de motion. Decidir antes de tasks si entra en slice-2.

## Capabilities

> Contrato con sdd-spec. Inventario `openspec/specs/` verificado.

### Nuevas

- `three-js-web`: skill 3D web (three.js + R3F + drei, Spline no-code).
- `web-animation-sources`: curaduría de las 10 referencias de animación.
- `model-routing`: routing de modelos por catálogo del runtime (E1).
- `router-replay-corpus`: benchmark del router sin modelos (E2).
- `apply-progress-journal`: journal durable del apply (E3).
- `installer-lifecycle`: ciclo de vida seguro del instalador (E4).
- `review-policy`: política de review documentada (E5).
- `ahe-extension-point`: diseño doc-only AHE (E6).

### Modificadas

- `model-routing-hooks`: pasa de diferido a activado por E1.
- `rdd-extension-point`: se extiende con el diseño AHE doc-only (E6).
- `overlap-matrix`: grupo unitario de delimitación para `three-js-web`.

## Approach

Media: opciones 1 y 4 de la exploración (skill de curaduría + una sola skill 3D en `05-frontend`). Harness: extraer invariantes del kit y reimplementarlos en Node (append-only, lock, hash de contrato, IDs idempotentes); E1 por interfaz de catálogo de modelos (OpenCode/Antigravity/Codex), nunca por comando. Registro y validación `--strict` en cada PR; material de terceros vendored con atribución.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `05-frontend/{three-js-web,web-animation-sources}/` | Nuevo | Skills media |
| `SKILLS.md`, `AGENTS.md`, `.atl/skill-registry.md` | Modificado | Registro + contadores |
| `00-meta-skills/skill-router/` (matriz, fixtures, scripts) | Modificado | Fila delimitación + corpus replay (E2) |
| `00-meta-skills/sdd-apply/` | Modificado | Journal apply-progress (E3) |
| `00-meta-skills/skill-sync/scripts/install-skills.mjs` | Modificado | Ciclo de vida (E4) |
| `00-meta-skills/harness-map.md` | Modificado | E5 + punto E6 doc-only |
| `openspec/specs/model-routing-hooks/spec.md` | Modificado | Delta de activación |

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| `--strict` falla sin registro en 3 índices | Alta | Registro mismo PR + regen del registro |
| E1 acoplado a runtime (catálogos distintos) | Media | Interfaz de catálogo, no comandos |
| Port de E3/E4 a Node pierde invariantes | Media | Invariantes documentados + dry-run |
| Volumen >400 líneas | Alta | PRs encadenados desde tasks |
| Rot de las 10 URLs | Media | Lista curada con autor/propósito |

## Rollback

Aditivo: se eliminan skills y archivos nuevos, se revierte el diff de índices. Respaldo previo de `install-skills.mjs`, `overlap-matrix.json` y `harness-map.md`. `--emit-registry` regenera `.atl/` si un PR queda a medias.

## Dependencias

- Node 20+ (verificación: `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict`).
- Kit v1.0.40 (Apache-2.0) como fuente de invariantes; vendoring con atribución.

## Success Criteria

- [ ] `validate-skills.mjs --strict` exit 0 tras slice-2.
- [ ] Router: queries tipo "3d scene three.js" o "three.js webgl" resuelven `three-js-web` como primario (smoke). La query literal «3d» no es alcanzable por diseño: el router descarta tokens de menos de 4 caracteres (`MIN_TRIGGER_LENGTH = 4`).
- [ ] Replay E2 corre sin llamadas a modelos y emite métricas.
- [ ] Journal E3 recupera un write interrumpido sin pérdida.
- [ ] `install-skills.mjs --dry-run` y uninstall solo-propios verificados.
- [ ] E1 activa perfiles por fase vía catálogo en OpenCode sin comandos hardcodeados.
- [ ] `harness-map.md` documenta E5 y el punto AHE (E6, doc-only).
