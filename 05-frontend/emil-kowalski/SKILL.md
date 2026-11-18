---
name: emil-kowalski
description: "Filosofía de Emil Kowalski (animations.dev): física de resortes, gestos interrumpibles, FLIP, curvas cubic-bezier intencionales por arquetipo y microinteracciones táctiles. Úsala al crear animaciones UI fluidas, gestos mobile-native o stress-testing BreakUI. No usar para 3D o Canvas."
license: MIT
metadata:
  version: "2.0.0"
  trigger: ["emil kowalski", "animations dev", "fisica de resortes", "spring physics", "gestos interrumpibles", "layout animations", "tactile feedback", "mobile native", "break ui", "starting style"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 🌀 emil-kowalski — Design Engineering, Física, Gestos & Mobile-Native Web

Principios completos de las 19 skills de ingeniería de diseño de **Emil Kowalski** (`animations.dev`, `emil-design-eng`, `animate`, `gestures`, `mobile-native`, `break-ui`, `learn-taste`), armonizados con [`design-driven`](../design-driven/SKILL.md).

---

## 🚦 Reglas e Invariantes Duras (Floor, Not Ceiling)

1. **Gate de Frecuencia de Uso (Cuándo NO animar)**:
   - **`100+ veces/día`** (atajos de teclado, command palette, cambio rápido de tabs/filtros): **CERO animación, jamás**.
   - **`Decenas de veces/día`**: casi imperceptible (`<= 150ms`).
   - **`Ocasional`** (modales, drawers, toasts, popovers): animación estándar `< 300ms` (drawers hasta `500ms`).
   - **`Raro / primera vez`**: presupuesto completo de *delight*.
2. **Escalera de Herramientas (Menor costo → Mayor expresividad)**:
   `1. CSS transition` → `2. CSS @starting-style` (entrada en mount sin estado JS) → `3. CSS @keyframes` (compositor inmune a bloqueo de hilo JS) → `4. WAAPI (element.animate)` → `5. Motion 14.2+` (propiedades `x`/`y`/`scale` ya aceleradas por GPU; en `< 14.2` usar `transform` en string).
3. **Física, Curvas y Compositor Exactos**:
   - **Prohibido `scale(0)`**: arrancar siempre desde `scale(0.95)` + `opacity: 0`. Anclar popovers/menus/tooltips al trigger con `transform-origin: var(--transform-origin)` (modales permanecen centrados).
   - **Curvas calibradas**: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. Prohibido `ease-in` en UI. Presets: rápidos `{ stiffness: 450, damping: 35, mass: 0.8 }`, medios `{ stiffness: 300, damping: 30, mass: 1.0 }`, drawers `{ stiffness: 220, damping: 28, mass: 1.0 }`.
   - **Asimetría & Crossfades**: usar timing asimétrico (e.g., `2s linear` en hold-to-confirm vs `200ms ease-out` al soltar); disimular crossfades entre formas distintas con `filter: blur(2px)` (nunca `> 20px`).
   - **Prohibido animar CSS vars heredadas en un padre**: re-evalúa todo el subárbol; mutar `element.style.transform` directo u operar en compositor (`transform`/`opacity`).
4. **Invariante `prefers-reduced-motion`**: eliminar traslaciones (`x`/`y`/`scale`) y degradar a fades `<= 100ms` o transición inmediata.
5. **Gestos 1:1 & Velocity Flick**: capturar puntero (`setPointerCapture`), ignorar segundo dedo multi-touch (`if (isDragging) return`), descartar por velocidad (`Math.abs(distance) / elapsedMs > 0.11`), y aplicar amortiguamiento elástico progresivo en bordes.

---

## 📱 `mobile-native`, `break-ui` & `learn-taste` (Resumen Operativo)

- **`mobile-native` (11 Fixes Web)**: `@media (hover: hover) and (pointer: fine)` contra sticky hover; `-webkit-tap-highlight-color: transparent`; `100dvh` para app shells vs `100svh` para heroes; `font-size: 16px` mínimo en `<input>` bajo `@media (pointer: coarse)`; `overscroll-behavior: none` en root y `contain` en sheets; `viewport-fit=cover` + `interactive-widget=resizes-content`.
- **`break-ui` (Stress-Test)**: validar componentes con nombres de 1 char y 80 chars, contadores de 7 dígitos, vacíos, `Intl.PluralRules` y fechas relativas `> 7 días` pasando a absolutas.
- **`learn-taste`**: al cierre de sesión, destilar cualquier corrección visual del usuario en una regla explícita dentro de `DESIGN_SYSTEM.md`.

Ver detalle completo y checklist en [`references/emil-mobile-gestures-breakui.md`](references/emil-mobile-gestures-breakui.md), además de [`references/spring-physics.md`](references/spring-physics.md), [`references/interruptible-gestures.md`](references/interruptible-gestures.md) y [`references/layout-flip.md`](references/layout-flip.md).

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Estas reglas forman el piso físico/táctil contra UI torpe o pesada. Preservando `prefers-reduced-motion`, rendimiento de compositor y el Gate de Frecuencia, se habilita View Transitions API, coreografías FLIP avanzadas o física bespoke anotadas con `[Beyond-Baseline: <razón técnica/creativa>]`.
