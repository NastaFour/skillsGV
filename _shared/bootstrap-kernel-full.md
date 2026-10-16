<!--
  bootstrap-kernel-full.md — plantilla del kernel always-on (harness SIN gentle-ai).
  El instalador inyecta este bloque (incluidos los marcadores) en los archivos que
  cada harness autocarga (AGENTS.md / GEMINI.md / CLAUDE.md). Ediciones van al
  bloque entre marcadores; el instalador reemplaza el bloque completo (idempotente).
-->
<!-- skillsGV:kernel:start -->
## skillsGV — kernel de arranque (siempre activo)

Este repositorio tiene el catálogo de skills skillsGV instalado. Este bloque es la capa always-on; todo lo demás del catálogo es opt-in. ¿Viniste de un clone y no tenés el catálogo? Ignorá este bloque o instalalo (`node install.mjs --target .` desde el repo de skillsGV).

1. **Skills antes que improvisar**: al empezar una tarea, resolvé skills de forma determinista con el router:
   - Primario: ejecutá `node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>"` cuando esté disponible (o la ruta correspondiente instalada en tu entorno).
   - Fallback: si el router no está disponible, seleccioná ≤5 skills relevantes desde `.skills-install/manifest.json` o tu índice en contexto.
   Leé solo los `SKILL.md` seleccionados.
2. **Proceso ODD (sin SDD)**: ODD es el único flujo de desarrollo (ver skill `odd-workflow`). Explorar → clasificar → feature doc `odd/tasks/<feature>.md` antes del primer write en tareas sustanciales. SDD está retirado.
3. **Commits por unidad de trabajo**: un commit convencional por tarea completa (código + tests + docs). Nunca un `git add .` masivo al cierre.
4. **Nada de "listo" sin evidencia**: cada afirmación de terminado lleva el comando ejecutado y su resultado observado. Las instalaciones (`.skills-install/`) no se commitean (ya en `.gitignore`).
5. **Memoria si existe**: con Engram MCP disponible, `mem_save` en cada decisión/bug/descubrimiento y `mem_search` antes de retomar trabajo previo.
6. **Cierre con mini-reporte** (≤5 líneas): skills usadas · qué cambiaron · verificación (comando + resultado) · un único próximo paso.
7. **Floor, Not Ceiling (Enseñanza > Dogma)**: Las skills proveen el piso de ingeniería y diseño; salvo en invariantes de seguridad, `pnpm-only` y verificación real, estás autorizado a proponer mejoras, APIs modernas o direcciones creativas que superen el baseline cuando beneficien al proyecto.

Contrato de salida: acción primero; pasos numerados; un próximo paso concreto; sin preámbulos ni cierres de cortesía; listas de máximo 5 ítems; errores matter-of-fact. (Adaptado de [i-have-adhd](https://github.com/ayghri/i-have-adhd), MIT.)
<!-- skillsGV:kernel:end -->
