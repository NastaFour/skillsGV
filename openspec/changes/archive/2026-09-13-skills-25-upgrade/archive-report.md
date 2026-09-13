# Archive Report: skills-25-upgrade

**Change**: `skills-25-upgrade`  
**Proyecto**: `skills-catalog`  
**Fecha de archivo**: 2026-09-13  
**Modo**: hybrid (archivo openspec + Engram project `skills-catalog`, topic `sdd/skills-25-upgrade/archive-report`)  
**Repo**: `C:\Users\j1347\Desktop\skills`  
**Estado al cierre**: `main` @ `c3e6d8f` («feat(doctor): add catalog-doctor and mcp-manifest with bidirectional parity») + commit final de archivado SDD; working tree limpio tras commit.

---

## Veredicto de cierre

**CAMBIO ARCHIVADO — SDD CYCLE COMPLETE.**  
Verificación final **PASS**, 0 blockers, 0 critical issues.  
Las 48 tareas y subtareas del plan de implementación y verificación (WU0 a WU5b) se encuentran marcadas como completadas `[x]` en `tasks.md`.  
Los 11 commits de implementación encadenados (`d140556` .. `c3e6d8f`) forman la historia lineal verificada en `main`. Los 10 delta specs fueron sincronizados a `openspec/specs/` con verificación de integridad por diff GNU, y la carpeta del cambio fue trasladada mecánicamente a `openspec/changes/archive/2026-09-13-skills-25-upgrade/`.

---

## Estado final (autoridad del cierre)

Los siguientes hechos reflejan el estado **AL CIERRE** y tienen precedencia sobre cualquier snapshot intermedio:

1. **Tareas**: 48/48 tareas `[x]` en `tasks.md` (persistido y archivado). Todas las unidades de trabajo (`WU0`, `WU1a`, `WU1b`, `WU2`, `WU3a`, `WU3b`, `WU4a`, `WU4b`, `WU5a`, `WU5b`) completadas y documentadas en `apply-progress.md`.
2. **Verificación final (`sdd-verify`)**: Veredicto PASS. Ejecución técnica determinista sobre el árbol real en `main`.
3. **Calidad y Gates en verde (8/8)**:
   - `catalog-doctor`: 6/6 checks PASS (exit 0) — diagnostica `validator-strict`, `installer-dryrun`, `loader-status`, `manifest-consistency`, `dependency-check`, `mcp-parity`.
   - `validate-skills.mjs --strict`: 209/209 pass, 0 errors, 0 warnings, 213 info (exit 0).
   - `pnpm test`: 75/75 tests pass (exit 0).
   - `pnpm test:addon`: 3/3 tests pass (exit 0).
   - `sync-addon.mjs --check`: 209/209 skills en paridad byte-a-byte entre catálogo canónico y espejo (`gentle-ai-dsh/skills/`).
   - `generate-indexes.mjs --check`: 209 skills, 13 categorías consistentes contra `catalog.json`.
   - `check-install-state.mjs --strict`: 11 runtimes verificados (`claude-code`, `opencode`, `cursor`, `copilot`, `codex`, `gemini-cli`, `antigravity`, `kiro`, `windsurf`, `deepseek`, `dsh`), missing=0, unregistered=0.
   - `agent-roster-tiers.test.mjs`: 12/12 pass (exit 0) cubriendo 21 agentes, 3 tiers nativos, sincronización de argumentos de perfiles y ruteo dsh.
4. **Higiene del repositorio**:
   - Respetada estrictamente la regla pnpm-only en todas las fases.
   - Ningún commit previo contiene rastros de `openspec/changes/` ni `.atl/`.
   - `catalog-doctor` opera como meta-herramienta excluida del conteo de 209 skills canónicas (`EXCLUDED_DIRS`) preservando la invariante del manifiesto.
5. **Reviews nativos formalmente diferidos**:
   - `gentle-ai review status` se encuentra en estado `clean` y `authoritative: true`.
   - La emisión y cierre formal de recibos en la interfaz nativa queda diferida para ejecución desde una sesión interactiva OpenCode/Claude Code, sin impacto sobre los artefactos archivados.

---

## Task Completion Gate

