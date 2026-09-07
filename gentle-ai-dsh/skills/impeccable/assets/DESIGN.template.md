# DESIGN.md — Especificación Visual y Sistema de Tokens (Stitch)

> Archivo inferido por `/impeccable document`. Especificación técnica y tokens del sistema de diseño.

## 1. Diales Triaxiales
- `DESIGN_VARIANCE`: [1-10] (1-3 simétrico, 4-7 asimetría moderada, 8-10 editorial)
- `MOTION_INTENSITY`: [1-10] (1-3 estático, 4-7 CSS GPU, 8-10 coreografía GSAP/Motion)
- `VISUAL_DENSITY`: [1-10] (1-3 galería, 4-7 app diaria, 8-10 dashboard/cockpit)

## 2. Paleta de Color (OKLCH)
- **Base Fondo**: `oklch(0.98 0.005 240)`
- **Superficie Tarjetas**: `oklch(1.00 0.000 0)`
- **Tinta Texto**: `oklch(0.12 0.010 240)`
- **Tinta Secundaria**: `oklch(0.45 0.015 240)`
- **Borde Neutro**: `oklch(0.90 0.005 240)`
- **Acento Primario** (Único, saturación <80%): `oklch(0.55 0.220 142)`

## 3. Tipografía y Escala
- **Par Tipográfico**: [Serif encabezados + Sans cuerpo / Mono datos]
- **Hero Display**: `clamp(2.5rem, 5vw + 1rem, 6rem)` (techo estricto 6rem)
- **Tracking Suelo**: `-0.04em` en display grande
- **Ancho Prosa**: `65ch - 75ch`
- **Valores Numéricos**: `font-mono` para tablas y datos de cockpit

## 4. Espaciado, Forma y Elevación
- **Nav Máximo**: `80px` en una sola línea horizontal
- **Hero Padding**: `pt-24` máximo en desktop
- **Radio de Tarjetas**: `12px - 16px` máximo (`rounded-xl`)
- **Radio de Botones**: `6px - 8px` o `9999px` (pill)

## 5. Reglas de Animación y Viewport
- **Unidad de Viewport**: `min-h-[100dvh]` (nunca `h-screen`)
- **Scroll Listeners**: Prohibido `window.addEventListener('scroll')` en JS
- **Preferencia de Movimiento**: `prefers-reduced-motion` para MOTION > 3
