---
name: app-flow-spec
description: "Generates the canonical APP_FLOW.md specification: route maps, role permissions, Mermaid state diagrams, empty/loading/error matrices, and UI transitions. Trigger: APP_FLOW.md, app flow, user flow, mapa de pantallas, flujo de navegacion, state transitions. Do NOT use for backend database ERDs (use architecture-designer) or component styling (use design-driven)."
license: MIT
compatibility: "Compatible with modern web and mobile apps. Requires Node 20+ and pnpm."
allowed-tools: Read Write Edit
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["APP_FLOW.md", "app flow", "user flow", "mapa de pantallas", "flujo de navegacion", "state transitions", "transiciones de estado", "screen map"]
  scope: [global, project]
---

# 🗺️ app-flow-spec — Especificación Canónica de Flujo de Aplicación (APP_FLOW.md)

Modela y documenta formalmente la arquitectura de navegación, permisos, máquinas de estados y transiciones de pantallas en el artefacto canónico **`APP_FLOW.md`**.

> **Integración ODD**: Consume los requerimientos funcionales (`FR-01..FR-n`) de `PRD.md` para producir `APP_FLOW.md`. Sus rutas y estados son referenciados por `DESIGN_SYSTEM.md` (componentes por pantalla), `TRD.md` (contratos API por vista) y las tareas de `odd/tasks/<feature>.md`.

## 📋 Cuándo Usar

- ✅ Definición o auditoría del mapa de rutas y permisos de usuario por pantalla.
- ✅ Modelado de flujos críticos de usuario mediante diagramas Mermaid (`flowchart TD` y `stateDiagram-v2`).
- ✅ Documentación exhaustiva de estados de interfaz: `Empty`, `Loading`, `Populated`, `Error` y `Offline`.
- ✅ Definición de la tabla determinista de transiciones de pantalla (origen, evento, validación, destino).
- ❌ **Do NOT use** para requisitos de negocio o problemas de usuario (usar `idea-to-prd-express` para `PRD.md`).
- ❌ **Do NOT use** para diseño visual de tokens, chasis o CSS (usar `design-driven` para `DESIGN_SYSTEM.md`).
- ❌ **Do NOT use** para arquitectura de backend o esquemas de base de datos (usar `architecture-designer` para `TRD.md`).

## 🛠️ Proceso de Generación

1. **Lectura de Entrada (`PRD.md`)**:
   - Inspeccionar si existe `PRD.md` en el proyecto para extraer los requerimientos funcionales (`FR-*`) y personas (`P-*`). Si no existe, extraer los flujos clave de la solicitud del usuario.
2. **Definir el Mapa de Rutas & Guards**:
   - Mapear cada pantalla requerida a una URL/ruta determinista y asociar los permisos de acceso y guards correspondientes.
3. **Diagramar Flujos Críticos en Mermaid**:
   - Crear un diagrama de flujo de alto nivel (`flowchart TD`) y diagramas de estados para flujos complejos (`stateDiagram-v2`).
4. **Completar la Matriz de 5 Estados por Pantalla**:
   - Especificar qué ve el usuario en: Vacío (`Empty`), Carga (`Loading`), Poblado (`Populated`), Error (`Error`) y Desconectado/Edge (`Offline`).
5. **Generar la Tabla de Transiciones**:
   - Mapear cada acción de usuario: `Origen → Evento → Validación → Destino Éxito / Destino Error`.
6. **Escribir el Artefacto Canónico**:
   - Guardar en la raíz como **`APP_FLOW.md`** siguiendo la [Plantilla de Referencia](references/app-flow-template.md).

## 📚 Referencias y Plantillas

- [Plantilla Canónica de APP_FLOW.md](references/app-flow-template.md)
- [`idea-to-prd-express`](../idea-to-prd-express/SKILL.md) — Proveedor de requerimientos (`PRD.md`)
- [`architecture-designer`](../../02-dev-roles/architecture-designer/SKILL.md) — Consumidor de flujos para `TRD.md`
- [`design-driven`](../../05-frontend/design-driven/SKILL.md) — Sistema de diseño y tokens (`DESIGN_SYSTEM.md`)
- [`odd-workflow`](../../00-meta-skills/odd-workflow/SKILL.md) — Orquestador ODD
