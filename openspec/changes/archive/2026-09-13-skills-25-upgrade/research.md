---
schema: gentle-ai.sdd-research/v1
revision: 3
outcome: done
change: skills-25-upgrade
project: skills-catalog
artifact_store: hybrid
admission:
  decision: granted
  declaration:
    schema: gentle-ai.sdd-research-capability/v1
    granted_by: orchestrator
    consent_source: "ronda de producto del usuario 'Research primero' (2026-09-11)"
    declared_classes: [documentation, open-web]
  observed_grants:
    documentation: "repo-local docs (gentle-ai-dsh/*, openspec/*, AGENTS.md, README.md, SKILLS.md, PLAN-DSH-*.md, installed runtime dirs); mecanismo: file reads"
    open-web: "github.com/Gentleman-Programming/gentle-ai; anthropic.com/Agent Skills; agentskills.io; mecanismo: fetch con cita de URL (canal efectivo en runtime: Context7)"
  l3_handling: "retirada de research por decisión del orquestador; nota de handoff sin clase de evidencia y sin claims; gate de instalación se define y ejecuta en apply/verify (WU0)"
questions:
  - "L1 — deltas 2.5.0→2.7.0: rename, NL, RDD, guard, jueces, bug engram, economía de modelos, codegraph; novedades 2.6/2.7"
  - "L2 — respaldo con fuentes de las 9 mejoras adoptadas; discriminación de lo ya satisfecho por el catálogo"
  - "L3 — evidencia de install-state runtime: diferida a apply/verify (handoff, sin claims)"
