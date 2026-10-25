---
name: onboarding-cro
description: "Diseño y optimización de flujos de onboarding para reducir Time-to-Value (TTV) y acelerar la activación de usuarios. Úsala en onboarding post-registro. No usar para tutoriales de marketing o newsletters."
license: MIT
metadata:
  version: "1.1.0"
  trigger: ["onboarding cro", "time to value", "activacion de usuario", "empty states", "checklist de onboarding"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 🚀 onboarding-cro — Aceleración de Time-to-Value y Activación de Usuarios

Framework de Optimización de Tasa de Conversión (CRO) aplicado a la experiencia de incorporación (*onboarding*) post-registro. Estructurado en **Guardrails de 2 Niveles** para comprimir el tiempo hasta el primer momento de valor (*Aha Moment*), transformar estados vacíos en catalizadores de acción y adaptarse tanto a productos *Product-Led Growth* (PLG) como a entornos Enterprise/Fintech con requisitos de verificación.

---

## 📋 Cuándo Usar

- Al diseñar o reestructurar el flujo de primer uso inmediatamente posterior a la creación de una cuenta.
- Al identificar que los usuarios registrados abandonan la aplicación sin completar su primera acción clave (baja activación).
- Para sustituir pantallas vacías inertes (*empty states*) por catalizadores con plantillas prediseñadas y datos de demostración.
- Para implementar listas de comprobación (*activation checklists*) interactivas con progreso visual claro.
- Para reemplazar carruseles forzados de bienvenida por guías contextuales orientadas a la tarea.
- **NO usar** para campañas promocionales de email marketing o newsletters.
- **NO usar** para formularios iniciales de captura de credenciales y contraseñas (usar `05-frontend/signup-flow-cro`).

---

## 🛡️ Guardrails de 2 Niveles (Invariantes Duros vs Heurísticas Contextuales)

### Nivel 1: Invariantes Duros (Innegociables en Todo Dominio)
1. **Cero Estados Vacíos Callejón sin Salida (*No Dead-End Empty States*)**: Ninguna pantalla inicial sin registros puede limitarse a un mensaje pasivo (*"No hay datos"*). Todo estado vacío debe explicar el propósito de la vista y ofrecer una acción primaria clara (crear el primer recurso, usar una plantilla, cargar datos demo o ver el estado de verificación en curso).
2. **Transparencia de Estado y Accesibilidad**: Todas las listas de activación, barras de progreso y asistentes deben ser navegables por teclado, anunciar su progreso mediante atributos ARIA (`aria-valuenow`, `aria-label`) y preservar el estado si el usuario recarga la página.
3. **Cero Bloqueos Artificiales sin Valor**: Nunca secuestrar la pantalla con carruseles promocionales de múltiples diapositivas que no configuren ni desbloqueen capacidades reales del producto.

### Nivel 2: Heurísticas Contextuales CRO (Base PLG/Self-Serve vs Excepciones Enterprise/Reguladas)
1. **Compresión de Time-to-Value (TTV)**:
   - *Por defecto (PLG / SaaS Self-Serve)*: Guiar al usuario hacia el *Aha Moment* en menos de 3 minutos posponiendo configuraciones avanzadas, facturación o ajustes secundarios.
   - *Excepción Contextual (`[Beyond-Baseline]`)*: En plataformas **Fintech, Salud, Cripto/Custodia, Infraestructura Cloud o B2B Enterprise**, donde la ley o la arquitectura exigen verificación de identidad (**KYC/KYB/AML**), conexión de clúster/VPC, firma de BAA/DPA o aprovisionamiento de seguridad antes de operar con datos reales, utiliza un **Onboarding por Compuertas Explicadas (*Staged Gate Onboarding*)**: muestra una barra de estado de verificación clara y ofrece un **Modo Sandbox / Datos Demo** mientras se aprueba la cuenta real.
2. **Guías Contextuales vs Configuración Inicial Guiada**:
   - *Por defecto*: Preferir tooltips *just-in-time* y checklists no bloqueantes (3 a 5 hitos con progreso dotado).
   - *Excepción Contextual (`[Beyond-Baseline]`)*: Cuando el producto no puede funcionar sin enlazar una fuente de datos externa (ej. conector de repositorio Git, cuenta contable o SDK de telemetría), un asistente paso a paso (*wizard* técnico con validador de conexión en vivo) es superior a soltar al usuario en un dashboard vacío.
3. **Segmentación por Rol u Objetivo**:
   - Si el producto atiende perfiles muy distintos (ej. Desarrollador vs Líder de Negocio), ofrecer una selección rápida de objetivo (con opción de *"Omitir"*) para personalizar plantillas y checklist.

---

## 🧠 Metodología Paso a Paso

### 1. Definición y Compresión del 'Aha Moment'
- **Identificar el Hito Nuclear**: Definir la acción concreta donde el usuario percibe el valor real del producto (ej. visualizar su primer panel con métricas, ejecutar su primera consulta o generar su primer entregable).
- **Ruta Crítica Despejada**: Posponer pasos accesorios (como subir avatar o configurar notificaciones secundarias) hasta después de haber experimentado el valor nuclear.

### 2. Transformación de Estados Vacíos en Catalizadores
- **Acción Primaria Prominente**: Botón claro (*"Crear primer proyecto"*) centrado en la vista.
- **Plantillas de 1 Clic**: Galería de 3 plantillas con estructura realista para eliminar el síndrome del lienzo en blanco.
- **Modo Sandbox / Datos de Muestra**: Opción de explorar la interfaz con datos de ejemplo (especialmente valioso cuando existe una espera por KYC o integración técnica).

### 3. Checklists de Activación con Progreso Dotado
- Iniciar el checklist con el primer paso completado (*"✓ Cuenta creada"*) y permitir saltar directamente a cada acción pendiente con un clic.

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Checklist de Activación Interactivo con Tokens Semánticos (React + Tailwind CSS)
```tsx
import React, { useState } from "react";

interface Step {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  actionText: string;
}

export function ActivationChecklist() {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "account",
      label: "Crear tu cuenta",
      description: "Espacio inicial aprovisionado.",
      completed: true,
      actionText: "Completado",
    },
    {
      id: "project",
      label: "Crear tu primer proyecto",
      description: "Comienza desde una plantilla o lienzo limpio.",
      completed: false,
      actionText: "Crear ahora",
    },
    {
      id: "invite",
      label: "Invitar a tu equipo",
      description: "Colabora en tiempo real con permisos por rol.",
      completed: false,
      actionText: "Invitar",
    },
    {
      id: "share",
      label: "Publicar tu primer entregable",
      description: "Comparte resultados o conecta tu flujo.",
      completed: false,
      actionText: "Configurar",
    },
  ]);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <aside className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-primary p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Guía de Activación
          </h3>
          <p className="text-xs text-text-secondary">
            {completedCount} de {steps.length} hitos completados
          </p>
        </div>
        <span className="text-sm font-bold text-accent-primary">{progressPercent}%</span>
      </div>

      <div
        className="mt-3 h-2 w-full rounded-full bg-surface-elevated overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border-subtle bg-surface-elevated p-3.5 transition"
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-xs transition ${
                  step.completed
                    ? "border-accent-primary bg-accent-primary text-surface-primary"
                    : "border-border-subtle bg-surface-primary text-text-primary"
                }`}
                aria-label={step.completed ? `Marcar ${step.label} como pendiente` : `Completar ${step.label}`}
              >
                {step.completed && "✓"}
              </button>
              <div>
                <h4
                  className={`text-sm font-medium ${
                    step.completed ? "text-text-secondary line-through" : "text-text-primary"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-text-secondary">{step.description}</p>
              </div>
            </div>

            {!step.completed && (
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="shrink-0 rounded-lg bg-surface-primary border border-border-subtle px-2.5 py-1 text-xs font-semibold text-accent-primary hover:border-accent-primary"
              >
                {step.actionText}
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
```

### Ejemplo 2: Empty State Activo con Plantillas y Modo Sandbox Demo
```tsx
import React from "react";

export function ActiveEmptyState() {
  const templates = [
    { title: "Tablero Operativo", desc: "Gestión de tareas visual por etapas." },
    { title: "Plan de Lanzamiento", desc: "Cronograma de entregas e hitos críticos." },
    { title: "Hoja de Ruta Trimestral", desc: "Priorización de objetivos y métricas." },
  ];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-primary p-12 text-center">
      <h2 className="text-xl font-bold text-text-primary">
        Comienza creando tu primer espacio de trabajo
      </h2>
      <p className="mt-1 text-sm text-text-secondary max-w-md">
        Elige una plantilla lista para usar o explora el entorno con datos de prueba.
      </p>

      <button
        type="button"
        className="mt-6 rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-surface-primary shadow-sm hover:bg-accent-hover transition"
      >
        + Crear proyecto en blanco
      </button>

      <div className="mt-10 w-full max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
          O arranca con una plantilla preconfigurada
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {templates.map((tpl) => (
            <button
              key={tpl.title}
              type="button"
              className="flex flex-col items-start rounded-xl border border-border-subtle bg-surface-elevated p-4 text-left transition hover:border-accent-primary hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-text-primary">{tpl.title}</h3>
              <p className="mt-1 text-xs text-text-secondary">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-border-subtle pt-6">
        <button
          type="button"
          className="text-xs font-medium text-text-secondary underline hover:text-text-primary"
        >
          Explorar primero en modo Sandbox con datos de demostración
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

El objetivo de *Aha Moment* en menos de 3 minutos y cero configuración previa representa el estándar óptimo para productos SaaS autogestionados (PLG). Cuando la arquitectura del dominio exige pasos obligatorios previos —como **verificación regulatoria KYC/KYB en Fintech, configuración de claves de cifrado/SSO en seguridad Enterprise o instalación de un agente CLI/SDK en herramientas DevOps**—, diseña un asistente multi-etapa con validación en vivo y entorno *Sandbox* paralelo, documentando la decisión con `[Beyond-Baseline: <requisito KYC/compliance o aprovisionamiento técnico>]`.

---

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Empty State Desierto** (*"No hay elementos aquí todavía"*) | Deja al usuario desorientado sin saber qué acción tomar. | CTA primario claro, plantillas de 1 clic y opción de datos demo / Sandbox. |
| **Carrusel Promocional Forzado de 5 Pantallas** | Los usuarios cierran o saltan las diapositivas sin retener información. | Permitir acceso directo o usar guías contextuales orientadas a la acción. |
| **Burocracia no justificada antes del valor** | Pedir datos accesorios no requeridos por compliance antes de mostrar el producto. | Posponer campos opcionales y ofrecer modo Sandbox si hay validación KYC asíncrona. |
| **Checklist sin progreso ni enlace directo a la tarea** | Genera carga cognitiva al obligar a buscar dónde se realiza cada paso. | Incluir barra de progreso viva y botones que lleven directo a la acción. |
