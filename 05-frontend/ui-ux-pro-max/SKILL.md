---
name: ui-ux-pro-max
description: "Base de 89 estilos UI, 192 paletas y 120 reglas UX por industria (SaaS, Fintech, E-commerce) con WCAG 2.2 AA/AAA, RTL y exportación DTCG. Úsala antes de codificar interfaces web y móviles. No usar para APIs o backend."
license: MIT
metadata:
  version: "2.0.0"
  trigger: ["ui ux pro max", "estilos ui", "paleta de colores", "bento grid", "glassmorphism", "brutalismo", "reglas de diseño", "wcag 2.2", "dtcg tokens", "rtl ui"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 💎 ui-ux-pro-max v2.0 — Design Intelligence, 192 Paletas, WCAG 2.2 & RTL

Motor de razonamiento visual basado en **89 estilos UI**, **192 paletas cromáticas y perfiles por dominio**, **74 emparejamientos tipográficos**, **120 directrices UX**, **25 tipos de gráficos** y **22 stacks**. Delega el `Design Read` de 3 líneas y los arquetipos `A–H` a [`design-driven`](../design-driven/SKILL.md).

---

## 🚦 Reglas Duras de Diseño y Accesibilidad (Floor, Not Ceiling)

1. **Coherencia Única & Regla del Acento 60-30-10**: Prohibido mezclar estilos dispares en una vista (ej. neobrutalismo + glassmorphism); un único color de acento primario para CTAs; doble codificación en estados (color + icono/texto, nunca solo color); cifras con `tabular-nums`.
2. **WCAG 2.2 AA/AAA & Casos Borde Críticos**:
   - **`focus-not-obscured`**: Headers/footers `sticky` o toasts jamás deben tapar el elemento actualmente enfocado con teclado (`scroll-margin-top`).
   - **`dragging-alternative`**: Toda interacción de arrastre (Kanban, reordenar listas, sliders) exige alternativa operativa por clic o teclado.
   - **`accessible-authentication`**: Prohibido bloquear `paste` o gestores de contraseñas en campos de login/2FA.
   - **`ime-composition-enter` (Guard CJK/IME Obligatorio)**: Cualquier handler `onKeyDown` que envíe formularios/mensajes con `Enter` DEBE comprobar `!e.nativeEvent.isComposing && e.keyCode !== 229` antes de hacer submit.
   - **`chip-collection-reflow` & `contextual-live-badge-updates`**: Badges dinámicos de notificaciones/contadores usan `aria-live="polite"`; colecciones de chips con overflow `+n` deben ser operables por teclado sin superposición.
   - **Touch/Pointer Target Floor**: Mínimo `24×24px` CSS en escritorio web y `44×44pt` (`48dp`) en interfaces táctiles móviles.
3. **Exportación Compatible con W3C DTCG & Preparación RTL**: Mapear variables semánticas (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`) en `DESIGN_SYSTEM.md` y exportar tokens opcionalmente en formato **W3C DTCG** (`$value`, `$type`); documentar nivel de soporte **RTL** (`full | partial | caveats`).

---

## 🏛️ Selección Rápida de Arquetipos & Industria

| Estilo / Industria | Claves Estructurales | Precauciones |
|---|---|---|
| **SaaS B2B / Bento Grid** | Cabeceras `sticky top-0` (se permiten `<th>` `text-xs uppercase tracking-wider` en tablas densas), acciones destructivas aisladas en modal, filtros sincronizados en URL | Evitar faux-density y cajas iguales repetitivas |
| **Fintech & Banca** | `font-mono` / `tabular-nums`, iconos `↑`/`↓` en variaciones, privacy blur opt-in | Cero floats en dinero |
| **E-commerce / Minimalismo Suizo** | Aspect ratios fijos (`1:1` o `4:5`), jerarquía precio actual vs tachado, CTA sticky `>= 44px` en móvil | Respetar jerarquía de lectura RTL si aplica |
| **Glassmorphism / Aurora / Kinetic** | `backdrop-blur` reservado a superficies inmersivas (`C`, `D`, `H`) | Contraste WCAG `>= 4.5:1` siempre garantizado |

---

## 📚 Referencias & Floor-Not-Ceiling (`[Beyond-Baseline]`)

- [Catálogo Extendido de Estilos UI](references/ui-styles.md) · [Catálogo de 160+ Paletas de Colores](references/color-palettes.md) · [Reglas Específicas por Industria](references/industry-rules.md).
- Presets e industrias marcan el piso operativo; se alientan paletas OKLCH propias o combinaciones laterales bajo `[Beyond-Baseline: <razón>]`.
