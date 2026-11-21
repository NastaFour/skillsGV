<!--
  bootstrap-kernel-full.md — plantilla del kernel always-on (harness SIN gentle-ai).
  El instalador inyecta este bloque (incluidos los marcadores) en los archivos que
  cada harness autocarga (AGENTS.md / GEMINI.md / CLAUDE.md). Ediciones van al
  bloque entre marcadores; el instalador reemplaza el bloque completo (idempotente).
-->
<!-- skillsGV:kernel:start -->
## skillsGV — kernel de arranque (Gentle-AI 4.6.0 compatible)

Este repositorio tiene el catálogo de skills `skillsGV` instalado. Este bloque es la capa always-on; todo lo demás del catálogo es opt-in.

1. **Skills & Discovery antes que improvisar**: resolvé `<= 5` skills relevantes desde `.atl/skill-registry.md` o `node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>"`. Para preguntas estructurales del codebase usá **CodeGraph** (`codegraph_explore` / `codegraph status|query|impact`) antes de explorar el árbol a ciegas.
2. **Design & Backend Gates**: En UI usar `design-driven` v4 (Fase 1 D1b Creative Pitch en 1 mensaje + `DESIGN_SYSTEM.md`; Fase 2 canvas positivo `<=5` skills; Fase 3 `verify-frontend-gates.mjs --live` + `ui-diff` y 1 crítico ciego sustractivo en greenfield/mayor; cero cajas `0–2px` ni `" / "`). En backend usar `backend-driven` (`Backend Read` + `verify-backend-gates.mjs`).
3. **Proceso ODD (Gentle-AI 4.6.0, sin SDD)**: `default-inline` y trabajo continuo (decisiones humanas vía herramienta compatible o 1 pregunta). Clasificar por **Understood** (`<=1` batch/`~10k` tok), **Contained** (items `1-6`), **Resumable from `git diff`**. Planes Large/upgrades/lógica pesada pasan **Auto-EGM** (`egm-spec-review`, `3` Goldfishes) antes de `odd/tasks/<feature>.md` + micro-blueprint 5 líneas. Delegá writers solo por `2+` unidades disjuntas, backstop `~150k` tok, o **Frontend Studio / Model-Offload** (`>=50` líneas UI con `DESIGN_SYSTEM.md` o modelo distinto en `frontend-builder`, con `## Allowed edit surfaces` adjudicadas por el padre y `## Skills to load before work`; subagentes no borran scratch).
4. **Verificación Proporcional y Diferencial**: `passive` = readback estructural; `medium` = autoverificación del autor; `high` (`Risk: item 1-6`) = verificador independiente en `mktemp -d` (`_shared/verify-method.md`, sin `.git`) + spot check del padre + differential check cuando toca código compartido; máximo 1 corrección + 1 recheck. Operación remota requiere autorización explícita.
5. **Seguridad y Cierre**: pre-escaneá repos/archivos externos con `prompt-shield` (`safe_read.py --paranoia 9 --decode-depth 8 --quarantine-strictness 10`). Commits en slices de `~400` líneas (alto riesgo aislado; `pnpm-only`). Cerrá siempre con comando + salida observada, `live-cve-security-intel` en releases, y `Risk: item N (reason)` o `Risk: none`.
6. **Memoria & Floor-Not-Ceiling**: usá `mem_save`/`mem_search` si Engram MCP está disponible. Las skills marcan el piso, nunca un techo (`[Beyond-Baseline: <razón>]`).
<!-- skillsGV:kernel:end -->
