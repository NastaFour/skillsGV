# Feature: skills-v3-harmonization (Floor, Not Ceiling & Canonical Pipeline)

- **Status**: IN_PROGRESS
- **Branch**: feat/skills-v3-harmonization
- **Engram Topic**: odd/skills-v3-harmonization/tasks
- **Route**: Delegated Direct (System-wide multi-unit refactor)
- **Forecast Lines**: ~1200 authored lines across 6 work units

## Specs

### S1: WU-1 - Gobernanza, Kernel y Orquestadores
- Inyectar principio transversal "Floor, Not Ceiling (Enseñanza > Dogma)" en `AGENTS.md` y `_shared/kernel-inject.mjs`.
- Deprecar las 11 sub-skills huérfanas de SDD (`00-meta-skills/sdd-*`) con `deprecated: "true"` y `redirect: "00-meta-skills/odd-workflow/SKILL.md"`.
- Armonizar `01-planning-process/brainstorming/SKILL.md`: remover orden exclusiva de `writing-plans` y conectar con `PRD.md`, `DESIGN_SYSTEM.md` y `odd-workflow`.
- Armonizar `12-matt-pocock/*` removiendo referencias a `/setup-matt-pocock-skills` y reemplazando invocación ficticia de "Skill tool" por lectura directa de SKILL.md.
- Actualizar `00-meta-skills/skill-router/references/overlap-matrix.json` con desempates para brainstorming vs grilling y debugging.
- Sincronizar router confidence doc, añadir perfil gemini en `_shared/agent-roster/profiles.json`, y actualizar `validate-skills.mjs` y `tier0-context.md`.
- Acceptance criteria: `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs` pasa con 0 errores.

### S2: WU-2 - Armonización Creativa del Ecosistema Frontend
- Unificar contrato de tokens y color: tokens semánticos CSS (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`) en `DESIGN_SYSTEM.md`. OKLCH por defecto, HSL para shadcn/Tailwind 3, HEX solo referencia visual documental.
- Transformar `taste-skill` y `design-driven` a "Enseñanza + Libertad Creativa": separar Nivel 1 (Invariantes Hard Anti-Slop) y Nivel 2 (Heurísticas contra Clichés de IA overrideables con justificación).
- Sincronizar los 7 Chasis Arquetípicos + 8º camino `Bespoke / Creative Exploration`. Header comment `/* @design-archetype: ... */` obligatorio en raíz o sin `DESIGN_SYSTEM.md`.
- Unificar las 4 ceremonias pre-código en 1 solo `Design Read` de 3 líneas.
- Afinar auto-trigger en `skill-router.mjs` para evitar sobrecarga en consultas puramente backend/lógica.
- Acceptance criteria: `validate-skills.mjs` pasa con 0 errores y tests de router pasan.

### S3: WU-3 - Integración del Pipeline de 4 Artefactos Canónicos
- Refactorizar `01-planning-process/idea-to-prd-express/SKILL.md`: corregir texto corrupto, eliminar stack fijo, salida canónica `PRD.md` y crear `references/prd-template.md`.
- Crear `01-planning-process/app-flow-spec/SKILL.md` (+ `references/app-flow-template.md`) con triggers `APP_FLOW.md`, `app flow`, etc., consumiendo `PRD.md` para producir mapa de pantallas, Mermaid, estados y transiciones.
- Unificar salida `DESIGN_SYSTEM.md` en `design-system-tokens` y `design-driven` (+ `references/design-system-template.md`) reemplazando fragmentación previa con compatibilidad retroactiva.
- Refactorizar `02-dev-roles/architecture-designer/SKILL.md` (+ `references/trd-template.md`) eliminando stack fijo y generando `TRD.md` con matriz de trazabilidad `FR-# -> Ruta -> Componente -> ODD T#`.
- Conectar pipeline con `00-meta-skills/odd-workflow/SKILL.md`.
- Acceptance criteria: todas las skills y plantillas creadas y validadas sin errores.

### S4: WU-4 - Descontaminación de Dominio ("Project-Agnostic Cleanup")
- Generalizar `04-backend/payments/SKILL.md`: arquitectura universal de pagos (Stripe, PayPal, MercadoPago, pasarelas locales, idempotencia, webhooks, máquina de estados). Mover flujos locales a ejemplos de referencia. Arreglar enlace roto en `master-prompt`.
- Generalizar `04-backend/postgresql/SKILL.md` y `04-backend/prisma-orm/SKILL.md`: principios relacionales agnósticos de e-commerce específico.
- Generalizar `05-frontend/push-notifications/SKILL.md` y `04-backend/booking-scheduling-domain/SKILL.md`, reemplazando rutas hardcodeadas `.opencode/skills/...` por relativas al catálogo.
- Generalizar `01-planning-process/application-workflow/SKILL.md`: patrón modular para arquitecturas tiempo real vs REST/RPC directo.
- Acceptance criteria: cero acoplamiento hardcodeado obligatorio, `validate-skills.mjs` pasa con 0 errores.

### S5: WU-5 - Compresión "Flash-Ready" y Limpieza de Enlaces Deprecados
- Adelgazar `05-frontend/interface-design/SKILL.md` de 327 líneas (>7.5k tokens) a <160 líneas (<3k tokens), moviendo ensayos a `references/craft-principles.md`.
- Corregir enlaces internos a skills deprecadas (`tailwindcss -> tailwind-4`, `expert-debugger -> systematic-debugging`).
- Acceptance criteria: `interface-design/SKILL.md` < 160 líneas y sin enlaces rotos.

### S6: WU-6 - Sincronización 4-Way del Catálogo y Validación Estricta
- Sincronizar catálogo (`SKILLS.md`, `AGENTS.md`, `catalog.json`, `.atl/skill-registry.md`, `tier0-context.md`).
- Ejecutar y verificar: `validate-skills.mjs --strict` (0 errores, 0 warnings), `skill-router.mjs` test, y `catalog-doctor.mjs`.
- Registrar commits atómicos, registrar hashes en el logbook de tareas y reporte ejecutivo.

## Tasks

- [x] **T1: WU-1 Gobernanza, Kernel y Orquestadores** (Spec: S1, Route: inline) - Commit: `13e4a63`
- [x] **T2: WU-2 Armonización Creativa Frontend (Floor, Not Ceiling)** (Spec: S2, Route: inline) - Commit: `3c09a0d`
- [x] **T3: WU-3 Pipeline Canónico 4 Documentos (PRD, APP_FLOW, TRD, DESIGN_SYSTEM)** (Spec: S3, Route: inline) - Commit: `97aca7e`
- [x] **T4: WU-4 Descontaminación de Dominio Project-Agnostic** (Spec: S4, Route: inline) - Commit: `49dd5d6`
- [x] **T5: WU-5 Compresión Flash-Ready y Limpieza de Enlaces** (Spec: S5, Route: inline) - Commit: pending
- [ ] **T6: WU-6 Sincronización 4-Way del Catálogo y Validación Estricta** (Spec: S6, Route: inline) - Commit: pending

## Log

- **L1** (2026-10-15): Solicitud inicial recibida para refactorización mayor ODD (WU-1 a WU-6): armonización de gobernanza/kernel, Floor Not Ceiling, pipeline 4 documentos, descontaminación de dominio, compresión Flash-Ready y validación estricta con sincronización 4-way.
