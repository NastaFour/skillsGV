# Escala de Espaciado y Jerarquía Tipográfica

Guía de referencia para dimensionamiento predecible, principio de proximidad y consistencia visual en Tailwind CSS.

---

## 1. La Escala de Espaciado Estricta

Nunca adivines valores numéricos arbitrarios (como 13px o 27px) para padding o margin. Utiliza una escala cerrada de múltiplos basados en la rejilla de 4px / 8px:

| Nivel | Valor Real | Clases Tailwind | Uso Típico |
|---|---|---|---|
| 1 | 4px | `p-1`, `m-1`, `gap-1` | Separación entre icono y texto adyacente |
| 2 | 8px | `p-2`, `m-2`, `gap-2` | Espaciado interno de badges, inputs pequeños |
| 3 | 12px | `p-3`, `m-3`, `gap-3` | Padding interno de inputs estándar, botones medianos |
| 4 | 16px | `p-4`, `m-4`, `gap-4` | Padding de tarjetas compactas, gap entre ítems |
| 6 | 24px | `p-6`, `m-6`, `gap-6` | Padding estándar de tarjetas de dashboard |
| 8 | 32px | `p-8`, `m-8`, `gap-8` | Separación entre bloques de contenido |
| 12 | 48px | `p-12`, `m-12`, `gap-12` | Separación entre secciones principales |
| 16 | 64px | `p-16`, `m-16`, `gap-16` | Margen superior/inferior de secciones en landing pages |

---

## 2. El Principio de Proximidad Gestalt

Los elementos relacionados deben estar visiblemente más cerca entre sí que de elementos ajenos.

### Error Común en Formularios
Un error frecuente es colocar el mismo margen arriba y abajo de una etiqueta de input:
- `mb-4` arriba del input y `mb-4` debajo del input.
Esto hace que la etiqueta parezca flotar en el medio, confusa entre el campo anterior y el siguiente.

### Regla de Proximidad Correcta
- La etiqueta (`<label>`) debe estar muy cerca de su input correspondiente: `mb-1.5` o `gap-1.5`.
- El campo completo debe estar significativamente más lejos del siguiente campo: `mb-6` o `gap-6`.

---

## 3. Jerarquía Tipográfica sin Tamaños Gigantes

No necesitas una fuente de 48px para hacer destacar un encabezado secundario en un dashboard. El contraste efectivo se logra balanceando tres variables:

1. **Tamaño**: `text-sm`, `text-base`, `text-lg`, `text-xl`.
2. **Peso**: `font-normal` (400) vs `font-medium` (500) vs `font-semibold` (600).
3. **Color/Luminosidad**: `text-slate-900` vs `text-slate-600` vs `text-slate-400`.

### Combinaciones de Alto Impacto
- **Título de tarjeta**: `text-base font-semibold text-slate-900`
- **Subtítulo descriptivo**: `text-sm font-normal text-slate-500`
- **Etiqueta en mayúsculas / Supertítulo**: `text-xs font-semibold tracking-wider uppercase text-slate-400`
- **Métrica principal**: `text-3xl font-bold tracking-tight text-slate-900 tabular-nums`