- `tasks.md` archivado: 48/48 checkboxes `[x]`
  - WU0 (Espejo WIP + gate install-state): 7/7 `[x]` (0.1–0.7)
  - WU1a (Manifiesto + generador de índices): 5/5 `[x]` (1a.1–1a.5)
  - WU1b (Truth-up documental): 6/6 `[x]` (1b.1–1b.6)
  - WU2 (RDD activo): 5/5 `[x]` (2.1–2.5)
  - WU3a (Gates del validador): 5/5 `[x]` (3a.1–3a.5)
  - WU3b (Evals + suites): 4/4 `[x]` (3b.1–3b.4)
  - WU4a (Provider custom): 4/4 `[x]` (4a.1–4a.4)
  - WU4b (Tiers nativos + roster): 3/3 `[x]` (4b.1–4b.3)
  - WU5a (sync-addon + espejo): 3/3 `[x]` (5a.1–5a.3)
  - WU5b (doctor + MCP): 6/6 `[x]` (5b.1–5b.6)
- `apply-progress.md` archivado: acumuló las 10 Work Units con hashes de commit, comandos ejecutados y evidencia de diff/tests.
- `verify-report.md` archivado: veredicto técnico PASS exhaustivo de 170 líneas.

---

## Sincronización de Delta Specs → Main Specs

Los 10 delta specs de `openspec/changes/skills-25-upgrade/specs/` fueron incorporados en `openspec/specs/`:

| Dominio | Tipo | Acción realizada | Requirements resultantes |
|---|---|---|---|
| `catalog-doctor` | Nuevo | Creado directorio y `spec.md` copiado mecánicamente | 3 requirements (`Comando doctor unificado`, `Doctor read-only`, `Doctor como self-check de instalación`) |
| `catalog-manifest` | Nuevo | Creado directorio y `spec.md` copiado mecánicamente | 3 requirements (`Manifiesto único de skills`, `Índices derivados del manifiesto`, `Conteos declarados verificados`) |
| `harness-orchestration` | Existente | Fusión de requisitos: modificado `Gatekeeper en modo auto` (corte al 2º fallo, sin 3er intento) y agregado `Superficie NL-primero` | 9 requirements (8 previos actualizados + 1 agregado) |
| `installer-lifecycle` | Existente | Fusión de requisitos: agregados `Gate de install-state por runtime` y `Mirror generado desde el catálogo canónico` | 7 requirements (5 previos + 2 agregados) |
| `mcp-requirements` | Nuevo | Creado directorio y `spec.md` copiado mecánicamente | 3 requirements (`Declaración requires-mcp en metadata`, `Manifiesto MCP`, `Fallback determinista sin MCP`) |
| `model-routing` | Existente | Fusión de requisitos: agregados `Tiers por fase (economía de modelos)`, `Provider personalizado en perfiles`, `Alineación con perfiles nativos` | 7 requirements (4 previos + 3 agregados) |
| `rdd-extension-point` | Existente | Fusión de requisitos: agregados `Contrato de integración con el recibo RDD nativo` y `Semántica opt-in preservada`; actualizados `Punto de inserción post-verify` y `Mapeo de lentes existentes`; retirados 2 requisitos de Slice 1; preservado diseño AHE | 5 requirements |
| `review-policy` | Existente | Fusión de requisitos: agregados `Judgment Day fuera de la validación SDD` y `Guard de líneas 400/800` | 5 requirements (3 previos + 2 agregados) |
| `skill-eval-harness` | Nuevo | Creado directorio y `spec.md` copiado mecánicamente | 3 requirements (`Esquema de evals por skill`, `Runner node:test integrado a pnpm test`, `Loop de optimización documentado`) |
| `skill-quality-gates` | Nuevo | Creado directorio y `spec.md` copiado mecánicamente | 5 requirements (`Descripción con cláusula de exclusión`, `Presupuesto de 500 líneas por SKILL.md`, `Presupuestos de tokens`, `Check de dependencias`, `Auditoría de scripts`) |

Total: 5 specs nuevos creados, 5 specs existentes fusionados.

---

## Contrato Mecánico de Copia y Readback

1. **Sincronización de specs**:
   - Las 5 specs nuevas se copiaron mecánicamente. El readback con `diff.exe -u` contra su origen en el change produjo salida VACÍA (exit 0 en los 5 casos, byte-idénticos).
   - Las 5 specs existentes se fusionaron preservando estrictamente la estructura canónica y los escenarios Given/When/Then. El diff resultante en `git diff openspec/specs/` reflejó únicamente las adiciones y modificaciones contractuales.
