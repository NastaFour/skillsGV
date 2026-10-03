---
name: onboarding-cro
description: "Diseño y optimización de flujos de onboarding para reducir Time-to-Value (TTV) y acelerar la activación de usuarios. Úsala en onboarding. No usar para tutoriales de marketing o newsletters."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["onboarding cro", "time to value", "activacion de usuario", "empty states", "checklist de onboarding"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 🚀 onboarding-cro — Aceleración de Time-to-Value y Activación de Usuarios

Framework de Optimización de Tasa de Conversión (CRO) aplicado a la experiencia de incorporación (*onboarding*) post-registro. Centrado en comprimir radicalmente el tiempo necesario para experimentar el primer momento de valor (*Aha Moment*), transformar pantallas vacías en aceleradores de productividad y guiar al usuario mediante checklists interactivos contextuales.

---

## 📋 Cuándo Usar

- Al diseñar o reestructurar el flujo de primer uso inmediatamente posterior a la creación de una cuenta.
- Al identificar que los usuarios registrados abandonan la aplicación sin completar su primera acción clave (baja activación).
- Para sustituir pantallas vacías inertes (*empty states*) por catalizadores con plantillas prediseñadas y datos de prueba.
- Para implementar listas de comprobación (*activation checklists*) interactivas con progreso visual dinámico.
- Para reemplazar modales o carruseles intrusivos de bienvenida por guías orientadas a la tarea en el momento exacto de necesidad.
- Para segmentar a los usuarios en la primera pantalla según su rol u objetivo prioritario.
- **NO usar** para tutoriales promocionales de marketing, campañas de email de goteo o newsletters.
- **NO usar** para formularios de captura de credenciales y contraseñas (usar `05-frontend/signup-flow-cro`).

---

## 🚦 Reglas Duras

1. **Aha Moment en Menos de 3 Minutos (TTV Estricto)**: El trayecto desde que el usuario inicia sesión por primera vez hasta que experimenta el beneficio esencial del producto debe completarse en menos de 3 minutos. Queda prohibido obligar a configurar ajustes avanzados o preferencias no esenciales antes de este hito.
2. **Prohibición de Empty States Pasivos**: Queda terminantemente prohibido mostrar pantallas desérticas con mensajes negativos o estériles (*"No hay registros"* o *"No has creado ningún elemento"*). Todo estado inicial sin datos debe ofrecer un botón de acción principal, un selector de plantillas preconfiguradas o la opción de precargar datos de ejemplo con 1 clic.
3. **Checklist Interactivo con Refuerzo Visual**: La lista de tareas de activación debe contener entre 3 y 5 hitos concretos, exhibir una barra de progreso porcentual visible y ofrecer tachado dinámico inmediato con feedback afirmativo al completar cada acción.
4. **Guías Contextuales Just-in-Time, Jamás Carruseles Forzados**: Prohibido bloquear la interfaz con diálogos modales de 4 o 5 diapositivas antes de permitirle interactuar. Las indicaciones deben desplegarse como tooltips sutiles anclados al componente relevante en el momento en que el usuario intenta realizar la tarea.
5. **Segmentación de Roles en Pantalla Inicial**: La primera pantalla del onboarding debe permitir al usuario seleccionar su perfil u objetivo (ej. *"Líder de Proyecto"*, *"Desarrollador"*, *"Diseñador"*), adaptando dinámicamente las plantillas y el checklist al flujo de mayor relevancia para su rol.

---

## 🧠 Metodología Paso a Paso

### 1. Definición y Compresión del 'Aha Moment'
- **Identificar el Hito Nuclear**: Definir la acción concreta donde el usuario percibe el valor real del producto (ej. ver su primer gráfico renderizado, enviar su primera invitación de equipo, o importar su primer archivo).
- **Ruta Crítica Despejada**: Eliminar cualquier paso intermedio no indispensable (como subir foto de perfil o configurar integraciones secundarias) hasta después de haber alcanzado el *Aha Moment*.

### 2. Segmentación de Objetivos en la Primera Pantalla
- **Selector de Enfoque (Role / Goal Branching)**: Ofrecer 3 o 4 tarjetas visuales seleccionables con un clic:
  - *"Quiero automatizar mis tareas repetitivas"*
  - *"Quiero colaborar con mi equipo en tiempo real"*
  - *"Quiero visualizar métricas y analíticas"*
- **Preconfiguración Automática**: Con base en la selección, preseleccionar la plantilla adecuada y configurar el espacio de trabajo para ese objetivo específico.

### 3. Transformación de Estados Vacíos en Catalizadores
- **Botón de Creación Primaria**: Un botón con estilo visual prominente (*"Crear mi primer proyecto"*) centrado en el área de trabajo.
- **Plantillas de 1 Clic**: Galería horizontal de 3 plantillas prefabricadas con datos realistas para que el usuario no enfrente un lienzo en blanco intimidante.
- **Botón de Datos de Demostración**: Un enlace accesible que permita cargar un conjunto de datos ficticios para explorar la plataforma de inmediato sin requerir configuración manual.

### 4. Checklists de Activación con Gratificación Dinámica
- **Efecto de Progreso Dotado (Endowed Progress Effect)**: Comenzar el checklist con el primer paso ya completado automáticamente (ej. *"✓ Crear cuenta"*), para que la barra de progreso inicie en 25% o 33%, reduciendo la fricción percibida.
- **Acciones Directas en el Checklist**: Cada ítem debe incluir un botón o enlace que transporte al usuario directamente a la pantalla o modal donde se ejecuta dicha acción.
- **Cierre y Celebración**: Al completar todos los pasos, otorgar un distintivo visual o desbloquear una ventaja clara en la plataforma.

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Checklist de Activación Interactivo con Barra de Progreso Dinámica (React + Tailwind CSS)
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
      description: "Acceso completado con éxito.",
      completed: true,
      actionText: "Completado",
    },
    {
      id: "project",
      label: "Crear tu primer proyecto",
      description: "Comienza desde una plantilla o lienzo en blanco.",
      completed: false,
      actionText: "Crear ahora",
    },
    {
      id: "invite",
      label: "Invitar a un compañero de equipo",
      description: "Colabora en tiempo real con tu equipo.",
      completed: false,
      actionText: "Invitar",
    },
    {
      id: "share",
      label: "Compartir tu primer enlace",
      description: "Obtén comentarios o retroalimentación inmediata.",
      completed: false,
      actionText: "Generar enlace",
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
    <aside className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Cabecera con progreso porcentual */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Guía de Inicio Rápido
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completedCount} de {steps.length} tareas completadas
          </p>
        </div>
        <span className="text-sm font-bold text-emerald-500">{progressPercent}%</span>
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Lista de pasos interactiva */}
      <div className="mt-6 space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
              step.completed
                ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-xs transition ${
                  step.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                }`}
                aria-label={step.completed ? `Marcar ${step.label} como pendiente` : `Completar ${step.label}`}
              >
                {step.completed && "✓"}
              </button>
              <div>
                <h4
                  className={`text-sm font-medium ${
                    step.completed
                      ? "text-slate-400 line-through dark:text-slate-500"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
              </div>
            </div>

            {!step.completed && (
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="shrink-0 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
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

### Ejemplo 2: Empty State Activo con Plantillas y Carga de Datos Demo
```tsx
import React from "react";

export function ActiveEmptyState() {
  const templates = [
    { title: "Tablero Kanban", desc: "Gestión de tareas visual por columnas.", icon: "📋" },
    { title: "Plan de Lanzamiento", desc: "Cronograma de entregas e hitos.", icon: "🚀" },
    { title: "Hoja de Ruta Producto", desc: "Priorización trimestral de funciones.", icon: "🗺️" },
  ];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
        ✨
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
        Comienza creando tu primer espacio de trabajo
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Elige una plantilla lista para usar o empieza con un lienzo en blanco para organizar tus proyectos en minutos.
      </p>

      {/* Botón de acción primordial */}
      <button
        type="button"
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 transition"
      >
        + Crear proyecto en blanco
      </button>

      {/* Galería de plantillas rápidas */}
      <div className="mt-10 w-full max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          O arranca rápidamente con una plantilla probada
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {templates.map((tpl) => (
            <button
              key={tpl.title}
              type="button"
              className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500"
            >
              <span className="text-2xl">{tpl.icon}</span>
              <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {tpl.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Opción de explorar con datos de muestra */}
      <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
        <button
          type="button"
          className="text-xs font-medium text-slate-500 underline hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ¿Prefieres ver cómo luce con datos reales? Cargar proyecto demo de ejemplo
        </button>
      </div>
    </div>
  );
}
```

---

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Empty State Desierto** (*"No hay elementos aquí todavía"*) | Deja al usuario desorientado sin saber qué botón presionar para continuar. | Botón central prominente de acción y catálogo de plantillas iniciales de 1 clic. |
| **Carrusel Obligatorio de 5 Pantallas** | Los usuarios saltan las pantallas sin leer y experimentan frustración inmediata. | Permitir interactuar de inmediato; mostrar tooltips orientados a la tarea solo cuando sea pertinente. |
| **Configuración burocrática antes del valor** | Forzar a completar perfil, foto y métodos de pago antes de usar la herramienta. | Posponer ajustes accesorios hasta que el usuario haya experimentado el valor (*Aha Moment*). |
| **Checklist sin barra de progreso o sin inicio dotado** | Parece una lista de tareas abrumadora y provoca desmotivación. | Iniciar con el primer hito ya completado (efecto de progreso dotado) y barra porcentual viva. |
| **Tratar a todos los usuarios con el mismo flujo** | Muestra tutoriales irrelevantes para quien solo necesita una función puntual. | Pregunta rápida de segmentación en la pantalla inicial para bifurcar el recorrido. |
