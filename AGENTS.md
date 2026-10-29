# AGENTS.md — Skill System & Agent Contract (Portable 2026, pnpm)

Este archivo define el contrato de comportamiento y gobernanza cognitiva para cualquier agente de IA (Claude Code, Cursor, Gemini CLI, OpenCode, Codex, Copilot, Antigravity) trabajando en este repositorio o con este catálogo de skills.

## 🚀 1. Capa Always-On y Activación (Kernel de Arranque)
- **Modelo de capas**: Los agentes priorizan lo que reside en su capa always-on. El instalador (`node install.mjs --target <repo>`) inyecta el kernel `skillsGV:kernel` en los archivos autocargados (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`) y blinda `.gitignore`.
- **En este repositorio**: El catálogo completo está disponible. Las skills son módulos auto-contenidos conforme a la especificación [agentskills.io](https://agentskills.io/specification).
- **Índice completo**: Consulta [`SKILLS.md`](SKILLS.md) para el árbol de skills y rutas, y [`catalog.json`](catalog.json) para el manifiesto estructurado.

## 🔄 2. Proceso Exclusivo: ODD (Organic-Driven Development)
Gentle-AI 4.3.1 ODD es la única vía de desarrollo autorizada. El orquestador trabaja inline por defecto (`default-inline`); un trigger de delegación se activa solo cuando su condición realmente se cumple (presupuesto de evidencia superado >1 batch de ≤3 llamadas/~10k tokens o >~5 búsquedas secuenciales, Writer solo por 2+ unidades paralelas independientes con superficies disjuntas lanzadas juntas o backstop de ~150k tokens, o verificador independiente para ítems de alto riesgo 1-6 vía `--escalate-item <1-6> --escalate-reason` ejecutando probes en un `mktemp -d` aislado); el conteo de archivos, modelo del writer o tamaño de la tarea por sí solos nunca deciden la ruta. El review nativo (Provider Contract `1.5`) es proporcionativo: `review assess` solo marca `review_due` para riesgo alto (1-6); un candidato medio reporta `under_budget`, y el agente selecciona las lentes 4R con `--lenses/--lenses-reason` (con soporte de `--request-context` y `--target-evidence`). Todo cambio sigue este protocolo:
1. **Authorize**: Establecé si la solicitud autoriza cambios en código. Auditorías, revisiones o consultas son de solo lectura.
2. **Explore**: Inspeccioná código antes de proponer o escribir.
3. **Resolve Uncertainty**: Máximo una pregunta enfocada si hay decisiones de producto ambiguas.
4. **Classify**: Dimensioná según los 3 criterios de ODD (**Understood** en ≤1 batch de 3 llamadas/~10k tokens, **Contained risk** frente a los 6 ítems de alto riesgo, y **Resumable from `git diff` alone**); nunca clasifiques contando pasos, archivos, comandos o tests. Es *Large/Sustancial* solo cuando falla el resume test.
5. **Track before write**: Creá automáticamente `odd/tasks/<feature>.md` y su espejo Engram `odd/<feature>/tasks` antes del primer cambio de código.
6. **Implement (One-Shot Pre-Flight Blueprint)**: Antes de codificar cada unidad, sintetizá un micro-blueprint de 5 líneas (archivos exactos, firmas/tipos, invariantes, casos borde y probe de verificación) para lograr ejecuciones one-shot sin desperdicio de tokens. Implementá tarea a tarea en feature branch, commiteando unidades de trabajo en slices revisables de ~400 líneas cambiadas de autoría (código + tests + docs juntos). Cualquier unidad cuya línea `Risk:` nombre un ítem de alto riesgo (1-6) recibe su propio commit aislado (cerrando primero cualquier slice `under_budget` pendiente). Registrá el commit que contiene cada tarea en `odd/tasks/<feature>.md`.
7. **Close, Live CVE Gate & Verify**: Al cierre de un proyecto o release, ejecutá el gate de inteligencia de vulnerabilidades recientes (`live-cve-security-intel`) sobre las versiones exactas del stack y ciclo de vida de memoria/workers. Reportá con evidencia observada (comando + salida). Cero claims de "listo" sin prueba. Cerrá todo cambio de código con `Risk: item N (reason)` o `Risk: none` (verificando el ítem 3 cuando se modifican opciones, parsers o helpers compartidos).

## 🧭 3. Carga de Skills por Turno (Two-Tier Progressive Disclosure)
- **Tier 0 (Base)**: House-meta disponible al inicio (`odd-workflow`, `skill-router`, `skill-loader`, `skill-validator`, `testing-patterns`, `code-reviewer`, `engram-integration`, `dod-checker`, `decision-gate`).
- **Tier 1 (Bajo demanda)**: Cuando la tarea lo requiera o haya ambigüedad, ejecutá el router determinista para resolver las ≤5 skills exactas:
  ```bash
  node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" [--diff <lineas>] [--json]
  ```
- **Límite de contexto**: Jamás cargues más de 5 skills en un único turno. No ejecutes el router en bucle si las skills ya están en contexto.

## 🚦 4. Reglas Globales No Negociables
- **pnpm only**: `npm` y `npx` están estrictamente rechazados. Usá `pnpm` para scripts/dependencias y `pnpm dlx` en reemplazo de `npx`.
- **TDD aplicable**: Si existe runner determinista, observá RED antes de implementar, GREEN al completar, y refactorizá manteniendo verde.
- **Memoria persistente**: Si Engram MCP está disponible, guardá decisiones y descubrimientos con `mem_save` y consultá contexto previo con `mem_search`.
- **Revisión adversarial**: Cambios de alto impacto pasan por `judgment-day` (dos jueces ciegos independientes) antes de entrega final.
- **Anti-slop frontend & Design Gate obligatorio**: Toda tarea con superficie visual o código frontend activa obligatoriamente la fase D1b de `design-driven` antes de escribir código UI (en greenfield/pantallas completas vía 5 bloques o inferencia en modo auto con `Design Read` de 3 líneas; en ajustes menores/mantenimiento vía Fast-Path con `Design Read` de 1 línea). El diseño se ancla en uno de los 8 Chasis Arquetípicos (Monograph, Spec-Sheet, Gallery, Kinetic, Precision, Humanist, System Native, o Bespoke / Creative Exploration) y declara sus 3 reglas generativas mecánicas en `DESIGN_SYSTEM.md` o en la cabecera del archivo raíz de entrada (`/* @design-archetype: ... */`). Prohibido generar interfaces sin Design Read previo o inventar estética en el vacío.
- **Floor, Not Ceiling (Enseñanza > Dogma)**: Las skills proveen el piso de ingeniería y diseño; salvo en invariantes de seguridad (cero credenciales expuestas, auth, sanitización), `pnpm-only` y verificación real con evidencia antes de cerrar, el modelo está autorizado a proponer o aplicar mejoras, APIs modernas o direcciones creativas que superen el baseline de una skill cuando beneficien al proyecto (anotando `[Beyond-Baseline: <razón técnica/creativa>]`).



