# Exploración: extracciones del kit opencode-agent-orchestration-kit (Slice 2)

Fuente: https://github.com/jcarlosrodicio/opencode-agent-orchestration-kit (v1.0.40, Apache-2.0, 102 commits, 97 stars). Análisis de qué extraer para el catálogo skills-catalog. Nota de contexto: el kit es OpenCode-only y Bash-first (Native Windows no soportado); nuestro catálogo es multi-agente y Node-first.

## Extracciones priorizadas

| ID | Extracción | Prioridad | Encaje en el catálogo |
|---|---|---|---|
| E1 | **Model routing** (patrón oc-switch: modelo por agente, catálogo real, estado persistido) | ALTA | Es el Slice 2 diferido en el design de skills-harness (tarea 3.2). Skill `model-routing` provider-agnóstica, sin TUI obligatoria; los hooks ya existen en model-routing-hooks spec. |
| E2 | **Replay determinista del router** (corpus JSONL + replay sin llamar modelos + métricas agregadas) | ALTA | Extiende `overlap-smoke-tests.json` a un corpus de routing + script replay + summarize. Benchmark del skill-router sin costo de modelos. |
| E3 | **Journal de loop acotado** (contrato en markdown + snapshot JSON versionado + historial JSONL append-only + lock exclusivo + IDs idempotentes + recuperación de escrituras interrumpidas) | MEDIA-ALTA | Endurece `sdd-apply` (apply-progress hoy es merge simple; un abort a mitad de WU dejó trabajo parcial). Aplica al apply-progress journal. |
| E4 | **Ciclo de vida seguro del instalador** (manifest de ownership, dry-run, journal durable, uninstall solo-archivos-propios, rollback de una generación) | MEDIA | Portar el CONCEPTO a `install-skills.mjs` (Node) — no copiar sus wrappers Bash. |
| E5 | **Política de review única** (solo lo introducido/empeorado bloquea; deuda preexistente se reporta aparte; perfiles de arquitectura solo si se declaran explícitamente) | MEDIA | Refuerza el selector de lentes y el principio de causal disposition del punto RDD; documentar en harness-map + skill de review. |
| E6 | **AHE con evidencia** (sidecars evaluator/debugger/evolver; niveles static_contract, transcript_replay, live_smoke, manual_oracle) | MEDIA (condicionada) | Flesh-out del punto de extensión RDD (post-verify pre-archive). OJO: el usuario decidió que RDD NO se implementa aún ("avisará"). Incluir SOLO como diseño doc-only del punto de extensión salvo decisión explícita en la proposal. |
| E7 | **Open Design / Impeccable** (workspace de diseño local + checks deterministas de frontend) | BAJA-OPCIONAL | Combinaría con figma-mcp/figma-implement; marcar como opcional/OPEN. |

## Ya cubierto por skills-harness (no extraer)
Agentes de fase (lead≈sdd-orchestrator, specifier≈sdd-spec, reviewer≈verify), comandos de workflow, validación mecánica (check-harness≈validate-skills --strict), skills de proceso, permisos conservadores.

## Riesgos de la extracción
- E1: el estado persistido del selector depende del runtime (opencode vs pi vs antigravity tienen catálogos distintos); diseñar por interfaz de catálogo, no por comando.
- E3/E4: no copiar Bash (Windows del usuario); reimplementar en Node con los mismos invariantes (append-only, lock, hash de contrato, IDs idempotentes).
- E6: riesgo de scope creep; queda condicionado a la decisión RDD del usuario.
- Enlaces/URLs externas: riesgo de rot; el kit pineó Superpowers por commit inmutable — mismo principio que nuestro vendoring con atribución.