2. **Movimiento de la carpeta del change a archive**:
   - Se generó un snapshot temporal completo de `openspec/changes/skills-25-upgrade/` en `$env:TEMP\skills-25-upgrade-snapshot`.
   - Se trasladó mecánicamente la carpeta a `openspec/changes/archive/2026-09-13-skills-25-upgrade/`.
   - Se verificó que el origen `openspec/changes/skills-25-upgrade` ya NO existe (`Test-Path: False`).
   - Se ejecutó readback estricto con GNU diff:
     `diff -r "$snapshotPath" "openspec/changes/archive/2026-09-13-skills-25-upgrade"` → **exit code 0, 0 diferencias**.
   - Se eliminó el snapshot temporal tras confirmar la integridad 100%.
   - `archive-report.md` fue incorporado de forma aditiva dentro del directorio archivado.

---

## Trazabilidad y Artefactos Archivados

Directorio archivado: `openspec/changes/archive/2026-09-13-skills-25-upgrade/`
- `preproposal.md` ✅ (Exploración preliminar y motivación de la modernización)
- `proposal.md` ✅ (Propuesta aprobada con forecast y dependencias)
- `exploration.md` ✅ (Análisis de viabilidad y runtimes)
- `research.md` ✅ (Investigación técnica profunda)
- `specs/` ✅ (10 especificaciones delta con escenarios Given/When/Then)
- `design.md` ✅ (Decisiones arquitectónicas, trade-offs y diagramas de flujo)
- `tasks.md` ✅ (48/48 tareas completadas `[x]`)
- `apply-progress.md` ✅ (Bitácora completa de implementación de WU0 a WU5b)
- `verify-report.md` ✅ (Reporte de verificación independiente con veredicto PASS)
- `journal/` ✅ (`events.jsonl`, `snapshot.json` del tracking de ejecución)
- `archive-report.md` ✅ (Este documento de cierre)

El directorio activo `openspec/changes/skills-25-upgrade/` fue completamente retirado del árbol activo.

---

## Fuente de Verdad Actualizada

A partir de este archivo, la verdad contractual del catálogo reside en:
- Manifiesto: `catalog.json` (209 skills, 13 categorías, fuente única de verdad).
- Especificaciones maestras: `openspec/specs/` (16 dominios canónicos, incluyendo los 5 nuevos y 5 actualizados).
- Herramientas de diagnóstico: `00-meta-skills/catalog-doctor/` (`pnpm doctor`).
- Evals harness: `_shared/eval-harness.mjs`, `test/evals.test.mjs`, `scripts/run-evals.mjs`.
- Roster y perfiles: `_shared/agent-roster/roster.json` (21 agentes, 3 tiers nativos).
- Espejo sincronizado: `gentle-ai-dsh/skills/` (espejo en paridad 209/209 gobernado por `scripts/sync-addon.mjs`).

---

## Riesgos y Notas de Cierre

1. **Cierre formal de reviews nativos**:
   - El estado de review en el binario nativo está limpio (`authoritative: true`).
   - Se recomienda ejecutar el comando de cierre/receipt en la próxima sesión nativa OpenCode/Claude Code si se requiere trazabilidad adicional en el ledger nativo.
2. **Preservación del conteo de 209 skills**:
   - Futuras adiciones de skills deben respetar el flujo de manifiesto: crear skill → ejecutar `generate-indexes.mjs --write` → verificar con `catalog-doctor`.
3. **Persistencia Engram**:
   - Registrada en el reporte para sincronización en background / sesión con permisos interactivos.

---

## Key Learnings de la Fase Archive

1. **Integridad GNU diff**: El uso de `C:\Program Files\Git\usr\bin\diff.exe` garantiza readback determinista a nivel de byte en entornos Windows, evitando divergencias sutiles de formato de línea.
2. **Fusión selectiva vs. copia total**: Los deltas con `ADDED Requirements` y `MODIFIED Requirements` se integran quirúrgicamente en las specs existentes sin perturbar el contenido previo, mientras que las specs nuevas se copian como unidades canónicas completas.
3. **Snapshot de seguridad pre-move**: Mantener un snapshot temporal durante el movimiento de carpetas y validar con `diff -r` asegura que ningún archivo se corrompa o se pierda antes de eliminar el snapshot.
