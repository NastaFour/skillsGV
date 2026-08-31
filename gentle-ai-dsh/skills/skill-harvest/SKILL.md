---
name: skill-harvest
description: "Trigger: harvest, cerrar proyecto, fin de proyecto, extraer aprendizajes, skill harvest, crear skill nueva, post-project. At project close (after ALL fixes), extract repeatable patterns from Engram memory and draft new-skill proposals into the _inbox folder — never auto-create skills."
license: MIT
allowed-tools: Read Write Bash(git:*,gh:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
---

# skill-harvest — Extracción de skills al cierre de proyecto

## Cuándo

Al cierre de CADA proyecto, después de TODOS los fixes, y solo cuando el usuario
lo considere cerrado. Nunca a mitad de camino.

## Procedimiento

1. Buscá en Engram (mem_search / mem_session_summary) lo aprendido del proyecto:
   discoveries, bugs, convenciones, decisiones de diseño (design/<proyecto>).
2. Identificá 1-3 patrones repetibles: gotchas que costaron tiempo, flujos que
   funcionaron, convenciones que nacieron.
3. Por cada candidato, escribí un TXT en la carpeta inbox (env **SKILLS_INBOX**,
   default ~/skills/_inbox (override con env SKILLS_INBOX)) con nombre <skill>.txt y esta
   estructura fija:

        name: <kebab-case>
        trigger: <cuándo se dispara>
        problema: <qué resuelve>
        contenido: <borrador del SKILL.md>
        evidencia: <archivos/sesión donde surgió>

4. Recomendá al usuario la creación formal (skill-creator + registro en SKILLS.md/AGENTS.md
   + validate-skills.mjs --strict). Listá los TXT generados.

## Regla dura

NUNCA crees la skill automáticamente. Solo proponé el borrador y esperá aprobación.

## Checklist de cierre

Antes de declarar el proyecto terminado: (1) mem_session_summary hecho, (2) harvest
corrido, (3) TXT(s) en _inbox referenciados en el resumen.
