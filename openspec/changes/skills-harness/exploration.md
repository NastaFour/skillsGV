# Exploración: skills-harness

> Evolución del catálogo de 129 skills hacia un harness multi-agente profesional, modelado sobre el runtime de gentle-ai (Gentleman Programming). Objetivo: el agente lee el sistema de skills, comprende cómo se conectan y selecciona las skills correctas automáticamente (tier 0 obligatorias, tier 1 por triggers, tier 2 bajo demanda), sin declaración manual del usuario. SDD profundo integrado; RDD diferido (solo punto de extensión).

---

## 1. Estado actual (mecánica del catálogo)

### 1.1 Inventario y estructura

- **129 skills** en 10 categorías (`00-meta-skills` a `08-devops` + `professional-planner/`), spec agentskills.io (frontmatter YAML: `name`, `description` ≤1024, `license`, `compatibility`, `metadata.trigger`, `allowed-tools`).
- **Sin package.json**: scripts Node `.mjs` sin dependencias (Node 20+). Verificación = `skill-validator` (exit 0 = limpio).
- **Almacén de artefactos**: `openspec/` configurado como **hybrid** (archivos + Engram) en `openspec/config.yaml`; `strict_tdd: false`.
- **Documentación de gobierno**: `AGENTS.md` (tabla auto-invoke con ~90 filas, two-tier loading, regla de 3 capas), `SKILLS.md` (índice 129), `harness-map.md` (mapeo a los 20 Agent Harnesses, con brechas auto-detectadas #16 Skill Resolution Feedback y #4 Execution Mode), `mio/` (evaluaciones honestas de Kimi/Antigravity, plan de blindaje F1-F8 completado).

### 1.2 Meta-skills (núcleo actual)

| Meta-skill | Mecánica | Estado |
|---|---|---|
| `skill-router` | Router determinista: walk del catálogo, match de triggers con regex word-boundary (min 4 chars), confianza ≤1.0 solo con trigger exacto, redirect de deprecated, heurísticas `needsSDD`/`trivial`/`skipJudgmentDay`, contrato validado por `validate-output.mjs` (exit 2 ante violación). Output: `{primary, secondary, confidence, needsSDD, trivial, skipJudgmentDay, deprecatedHit, tier1toLoad}`. | Sólido; reemplaza ~80% de la selección estocástica |
| `skill-loader` | Tier 0/1/2: `tier0-context.json` (12 skills, ~2K tokens), `tier1-instructions.txt` por turno, regla "route first" (`--check`), cache de frontmatter por mtime (`~/.skill-router-cache.json`). | Funcional pero **enforcement por convención** (el agente debe invocarlo) |
| `skill-validator` | Spec agentskills.io + checks estrictos: `allowed-tools` ausente = error, `version` no-semver = error, contrato de campos del router (`min_diff_lines`, `time_budget_sec`, `critical_markers`, `deprecated`→`redirect`). | Robusto, CI-ready |
| `skill-sync` | `install-skills.mjs`: 10 agentes destino (claude-code, opencode, cursor, copilot, codex, gemini-cli, antigravity, kiro, windsurf, deepseek), copy/symlink/junction, reescritura de imports `_shared` y refs cruzadas. | Más amplio que la lista nativa de gentle-ai (incluye DeepSeek) |
| `skill-creator` | Scaffolding spec-compliant + siembra en `SKILLS.md`. | No calcula tier ni registra en registry/harness-map |

### 1.3 SDD actual

- **`professional-planner`** (v2.0): 6 fases con gates de aprobación explícitos, framework RTCRO, artefactos en `openspec/changes/<feature>/`, DoD como gate final, protocolo de rollback, quick-start MVP. **Es un monolito**: una sola skill que orquesta fases inline; no hay agentes de fase, contrato de resultado por fase, grafo de dependencias explícito, abstracción de almacén de artefactos ni routing de modelos.
- **`agents`** (01-planning-process): contiene los delegation triggers (regla de 4+ archivos, 2+ archivos no triviales, fresh review, kill switches), pero es **específica de [APP]** (supermercado), no un orquestador de catálogo.
- Apoyo: `decision-gate` (defaults ejecutables vía `resolve-default.mjs`), `idea-to-prd-express` (SDD comprimido 20 min), `dod-checker` (gate de calidad).

### 1.4 Fortalezas vs. brechas concretas

**Fortalezas:**
1. Router determinista con contrato validado — equivalente funcional al routing orgánico de gentle-ai.
2. Tiering real (0/1/2) con loader cacheado por mtime; presupuesto de tokens controlado.
3. Validador estricto con esquema de campos del router (sin campos custom sin contrato).
4. Distribución cross-tool superior a gentle-ai (10 agentes, DeepSeek incluido).
5. Cultura de auto-evaluación (mio/ con auditorías independientes de Kimi y Antigravity).
6. Almacén hybrid ya configurado (`openspec/config.yaml`).

**Brechas concretas vs. el harness objetivo:**
1. **Sin orquestador/ejecutores**: no hay separación orchestrator ↔ phase agents; `professional-planner` ejecuta todo inline; el catálogo no contiene skills `sdd-*` (las instaladas en `~/.config/opencode/skills` son gestionadas por gentle-ai, fuera del catálogo).
2. **Sin contrato de resultado por fase** (status/summary/artifacts/next_recommended/risks/skill_resolution).
3. **Sin protocolo de resolución de skills para delegación** (pasar paths exactos, no reglas digeridas): no existe `.atl/skill-registry.md` en el catálogo; `SKILLS.md` es índice estático; harness-map marca #16 Skill Resolution Feedback como brecha.
4. **Sin abstracción de almacén de artefactos en runtime** (engram/openspec/hybrid/none declarados en config.yaml pero no ejecutados por las fases; no hay convención de topic keys `sdd/{change}/...`).
5. **Sin routing de modelos por fase** (harness-map: "Model Routing — futuro").
6. **Sin modo de ejecución** (auto/interactive) ni gatekeeper automático entre fases.
7. **Sin estrategia de entrega** (single PR vs. chained) ni guard de carga de review.
8. **Enforcement del router por convención**: el agente debe acordarse de llamarlo; no hay hook de arranque ni instrucción de sistema que lo fuerce (recomendación #3 de la evaluación Antigravity, no implementada).
9. **Telemetría incipiente**: `.skills-used.json` con 1 turno; sin auditoría de sesión (harness-map #16; recomendación #1 Antigravity).
10. **`skill-creator` no integra** el nuevo skill al tiering ni al registro.
11. **Sin punto de extensión RDD documentado** (diferido por el usuario, pero debe quedar declarado).
12. **Riesgo de seguridad**: `opencode.json` del catálogo contiene una API key de Context7 en texto plano.
13. **Git corrupto** en `.git/` (no se pueden usar comandos mutantes; afecta entrega/review nativa).

---

## 2. Arquitectura de referencia: gentle-ai (patrones extraíbles)

Fuente: README público, `docs/architecture.md`, `docs/trigger-rules.md`, `docs/skill-registry.md`, `docs/agents.md` (v2.3.0, 5.9k stars).

### Patrones arquitectónicos reutilizables (no código)

1. **Configurador de ecosistema, no instalador de agentes**: adapta el runtime existente de cada agente. Un único set de reglas canónicas se proyecta a cada adaptador (marker en system prompt para Claude/Codex, overlay `opencode.json` para OpenCode/Kilo, módulo Jinja para Kimi, agentes nativos para Cursor/Kiro). Soporta `--scope=workspace`.
2. **Modelo de delegación por agente**: Full sub-agents (Claude Code Task, OpenCode overlay, Cursor `~/.cursor/agents/sdd-{phase}.md`, Copilot runSubagent, Kiro nativo), Solo-agent (Windsurf, **Antigravity**, OpenClaw, Trae), multi-agente nativo (Codex con fallback a inline). El orquestador permanece delgado; cada fase corre en contexto fresco.
3. **Skill registry como índice, no como resumen**: `.atl/skill-registry.md` con `name + descripción completa + scope + path exacto`; los delegadores pasan **paths exactos** a los sub-agentes (`## Skills to load before work`); proyecto gana sobre global; refresh automático por hooks de arranque. Excluye `_shared`, `skill-registry` y `sdd-*`.
4. **SDD por agentes de fase**: 10-11 fases (`sdd-init`, `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`, `sdd-onboard` + judgment-day) con DAG `proposal → specs → tasks → apply → verify → archive` (design ramifica desde proposal), contrato de resultado por fase, y artefactos en Engram/OpenSpec/hybrid/none (topic keys `sdd/{change}/{artifact}`).
5. **Routing orgánico de implementación** (trigger rules): inline (1-3 archivos) vs. delegado (4+ archivos, lectura prepara escritura, 2+ escrituras no triviales) vs. SDD opcional (ambigüedad sustancial). **El tamaño nunca fuerza SDD por sí solo** — solo petición explícita o propuesta aceptada.
6. **Routing de modelos por fase (multi-mode)**: perfiles OpenCode (`sdd-orchestrator-{name}`, `--profile-phase cheap:sdd-design:...`), frontmatter `model:` en agentes Kiro (aliases `auto|opus|sonnet|haiku|minimax|glm|deepseek|qwen`), presets Codex (sdd-strong/mid/cheap con niveles de effort). Demás agentes: single-mode.
7. **Gates de entrega y guard de carga de review**: estrategia de entrega (ask-on-risk / auto-chain / single-pr / exception-ok), chain strategy (stacked-to-main / feature-branch-chain), 400-line budget.
8. **RDD opt-in (diferido aquí)**: review nativo acotado con riesgo congelado en START (low → readback estructural 0 lenses; standard → 1 lens de foco; high → 4R canónico), una corrección acotada, recibo (receipt), validación en gates pre-commit/pre-push/pre-pr/release. Review informativo; la política ordinaria del repo gobierna la entrega.
9. **Componentes con inyección por marcadores**: engram, sdd, skills, mcp, persona (docente), theme, permissions, gga; `filemerge` (merge por marcadores sin clobber); backup/rollback con snapshots comprimidos deduplicados.

### Correspondencia catálogo ↔ gentle-ai

| Capacidad gentle-ai | En el catálogo hoy |
|---|---|
| Skill registry + paths exactos | Parcial: `SKILLS.md` índice; falta protocolo de delegación y `.atl/` |
| Routing orgánico (inline/delegado/SDD) | `agents` (delegation triggers) + heurísticas del router |
| Orquestador + agentes de fase | Solo `professional-planner` (monolito) |
| DAG + contrato de resultado + artifact store | No |
| Model routing por fase | No ("futuro" en harness-map) |
| Two-tier loading | Sí (router + loader, ~2K tokens) |
| Entrega/chain strategy | No |
| RDD | Diferido (punto de extensión post-verify) |

---

## 3. Análisis de brechas vs. el objetivo del usuario

### 3.1 Capas 1-6 + skills híbridas (estado actual en catálogo)

| Capa / Skill | Estado | Relación con skills existentes |
|---|---|---|
| **Capa 1 — Frontend/Diseño UI** | | |
| `frontend-design` | **Existe** (02-dev-roles, Anthropic, INTACTA — no tocar) | Núcleo de diseño |
| `playwright` | **Existe** (07-testing) | `playwright-mcp`: variante MCP, nueva |
| `impeccable`, `taste-skill`, `animate`, `design-motion`, `theme-factory`, `figma-implement`, `brandkit`, `designer-skills` | **Nuevas (8)** | Solapan con `motion-framer`, `motion-gsap`, `visual-effects`, `design-system-tokens`, `ai-ui-generation` — requiere matriz de solapamiento |
| **Capa 2 — Imagen/Gráficos/Video** | | |
| `nano-banana`, `banana-claude`, `canvas-design`, `algorithmic-art`, `remotion-superpowers`, `claude-remotion`, `blender-motion`, `ae-motion` | **Nuevas (8)** | Sin predecesoras; nueva categoría de medios sugerida |
| **Capas 3-4 — Producto/Interacción** | | |
| `hi-fi-mockups`, `brandkit-sync`, `slide-decks`, `figma-mcp`, `token-budgets`, `turn-repair`, `generative-ui`, `progressive-reveal`, `frustration-checks`, `feedback-loops` | **Nuevas (10)** | `token-budgets` solapa con `design-system-tokens`; `generative-ui` con `ai-ui-generation`; `feedback-loops` con `decision-gate` |
| **Capa 5 — Comportamiento/Prompts** | | |
| `system-structure`, `persona-architecture`, `tone-calibration`, `emotional-design`, `template-design`, `few-shot-patterns`, `chain-of-thought`, `constraint-spec` | **Nuevas (8)** | `prompt-engineering` existe (03-ai-ml) — la capa 5 lo especializa |
| **Capa 6 — Confianza/Evaluación** | | |
| `guardrails`, `trust-calibration`, `transparency-patterns`, `quality-rubrics`, `task-decomposition`, `handoff-protocols` | **Nuevas (6)** | `dod-checker`, `verification-before-completion` existentes; `guardrails` con matiz de seguridad (02-dev-roles) |
| **Skills híbridas (MCP)** | | |
| `component-scrapper-mcp`, `oklch-theme-injector`, `motion-video-pipeline`, `ux-auditor-agent`, `asset-generator-mcp` | **Nuevas (5)** | `mcp-integration` existe (04-backend); `oklch-theme-injector` complementa `design-system-tokens` (HSL) |

**Total: 46 skills nuevas** (129 → ~175). `frontend-design` y `playwright` ya existen.

### 3.2 Portabilidad multi-agente

- **skill-sync cubre hoy**: claude-code, opencode, cursor, copilot, codex, gemini-cli, **antigravity** (`~/.gemini/antigravity/skills/`), kiro, windsurf, **deepseek** — 10 agentes. gentle-ai no lista DeepSeek; el catálogo ya lo supera ahí.
- **Antigravity**: soportado como destino de sync, pero es **solo-agent** en gentle-ai (sin sub-agentes custom; Mission Control delega Browser/Terminal). El SDD del catálogo debe funcionar inline en Antigravity (el orquestador = ejecutor; Engram provee persistencia entre fases).
- **GLM 5.3**: es un **modelo**, no un harness de agente con directorio de config propio. La portabilidad a GLM es por **routing de modelos**: proveedor GLM en OpenCode (multi-mode por fase) o alias `glm` en Kiro. No requiere target nuevo en skill-sync; sí requiere documentar el perfil de modelo.
- **Faltantes en skill-sync** (opcionales): kilo (usa config opencode — trivial), qwen, kimi, trae, pi, hermes, openclaw.

### 3.3 Profundidad SDD

| Dimensión | professional-planner hoy | Objetivo (gentle-ai) |
|---|---|---|
| Fases | 6 con gates de aprobación | 10 agentes de fase + orquestador |
| Grafo de dependencias | Implícito en el documento | Explícito (DAG + `next_recommended`) |
| Contrato de resultado | No | `{status, executive_summary, artifacts, next_recommended, risks, skill_resolution}` |
| Almacén de artefactos | openspec/.codewhale (mencionado) | engram/openspec/hybrid/none con topic keys |
| Delegación | No (todo inline) | Sub-agentes con contexto fresco |
| Model routing | No | Perfiles por fase (OpenCode/Kiro/Codex) |
| Modo de ejecución | Gates manuales | auto (con gatekeeper) / interactive |
| Entrega | No | ask-on-risk / auto-chain / single-pr |

### 3.4 Punto de extensión RDD (diferido)

La inserción limpia es **post-verify, pre-archive**: `sdd-verify → gate de review → sdd-archive`. Los lentes existentes del catálogo (`code-reviewer` 4R, `judgment-day` doble juez) mapean 1:1 a los lentes de review de gentle-ai; RDD añadiría congelamiento de candidato, recibo (receipt) y validación en gates de entrega. Solo debe quedar **documentado como punto de extensión**, sin diseñar el mecanismo.

---

## 4. Áreas afectadas

- `00-meta-skills/skill-router/` — extensión de heurísticas y contrato si se añaden flags de harness (p. ej. `delegate` sugerido); el auto-routing de las 46 nuevas skills ya funciona por walk + frontmatter (sin cambios de código).
- `00-meta-skills/skill-loader/` — regenerar `tier0-context.json` al cambiar el set Tier 0; posible flag `--emit-registry`.
- `00-meta-skills/skill-sync/` — targets opcionales (kilo); verificación de paridad tras añadir 46 skills.
- `00-meta-skills/skill-creator/` — calcular tier automáticamente y sembrar registro + harness-map.
- `00-meta-skills/harness-map.md` — actualizar mapeo y cerrar brechas #16/#4.
- `AGENTS.md` — tabla auto-invoke (+46 filas), definición de Tier 0 revisada, regla del orquestador.
- `SKILLS.md` — índice (+46 skills).
- `professional-planner/` — rol recalculado: metodología de referencia vs. ejecutores de fase.
- `01-planning-process/agents/` — separar los delegation triggers del contexto [APP] y fusionarlos en el orquestador.
- `openspec/config.yaml` — convenciones de artefactos por fase (topic keys, paths).
- `_shared/` — utilidades compartidas del orquestador (si aplica).
- `opencode.json` — gestión de la API key expuesta y posible overlay de agentes OpenCode.
- Nuevas categorías (sugeridas): `09-media-graphics` (Capa 2), `10-product-ux` (Capas 3-4), `11-mcp-hybrid` (skills híbridas) — decisión de diseño; Capa 1 → `05-frontend`, Capa 5 → `03-ai-ml`, Capa 6 → `02-dev-roles` (reutilizando prefijos existentes para que la heurística `needsSDD` por categorías siga funcionando).

---

## 5. Enfoques candidatos

| # | Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|---|
| **A** | **Profundizar el núcleo meta existente** (router+loader+validator+sync como columna; añadir orquestador como skill única y telemetría real) | Mínima disrupción; reutiliza todo el blindaje F1-F8; rápido | Sin separación real orquestador/ejecutor; sigue siendo por convención; escala mal con 175 skills; no alcanza SDD profundo | Bajo |
| **B** | **Estructura orquestador/fases estilo gentle-ai** (vendors o autoría catálogo-nativa de `sdd-explore/propose/spec/design/tasks/apply/verify/archive` + orquestador; contrato de resultado; DAG; artifact store) | Paridad arquitectónica con gentle-ai; contexto fresco por fase; SDD profundo real; portable a OpenCode overlay / Cursor / Kiro nativos | Cambio grande; requiere resolver el rol de `professional-planner` (doble fuente de verdad); más skills que mantener; presupuesto de tokens del Tier 0 crece | Alto |
| **C** | **Híbrido (recomendado)**: núcleo meta actual + orquestador delgado + agentes de fase catálogo-nativos + protocolo de registro para delegación + abstracción de almacén + hooks de routing de modelos + RDD documentado | Incremental (B se alcanza por etapas); reutiliza blindaje; el router/loader ya son equivalentes gentle-ai; la ola de contenido (46 skills) avanza en paralelo | Necesita decisión de categorías y matriz de solapamiento; requiere disciplina de autoría (triggers de calidad) para que el auto-routing no degrade | Medio-Alto |
| **D** | **Adopción completa de gentle-ai** (binario gestiona los assets; el catálogo queda como contenido) | Cero código propio; probado en producción | El usuario pide que el **catálogo sea** el harness portable (DeepSeek/GLM no cubiertos por gentle-ai); se pierde independencia y la paridad 129→175; no alineado con el objetivo | N/A (descartado) |
| **E** | **Ola de contenido** (las 46 skills en capas 1-6 + híbridas, con categorías nuevas y triggers de calidad) — complementaria a A/B/C, no excluyente | Entrega valor visible por capa; auto-routing inmediato (el router ya descubre frontmatter) | Sin el harness (A/B/C) las skills nuevas carecen de orquestación y delegación | Medio |

---

## 6. Recomendación

**Enfoque C (híbrido), ejecutado en dos frentes:**

1. **Frente harness (núcleo)**: conservar router/loader/validator/sync/creator como columna vertebral (ya son equivalentes gentle-ai) y añadir, por etapas: (1) skill `sdd-orchestrator` catálogo-nativa (coordinación, triggers de delegación separados de [APP], gatekeeper, contrato de resultado); (2) agentes de fase `sdd-*` vendored del runtime gentle-ai instalado (MIT) o autoría catálogo-nativa, redefiniendo `professional-planner` como metodología de referencia; (3) registro de skills `.atl/skill-registry.md` o equivalente derivado de `SKILLS.md` + protocolo de delegación por paths exactos; (4) abstracción de almacén (engram/openspec/hybrid/none con topic keys `sdd/{change}/{artifact}`); (5) hooks de routing de modelos (perfil GLM en OpenCode, alias glm en Kiro) sin exigir targets nuevos en skill-sync; (6) punto de extensión RDD documentado post-verify; (7) telemetría de sesión real (`.skills-used.json` → auditoría consolidada).
2. **Frente contenido**: las 46 skills en 3 categorías nuevas sugeridas (`09-media-graphics`, `10-product-ux`, `11-mcp-hybrid`) + plegado de Capa 1→`05-frontend`, Capa 5→`03-ai-ml`, Capa 6→`02-dev-roles`, con **matriz de solapamiento** previa (motion/visual-effects/design-system-tokens/prompt-engineering/dod-checker) para evitar triggers duplicados y degradación del router. Cada skill nueva con `metadata.trigger` de calidad (≥4 chars, word-boundary) → el auto-routing es inmediato por el walk del router; regenerar `tier0-context.json` y sembrar `SKILLS.md`/`AGENTS.md` (automatizar en skill-creator).

**Distribución Tier sugerida:**

- **Tier 0 (siempre, ~12-14, presupuesto ~2-3K tokens)**: skill-router, skill-loader, skill-validator, skill-sync, skill-creator, **sdd-orchestrator (nueva)**, professional-planner, agents (delegación), idea-to-prd-express, project-tracker, session-notes, engram-integration, decision-gate, dod-checker.
- **Tier 1 (trigger-routed)**: las ~46 nuevas + long tail existente, vía `tier1toLoad[]` del router.
- **Tier 2**: resto, bajo demanda tras re-ruteo explícito.

**Orden de implementación sugerido**: matriz de solapamiento y decisión de categorías → orquestador + contrato de resultado → 2-3 agentes de fase piloto (explore, apply) → registro y protocolo de delegación → ola de contenido por capas (Capa 1 → 6 → híbridas) → telemetría y cierre de brechas harness-map.

## 7. Riesgos

1. **Volumen**: ~46 skills + cambios de harness; riesgo de review >400 líneas — requiere delivery strategy (chained PRs) desde tasks.
2. **Solapamiento semántico**: `design-motion`/`animate` vs. `motion-framer`/`motion-gsap`; `token-budgets` vs. `design-system-tokens`; capa 5 vs. `prompt-engineering`; capa 6 vs. `dod-checker` — sin matriz de solapamiento, el router degrada (falsos primarios).
3. **Doble fuente de verdad SDD**: `professional-planner` vs. agentes `sdd-*` — debe definirse rol (metodología vs. ejecución) antes de aplicar.
4. **GLM 5.3 como expectativa**: es un modelo, no un harness; la portabilidad es por routing de modelos (OpenCode/Kiro), no por skill-sync. Comunicar esta distinción al usuario en la propuesta.
5. **Enforcement por convención**: sin hooks de arranque reales, el "auto-pick" depende del prompt del agente; mitigar con instrucción de sistema en OpenCode + regla dura en AGENTS.md + `--check` del loader.
6. **`frontend-design` INTACTA**: el harness debe envolverla sin modificar (convención del proyecto).
7. **Git corrupto** (`.git/`): impide commit/review nativos; decidir antes de apply (reinicializar repo o copia nueva).
8. **API key Context7 expuesta** en `opencode.json` del catálogo: mover a variable de entorno en el harness.
9. **Regresión del router con 46 skills**: exige validación continua (`validate-output.mjs` + tests de humo del router en cada lote).
10. **RDD diferido**: no sobrediseñar; solo dejar el punto de extensión post-verify documentado.

## 8. Listo para propuesta

**Sí.** La dirección está clara (enfoque C híbrido + ola de contenido E), el estado actual está verificado contra código real y la arquitectura de referencia está documentada. La propuesta debe fijar: (1) decisión de categorías nuevas vs. plegado, (2) matriz de solapamiento de las 46 skills, (3) rol de `professional-planner`, (4) gestión del git corrupto, (5) alcance por lotes (harness primero, contenido después) para mantener PRs revisables.