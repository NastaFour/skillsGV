# Elevación y Sombras Multicapa (Elevation & Layered Shadows)

Principios para generar profundidad realista y evitar bordes negros toscos en interfaces web.

---

## 1. El Problema de los Bordes Duros

Un error habitual en interfaces diseñadas por desarrolladores es encerrar cada sección dentro de un borde oscuro visible:
- `border border-gray-400`
- `border-2 border-slate-500`

Cuando cada tarjeta, menú y contenedor tiene un borde de alto contraste, la pantalla se satura de líneas negras que compiten con el contenido real.

### Regla Fundamental
> En el mundo físico, los objetos rara vez tienen un contorno negro dibujado alrededor; tienen profundidad, luz ambiental y sombra.

---

## 2. Anatomía de una Sombra Multicapa Suave

Una sombra natural no se compone de un único valor borroso de `box-shadow`. Se crea combinando **dos o tres capas de sombra**:

1. **Luz Directa (Key Shadow)**:
   - Desplazamiento vertical perceptible (ej. `y = 4px` a `10px`).
   - Mayor desenfoque (blur).
   - Simula la luz proveniente desde arriba.
2. **Luz Ambiental (Ambient Shadow)**:
   - Desplazamiento mínimo (ej. `y = 1px` a `2px`).
   - Desenfoque cerrado y opacidad muy suave.
   - Evita que el objeto flote sin anclaje visual y define el borde sin necesidad de una línea negra.

### Ejemplo de Box-Shadow Compuesto
```css
/* Sombra de tarjeta refinada y natural */
box-shadow:
  0 1px 2px 0 rgba(15, 23, 42, 0.05),     /* Capa ambiental sutil */
  0 8px 16px -4px rgba(15, 23, 42, 0.08); /* Capa direccional difusa */
```

### Equivalentes en Tailwind CSS
- **Elevación mínima (Tarjetas estáticas)**: `shadow-xs` o `shadow-sm` junto con `border border-slate-250/50` o `border border-slate-100`.
- **Elevación interactiva (Tarjetas hover)**: `shadow-md` o `shadow-lg` con transición suave `transition-shadow duration-200`.
- **Elevación flotante (Modales, Popovers)**: `shadow-xl` o `shadow-2xl`.

---

## 3. Elevación en Modo Oscuro (Dark Mode)

En interfaces oscuras, las sombras no son visibles porque el fondo ya es negro o gris carbón profundo.

### Estrategia de Luminosidad por Capas
En dark mode, la elevación se comunica a través de la **luminosidad superficial**:
- **Fondo base de pantalla**: `#09090b` (Zinc 950) o `#0f172a` (Slate 900).
- **Contenedores de nivel 1 (Tarjetas)**: `#18181b` (Zinc 900) o `#1e293b` (Slate 800) con borde fino translúcido `border border-white/5`.
- **Contenedores de nivel 2 (Modales, dropdowns)**: `#27272a` (Zinc 800) con borde `border border-white/10`.