sources:
  - id: S1
    class: documentation
    title: "Exploration skills-25-upgrade (baseline interno)"
    publisher: "skillsGV (local)"
    url: "openspec/changes/skills-25-upgrade/exploration.md"
    accessed_at: "2026-09-11"
    excerpt: "209 skills validadas; deltas 2.5 mapeados; WIP sin commitear; minería de sesiones dsh."
  - id: S2
    class: documentation
    title: "sdd-orchestrator SKILL (catálogo)"
    publisher: "skillsGV (local)"
    url: "00-meta-skills/sdd-orchestrator/SKILL.md"
    accessed_at: "2026-09-11"
    excerpt: "En gentle-ai 2.5.0 los comandos SDD se renombraron a /gentle-sdd-*; gatekeeper: fallo → re-ejecutar UNA vez; segundo fallo → detener la cadena."
  - id: S3
    class: documentation
    title: "AGENTS.md del addon dsh"
    publisher: "skillsGV (local)"
    url: "gentle-ai-dsh/AGENTS.md"
    accessed_at: "2026-09-11"
    excerpt: "Regla Alan: el NL siempre funciona; el slash es alias opcional. §7 codegraph-first con caída a grep/read. Doctor al arranque."
  - id: S4
    class: documentation
    title: "persistence-contract (bundle dsh)"
    publisher: "skillsGV (local)"
    url: "gentle-ai-dsh/skills/_shared/persistence-contract.md"
    accessed_at: "2026-09-11"
    excerpt: "Natural-language triggers always work too — the slash commands are an optional alias, not a requirement. /gentle-sdd-new|ff|continue."
  - id: S5
    class: documentation
    title: "judgment-day SKILL (catálogo)"
    publisher: "skillsGV (local)"
    url: "02-dev-roles/judgment-day/SKILL.md"
    accessed_at: "2026-09-11"
    excerpt: "MUST NOT validate SDD planning steps (proposal/spec/design/tasks); código post-apply/pre-PR. Residual: 'Judgment Day is a phase gate inside SDD' (línea 112)."
  - id: S6
    class: documentation
    title: "validate-skills.mjs (validador del catálogo)"
    publisher: "skillsGV (local)"
    url: "00-meta-skills/skill-validator/scripts/validate-skills.mjs"
    accessed_at: "2026-09-11"
    excerpt: "desc present/≤1024 + aviso desc-when bilingüe; index-sync SKILLS.md/AGENTS.md; registry-consistency con .atl; compatibility ≤500; sin checks de tamaño, scripts, deps ni manifiesto."
  - id: S7
    class: documentation
    title: "package.json del catálogo"
    publisher: "skillsGV (local)"
    url: "package.json"
    accessed_at: "2026-09-11"
    excerpt: "scripts: test, validate, validate:strict, router, registry:sync, skills:sync. Sin doctor."
  - id: S8
    class: documentation
    title: "Runtime dsh instalado (AGENTS.md + manifests)"
    publisher: "local runtime (~/.dsh)"
    url: "C:/Users/j1347/.dsh/AGENTS.md"
    accessed_at: "2026-09-11"
    excerpt: "Context7 declarado como canal de docs; bootstrap de MCPs; tiers de modelos; RDD opt-in; doctor al arranque; preset gentle-ai instalado 2026-08-31."
  - id: S9
    class: documentation
    title: "PLAN-DSH (fases 1 y 2 del harness)"
    publisher: "workspace del harness (local)"
    url: "Desktop/Proyectos programacion/trabajos/gentle-ai + deepseek harness/PLAN-DSH-MEJORAS.md"
    accessed_at: "2026-09-11"
    excerpt: "Hardening A1-A6, design-driven D1-D6, harvest C1-C2, pendientes E1-E5 y potencias G1-G6."
  - id: S10
    class: open-web
    title: "gentle-ai docs/trigger-rules.md"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/docs/trigger-rules.md"
    accessed_at: "2026-09-11"
    excerpt: "review mode enable --scope global (única forma de encenderlo); status/disable global|clone; install (full) y sync (refresh managed content)."
  - id: S11
    class: open-web
    title: "gentle-ai internal/assets/skills/_shared/sdd-phase-common.md"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/internal/assets/skills/_shared/sdd-phase-common.md"
    accessed_at: "2026-09-11"
    excerpt: "Default PR review budget: 400 changed lines (additions + deletions); goldens excluidos del conteo de riesgo y dentro del snapshot."
  - id: S12
    class: open-web
    title: "gentle-ai internal/assets/opencode/sdd-orchestrator.md"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/internal/assets/opencode/sdd-orchestrator.md"
    accessed_at: "2026-09-11"
    excerpt: "Gatekeeper post-fase re-ejecuta la fase una vez y reporta; meta-comandos /sdd-new, /sdd-continue, /sdd-ff manejados por el orquestador."
  - id: S13
    class: open-web
    title: "gentle-ai internal/model/codex_model.go"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/internal/model/codex_model.go"
    accessed_at: "2026-09-11"
    excerpt: "Tiers sdd-strong/sdd-mid/sdd-cheap con modelo y reasoning effort por fase; sdd-research y jueces en strong; apply/fix-agent en mid."
  - id: S14
    class: open-web
    title: "gentle-ai internal/opencode/models.go"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/internal/opencode/models.go"
    accessed_at: "2026-09-11"
    excerpt: "SDDPhases() incluye sdd-research; ReviewRefuterAgent/ReviewValidatorAgent; ReviewPhases = lentes + refuter + validator."
  - id: S15
    class: open-web
    title: "gentle-ai docs/usage.md + docs/opencode-profiles.md + specs/sdd-profiles"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/docs/usage.md"
    accessed_at: "2026-09-11"
    excerpt: "sync --profile <nombre>:<modelo> y --profile-phase <perfil>:<fase>:<modelo>; estrategias external-single-active / generated-multi; nombres slug con reservados."
  - id: S16
    class: open-web
    title: "gentle-ai archived spec 2026-06-14-organic-agent-trigger-rules"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/openspec/changes/archive/2026-06-14-organic-agent-trigger-rules/specs/spec.md"
    accessed_at: "2026-09-11"
    excerpt: "Tier-3: post-sdd-phase en [design, apply] → judgment-day strong (evidencia histórica del binding JD↔SDD)."
  - id: S17
    class: open-web
    title: "gentle-ai internal/sddstatus/status.go"
    publisher: "Gentleman Programming (GitHub)"
    url: "https://github.com/gentleman-programming/gentle-ai/blob/main/internal/sddstatus/status.go"
    accessed_at: "2026-09-11"
    excerpt: "shouldTryEngram: openspec/config.yaml declarado, env GENTLE_AI_SDD_STATUS_ENGRAM o .engram/ seleccionan Engram sin crear openspec/."
  - id: S18
    class: open-web
    title: "anthropics/skills — README + skill-creator + quick_validate.py"
    publisher: "Anthropic (GitHub)"
    url: "https://github.com/anthropics/skills/blob/main/README.md"
    accessed_at: "2026-09-11"
    excerpt: "description = qué hace y cuándo usarla; 6 campos permitidos (name, description, license, allowed-tools, metadata, compatibility); name kebab ≤64; desc ≤1024 sin <>."
  - id: S19
    class: open-web
    title: "anthropics/skills — skill-creator/references/schemas.md + SKILL.md"
    publisher: "Anthropic (GitHub)"
    url: "https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md"
    accessed_at: "2026-09-11"
    excerpt: "evals.json: {evals:[{id, prompt, expected_output, files, expectations}]}; 2-3 prompts reales; loop de optimización run_loop con historial."
  - id: S20
    class: documentation
    title: "addon dsh — bin/gentle-dsh.mjs + test/installer.test.mjs"
    publisher: "skillsGV (local)"
    url: "gentle-ai-dsh/bin/gentle-dsh.mjs"
    accessed_at: "2026-09-11"
    excerpt: "Comando doctor para verificar instalación; el test exige doctor PASS en instalación temporal."
