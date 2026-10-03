# Animaciones de Layout y Técnica FLIP (Layout Animations)

Guía para animar cambios de estructura y dimensiones sin saltos bruscos en el DOM.

---

## 1. La Técnica FLIP (First, Last, Invert, Play)

Animar propiedades de diseño como `width`, `height`, `top` o `padding` provoca reflujos costosos (*browser reflow / layout thrashing*), causando caídas de cuadros por segundo.

La técnica FLIP resuelve esto calculando la diferencia espacial antes y después del cambio estructural y animando únicamente transformaciones GPU (`transform: translate, scale`):

1. **First (Primero)**: Medir la posición y tamaño iniciales del elemento (`getBoundingClientRect()`).
2. **Last (Último)**: Aplicar el cambio de estado en el DOM y medir la posición final.
3. **Invert (Invertir)**: Aplicar una transformación inversa (`translateX`, `translateY`, `scale`) para que el elemento aparezca visualmente en su estado inicial, aunque el DOM ya esté en su estado final.
4. **Play (Reproducir)**: Animar la transformación inversa hacia `transform: none` con un resorte físico.

---

## 2. El Poder de `layoutId` en Componentes Compartidos

En Motion / Framer Motion, la propiedad `layoutId` permite que dos componentes distintos en el árbol de React compartan una animación de transformación continua como si fueran el mismo objeto físico.

### Caso Clásico: Indicador de Pestaña Activa (Pill Slider)
- Sin `layoutId`: Cada botón renderiza su propio fondo azul al seleccionarse, apareciendo de golpe.
- Con `layoutId`: Existe una única "pastilla" animada que viaja magnéticamente de una pestaña a otra usando un resorte suave.

```tsx
import { motion } from "framer-motion";
import { useState } from "react";

const tabs = ["Visión General", "Métricas", "Configuración"];

export function TabBar() {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-slate-700"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 3. Prevención de Deformación en Contenidos Internos

Al escalar un contenedor mediante `layout`, los elementos hijos pueden sufrir distorsiones no deseadas (por ejemplo, textos estirados o bordes ovalados).

### Buenas Prácticas
1. **Evitar animar fuentes con scale**: Añade `layout="position"` si el componente solo cambia de lugar en la cuadrícula y no debe deformar su texto interno.
2. **Bordes redondeados uniformes**: Si el contenedor animado tiene `rounded-2xl`, asegúrate de que Framer Motion anime también el `borderRadius` declarándolo en la variante o asegurando que el contenedor padre maneje `overflow-hidden`.
