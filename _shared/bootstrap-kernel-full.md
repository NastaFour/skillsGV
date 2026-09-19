<!--
  bootstrap-kernel-full.md — plantilla del kernel always-on (harness SIN gentle-ai).
  El instalador inyecta este bloque (incluidos los marcadores) en los archivos que
  cada harness autocarga (AGENTS.md / GEMINI.md / CLAUDE.md). Ediciones van al
  bloque entre marcadores; el instalador reemplaza el bloque completo (idempotente).
-->
<!-- skillsGV:kernel:start -->
## skillsGV — kernel de arranque (siempre activo)

Este repositorio tiene el catálogo de skills skillsGV instalado. Este bloque es la capa always-on; todo lo demás del catálogo es opt-in.

1. **Skills antes que improvisar**: al empezar una tarea, elegí hasta 5 skills relevantes del índice de skills que ya tenés en contexto (o de `.skills-install/manifest.json`) y leé solo esos `SKILL.md`.
2. **Commits por unidad de trabajo**: un commit convencional por tarea completa (código + tests + docs). Nunca un `git add .` masivo al cierre.
3. **Las instalaciones no se commitean**: `.skills-install/` y los directorios de skills instalados ya están en `.gitignore` (los escribió el instalador).
4. **Nada de "listo" sin evidencia**: cada afirmación de terminado lleva el comando ejecutado y su resultado observado.
5. **Memoria si existe**: con Engram MCP disponible, `mem_save` en cada decisión/bug/descubrimiento y `mem_search` antes de retomar trabajo previo.
6. **Cierre con mini-reporte** (≤5 líneas): skills usadas · qué cambiaron · verificación (comando + resultado) · un único próximo paso.

Contrato de salida: acción primero; pasos numerados; un próximo paso concreto; sin preámbulos ni cierres de cortesía; listas de máximo 5 ítems; errores matter-of-fact. (Adaptado de [i-have-adhd](https://github.com/ayghri/i-have-adhd), MIT.)
<!-- skillsGV:kernel:end -->
