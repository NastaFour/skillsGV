---
name: archify
description: "Usala para crear diagramas Excalidraw, flujos y mapas de arquitectura visual técnica. No usar para escribir código de backend ni despliegues de infraestructura."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["archify", "excalidraw diagram", "diagrama de arquitectura", "mapa de arquitectura", "flujo de secuencia", "wireframe excalidraw"]
  scope: [global, project]
---

# Archify — Diagramas Técnicos y Arquitectura Visual en Excalidraw

Generador de diagramas de arquitectura técnica, mapas de componentes, flujos de secuencia y wireframes visuales en formato Excalidraw (`.excalidraw` JSON, ASCII estructurado y SVG reproducible). Transforma requerimientos de diseño en diagramas claros, mantenibles y estandarizados.

---

## 🎯 Contrato de Activación

Usa esta skill cuando el usuario solicite:
- Diseñar o documentar la arquitectura de un sistema, plataforma o monorepo.
- Mapear componentes, servicios, gateways y capas de persistencia.
- Trazar flujos de secuencia o interacción entre actores, servicios y APIs.
- Generar wireframes de baja/media fidelidad para flujos de usuario en formato visual.
- Exportar diagramas directamente a formato Excalidraw (JSON reproducible), ASCII para chat o SVG.

**No usar para**:
- Implementar código fuente o refactorizar archivos de backend/frontend (usar `architecture-designer` o `feature-implementer`).
- Diseñar sistemas visuales de UI finales en código CSS/Tailwind (usar `frontend-design`).

---

## 📐 Principios de Layout y Diseño Excalidraw

Para garantizar diagramas legibles y profesionales, aplica estas reglas de maquetación:

### 1. Jerarquía por Capas Verticales / Horizontales
Organiza los componentes respetando la dirección natural del flujo de datos (arriba hacia abajo o izquierda a derecha):
- **Capa 1: Clientes y Canales**: Web (React/Vite), Mobile (Expo/React Native), Terceros.
- **Capa 2: Edge y Tráfico**: Reverse Proxies, Cloudflare, WAF, API Gateway, Load Balancers.
- **Capa 3: Servicios de Aplicación**: Node/Express, NestJS, Workers, Microservicios.
- **Capa 4: Comunicación Asíncrona**: Colas BullMQ, Mensajería Redis/RabbitMQ, WebSockets.
- **Capa 5: Persistencia y Almacenamiento**: PostgreSQL, Prisma, S3/R2 Storage, Caches.

### 2. Paleta Cromática Semántica
Asigna colores de borde y fondo consistentes por responsabilidad:
- 🔵 **Clientes / Frontend**: Trazo `#1e40af` (azul), Relleno `#dbeafe` (azul claro).
- 🟣 **Gateway / Edge**: Trazo `#6b21a8` (púrpura), Relleno `#f3e8ff` (púrpura claro).
- 🟢 **Servicios Backend / APIs**: Trazo `#166534` (verde), Relleno `#dcfce7` (verde claro).
- 🟠 **Datos / Persistencia**: Trazo `#c2410c` (naranja), Relleno `#ffedd5` (naranja claro).
- 🔴 **Seguridad / Auth / WAF**: Trazo `#991b1b` (rojo), Relleno `#fee2e2` (rojo claro).
- ⚪ **Cajas Contenedoras (Subdominios)**: Trazo punteado gris `#9ca3af`, Relleno `#f9fafb`.

### 3. Geometría y Espaciado
- Mantén espaciado uniforme: mínimo `40px` entre cajas adyacentes y `60px` entre capas.
- Cuadricula mental: dimensiones múltiplos de `20px` (ej. cajas de `180x80px` o `220x100px`).
- Flechas con etiquetas breves: verbos de acción en tiempo presente (ej. `HTTP POST /booking`, `Publish event`, `Read SQL`).

---

## 🛠️ Formatos de Salida Soportados

### 1. Representación ASCII Estructurada (Chat Rápido)
Presenta siempre un mapa conceptual inicial en Markdown ASCII para validación inmediata:

```text
+-------------------+        +--------------------+
|   Web / Mobile    |        |  Admin Vite Panel  |
+---------+---------+        +---------+----------+
          |                            |
          +------------+  +------------+
                       |  |
                       v  v
             +---------------------+
             |   Cloudflare Edge   | (SSL Full, WAF, Turnstile)
             +----------+----------+
                        |
                        v
             +---------------------+
             |  Express API Server | (JWT Auth, Zod Validation)
             +----+-------------+--+
                  |             |
         +--------+             +--------+
         v                               v
+-----------------+              +-----------------+
|   PostgreSQL    |              |   BullMQ Queue  |
|  (Prisma ORM)   |              |  (Redis Engine) |
+-----------------+              +-----------------+
```

### 2. Formato Excalidraw JSON Schema (v2)
Para generar un archivo reproducible `.excalidraw`:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "archify",
  "elements": [
    {
      "id": "box-client-web",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 180,
      "height": 80,
      "angle": 0,
      "strokeColor": "#1e40af",
      "backgroundColor": "#dbeafe",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "roundness": { "type": 3 },
      "boundElements": [{ "id": "arrow-web-edge", "type": "arrow" }]
    },
    {
      "id": "text-client-web",
      "type": "text",
      "x": 130,
      "y": 130,
      "width": 120,
      "height": 20,
      "angle": 0,
      "strokeColor": "#1e3a8a",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "text": "Web Client (Vite)",
      "fontSize": 16,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "middle",
      "baseline": 14
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

---

## 📋 Pasos de Ejecución

1. **Recepción de Requerimientos**: Identificar actores, fronteras del sistema, tecnologías y protocolos de comunicación.
2. **Definición de Topología**: Seleccionar el tipo de diagrama (Arquitectura General, Flujo de Secuencia, Mapa de Componentes o Wireframe).
3. **Boceto ASCII In-Chat**: Dibujar la estructura básica para confirmar que todas las dependencias y conexiones son correctas.
4. **Construcción Excalidraw**:
   - Generar IDs semánticos únicos para cada elemento (`box-*`, `arrow-*`, `text-*`).
   - Calcular coordenadas `(x, y)` asegurando que las flechas apunten con exactitud a los centros de las cajas conectadas.
   - Definir agrupaciones (`groupIds`) cuando haya módulos o subsistemas compuestos.
5. **Persistencia del Archivo**: Guardar el contenido en `<ruta-solicitada>.excalidraw` o emitir el bloque JSON descargable.

---

## 🚦 Decision Gates

| Situación | Acción Recomendada |
|---|---|
| Arquitectura de alto nivel o decisiones de stack | Usar primero `02-dev-roles/architecture-designer` para definir el stack, luego `archify` para diagramar. |
| Diagrama técnico en Markdown simple / PR docs | Generar diagrama Mermaid inline o ASCII. |
| Diagrama visual editable y reproducible para el equipo | Generar archivo `.excalidraw` usando `archify`. |
| Prototipado rápido de UI con IA | Usar `11-mcp-hybrid/open-design` o `05-frontend/frontend-design`. |

---

## 📚 Referencias

- [`02-dev-roles/architecture-designer`](../architecture-designer/SKILL.md) — Definición y análisis arquitectónico.
- [`12-matt-pocock/codebase-design`](../../12-matt-pocock/codebase-design/SKILL.md) — Diseño de módulos y límites de abstracción.
- [Excalidraw Official Specification](https://docs.excalidraw.com) — Formato de elementos y rendering.
