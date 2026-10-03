---
name: lean-ux
description: "Usala para validar hipótesis de diseño, suposiciones de negocio y ciclos Lean UX con MVP ágiles. No usar para especificaciones waterfall extensas ni desarrollo final."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["lean ux", "hipotesis de diseño", "validacion mvp", "suposiciones de producto", "build measure learn", "feedback loops"]
  scope: [global, project]
---

# Lean UX — Hipótesis de Diseño y Validación Rápida de MVP

Metodología Lean UX orientada a resultados (*outcomes over outputs*). En lugar de redactar especificaciones exhaustivas antes de construir, Lean UX alinea al equipo mediante la declaración explícita de suposiciones, formulación de hipótesis comprobables, creación de experimentos MVP de baja fidelidad y medición con bucles de retroalimentación directa (*Build-Measure-Learn*).

---

## 🎯 Contrato de Activación

Usa esta skill cuando el usuario solicite:
- Declarar o priorizar suposiciones de negocio, de usuario o de producto ante una nueva iniciativa.
- Formular hipótesis de diseño y experimentos de validación antes de codificar soluciones complejas.
- Definir un MVP (Producto Mínimo Viable) de baja o media fidelidad para comprobar valor real.
- Diseñar métricas directas y bucles de aprendizaje continuo sin desperdicio documental (*zero heavy specs*).
- Evaluar si una funcionalidad propuesta resuelve un dolor real o si debe descartarse/pivotarse.

**No usar para**:
- Procesos formales de especificación arquitectónica pesada o fases SDD completas (usar `02-dev-roles/architecture-designer` o `00-meta-skills/sdd-spec`).
- Sesiones de divergencia creativa pura sin validación de hipótesis (usar `01-planning-process/brainstorming`).
- Implementación de código de componentes o tests (usar `02-dev-roles/feature-implementer`).

---

## 🔄 El Ciclo Lean UX

```text
       +---------------------------------------------+
       |   1. Declarar Suposiciones (Assumptions)    |
       |      - Negocio + Usuario + Riesgo          |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |   2. Formular Hipótesis Comprobables        |
       |      - Plantilla estándar de Outcome        |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |   3. Diseñar Experimento / MVP Mínimo       |
       |      - Baja fidelidad, cero desperdicio     |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |   4. Medir y Aprender (Build-Measure-Learn) |
       |      - Pivotar / Iterar / Escalar           |
       +---------------------------------------------+
```

---

## 📋 Protocolo de Trabajo Paso a Paso

### Paso 1: Declaración y Matriz de Suposiciones

Comienza declarando las suposiciones sin juzgarlas. Clasifícalas en dos vertientes:

1. **Suposiciones de Negocio**:
   - ¿Qué problema del cliente estamos resolviendo?
   - ¿Por qué el cliente pagaría o adoptaría nuestra solución?
   - ¿Cuál es la propuesta de valor diferenciadora?

2. **Suposiciones de Usuario**:
   - ¿Quién es el usuario principal (perfil, contexto, restricciones)?
   - ¿En qué momento y dispositivo interactúa con el flujo?
   - ¿Qué fricción actual le impide alcanzar su objetivo?

3. **Matriz de Priorización por Riesgo**:
   - Evalúa cada suposición en dos ejes: **Riesgo (Alto / Bajo)** e **Incertidumbre (Alta / Baja)**.
   - **Enfócate exclusivamente en el cuadrante de Alto Riesgo + Alta Incertidumbre**. Las suposiciones de bajo riesgo no justifican experimentos complejos.

---

### Paso 2: Formulación Canónica de Hipótesis

Transforma cada suposición crítica en una hipótesis comprobable usando la plantilla estándar de Lean UX:

```text
Creemos que:
  [Construir esta solución / experiencia / funcionalidad]

Para el segmento de usuarios:
  [Perfil específico de usuario o contexto de uso]

Logrará el resultado de negocio (Outcome):
  [Métrica o cambio observable de comportamiento, NO un entregable]

Sabremos que tuvimos éxito cuando:
  [Criterio de validación medible: ej. >= 20% de conversión, 50 clics en CTA, o retención a 7 días]
```

> **Regla de oro**: Un *outcome* es un cambio en el comportamiento del usuario que genera valor comercial. "Lanzar la pantalla de checkout" es un entregable (*output*); "reducir el abandono del carrito en un 15%" es un resultado (*outcome*).

---

### Paso 3: Definición del MVP de Baja Fidelidad

El MVP en Lean UX no es la versión 1.0 de un software, sino **el artefacto más pequeño y económico capaz de validar o refutar la hipótesis**:

| Tipo de MVP | Cuándo Usarlo | Esfuerzo |
|---|---|---|
| **Smoke Test / Fake Door** | Validar demanda antes de construir backend | Bajo (1 día) |
| **Prototipo Clickeable / Wireframe** | Validar usabilidad y claridad de flujo | Medio (1-3 días) |
| **Concierge MVP** | Servicio prestado manualmente tras bambalinas | Bajo en código, alto manual |
| **Wizard of Oz** | La UI parece automatizada, pero la lógica es manual | Medio |
| **Feature Flag Slice** | Probar en un subconjunto (5-10%) de usuarios reales | Medio-Alto |

---

### Paso 4: Medición Directa y Bucles de Aprendizaje

1. **Métricas de Aprendizaje vs Métricas de Vanidad**:
   - *Vanidad (evitar)*: visitas totales a la página, descargas acumuladas.
   - *Accionables (utilizar)*: tasa de finalización de flujo, activación en primeros 3 minutos, tasa de recomendación neta.
2. **Evaluación de Resultados**:
   - **Validada**: La evidencia confirma la hipótesis -> Proceder a diseñar e implementar con `02-dev-roles/architecture-designer` o `00-meta-skills/sdd-apply`.
   - **Refutada**: La evidencia contradice la hipótesis -> Pivotar la solución o descartar la iniciativa sin haber malgastado semanas de desarrollo.
   - **Inconclusa**: La muestra o métrica fue ambigua -> Refinar el experimento o ajustar el criterio de medición.

---

## 🚫 Criterios Anti-Desperdicio (*Zero Heavy Specs*)

- **Sin PRDs de 30 páginas**: Toda la hipótesis, experimento y métrica debe caber en una página de Markdown.
- **Comprensión Compartida (*Shared Understanding*)**: La conversación y la colaboración constante reemplazan a los traspasos de documentos rígidos.
- **Iteraciones Cortas**: Ningún ciclo de experimentación debe tomar más de 1 o 2 semanas.

---

## 🚦 Decision Gates

| Situación | Acción |
|---|---|
| Idea inicial sin validación de demanda | Ejecutar `01-planning-process/lean-ux` para hipótesis y smoke test. |
| Decisión técnica/funcional que requiere spec ágil en 20 min | Usar `01-planning-process/idea-to-prd-express`. |
| Hipótesis validada y lista para arquitectura técnica | Proceder a `02-dev-roles/architecture-designer`. |
| Tarea puntual sobre código ya existente | Seguir el flujo de desarrollo directo sin Lean UX. |

---

## 📚 Referencias

- [`01-planning-process/brainstorming`](../brainstorming/SKILL.md) — Exploración inicial de ideas y diseños colaborativos.
- [`01-planning-process/idea-to-prd-express`](../idea-to-prd-express/SKILL.md) — Conversión acelerada de decisiones en PRD de 20 minutos.
- [`01-planning-process/project-tracker`](../project-tracker/SKILL.md) — Seguimiento de estado y roadmap del proyecto.
- Gothelf, J. & Seiden, J. — *Lean UX: Designing Great Products with Agile Teams*.
