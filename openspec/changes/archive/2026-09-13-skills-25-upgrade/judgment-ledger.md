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
