# Judgment Ledger — skills-25-upgrade, tramo WU4a–WU5b

**Change**: `skills-25-upgrade` (tramo WU4a–WU5b, 14 commits en `main` sin push)
**Fecha**: 2026-09-13
**Repositorio**: `C:\Users\j1347\Desktop\skills`
**Rango auditado**: `3adc68a..c3e6d8f` (24 archivos, espejo sin sincronizar)
**Veredicto**: **BLOCK / FIX** (Red: 2 CRITICAL deterministas; Blue: FIX explícito)
**Jueces**: `jd-judge-a` (Red) y `jd-judge-b` (Blue), revisión ciega adversarial dual
**Fix**: `jd-fix-agent` (agente de fix quirúrgico, contexto fresco), un solo escritor

---

## 1. Veredicto

El tramo quedó **BLOQUEADO** para push hasta corregir los hallazgos confirmados. Los dos
jueces coincidieron en dos defectos de contrato (no de línea de código): inconsistencia
entre walkers del catálogo por el split de `catalog-doctor`, y contradicción de tiers
entre `agents[]` y `phases` del roster. La verificación propia del orquestador corroboró
ambos overlaps antes de autorizar el fix.

## 2. Hallazgos confirmados

| ID | Severidad | Origen | Hallazgo | Estado |
|---|---|---|---|---|
| CR-1 | 🔴 CRITICAL | Red (determinista) + Blue | Split de `catalog-doctor`: excluido solo en 2 walkers (`_shared/catalog-manifest.mjs`, `skill-validator`) mientras `install-skills`, `check-install-state` y `skills-loader` lo cuentan → install/state reportaban 210 vs 209 declarado; la próxima regeneración del registry indexaba el doctor y `validate --strict` rompía. | ✅ Arreglado (dirección A) |
| CR-2 | 🔴 CRITICAL | Red (determinista) + Blue | Tiers contradictorios: `agents[]` ponía `sdd-propose/spec/design/verify` en `sdd-cheap` mientras `phases` decía strong/strong/mid/mid (y `model-mapping.md` coincidía con `phases`) → el mismo trabajo resolvía a modelos distintos según el mecanismo (apply proyecta el tier del agente; set-models emite las fases). | ✅ Arreglado |
| W-1 | 🟡 WARNING | Red + Blue | MCP undersized: `open-design` referencia el servidor real `mcp-open-design` (con fallback od CLI) sin declarar; `figma-implement` referencia el servidor Figma sin declarar; la inspección previa citó skills inexistentes de `11-mcp-hybrid`. | ✅ Arreglado (declaraciones + manifest) |
| W-2 | 🟡 WARNING | Red (RED-007) + Blue (BLUE-006) | Parity gate ciego a `_shared`: el espejo `gentle-ai-dsh/skills/_shared/**` tenía drift real (roster con tiers viejos, `profiles.json`, schema, `sdd-phase-common.md`) sin detección. | ✅ Arreglado (intersección) |
| D-1 | 🟡 WARNING | Red (RED-004) | `--api-key-env` aceptaba shapes de clave real que cumplen el regex de nombre (`ghp_…`, `AKIA…`, `sk_live_…`). | ✅ Arreglado |
| D-2 | 🟡 WARNING | Red (RED-005) + Blue (BLUE-008) | Merge del `provider` en `apply.mjs`: indentación tomada como slice crudo (configs compactas en una línea → JSON corrupto) y primera coincidencia de `"provider"` sin anclar al root (un provider anidado se confundía con la sección raíz). | ✅ Arreglado |
| D-3 | 🟡 WARNING | Red (RED-006) | `sync-addon --write` sin guardas de `--mirror`: un mirror apuntando al root del repo/catálogo o fuera del repo podía purgar directorios arbitrarios. | ✅ Arreglado |
| D-4 | 🟡 WARNING | Red (RED-008) | `doctor --root` parcial: 2 de 6 checks (`installer-dryrun`, `loader-status`) resuelven el catálogo desde la ubicación del script y no respetan `--root`. | ✅ Arreglado (limitación explícita) |
| D-5 | 🟡 WARNING | Blue (BLUE-004) | Claim falso en `verify-report.md` §catalog-doctor: el self-check NO está integrado y `test:addon` prueba el doctor del addon, no `catalog-doctor`. | ✅ Arreglado (claim corregido) |
| D-6 | 🟡 WARNING | Blue (BLUE-005) | dsh sin inyección real de provider vs spec R2. Verificado contra `tasks.md` 4a.3: la actualización de literales `DSH_*` existe y es acotada; los literales son la única superficie de inyección del preset (provider/model), `baseURL/apiKeyEnv` no son representables. | ✅ Verificado + test agregado |
| D-7 | 🟡 WARNING | Blue (BLUE-007) | `set-models --list` imprimía las fases con `profiles.current` en lugar del perfil resuelto por `--profile`. | ✅ Arreglado |

