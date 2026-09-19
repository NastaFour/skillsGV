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
- **Proceso**: ODD/RDD/SDD, commits por unidad y verificación los define tu harness gentle-ai — seguílo tal cual; SDD solo a pedido explícito. Si el binario está disponible, el dispatcher nativo (`gentle-ai sdd-status` / `gentle-ai sdd-continue`) es la autoridad de ruteo de fases.
- **Instalaciones ya gitignoradas** (`.skills-install/` y skills): no las commitees.
<!-- skillsGV:kernel:end -->