claims:
  - {id: C1, text: "RDD/review mode se enciende con 'gentle-ai review mode enable --scope global --cwd <repo>' (global es la única forma); status/disable admiten scopes global|clone.", sources: [S10]}
  - {id: C2, text: "Presupuesto por defecto de revisión: 400 líneas cambiadas (adiciones+deleciones); goldens excluidos del conteo de riesgo y dentro del snapshot.", sources: [S11]}
  - {id: C3, text: "El gatekeeper de modo automático re-ejecuta la MISMA fase una vez ante fallo; el segundo fallo detiene y reporta.", sources: [S12, S2]}
  - {id: C4, text: "Economía de modelos: tiers por fase (sdd-strong/mid/cheap) con reasoning effort; sdd-research y jueces en strong; perfiles vía 'gentle-ai sync --profile/--profile-phase'.", sources: [S13, S15]}
  - {id: C5, text: "Fases SDD canónicas incluyen sdd-research; review incluye lentes + review-refuter + review-validator.", sources: [S14]}
  - {id: C6, text: "'gentle-ai install' instala y 'gentle-ai sync' refresca contenido gestionado; el PRD exige publicar slash commands SDD para invocación orgánica en OpenCode.", sources: [S10, S15]}
  - {id: C7, text: "Spec archivada 2026-06-14: el trigger Tier-3 ejecutaba judgment-day en post-sdd-phase para [design, apply] (evidencia histórica previa al reclamo de separación).", sources: [S16]}
  - {id: C8, text: "El catálogo ya documenta el rename a /gentle-sdd-* y la regla NL>slash ('Regla Alan'), pero los assets upstream de OpenCode aún listan meta-comandos /sdd-new, /sdd-continue, /sdd-ff.", sources: [S2, S3, S4, S12]}
  - {id: C9, text: "Contrato de descripción Anthropic: 'qué hace y cuándo usarla'; 6 campos permitidos; name kebab ≤64; desc ≤1024 sin ángulos; la descripción es crítica para el triggering.", sources: [S18]}
  - {id: C10, text: "Eval harness Anthropic: evals.json {id, prompt, expected_output, files, expectations}; 2-3 prompts reales; loop de optimización con historial.", sources: [S19]}
  - {id: C11, text: "Validador del catálogo: desc present/≤1024 + aviso desc-when bilingüe; index-sync SKILLS/AGENTS; consistencia con .atl; compatibility ≤500; sin checks de tamaño de skill, scripts, deps ni build de manifiesto.", sources: [S6]}
  - {id: C12, text: "El addon dsh ya tiene 'doctor' (verifica instalación) con test que exige doctor PASS; el catálogo raíz no expone doctor.", sources: [S20, S7]}
  - {id: C13, text: "Runtime instalado: Context7 es canal de documentación declarado; RDD opt-in en AGENTS; tiers por modelos en presets; preset gentle-ai instalado el 2026-08-31.", sources: [S8]}
  - {id: C14, text: "shouldTryEngram: Engram se selecciona por openspec/config.yaml, env GENTLE_AI_SDD_STATUS_ENGRAM o .engram/.", sources: [S17]}
