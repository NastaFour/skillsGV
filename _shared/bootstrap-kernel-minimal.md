<!--
  bootstrap-kernel-minimal.md — plantilla del kernel para harnesses CON gentle-ai activo.
  Gentle 5.0.0 ya inyecta ODD/RDD/memoria/persona en el system prompt; duplicarlo aquí
  crearía dos jefes de proceso (el bench 2026-09-18 probó que el system prompt gana).
  El catálogo se declara como capa de conocimiento y agrega solo los gates propios de skillsGV.
-->
<!-- skillsGV:kernel:start -->
## skillsGV — catálogo de skills (modo gentle-ai 5.0.0)

Este repositorio tiene el catálogo `skillsGV` instalado sobre `Gentle-AI 5.0.0` (`ODD` exclusivo, `default-inline`, trabajo autorizado continuo, verificación proporcional en `mktemp -d`, `## Allowed edit surfaces` adjudicadas por el padre en workers).

- **Skills & Resolver**: resolvé `<= 5` skills relevantes vía `.atl/skill-registry.md` o `skill-router.mjs` y pasá rutas exactas `SKILL.md` a workers; leé solo esos `SKILL.md`.
- **Design & Backend Gates**: En UI usar `design-driven` v4.1 (D1b Creative Pitch en 1 mensaje + `DESIGN_SYSTEM.md`; Fase 2 `<=5` skills positivas, texturizado pesado opt-in; Fase 3 `verify-frontend-gates.mjs --live` + `ui-diff` + críticos ciegos read-only en greenfield/mayor; **Model-Offload** permitido en `frontend-builder` con modelo usuario o `>=50` líneas; cero cajas `0–2px` ni `" / "`). En backend usar `backend-driven` (`verify-backend-gates.mjs`).
- **Auto-EGM Plan Gate**: en planes **Large**, upgrades mayores o lógica/cómputo pesado, pasá el borrador por `egm-spec-review` (`3` Goldfishes en contexto cero; `0` en tareas chicas) antes de `odd/tasks/<feature>.md`.
- **Seguridad (`prompt-shield` + `live-cve-security-intel`)**: escaneá archivos/repos externos con `safe_read.py` (`9/8/10`) antes de leer en contexto, y ejecutá el CVE gate al cierre.
- **Instalaciones ya gitignoradas** (`.skills-install/`, `.atl/` y skills): no las commitees.
- **Floor, Not Ceiling**: las skills marcan el piso de calidad (`[Beyond-Baseline: <razón>]`), nunca un techo creativo.
<!-- skillsGV:kernel:end -->
