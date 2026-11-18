<!--
  bootstrap-kernel-full.md — plantilla del kernel always-on (harness SIN gentle-ai).
  El instalador inyecta este bloque (incluidos los marcadores) en los archivos que
  cada harness autocarga (AGENTS.md / GEMINI.md / CLAUDE.md). Ediciones van al
  bloque entre marcadores; el instalador reemplaza el bloque completo (idempotente).
-->
<!-- skillsGV:kernel:start -->
## skillsGV — kernel de arranque (Gentle-AI 4.5.0 compatible)

Este repositorio tiene el catálogo de skills `skillsGV` instalado. Este bloque es la capa always-on; todo lo demás del catálogo es opt-in.

1. **Skills & Discovery antes que improvisar**: resolvé `<= 5` skills relevantes desde `.atl/skill-registry.md` o `node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>"`. Para preguntas estructurales del codebase usá **CodeGraph** (`codegraph_explore` / `codegraph status|query|impact`) antes de explorar el árbol a ciegas.
2. **Design Gate D1b + Think Outside the Box (obligatorio en UI)**: antes de generar o editar UI/CSS, cargá `design-driven` (y hermanas `taste-skill`, `impeccable`, `hallmark-design-study`, `ui-ux-pro-max`, `interface-design`, `emil-kowalski`, `ai-design-check-stageshow`), emití el `Design Read` de 3 líneas (`1` línea en ajustes `<50` líneas), fijá Chasis `A–H` (`H` = Inversión Lateral de 3 Clichés) y persistí `DESIGN_SYSTEM.md`.
3. **Proceso ODD (Gentle-AI 4.5.0, sin SDD)**: `default-inline`. Autorizar → Explorar → Resolver incertidumbre (máx. 1 pregunta) → Clasificar por 3 criterios (**Understood** `<=1` batch/`~10k` tok, **Contained risk** items `1-6`, **Resumable from `git diff` alone**) → en planes **Large**/upgrades/lógica pesada, **Auto-EGM Plan Gate** (`egm-spec-review`, `3` Goldfishes; `0` en chicas) → `odd/tasks/<feature>.md` + micro-blueprint 5 líneas. Delegá writers solo por paralelismo real (pasando `## Allowed edit surfaces`, `## Skills to load before work`, y cierre `## Key Learnings`) o backstop `~150k` tok; subagentes nunca borran scratch fuera del repo, lo reportan al padre.
4. **Verificación Proporcional y Diferencial**: `passive` = readback estructural; `medium` = autoverificación del autor; `high` (`Risk: item 1-6`) = verificador independiente en `mktemp -d` (`_shared/verify-method.md`, sin `.git`) + spot check del padre + differential check cuando toca código compartido; máximo 1 corrección + 1 recheck. Operación remota requiere autorización explícita.
5. **Seguridad y Cierre**: pre-escaneá repos/archivos externos con `prompt-shield` (`safe_read.py --paranoia 9 --decode-depth 8 --quarantine-strictness 10`). Commits en slices de `~400` líneas (alto riesgo aislado; `pnpm-only`). Cerrá siempre con comando + salida observada, `live-cve-security-intel` en releases, y `Risk: item N (reason)` o `Risk: none`.
6. **Memoria & Floor-Not-Ceiling**: usá `mem_save`/`mem_search` si Engram MCP está disponible. Las skills marcan el piso, nunca un techo (`[Beyond-Baseline: <razón>]`).
<!-- skillsGV:kernel:end -->