contradictions:
  - "Rename: docs locales/ecosistema dicen /gentle-sdd-*; assets upstream de OpenCode aún dicen /sdd-new|continue|ff. Sin CHANGELOG versionado que resuelva cuál rige en 2.7.0."
  - "Judgment Day: el SKILL local dice 'MUST NOT validar planning' y su propio residual 'phase gate inside SDD' (línea 112) se contradice; upstream histórico lo ataba a post-sdd-phase [design, apply]."
  - "Conteos históricos de skills divergentes (197/206/208/209) — evidencia interna de drift de índices (S1)."
uncertainty:
  - "Bug de tool-prefix de engram en JD: sin fuente localizada; estado en 2.7.0 no verificable con el corpus indexado (sin issues/releases indexados)."
  - "managed-assets.json / rehash de installSddAssets: sin fuente en el corpus indexado."
  - "Autoridad externa de los umbrales '500 líneas por SKILL.md' y '~2K tokens Tier 0': no localizada; se tratan como propuesta interna a ratificar."
  - "Cláusula de exclusión 'Do NOT use for' en descriptions: no aparece en el material Anthropic recuperado; se trata como práctica interna."
  - "Presupuesto 800 del preflight: convención local (S1); no confirmado upstream."
  - "Atribución por versión exacta (2.6.x/2.7.x): las fuentes open-web son de la rama main, sin CHANGELOG/artefactos versionados indexados."
freshness: "Open-web: rama main upstream al 2026-09-11 (recuperación vía Context7; sin releases versionadas). Local: working tree al 2026-09-11 (27 archivos WIP intactos)."
product_choices: none
---

# Research (revisión 3) — skills-25-upgrade

> Estado: `done` — evidencia mapeada por claim, contradicciones e incertidumbre declaradas. Los hallazgos open-web describen el upstream (rama main) al 2026-09-11; la atribución exacta por versión 2.6/2.7 no es verificable con el corpus indexado (sin CHANGELOG).
> Canal externo: Context7 (endpoint de documentación del runtime, declarado en S8). Las URLs de S10–S19 corresponden al repositorio upstream.

## 1 · Admisión (revisión 3)

Declaración `gentle-ai.sdd-research-capability/v1` con clases canónicas únicamente:
`documentation` (docs locales del repo/runtime) y `open-web` (repo gentle-ai + Anthropic Skills).
**Admitida.** L3 retirada por el orquestador: no se admitió clase de ejecución local; queda como
nota de handoff sin evidencia y sin claims (ver §4).

## 2 · L1 — Deltas gentle-ai 2.5.0 → 2.7.0

