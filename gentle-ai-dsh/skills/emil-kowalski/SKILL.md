---
name: emil-kowalski
description: "Filosofía de Emil Kowalski (animations.dev): física de resortes, gestos interrumpibles, FLIP y microinteracciones táctiles. Úsala al crear animaciones UI fluidas. No usar para 3D o Canvas."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["emil kowalski", "animations dev", "fisica de resortes", "spring physics", "gestos interrumpibles", "layout animations", "tactile feedback"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 🌀 emil-kowalski — Filosofía de Animación e Interacción Fluida

Principios de interacción y diseño de movimiento basados en las enseñanzas de Emil Kowalski (*animations.dev*). Transforma interfaces estáticas o acartonadas en experiencias fluidas regidas por la física de resortes, gestos táctiles 1:1 interrumpibles con conservación de inercia y transiciones de diseño coordinadas (FLIP).

---

## 📋 Cuándo Usar

- Al implementar microinteracciones, transiciones de estados y animaciones de componentes web interactivos.
- Para reemplazar duraciones de tiempo fijas (`duration: 300ms ease-out`) por resortes físicos dinámicos con `stiffness`, `damping` y `mass`.
- Al desarrollar componentes táctiles gestuales (cajones desplegables, hojas inferiores/drawers, modales expansibles, tarjetas arrastrables).
- Para coordinar cambios de tamaño o reordenamiento en cuadrículas sin saltos bruscos en el DOM mediante animaciones de layout.
- **NO usar** para escenas tridimensionales o simulaciones de shaders WebGL/Canvas (usar `three-js-web`).
- **NO usar** para secuencias lineales de video o narrativas complejas basadas en scroll estricto (usar `motion-gsap`).

---

## 🚦 Reglas Duras

1. **Física de Resortes sobre Duraciones Fijas**: Prohibido emplear curvas de tiempo mágicas (`ease-in-out`, `cubic-bezier`) o duraciones fijas fijadas por cronómetro en elementos interactivos manipulados por el usuario. Todo movimiento interactivo debe definirse con resortes físicos (`stiffness`, `damping`, `mass`).
2. **Gestos Táctiles 1:1 e Interrumpibles**: El desplazamiento visual debe seguir fielmente la posición del puntero. Si el usuario suelta o interrumpe la interacción a mitad de camino, la animación debe preservar la velocidad instantánea acumulada (`preserve velocity`), sin saltos bruscos ni reinicios de animación.
3. **Coordinación Exit-Before-Enter y Flujo Estable**: Cuando un elemento sale y otro entra en el mismo contenedor, prevenir colisiones de altura utilizando animaciones de presencia coordinadas (`mode="popLayout"` o técnica FLIP) para que el layout no sufra tirones.
4. **Microinteracciones Sutiles de Feedback Háptico**: Las reducciones de escala al pulsar un botón (`whileTap` o `:active`) deben ser discretas (`scale: 0.97` a `0.98`), nunca factores exagerados (como `scale: 0.8`) que rompan la legibilidad del texto o la alineación visual.
5. **Cumplimiento Estricto de `prefers-reduced-motion`**: Si el sistema operativo del usuario tiene activada la preferencia de reducción de movimiento, eliminar desplazamientos espaciales (`x`, `y`, `scale`) y limitar la interacción a fundidos de opacidad casi instantáneos o cambios de estado inmediatos.

---

## ⚙️ Principios Fundamentales de animations.dev

### 1. Dinámica de los Tres Parámetros del Resorte
- **Stiffness (Rigidez)**: Fuerza restauradora del resorte hacia su posición objetivo. A mayor rigidez, mayor aceleración inicial y respuesta más ágil.
- **Damping (Amortiguamiento)**: Fricción que disipa la energía cinética. Un amortiguamiento equilibrado previene rebotes molestos sin ralentizar la respuesta.
- **Mass (Masa)**: Inercia del componente. A mayor masa, mayor lentitud en los cambios de aceleración.

### 2. Presets Calibrados de Emil Kowalski
- **Interacciones Rápidas (Toggles, botones, pestañas activas)**:
  `{ stiffness: 450, damping: 35, mass: 0.8 }`
- **Superficies Medias (Diálogos modales, popovers, menús flotantes)**:
  `{ stiffness: 300, damping: 30, mass: 1.0 }`
- **Componentes Gestuales Grandes (Drawers, sheets inferiores)**:
  `{ stiffness: 220, damping: 28, mass: 1.0 }`

### 3. La Técnica FLIP en Animaciones de Layout
Al alterar listas o expandir tarjetas, evitar animar directamente propiedades de reflujo (`height`, `width`, `top`). Utilizar la técnica FLIP (`First, Last, Invert, Play`) mediante la propiedad `layout` o `layoutId` para que el navegador ejecute transformaciones aceleradas por hardware en la GPU.

---

## 💻 Ejemplos Prácticos de Implementación

### Ejemplo 1: Selector de Pestañas con Indicador Deslizante FLIP (`layoutId`)
```tsx
import { motion } from "framer-motion";
import { useState } from "react";

const options = ["Actividad", "Notificaciones", "Seguridad"];

export function TabSelector() {
  const [selected, setSelected] = useState(options[0]);

  return (
    <nav className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`relative rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isSelected ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {isSelected && (
              <motion.span
                layoutId="active-indicator"
                className="absolute inset-0 rounded-lg bg-white shadow-xs dark:bg-slate-700"
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 32,
                  mass: 0.8,
                }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

### Ejemplo 2: Botón Interactivo con Feedback Físico Sutil
```tsx
import { motion } from "framer-motion";

export function TactileButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {children}
    </motion.button>
  );
}
```

---

## 📚 Referencias

- [Guía y Calibración de Física de Resortes](references/spring-physics.md)
- [Implementación de Gestos Táctiles Interrumpibles](references/interruptible-gestures.md)
- [Animaciones de Layout y Técnica FLIP](references/layout-flip.md)
