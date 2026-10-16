# AGENTS.md — Skill System & Agent Contract (Portable 2026, pnpm)

Este archivo define el contrato de comportamiento y gobernanza cognitiva para cualquier agente de IA (Claude Code, Cursor, Gemini CLI, OpenCode, Codex, Copilot, Antigravity) trabajando en este repositorio o con este catálogo de skills.

## 🚀 1. Capa Always-On y Activación (Kernel de Arranque)
- **Modelo de capas**: Los agentes priorizan lo que reside en su capa always-on. El instalador (`node install.mjs --target <repo>`) inyecta el kernel `skillsGV:kernel` en los archivos autocargados (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`) y blinda `.gitignore`.
- **En este repositorio**: El catálogo completo está disponible. Las skills son módulos auto-contenidos conforme a la especificación [agentskills.io](https://agentskills.io/specification).
- **Índice completo**: Consulta [`SKILLS.md`](SKILLS.md) para el árbol de skills y rutas, y [`catalog.json`](catalog.json) para el manifiesto estructurado.

## 🔄 2. Proceso Exclusivo: ODD (Organic-Driven Development)
Gentle-AI 4.1.x ODD es la única vía de desarrollo autorizada. La delegación es por razón nombrada (presupuesto de evidencia, writers paralelos con superficies disjuntas, o verificador independiente de alto riesgo); el conteo de archivos y el tamaño por sí solos nunca deciden la ruta. El review nativo es proporcionativo: `review assess` solo marca `review_due` para riesgo alto; un candidato medio reporta `under_budget` sin importar las líneas, y el agente selecciona las lentes 4R con `--lenses/--lenses-reason`. Todo cambio sigue este protocolo:
1. **Authorize**: Establecé si la solicitud autoriza cambios en código. Auditorías, revisiones o consultas son de solo lectura.
2. **Explore**: Inspeccioná código antes de proponer o escribir.
3. **Resolve Uncertainty**: Máximo una pregunta enfocada si hay decisiones de producto ambiguas.
4. **Classify**: Si el trabajo involucra 2+ pasos significativos, es sustancial.
5. **Track before write**: Creá automáticamente `odd/tasks/<feature>.md` y su espejo Engram `odd/<feature>/tasks` antes del primer cambio de código.
6. **Implement**: Tarea a tarea en feature branch. Cada tarea cierra con un Conventional Commit (código + tests + docs) registrando el hash en el documento de tareas.
7. **Close & Verify**: Reporte con evidencia observada (comando + salida). Cero claims de "listo" sin prueba.

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