| # | Delta | Estado | Evidencia | Corrección / nota para el catálogo |
|---|---|---|---|---|
| 1 | Rename `/gentle-sdd-*` | Parcial — contradictorio | S2, S3, S4 (local: renombrados desde 2.5.0) vs S12 (upstream OpenCode: meta-comandos `/sdd-new`, `/sdd-continue`, `/sdd-ff`) | No asumir consistencia upstream; verificar contra el binario/instalador en apply. |
| 2 | NL > slash | Confirmado en ecosistema; direccional upstream | S3, S4 (Regla Alan: el NL siempre funciona; slash = alias opcional); S16 (triggers orgánicos por evento) | Mantener la regla; es independiente del rename. |
| 3 | RDD | **Confirmado** | S10: `review mode enable --scope global` (única forma de encenderlo); `status`/`disable` global\|clone | RDD sigue opt-in; documentar el comando exacto y los scopes. |
| 4 | Guard ~400 | Confirmado (400); 800 sin confirmar | S11 (400 = add+del; goldens fuera del riesgo) + S1 (preflight local 800) | Propagar 400 como default; tratar 800 como presupuesto local declarado. |
| 5 | Jueces fuera de validación SDD | Local confirmado; upstream histórico en contra | S5 (`MUST NOT` validar planning; residual línea 112); S16 (histórico: JD en post-sdd-phase [design, apply]) | Reposicionar residuales (línea 112, addon AGENTS paso 4, catalog-usage). |
| 6 | Bug tool-prefix engram (JD) | **Sin fuente** | Búsquedas sin resultado en el corpus indexado; local: sin referencias `mcp__`/`engram__` | Pregunta abierta; verificar issues/releases upstream cuando el canal lo permita. |
| 7 | Economía de modelos | **Confirmado** | S13 (tiers por fase; research y jueces en strong), S15 (perfiles vía sync) | El roster local (strong/flash) es coherente; alinear nombres si se adoptan tiers. |
| 8 | Codegraph→grep | Local confirmado; upstream no localizado | S3 §7 (codegraph primero; caída a grep/read si falla) | Propagar a `AGENTS.md` raíz. |

**Novedades 2.6/2.7 relevantes para el catálogo**

- `sdd-research` es fase canónica (S14) y pertenece al tier strong (S13) — el catálogo ya la incluye.
- `gentle-ai sync` refresca contenido gestionado; perfiles por fase vía `--profile` / `--profile-phase` (S10, S15).
- RDD/review: modo review + agentes `review-refuter`/`review-validator` y lentes (S10, S14).
- Gatekeeper por fase documentado como asset del orquestador OpenCode (S12).
- `shouldTryEngram` (config/env/.engram) — selección de store sin crear `openspec/` (S17).
- **No localizado**: `managed-assets.json` y rehash de `installSddAssets` (pregunta abierta, §6).

## 3 · L2 — Respaldo de las 9 mejoras adoptadas

| # | Mejora | Autoridad / cita | Estado en el catálogo | Nota de implementación |
|---|---|---|---|---|
| 1 | Description con cláusula de exclusión | S18 (what+when; triggering) | **Parcial**: present/≤1024 + aviso `desc-when` bilingüe (S6); sin cláusula de exclusión | Ampliar plantilla de skill-creator y check; la exclusión es práctica interna, no cita Anthropic. |
| 2 | 500 líneas + Tier 0 ~2K mecánico | Sin autoridad externa localizada | **Parcial**: Tier 0 existe (14 skills; loader con caché mtime); sin checks de presupuesto (S6) | Convertir en checks del validador; ratificar umbrales en la propuesta. |
| 3 | Manifiesto único `catalog.json` | Evidencia interna (S1: drift 197/206/208/209) | **Nuevo**: hoy compensa con index-sync + registry-consistency (S6) | Generar SKILLS.md/AGENTS.md/.atl desde el manifiesto; validar contra él. |
| 4 | Condición de corte (fail-3→escalar) | S12, S2 (re-ejecuta UNA vez; luego detiene) | **Parcial**: ya hay retry acotado (1 reintento) | Delta = umbral de tercer intento + escalado explícito; fijar semántica en spec. |
| 5 | Harness de skill-eval | S19 (esquema `evals.json`; 2-3 prompts; loop) | **Nuevo** (sin evals en el catálogo) | Adoptar `{prompt, files, expected_output, expectations}`; ubicarlo en skill-creator/validator. |
| 6 | `requires-mcp` + `mcp-manifest.json` | S18 (6 campos permitidos; `requires-mcp` NO está → anidar en metadata) | **Nuevo** (sin coincidencias en el repo) | Declarar MCP requerido por skill (11-mcp-hybrid) + fallback determinista; respetar la validación oficial. |
| 7 | `--check-deps` (compatibility) | S18 (compatibility es campo oficial) + S6 (hoy solo longitud ≤500) | **Nuevo** | Check de dependencias/entorno por skill; reusar el campo existente. |
| 8 | Auditoría de scripts en validador | Sin autoridad externa localizada | **Nuevo**: el validador solo escanea cuerpos de SKILL.md (S6) | Reglas: blacklist `curl`, `eval`/`Function`, justificación de `child_process`; ampliar scope a `scripts/`. |
| 9 | `skillsgv doctor` unificado | Precedentes: `engram doctor` + addon `doctor` (S20) | **Nuevo** a nivel catálogo (S7: scripts sin doctor) | Unificar validate/dry-run/loader-status/catalog-usage en un comando. |

