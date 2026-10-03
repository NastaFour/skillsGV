# Gestos Táctiles 1:1 e Interrumpibilidad (Interruptible Gestures)

Patrones de interacción táctil y conservación de velocidad física en componentes arrastrables.

---

## 1. El Concepto de Interrumpibilidad

En la mayoría de aplicaciones web mediocres, cuando una animación comienza, el usuario queda bloqueado hasta que la animación termina, o bien, si intenta cancelar la acción:
- La vista salta bruscamente al inicio (teletransportación de frames).
- La velocidad del dedo se ignora por completo y se ejecuta una animación fija de regreso.

### Principio Emil Kowalski
> Un gesto de interfaz es una conversación física continua entre el dedo del usuario y la pantalla. Si el usuario suelta la pantalla o cambia de sentido a mitad de camino, la interfaz debe heredar la velocidad actual (`velocity`) y continuar el movimiento sin discontinuidades.

---

## 2. Anatomía de un Drawer con Arrastre Físico

Al construir un cajón deslizable inferior (bottom sheet / drawer):

1. **Vínculo Directo 1:1**:
   - Mientras el dedo se desplaza, la posición del elemento sigue la coordenada del puntero en tiempo real sin desfase.
2. **Resistencia de Borde (Rubber-banding)**:
   - Si el usuario arrastra más allá del límite superior natural, la distancia recorrida debe aplicar una curva logarítmica de amortiguación (resistencia elástica), evitando que la vista se desconecte de la pantalla.
3. **Decisión por Velocidad vs Desplazamiento**:
   - No decidas si cerrar el cajón basándote únicamente en si superó el 50% de la altura de la pantalla.
   - **La velocidad prima sobre la distancia**: Si el usuario realiza un deslizamiento rápido (*flick*) hacia abajo con alta velocidad negativa, el cajón debe cerrarse incluso si solo se desplazó un 10% de su recorrido total.
4. **Conservación de Inercia**:
   - Al soltar (`onDragEnd` o `pointerup`), inyecta la velocidad instantánea del puntero en el resorte (`velocity: dragVelocity.y`).

---

## 3. Ejemplo Conceptual en Framer Motion

```tsx
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

export function DismissibleSheet({ onClose }: { onClose: () => void }) {
  const y = useMotionValue(0);
  
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.1, bottom: 0.8 }}
      style={{ y }}
      onDragEnd={(_event, info) => {
        const threshold = 150;
        const velocityThreshold = 500;
        
        // Cierre por desplazamiento o por velocidad del gesto (flick)
        if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
          onClose();
        }
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
    >
      <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700 mb-6" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Detalle de Operación</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Arrastra hacia abajo con rapidez para descartar este panel.
      </p>
    </motion.div>
  );
}
```
