# Feature: skills-v3-harmonization (Floor, Not Ceiling & Canonical Pipeline)

- **Status**: IN_PROGRESS
- **Branch**: feat/skills-v3-harmonization
- **Engram Topic**: odd/skills-v3-harmonization/tasks
- **Route**: Delegated Direct (Parallel writers with disjoint edit surfaces for T7 adversarial remediation)
- **Forecast Lines**: ~1500 authored lines across 7 work units

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
- [x] **T5: WU-5 Compresión Flash-Ready y Limpieza de Enlaces** (Spec: S5, Route: inline) - Commit: `f604701`
- [x] **T6: WU-6 Sincronización 4-Way del Catálogo y Validación Estricta** (Spec: S6, Route: inline) - Commit: `e3637a9`
- [ ] **T7: WU-7 Remediación de Auditoría Adversarial Post-Flash (15 hallazgos)** (Spec: S1-S6, Route: delegated — Writer trigger: 2 parallel writers with disjoint edit surfaces)

## Log

- **L1** (2026-10-15): Solicitud inicial recibida para refactorización mayor ODD (WU-1 a WU-6): armonización de gobernanza/kernel, Floor Not Ceiling, pipeline 4 documentos, descontaminación de dominio, compresión Flash-Ready y validación estricta con sincronización 4-way.
- **L2** (2026-10-15): WU-1 completado y verificado (commit `13e4a63`). Cláusula Floor, Not Ceiling inyectada en kernel y AGENTS.md; 11 sub-skills de SDD deprecadas con redirect a odd-workflow; Matt Pocock skills armonizadas; overlap-matrix actualizada; perfil gemini agregado.
- **L3** (2026-10-15): WU-2 completado y verificado (commit `3c09a0d`). Contrato de tokens unificado (semánticos CSS, OKLCH por defecto, HSL permitido); 8 chasis arquetípicos sincronizados; Design Read unificado de 3 líneas; reglas de taste-skill divididas en Nivel 1 (Hard Anti-Slop) y Nivel 2 (Heurísticas contextuales).
- **L4** (2026-10-15): WU-3 completado y verificado (commit `97aca7e`). Pipeline de 4 artefactos canónicos activo: `PRD.md` (`idea-to-prd-express`), `APP_FLOW.md` (`app-flow-spec`), `TRD.md` (`architecture-designer`), y `DESIGN_SYSTEM.md` (`design-driven`, `design-system-tokens`). Conexión trazable en `odd-workflow`.
- **L5** (2026-10-15): WU-4 completado y verificado (commit `49dd5d6`). Descontaminación de dominio: arquitectura universal de pagos (adaptadores e idempotencia) + referencia regional Venezuela; PostgreSQL y Prisma ORM desacoplados a modelado relacional profesional; push-notifications y booking generalizados; application-workflow modularizado en doble patrón (directo vs reactivo).
- **L6** (2026-10-15): WU-5 completado y verificado (commit `f604701`). Compresión Flash-Ready de `interface-design` a 67 líneas (<3k tokens) extrayendo `craft-principles.md`; enlaces deprecados limpiados (`tailwindcss` -> `tailwind-4`, `expert-debugger` -> `systematic-debugging`).
- **L7** (2026-10-15): WU-6 completado y verificado. Sincronización 4-way del catálogo (231 skills). Batería determinista 100% verde: `validate-skills.mjs --strict` (0 errores, 0 warnings), `catalog-doctor.mjs` (7/7 checks passed), y `test/**/*.test.mjs` (218/218 tests passed).
- **L8** (2026-10-15): Solicitud de evaluación final: "ya queda evaluar si verdaderamente soluciono todos los problemas y con una ejecucion impecable, cuando termines y este todo bien al 100% indicame en una lista todo lo nuevo , lo que se mejoro y arreglo". La auditoría adversarial independiente detectó 15 brechas residuales dejadas por Flash (referencias a `writing-plans`, `Skill tool` y `/setup-matt-pocock-skills` restantes, omisión de `The Humanist Companion` en `dials.md`, doble conteo de triggers en `skill-router.mjs`, 24 rutas `.opencode/skills/` hardcodeadas, enlaces deprecados residuales y notas SDD en `catalog-manifest.mjs`). Se abre T7 con 2 writers paralelos de superficie disjunta para llevar la ejecución al 100% real.

