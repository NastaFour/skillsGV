---
name: emil-kowalski
description: "Filosofía de Emil Kowalski (animations.dev): física de resortes, gestos interrumpibles, FLIP, curvas cubic-bezier intencionales por arquetipo y microinteracciones táctiles. Úsala al crear animaciones UI fluidas. No usar para 3D o Canvas."
license: MIT
metadata:
  version: "1.1.0"
  trigger: ["emil kowalski", "animations dev", "fisica de resortes", "spring physics", "gestos interrumpibles", "layout animations", "tactile feedback"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 🌀 emil-kowalski — Filosofía de Animación e Interacción Fluida

Principios de interacción y diseño de movimiento basados en las enseñanzas de Emil Kowalski (*animations.dev*), armonizados con los Arquetipos de Diseño de `design-driven`. Transforma interfaces estáticas en experiencias con intención física mediante resortes calibrados, curvas `cubic-bezier` de alta precisión, gestos táctiles 1:1 interrumpibles y transiciones de layout coordinadas (FLIP).

---

## 📋 Cuándo Usar

- Al implementar microinteracciones, transiciones de estados y animaciones de componentes web interactivos.
- Para elegir con criterio entre **física de resortes** (`stiffness`, `damping`, `mass`) en interfaces táctiles/cinéticas y **curvas `cubic-bezier` deterministas o transiciones instantáneas** en arquetipos sobrios o técnicos.
- Al desarrollar componentes gestuales (drawers, hojas inferiores, modales expansibles, tarjetas arrastrables) que deben conservar la velocidad del puntero.
- Para coordinar cambios de dimensiones o reordenamiento en cuadrículas sin saltos bruscos en el DOM mediante animaciones FLIP.
- **NO usar** para escenas tridimensionales o simulaciones de shaders WebGL/Canvas (usar `three-js-web`).
- **NO usar** para secuencias lineales de video o narrativas complejas basadas en scroll estricto (usar `motion-gsap`).

---

## 🧭 Matriz de Movimiento por Arquetipo (`design-driven` Alignment)

El movimiento nunca se diseña en el vacío; debe responder al chasis arquetípico declarado en `DESIGN_SYSTEM.md`:

| Arquetipo (`design-driven`) | Paradigma de Movimiento Recomendado | Implementación Técnica |
| :--- | :--- | :--- |
| **Kinetic Typography & Neo-Brutalist Swiss Grids** / **Precision Dark UI** | **Física de Resortes (Spring Physics) & Gestos 1:1** | Resortes sin rebote excesivo (`stiffness: 400–500`, `damping: 30–35`), conservación de inercia y FLIP (`layoutId`). |
| **The Atmospheric Minimalist & High-Craft UI** | **Curvas Deterministas Suaves o Resortes Críticamente Amortiguados** | `cubic-bezier(0.22, 1, 0.36, 1)` de `160ms–240ms` para apariciones sutiles, o resortes sin oscilación (`bounce: 0`). |
| **The Technical Monograph & Spec-Sheet** / **System Native** | **Transiciones Instantáneas o Micro-Easings Ultracortos** | Cambios de estado directos (`0ms–120ms`, `cubic-bezier(0.16, 1, 0.3, 1)`) que priorizan velocidad de lectura e inmediatez operativa. |

---

## 🚦 Reglas e Invariantes de Ingeniería

1. **Invariante Duro — Cumplimiento Estricto de `prefers-reduced-motion`**: Si el sistema operativo del usuario solicita reducción de movimiento, eliminar desplazamientos espaciales (`x`, `y`, `scale`) y sustituirlos por cambios de opacidad casi instantáneos (`<= 100ms`) o transiciones inmediatas.
2. **Gestos Táctiles 1:1 e Interrumpibles**: Cuando el usuario arrastra o manipula directamente un elemento (drawer, swipe, slider), usar física de resortes que preserve la velocidad instantánea acumulada (`preserve velocity`) al soltar o interrumpir a mitad de camino.
3. **Proporcionalidad entre Resortes y `cubic-bezier`**:
   - En interacciones impulsadas por gestos o cambios espaciales de layout (FLIP), preferir resortes físicos (`type: "spring"`).
   - En transiciones de color, opacidad, hover discreto o arquetipos editoriales (*Monograph*, *Atmospheric Minimalist*), las curvas `cubic-bezier(0.22, 1, 0.36, 1)` con duraciones cortas (`150ms–220ms`) son limpias, predecibles y libres de costo de JS. Evitar únicamente curvas por defecto genéricas y lentas (`ease-in-out 500ms`).
4. **Coordinación Exit-Before-Enter y Flujo Estable**: Cuando un elemento sale y otro entra en el mismo contenedor, prevenir colisiones de altura utilizando animaciones de presencia coordinadas (`mode="popLayout"` o técnica FLIP).
5. **Microinteracciones Sutiles de Feedback Háptico**: Las reducciones de escala al pulsar un botón (`whileTap` o `:active`) deben ser discretas (`scale: 0.97` a `0.98`), nunca factores exagerados (`scale: 0.8`) que rompan la alineación visual.

---

## ⚙️ Principios Fundamentales de animations.dev

### 1. Dinámica de los Tres Parámetros del Resorte
- **Stiffness (Rigidez)**: Fuerza restauradora hacia la posición objetivo. Mayor rigidez = respuesta inicial más ágil.
- **Damping (Amortiguamiento)**: Fricción que disipa la energía cinética y evita oscilaciones mareantes.
- **Mass (Masa)**: Inercia percibida del componente.

### 2. Presets Calibrados
- **Interacciones Rápidas (Toggles, pestañas activas)**: `{ stiffness: 450, damping: 35, mass: 0.8 }`
- **Superficies Medias (Diálogos modales, popovers, menús)**: `{ stiffness: 300, damping: 30, mass: 1.0 }`
- **Componentes Gestuales Grandes (Drawers, sheets inferiores)**: `{ stiffness: 220, damping: 28, mass: 1.0 }`
- **Easing Editorial / Minimalista (CSS)**: `transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease-out`

### 3. La Técnica FLIP en Animaciones de Layout
Al alterar listas o expandir tarjetas, evitar animar directamente propiedades que disparan reflow (`height`, `width`, `top`). Utilizar la técnica FLIP (`First, Last, Invert, Play`) mediante `layout` o `layoutId` sobre `transform` y `opacity` en la GPU.

---

## 💻 Ejemplos Prácticos de Implementación

### Ejemplo 1: Selector de Pestañas con Indicador Deslizante FLIP (`layoutId`) y Reducción de Movimiento
```tsx
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const options = ["Actividad", "Notificaciones", "Seguridad"];

export function TabSelector() {
  const [selected, setSelected] = useState(options[0]);
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav className="inline-flex gap-1 rounded-xl bg-surface-elevated p-1 border border-border-subtle">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={`relative rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isSelected ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {isSelected && (
              <motion.span
                layoutId="active-indicator"
                className="absolute inset-0 rounded-lg bg-surface-primary shadow-xs border border-border-subtle"
                transition={
                  shouldReduceMotion
                    ? { duration: 0.01 }
                    : { type: "spring", stiffness: 450, damping: 32, mass: 0.8 }
                }
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
import { motion, useReducedMotion } from "framer-motion";

export function TactileButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="inline-flex items-center justify-center rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-surface-primary shadow-sm hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
    </motion.button>
  );
}
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Los presets de resortes y curvas `cubic-bezier(0.22, 1, 0.36, 1)` constituyen el piso de calidad para evitar animaciones robóticas. Salvo en el invariante innegociable de accesibilidad (`prefers-reduced-motion`) y rendimiento en compositor (`transform`/`opacity`), el equipo puede emplear física personalizada, View Transitions API nativas o coreografías asimétricas cuando el arquetipo visual de `DESIGN_SYSTEM.md` lo demande, documentándolo con `[Beyond-Baseline: <razón técnica/creativa>]`.

---

## 📚 Referencias

- [Guía y Calibración de Física de Resortes](references/spring-physics.md)
- [Implementación de Gestos Táctiles Interrumpibles](references/interruptible-gestures.md)
- [Animaciones de Layout y Técnica FLIP](references/layout-flip.md)