## 3. Dirección aprobada por el maintainer

**Dirección A** — `catalog-doctor` es una skill real del catálogo: se elimina de las
exclusiones de los walkers y el total pasa a **210 en TODOS lados** (manifest, índices,
prosa, registry, espejo y gates). Se descarta la dirección B (exclusión consistente a 209).

## 4. Resumen del fix

### F1 — `catalog-doctor` → 210
- Exclusiones removidas en `_shared/catalog-manifest.mjs`, `skill-validator` y el walker de `test/catalog-integrity`.
- `catalog.json`, `SKILLS.md` y tabla de `AGENTS.md` regenerados (`generate-indexes --write`); prosa a 210 en README, `openspec/config.yaml`, `harness-map.md`, docs del addon (`AGENTS.md`, `README.md`, `ISSUES.md`, `package.json`, `bin/gentle-dsh.mjs`) y `skill-router`; `tier0-context.{json,md}` y `.atl/skill-registry.md` regenerados; espejo regenerado 210/210.
- `catalog-doctor` pasa `validate --strict` (0 err/0 warn) y su `child_process` queda justificado con `allows-script-exec` (mecanismo existente).
- Nota verificada: el emit del registry imprime `197 skills indexed` porque el registry excluye por contrato 12 `sdd-*` + `skill-registry` (210 − 13 = 197). No es un conteo stale; el archivo `.atl/skill-registry.md` sí estaba stale y quedó regenerado.

### F2 — Tiers del roster
- `roster.json`: `sdd-propose=sdd-strong`, `sdd-spec=sdd-mid`, `sdd-design=sdd-strong`, `sdd-verify=sdd-mid` (el resto sin cambios), alineado con `phases` y `references/model-mapping.md`.
- Test de tiers actualizado (6 strong / 4 mid / 11 cheap) con aserciones de coherencia agente↔fase.
- `gentle-ai-dsh/preset/roster.routing.json` regenerado (derivado del roster; estaba stale incluso respecto del roster anterior).

### F3 — MCP coverage
- Inspección real de `11-mcp-hybrid/**` + `05-frontend/figma-implement`: solo `open-design` (`mcp-open-design`) y `figma-implement` (`figma`) referencian servidores MCP reales; el resto menciona tooling MCP genérico sin server identificable.
- `metadata.requires-mcp` + `metadata.mcp-fallback` declarados en ambas skills (formato condición → acción degradada → límite; el pipeline no falla).
- `mcp-manifest.json`: `figma.requiredBy += figma-implement`; nuevo server `mcp-open-design` con `requiredBy: [open-design]` (paridad bidireccional verificada por doctor).

### F4 — Parity gate y `_shared`
- `sync-addon.mjs` verifica la **intersección** de `_shared/**` (archivos presentes en ambos árboles byte-idénticos; mirror-only permitidos) y `--write` sincroniza esa intersección; la salida de `--check` declara la cobertura exacta.
- Guardas de mirror: el root debe estar estrictamente dentro del catálogo; se rechazan catálogo/ancestros/fuera del repo (exit 2 antes de mutar); las purgas solo tocan directorios skill-like (con `SKILL.md`).
- Drift real sincronizado: `roster.json`, `profiles.json`, `profiles.schema.json`, `sdd-phase-common.md` (4 archivos de la intersección de 11).

### Deltas
- D1 shapes de clave rechazados + tests; D2 indentación real (`lineIndentAt`), anclaje al root (`findNamedObjectAtDepth`) y tests (config compacta + provider anidado); D3 guardas + tests (root/catálogo/fuera + purga selectiva); D4 `rootScope` por check + nota explícita en tabla/JSON/help + tests; D5 perfil resuelto en `--list` + test; D6 test de literales `DSH_*` con provider custom (dry-run JSON, sin tocar el preset); D7 claim corregido.

## 5. Diferido / límites documentados (sin inventar)

