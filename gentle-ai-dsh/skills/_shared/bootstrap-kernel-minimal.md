<!--
  bootstrap-kernel-minimal.md — plantilla del kernel para harnesses CON gentle-ai activo.
  Gentle ya inyecta ODD/RDD/memoria/persona en el system prompt; duplicarlo aquí
  crearía dos jefes de proceso (el bench 2026-09-18 probó que el system prompt gana).
  El catálogo se declara como capa de conocimiento y defiere el proceso al harness.
-->
<!-- skillsGV:kernel:start -->
## skillsGV — catálogo de skills (modo gentle-ai)

Este repositorio tiene el catálogo skillsGV instalado y el harness gentle-ai activo.

- **Skills**: elegí ≤5 skills relevantes por tarea desde tu índice de skills y leé solo esos `SKILL.md`; el catálogo es capa de conocimiento, no capa de proceso.
- **Proceso**: ODD exclusivo (Organic Driven Development), gobernado por el Evidence Budget de Gentle-AI 4.0.0 (máx. 1 batch paralelo de ~10k tokens inline; mappers y writers delegados). Commits por unidad de trabajo (Conventional Commits) y verificación con evidencia obligatoria.
- **Instalaciones ya gitignoradas** (`.skills-install/` y skills): no las commitees.
<!-- skillsGV:kernel:end -->
