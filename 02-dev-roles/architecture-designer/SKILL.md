---
name: architecture-designer
description: "Generates the canonical TRD.md (Technical Requirements Document): module architecture, data schemas, API contracts, NFRs, and traceability matrix linking PRD, APP_FLOW, and DESIGN_SYSTEM to ODD tasks. Trigger: TRD.md, technical requirements document, documento de requerimientos tecnicos, especificacion tecnica, architecture designer. Do NOT use for initial product discovery (use idea-to-prd-express) or visual layout (use design-driven)."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read Write Edit
metadata:
  trigger: ["TRD.md", "technical requirements document", "documento de requerimientos tecnicos", "especificacion tecnica", "architecture designer", "diseno de arquitectura"]
  scope: [global, project]
  version: "2.0.0"
---

# 🏛️ architecture-designer — Especificación Técnica Canónica (TRD.md)

Actúa como Arquitecto Principal de Software, definiendo la estructura técnica, esquemas de datos, contratos de interfaz y matriz de trazabilidad en el artefacto canónico **`TRD.md`**.

> **Integración ODD**: Consume los requisitos de `PRD.md`, las rutas y estados de `APP_FLOW.md` y los tokens/componentes de `DESIGN_SYSTEM.md` para producir `TRD.md`. Cada requerimiento se mapea de forma determinista a tareas ODD en `odd/tasks/<feature>.md`.

## 📋 Cuándo Usar

- ✅ Generación o actualización del documento de especificación técnica canónica (`TRD.md`).
- ✅ Definición modular de capas (Dominio, Aplicación, Infraestructura, Presentación) y contratos de API.
- ✅ Modelado de esquemas de datos relacionales o documentales y diagramas ER en Mermaid.
- ✅ Matriz de trazabilidad: `FR-# (PRD) → Ruta (APP_FLOW) → Componente (DESIGN_SYSTEM) → Tarea ODD (T#)`.
- ❌ **Do NOT use** para ideación inicial o requerimientos de usuario (usar `idea-to-prd-express` para `PRD.md`).
- ❌ **Do NOT use** para flujos de navegación y pantallas UI (usar `app-flow-spec` para `APP_FLOW.md`).
- ❌ **Do NOT use** para sistemas de diseño visual y tokens (usar `design-driven` para `DESIGN_SYSTEM.md`).

## 🛠️ Validación de Contexto y Selección de Stack

Antes de diseñar, valida las condiciones de contorno del proyecto:
1. **Stack Tecnológico**: Si el proyecto ya tiene un stack definido en su repositorio, respétalo. Si el stack no está definido, evalúa las compensaciones técnicas usando la matriz de [`tech-stack-advisor`](../../01-planning-process/tech-stack-advisor/SKILL.md) y propone el stack óptimo fundamentando la elección.
2. **Escala y Concurrencia**: Define los requisitos no funcionales (`NFR-*`) de rendimiento, volumen de datos y concurrencia esperada.
3. **Estructura de Espacios de Trabajo**: Si aplica un monorepo, consulta [`pnpm-workspaces`](../../06-code-quality/pnpm-workspaces/SKILL.md).
4. **Principios SOLID y Arquitectura Limpia**: Evita controladores masivos acoplados directamente a la persistencia. Desacopla la lógica de negocio mediante inversión de dependencias (DIP). Consulta [`solid-clean-code`](../../06-code-quality/solid-clean-code/SKILL.md).

## 📦 Entregable Canónico: `TRD.md`

Genera el archivo **`TRD.md`** en la raíz del proyecto siguiendo la plantilla canónica:
👉 [Plantilla Canónica de TRD](references/trd-template.md)

Estructura obligatoria de `TRD.md`:
1. **Visión Técnica y Stack**: Justificación técnica de las herramientas y librerías elegidas.
2. **Arquitectura de Módulos**: Diagrama de capas y árbol de estructura de directorios.
3. **Esquema de Datos**: Diagrama Entidad-Relación en Mermaid y definición de modelos e índices.
4. **Contratos de API y Errores**: Payloads tipados con validadores de esquema (ej. Zod) y códigos de error estándar.
5. **Seguridad y Rendimiento (`NFR-*`)**: Mecanismos de autenticación, control de accesos, idempotencia y límites de latencia.
6. **Matriz de Trazabilidad Canónica**: Mapeo tabular obligatorio de cada `FR-#` hacia su ruta en `APP_FLOW.md`, componente en `DESIGN_SYSTEM.md`, endpoint en `TRD.md` y tarea de implementación ODD `T#`.

## 📚 Referencias

- [Plantilla Canónica de TRD.md](references/trd-template.md)
- [`idea-to-prd-express`](../../01-planning-process/idea-to-prd-express/SKILL.md) — Requerimientos de producto (`PRD.md`)
- [`app-flow-spec`](../../01-planning-process/app-flow-spec/SKILL.md) — Flujos de pantalla (`APP_FLOW.md`)
- [`design-driven`](../../05-frontend/design-driven/SKILL.md) — Sistema de diseño (`DESIGN_SYSTEM.md`)
- [`odd-workflow`](../../00-meta-skills/odd-workflow/SKILL.md) — Orquestador ODD y seguimiento de tareas