1. **`catalog-doctor` como self-check del flujo de instalación** (spec `catalog-doctor`, SHOULD): no está cableado al instalador del addon. El addon tiene su propio `doctor` (verificado en `pnpm test:addon`); `catalog-doctor` se verifica con `test/catalog-doctor.test.mjs` y `pnpm doctor`. El claim falso del verify-report quedó corregido (D7) y el requisito queda pendiente como follow-up.
2. **`doctor --root` para `installer-dryrun` y `loader-status`**: ambos scripts resuelven el catálogo desde su propia ubicación y no aceptan override de root. Se documenta la limitación explícitamente (tabla `rootScope`/`rootNote`, JSON por check y `--help`) en lugar de inventar un flag que los scripts no soportan.
3. **Inyección de `baseURL/apiKeyEnv` en dsh**: el preset no tiene bloque de definición de providers; solo existen literales provider/model (`DSH_*`). La inyección de routing (provider id + modelo) funciona para providers custom (test nuevo); las credenciales quedan como limitación reportada por el adaptador.
4. **Espejo `_shared`**: los archivos canónicos-únicos (`catalog-manifest.mjs`, `eval-harness.mjs`) no se copian al espejo por contrato de intersección; los mirror-only (6 archivos curados del addon) se preservan.
5. **Instalación real multi-runtime**: no fue necesaria. `check-install-state --strict` pasa con los 11 runtimes en `expected 210 · observed 210 · missing 0 · unregistered 0` y el dry-run planifica 210 skills.

## 6. Evidencia de cierre (gates)

| Gate | Resultado |
|---|---|
| `validate-skills.mjs --strict` | **210 pass · 0 with issues · 0 errors · 0 warnings · 214 info** (exit 0) |
| `generate-indexes.mjs --check` | 210 skills · 13 categorías consistentes (exit 0) |
| `pnpm test` | 82/82 pass (exit 0) |
| `pnpm test:addon` | 3/3 pass (exit 0) |
| `sync-addon.mjs --check` | 210 skills en paridad + intersección `_shared` (11 archivos) byte-idéntica (exit 0) |
| `pnpm doctor` | 6/6 checks (exit 0) |
| `check-install-state.mjs --strict` | 11 runtimes · missing 0 · unregistered 0 (exit 0) |
| `pnpm registry:sync` + `validate --strict` | registry regenerado (197 indexadas por exclusión) y validate sin rotura (exit 0) |

---

# Ronda 2 (re-run) — 2026-09-13

**Rango re-auditado**: `ae5735b..b2bb73c` (7 commits del fix de ronda 1, sin push)
**Veredicto**: **SIN bloqueantes** — la re-corrida adversarial dual no emitió bloqueos; produjo overlaps (confirmados por ambos jueces o por evidencia determinista) que este mini-fix convierte en correcciones.
**Fix**: `jd-fix-agent` (ronda 2, contexto fresco), un solo escritor.

## 7. Hallazgos de la ronda 2 y resolución

| ID | Origen | Tipo | Hallazgo | Estado |
|---|---|---|---|---|
| MF1 | RED-001 = BLUE-001 | introducida | `apply.mjs`: el replace quirúrgico del entry de provider perdía la indentación del entry (`findNamedObjectAtDepth` devolvía `{open, close}` sin `nameIdx` → `lineIndentAt(text, undefined)`); JSON válido pero mal formateado en configs pretty-printed. | ✅ Arreglado |
| MF2 | RED-002 | introducida | `agent-roster/SKILL.md` seguía documentando la tabla vieja (`sdd-propose/spec/design/verify` como `sdd-cheap`; strong=4/mid=2/cheap=15) contra el `roster.json` real (`propose/design`=strong, `spec/verify`=mid, 6/4/11); `evals.json` también declaraba conteos viejos. | ✅ Arreglado |
| MF3 | RED-005 | introducida | `apply.mjs`: el root del JSON se descubría con `text.indexOf("{")`; un `{` en un comentario inicial JSONC rompía (desbalanceado → exit 1; balanceado → root falso → inyección dentro del comentario → JSON inválido). | ✅ Arreglado |
| MF4 | RED-003 = BLUE-002 | pre-existente | `set-models.mjs`: `SECRET_SHAPE_PATTERNS` no cubría shapes de clave reales que pasan el regex de nombre (`hf_`, `npm_`, `dop_v1_`). | ✅ Arreglado |
| MF5 | RED-004 = BLUE-003 | pre-existente | `sync-addon.mjs`: la intersección-only dejaba módulos canónicos fuera del espejo (`catalog-manifest.mjs`, `eval-harness.mjs`) mientras `--check` reportaba "full parity"; scripts del espejo los importan. | ✅ Arreglado (unión) |

## 8. Resumen del mini-fix (ronda 2)