**Lo que el catálogo YA satisface** (discriminación): aviso `desc-when` + límites de descripción (S6); Tier 0 como artefacto + caché mtime del loader + router-replay; consistencia SKILLS↔.atl registry (S6); retry acotado del gatekeeper (S2/S12); roster de modelos por fortaleza (S1); regla NL y rename documentados en el ecosistema (S3/S4); codegraph-first en el addon (S3).

**Lo genuinamente nuevo**: manifiesto único; harness de evals; `requires-mcp`/`mcp-manifest`; `--check-deps`; auditoría de scripts; `skillsgv doctor`; cláusula de exclusión; checks de presupuesto (500/2K) mecanizados.

## 4 · L3 — Handoff (sin evidencia, sin claims)

Pregunta diferida a apply/verify (WU0): las skills extraídas del agente dsh no quedarían operativas en los
directorios runtime (~200+ esperadas). El gate "PASS" debe definir conteos consistentes por runtime y
manifiestos sincronizados, y ejecutarse con comandos de muestra en apply/verify. Esta fase NO recolectó
evidencia de instalación: la ejecución local no es una clase admitida en research.

## 5 · Contradicciones y frescura

- Rename: local (`/gentle-sdd-*`) vs upstream OpenCode (`/sdd-new`, `/sdd-continue`, `/sdd-ff`); sin CHANGELOG que resuelva.
- Judgment Day: `MUST NOT` validar planning (S5) vs residual interno "phase gate inside SDD" (S5, línea 112) vs binding histórico post-sdd-phase (S16).
- Drift de conteos interno (197/206/208/209) documentado en S1.
- Frescura: upstream = rama main al 2026-09-11 (Context7); sin releases versionadas; local = working tree con 27 archivos WIP intactos.

## 6 · Preguntas abiertas (no confirmadas con fuentes disponibles)

1. Estado del bug de tool-prefix de engram en JD (¿abierto/corregido en 2.7?) — sin fuente.
2. `managed-assets.json` / rehash de `installSddAssets` — sin fuente.
3. Autoridad de umbrales 500 líneas / ~2K tokens (Tier 0) — propuesta interna a ratificar.
4. Cláusula de exclusión "Do NOT use for" como requisito — práctica interna sin cita recuperada.
5. Presupuesto 800 del preflight — convención local.
6. Atribución exacta por versión 2.6/2.7 — corpus sin changelog versionado.

## 7 · Handoff y siguiente paso

- Research `done`: la propuesta puede consumir esta evidencia (decisiones de producto siguen `pending` y son del orquestador; no inferir consentimiento).
- L3 → WU0: definir y ejecutar el gate de install-state en apply/verify con comandos de muestra.
- Re-verificar rename y bug engram cuando exista canal a releases/issues upstream.
- Los claims C1–C14 mapean 1:1 a las fuentes S1–S20 del frontmatter.
