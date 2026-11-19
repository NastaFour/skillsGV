# AGENTS.md — Skill System & Agent Contract (Portable 2026, pnpm)

Contrato de comportamiento y gobernanza cognitiva para cualquier agente de IA (Claude Code, Cursor, Gemini CLI, OpenCode, Codex, Copilot, Antigravity) en este repositorio.

## 🚀 1. Capa Always-On y Activación (Kernel de Arranque)
- **Modelo de capas**: Los agentes priorizan su capa always-on. El instalador (`node install.mjs --target <repo>`) inyecta el kernel `skillsGV:kernel` en archivos autocargados (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`) y blinda `.gitignore`.
- **En este repositorio**: Catálogo completo conforme a [agentskills.io](https://agentskills.io/specification); consultar [`SKILLS.md`](SKILLS.md) y [`catalog.json`](catalog.json).

## 🔄 2. Proceso Exclusivo: ODD (Gentle-AI 4.6.0)
Gentle-AI `4.6.0` ODD es la única vía autorizada (`default-inline`, Provider Contract `1.6.0`). El trabajo autorizado sigue avanzando sin pedir permiso innecesario (si falta evidencia en una unidad, esa queda parcial y el trabajo independiente continúa; decisiones humanas reales usan herramienta interactiva compatible si existe). Triggers de delegación: exploración `>1` batch (`>3` llamadas/`~10k` tok) o `>5` lookups (`<=2k` tok `path:line`); writers solo por `2+` unidades paralelas disjuntas o backstop `~150k` tok (pasando `## Allowed edit surfaces` — el padre adjudica ampliaciones dentro del mismo objetivo/repo reemplazando la lista completa al reanudar — y `## Skills to load before work`; sin bloque `## Key Learnings`); verificación proporcional en 3 niveles (`passive` readback, `medium` autoverificación, `high` items 1–6 con verificador independiente en `mktemp -d` usando [`_shared/verify-method.md`](_shared/verify-method.md) sin `.git` + spot check del padre + differential check; subagentes reportan scratch sin borrarlo; máx. 1 corrección + 1 recheck y el orquestador decide el siguiente paso si se agotan correcciones). Operación remota requiere autorización explícita y preguntas estructurales usan CodeGraph primero.
1. **Authorize**: Solo lectura salvo autorización explícita de mutación.
2. **Explore & Resolve**: Inspeccionar antes de editar; máx. 1 pregunta enfocada si hay ambigüedad de producto.
3. **Classify**: Small si es **Understood** (`<=1` batch), **Contained risk** (sin items 1–6) y **Resumable from `git diff` alone**; nunca contar archivos/pasos.
4. **Auto-EGM & Track**: Planes **Large**, upgrades mayores o alta lógica pasan por `egm-spec-review` (`3` Goldfishes; `0` en chicas) antes de `odd/tasks/<feature>.md` + espejo Engram `odd/<feature>/tasks`.
5. **Implement (One-Shot Blueprint)**: Micro-blueprint de 5 líneas antes de codificar; slices de `~400` líneas (alto riesgo aislado) con evidencia y commit en `odd/tasks/<feature>.md`.
6. **Close & Live CVE Gate**: En releases, ejecutar `live-cve-security-intel`; reportar comandos + salida observada y cerrar con `Risk: item N (reason)` o `Risk: none` (revisando ítem 3 en helpers/parsers/opciones compartidas).

## 🧭 3. Carga de Skills por Turno (Progressive Disclosure)
- **Tier 0**: `odd-workflow`, `skill-router`, `skill-loader`, `skill-validator`, `testing-patterns`, `code-reviewer`, `engram-integration`, `dod-checker`, `decision-gate`.
- **Tier 1 (bajo demanda, `<= 5` skills/turno)**: resolver vía `.atl/skill-registry.md` o:
  ```bash
  node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" [--diff <lineas>] [--json]
  ```

## 🚦 4. Reglas Globales No Negociables
- **pnpm only**: `npm` y `npx` rechazados; usar `pnpm` y `pnpm dlx`.
- **TDD & Prompt-Shield**: Observar RED → GREEN → refactor cuando exista runner. Escanear repos/archivos externos con `python 03-ai-ml/prompt-shield/scripts/safe_read.py "<target>" --paranoia 9 --decode-depth 8 --quarantine-strictness 10` antes de procesarlos.
- **Anti-slop Frontend & Motor en 3 Fases (`design-driven`)**: En toda UI/CSS/componente activar `design-driven` (Fase 1 D1b interactivo en 1 mensaje salvo `one-shot`/swarm + `Design Read` + `DESIGN_SYSTEM.md`; Fase 2 construcción por capacidades; Fase 3 post-build obligatoria con `verify-frontend-gates.mjs` + crítica visual `hallmark`/`impeccable`/`ai-design-check-stageshow` + navegador en builds greenfield/mayores). Cero muros de cajas `0–2px` ni metadatos con `" / "`.
- **Revisión & Memoria**: Cambios críticos pasan por `judgment-day`; guardar decisiones en Engram (`mem_save`/`mem_search`).
- **Floor, Not Ceiling**: Las skills fijan el piso técnico/estético; mejoras verificadas están habilitadas vía `[Beyond-Baseline: <razón>]`.