- **MF1** — `findNamedObjectAtDepth` devuelve `{ nameIdx, open, close }`; el replace del entry conserva la indentación de su key. Test: config pretty-printed con entry gestionado desactualizado → FORMATO exacto asertado (no solo `JSON.parse`).
- **MF2** — tabla de tiers alineada al roster real (strong=6: `gentle-orchestrator`, 2 jueces, `sdd-research`, `sdd-propose`, `sdd-design`; mid=4: `sdd-apply`, `sdd-spec`, `sdd-verify`, `jd-fix-agent`; cheap=11: 6 lentes + `sdd-init`, `sdd-explore`, `sdd-tasks`, `sdd-archive`, `sdd-onboard`); `evals.json` con 21 agentes y tiers 6/4/11 (expectations offline siguen verdes).
- **MF3** — nuevo `findRootObjectOpen` brace-aware (salta strings y comentarios de línea/bloque) para encontrar el objeto ROOT; sin root válido → rechazo explícito (`exit 1`, nunca inyección a ciegas). Tests: comentario inicial con `{}` + provider → inyección correcta; archivo sin root → rechazo limpio sin mutación.
- **MF4** — denylist ampliada: `hf_`, `npm_`, `dop_v1_`, `shpat_`, `figd_`; tests de rechazo por cada shape nueva.
- **MF5** — `sync-addon.mjs` con política de **UNIÓN**: `--write` copia TODOS los canónicos de `_shared/**` al espejo (mirror-only preservados; 2 módulos nuevos: `catalog-manifest.mjs`, `eval-harness.mjs`); `--check` exige presencia + byte-parity de los 13 canónicos y declara la cobertura con verdad. Tests: hueco/divergencia de `_shared` fallan el gate aun con skills 100% en paridad; `--write` restaura. Smoke: `import('gentle-ai-dsh/skills/_shared/catalog-manifest.mjs')` → `IMPORT-OK`.

## 9. Evidencia de cierre (ronda 2)

| Gate | Resultado |
|---|---|
| `validate-skills.mjs --strict` | **210 pass · 0 with issues · 0 errors · 0 warnings · 214 info** (exit 0) |
| `generate-indexes.mjs --check` | 210 skills · 13 categorías consistentes (exit 0) |
| `pnpm test` | **86/86 pass** (exit 0) |
| `pnpm test:addon` | 3/3 pass (exit 0) |
| `sync-addon.mjs --check` | 210 skills en paridad + `_shared/**` unión: 13 canónicos verificados (presencia + byte-parity), 6 mirror-only permitidos (exit 0) |
| `pnpm doctor` | 6/6 checks (exit 0) |
| `check-install-state.mjs --strict` | 11 runtimes · expected 210 · observed 210 · missing 0 · unregistered 0 (exit 0) |
| `pnpm registry:sync` + `validate --strict` | registry regenerado (197 indexadas por exclusión) y validate sin rotura (exit 0) |

## 10. Limitaciones residuales de la ronda 2 (documentadas, fuera del alcance del mini-fix)

1. **Profundidad de los imports `_shared` en el espejo plano**: los scripts del espejo preservan el import canónico `../../../_shared/...`; con el layout plano (`gentle-ai-dsh/skills/<skill>/scripts/`) esa ruta resuelve un nivel arriba del mirror root (`gentle-ai-dsh/_shared/`). La unión garantiza presencia + byte-parity de los módulos en `gentle-ai-dsh/skills/_shared/**` (hallazgo RED-004/BLUE-003); la normalización de profundidad al copiar a un layout plano es responsabilidad del instalador — `skill-sync` ya reescribe `../../../_shared` → `../../_shared` (`fixSharedImports`) en copias, mientras el instalador del addon copia el espejo tal cual. Follow-up sugerido (fuera de este fix): aplicar la misma normalización en el pipeline del addon. No fue parte de los hallazgos de la ronda 2; se observó durante la verificación del fix.
2. **`catalog-doctor` como self-check del flujo de instalación** y **`doctor --root` parcial**: siguen vigentes las limitaciones residuales de la ronda 1 (§5, ítems 1–2).

## 11. Desviación y remediación post-archivo: Scoping de targets externos en el validador (WU3a)

- **Origen**: Judgment Day inter-proyecto (2026-09-13) detectó que `validate-skills.mjs` (WU3a, `ddb7e66`) ejecutaba `runManifestChecks(target)` incondicionalmente, disparando 3 falsos positivos permanentes sobre carpetas de dominio externas (`manifest-missing`, `manifest-tier0-source-missing`, `manifest-index-orphan-section`).
- **Resolución**:
  - Scoping estricto por identidad de raíz: `resolve(target) === REPO_ROOT` con flag de override `--catalog-root` y variable `SKILLS_CATALOG_OVERRIDE` para fixtures de prueba.
  - Fail-closed preservado en la raíz del catálogo: si falta `catalog.json` en `REPO_ROOT`, sigue fallando con `manifest-missing` (cero fail-open).
  - Targets externos retornan `[]` sin contaminar conteos ni emitir `manifest-skipped`.
  - `generate-indexes.mjs` documentado explícitamente como herramienta de uso exclusivo con raíces de catálogo.
  - Tests en `test/validator-gates.test.mjs` actualizados con `--catalog-root` y nuevo test para target externo (11/11 pass).
  - Paridad de `gentle-ai-dsh` regenerada con `sync-addon.mjs --write` (210 skills en byte parity).


