# Design System Specification (DESIGN_SYSTEM.md)

> **Artefacto Canónico**: `DESIGN_SYSTEM.md`  
> *(Unifica y reemplaza de forma retrocompatible a `design-dna.md`, `DESIGN.md` y `.interface-design/system.md`)*  
> **Estado**: Aprobado  
> **Versión**: 1.0.0  

---

## 1. Dirección Estética y Reglas Generativas

- **Chasis Arquetípico**: `[Technical Monograph | Industrial Spec-Sheet | The Gallery | The Kinetic Utility | The Precision Instrument | The Humanist Companion | The System Native | Bespoke]`
- **Vector Triaxial de Diales**:
  - `DESIGN_VARIANCE`: [1-10]
  - `MOTION_INTENSITY`: [1-10]
  - `VISUAL_DENSITY`: [1-10]
- **Las 3 Reglas Generativas Mecánicas**:
  1. *Retícula / Layout*: [ej. Grid asimétrico 1:3 con hairlines de 1px en desktop; colapso a 1 columna en móvil <768px].
  2. *Superficie / División*: [ej. Sin cajas elevadas; división visual puramente por bordes semánticos `var(--border-subtle)`].
  3. *Escala Tipográfica*: [ej. Hero display clamp(2.5rem, 5vw + 1rem, 6rem) con tracking -0.04em; cuerpo en Serif legible].
- **Firma de Oficio (Memorable Signature)**: [Detalle visual o interactivo distintivo del producto].

---

## 2. Tokens Semánticos de Color (CSS Custom Properties)

Formato preferido: **OKLCH** (moderno, uniforme en luminosidad). Compatible con **HSL** (shadcn/Tailwind 3). Los valores `#hex` se muestran exclusivamente como referencia humana.

### 2.1 Tema Claro (Light Theme)
```css
:root {
  /* Superficies */
  --surface-base: oklch(0.98 0.005 240);       /* Fondo general */
  --surface-raised: oklch(1.00 0.000 0);        /* Tarjetas y modales */
  --surface-overlay: oklch(0.95 0.008 240);     /* Hover / elementos secundarios */
  
  /* Textos y Contraste (WCAG 2.2 AA) */
  --text-primary: oklch(0.15 0.010 240);        /* Títulos y texto regular */
  --text-secondary: oklch(0.45 0.015 240);      /* Metadatos y etiquetas */
  --text-muted: oklch(0.60 0.010 240);          /* Placeholders y deshabilitados */
  
  /* Bordes */
  --border-subtle: oklch(0.90 0.005 240);       /* Separadores de 1px */
  --border-focus: var(--accent-primary);        /* Ring de foco accesible */
  
  /* Acento Principal (Saturación < 80%) */
  --accent-primary: oklch(0.55 0.220 142);      /* CTA y estado activo */
  --accent-foreground: oklch(0.99 0.000 0);     /* Texto sobre acento */
}
```

### 2.2 Tema Oscuro (Dark Theme)
```css
[data-theme="dark"], .dark {
  --surface-base: oklch(0.14 0.010 240);
  --surface-raised: oklch(0.18 0.012 240);
  --surface-overlay: oklch(0.22 0.015 240);
  
  --text-primary: oklch(0.96 0.005 240);
  --text-secondary: oklch(0.70 0.010 240);
  --text-muted: oklch(0.50 0.010 240);
  
  --border-subtle: oklch(0.26 0.010 240);
  --border-focus: var(--accent-primary);
  
  --accent-primary: oklch(0.65 0.200 142);
  --accent-foreground: oklch(0.10 0.000 0);
}
```

---

## 3. Escala Tipográfica y Espaciado

- **Familias Tipográficas**:
  - Encabezados: `[Display / Serif / Sans]`
  - Cuerpo: `[Sans Humanista / Grotesk]`
  - Código & Telemetría: `[Monospace zonificado para datos numéricos y tablas tabular-nums]`
- **Escala de Texto**:
  - `Hero Display`: `clamp(2.5rem, 5vw + 1rem, 6rem)` — Techo estricto 6rem.
  - `H1 / Page Title`: `clamp(2rem, 3vw + 1rem, 3rem)`
  - `H2 / Section Title`: `1.5rem` / `leading-snug`
  - `H3 / Subtitle`: `1.125rem` / `leading-normal`
  - `Body`: `1rem` (16px) / `leading-relaxed` / `max-w-[70ch]`
  - `Caption / Metadata`: `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)` (Suelo a11y 12px, font-medium)
- **Sistema de Espaciado**:
  - Múltiplos estrictos de 4px (8pt grid): `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px).

---

## 4. Radios, Elevación y Motion

- **Radios de Borde**:
  - Botones, inputs y badges: `6px` a `8px` (`rounded-md` / `rounded-lg`) o `9999px` (pastilla completa).
  - Tarjetas y contenedores: `12px` a `16px` (`rounded-xl`).
- **Elevación / Sombras**:
  - `shadow-sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
  - `shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.08)`
  - `shadow-popover`: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- **Física de Movimiento**:
  - Transición rápida UI: `150ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Resorte orgánico: `stiffness: 200, damping: 28`
  - *Accesibilidad*: `@media (prefers-reduced-motion: reduce)` fuerza transiciones inmediatas (0ms).

---

## 5. Inventario de Componentes Base y Estados

| Componente | Variantes | Estados Obligatorios |
|---|---|---|
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `destructive` | `idle`, `hover`, `focus-visible`, `active`, `disabled`, `loading` (spinner) |
| `Input` | `text`, `search`, `password`, `select` | `idle`, `hover`, `focus` (ring 2px), `disabled`, `error` (borde rojo + mensaje) |
| `Card` | `flat`, `interactive` (cliqueable) | `idle`, `hover` (elevación o borde sutil), `focus-visible` |
| `Badge` | `neutral`, `success`, `warning`, `error`, `accent` | `static`, `dismissible` |
| `Modal / Sheet` | `dialog`, `drawer` | `entering`, `entered`, `exiting`, cierre por `Esc` y backdrop click |
