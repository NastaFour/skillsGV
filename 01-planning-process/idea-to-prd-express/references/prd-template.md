# Product Requirements Document (PRD)

> **Artefacto Canónico**: `PRD.md`  
> **Estado**: Borrador / Aprobado  
> **Fecha**: YYYY-MM-DD  
> **Versión**: 1.0.0  

---

## 1. Resumen Ejecutivo
- **Visión General**: [Descripción concisa del producto o funcionalidad en 2-3 oraciones: qué es, para qué sirve y qué impacto genera].
- **Problema de Negocio / Oportunidad**: [Dolor específico que experimenta el usuario o la ineficiencia que se resuelve].
- **Métricas de Éxito**:
  - Métrica Primaria (North Star): [ej. Aumento de conversión del 15% / reducción de tiempo de tarea a <2 minutos].
  - Métrica Secundaria: [ej. Cero regresiones en tiempo de carga p95 < 200ms].

---

## 2. Personas y Dolores

| Persona | Rol / Perfil | Dolor Principal | Necesidad Crítica |
|---|---|---|---|
| **P-01** | [ej. Operador Logístico] | [ej. No ve los estados en tiempo real] | [ej. Vista consolidada con sincronización automática] |
| **P-02** | [ej. Cliente Final] | [ej. Incertidumbre sobre entrega] | [ej. Notificaciones push claras en cada cambio de fase] |

---

## 3. Alcance (Scope)

### ✅ IN-SCOPE
- [Funcionalidad 1 explícita: qué sí se construirá en esta versión].
- [Funcionalidad 2 explícita].
- [Integraciones necesarias].

### 🚫 OUT-OF-SCOPE
- [Qué queda explícitamente fuera de esta versión o para fases futuras].
- [Decisiones de diseño o arquitectura deliberadamente diferidas].

---

## 4. Requisitos Funcionales (Functional Requirements)

- **`FR-01`**: [Título del requerimiento]
  - **Descripción**: [El sistema debe permitir que el usuario...]
  - **Entradas**: [Parámetros, acciones o payloads]
  - **Salidas**: [Resultados visibles, mutaciones de estado, respuestas]
  - **Criterios de Aceptación**:
    - [ ] `AC-01.1`: [Comportamiento observable verificable]
    - [ ] `AC-01.2`: [Caso de borde o error controlado]

- **`FR-02`**: [Título del requerimiento]
  - **Descripción**: [El sistema debe...]
  - **Criterios de Aceptación**:
    - [ ] `AC-02.1`: [Criterio observable]

*(Continuar con `FR-03`..`FR-n` según sea necesario)*

---

## 5. Requisitos No Funcionales (Non-Functional Requirements)

- **`NFR-01` (Rendimiento)**: [ej. Tiempo de respuesta API p95 ≤ 250ms, FCP web ≤ 1.2s].
- **`NFR-02` (Seguridad & Auth)**: [ej. Sanitización de payloads con Zod/schema, tokens en cookies httpOnly, cero secretos en frontend].
- **`NFR-03` (Accesibilidad)**: [ej. Contraste mínimo WCAG 2.2 AA (4.5:1), navegación por teclado completa en componentes interactivos].
- **`NFR-04` (Concurrencia & Resiliencia)**: [ej. Idempotencia en mutaciones críticas vía headers o UUIDv4].

---

## 6. Criterios de Aceptación Globales (DoD)
- [ ] Todos los `FR-01..FR-n` tienen pruebas automatizadas que observan su resultado (`pnpm test`).
- [ ] No existen dependencias circulares ni datos simulados en entregables de producción.
- [ ] El flujo completo ha sido verificado contra la matriz de estados en `APP_FLOW.md`.

---

## 7. Riesgos, Supuestos y Preguntas Abiertas
- **Supuestos**:
  - [Supuesto 1: ej. La base de datos actual ya soporta transacciones ACID concurrentes].
- **Riesgos & Mitigaciones**:
  - [Riesgo 1]: [Descripción del riesgo] → **Mitigación**: [Cómo se previene o maneja].
- **Preguntas Abiertas**:
  - [ ] [Pregunta que requiere decisión del usuario / stakeholders].
