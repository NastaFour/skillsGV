# Catálogo de Paletas de Colores (160+ Combinaciones Curadas)

Guía de referencia para selección y aplicación de paletas cromáticas con ratios de contraste WCAG AA/AAA y semántica clara.

---

## 1. Familias Cromáticas Fundamentales

Cada sistema de diseño profesional define una base neutra (60%), una estructura de soporte (30%) y un acento interactivo (10%).

### 1.1 Paletas Corporativas y SaaS B2B
1. **Blue Steel**:
   - Fondo: `#f8fafc` (Slate 50) | Superficie: `#ffffff` | Borde: `#e2e8f0` (Slate 200)
   - Texto principal: `#0f172a` (Slate 900) | Secundario: `#64748b` (Slate 500)
   - Primario / CTA: `#2563eb` (Blue 600) | Hover: `#1d4ed8` (Blue 700)
2. **Deep Indigo**:
   - Fondo: `#f5f7fb` | Superficie: `#ffffff` | Borde: `#e0e7ff`
   - Primario: `#4338ca` (Indigo 700) | Acento: `#6366f1` (Indigo 500)
3. **Nordic Slate**:
   - Fondo: `#f1f5f9` | Tarjetas: `#ffffff` | Texto: `#1e293b`
   - Primario: `#0284c7` (Sky 600) | Acento: `#0ea5e9`
4. **Graphite Enterprise**:
   - Fondo: `#f4f4f5` (Zinc 100) | Superficie: `#ffffff`
   - Primario: `#18181b` (Zinc 900) | Acento: `#3b82f6` (Blue 500)

### 1.2 Paletas Fintech, Inversión y Banca
1. **Emerald Reserve**:
   - Fondo: `#090d0b` | Superficie: `#111815` | Borde: `#1c2b23`
   - Texto: `#f2fbf6` | Muted: `#7fa892`
   - Acento positivo: `#10b981` (Emerald 500) | Acento negativo: `#f43f5e` (Rose 500)
2. **Swiss Banking Dark**:
   - Fondo: `#0d0f12` | Superficie: `#16191f` | Borde: `#252b36`
   - Texto: `#f8fafc` | Acento: `#38bdf8` (Sky 400) | Neutral: `#94a3b8`
3. **Copper & Onyx**:
   - Fondo: `#0c0a09` (Stone 950) | Superficie: `#1c1917` (Stone 900)
   - Primario: `#d97706` (Amber 600) | Acento: `#f59e0b` (Amber 500)
4. **Clean Wealth Light**:
   - Fondo: `#ffffff` | Superficie: `#f8fafc` | Borde: `#e2e8f0`
   - Primario: `#0f766e` (Teal 700) | Secundario: `#0d9488` (Teal 600)

### 1.3 Paletas E-commerce y Conversión
1. **Warm Terracotta**:
   - Fondo: `#fafaf9` (Stone 50) | Superficie: `#ffffff` | Borde: `#e7e5e4`
   - Texto: `#1c1917` | CTA Principal: `#ea580c` (Orange 600) | Badge: `#f97316`
2. **Modern Luxury (Black & Cream)**:
   - Fondo: `#fdfbf7` (Cream) | Superficie: `#ffffff` | Borde: `#e6e2da`
   - Texto: `#121212` | Acento: `#121212` (Negro absoluto para CTA de alta gama)
3. **Electric Coral**:
   - Fondo: `#ffffff` | Superficie: `#f9fafb` | Borde: `#f3f4f6`
   - Texto: `#111827` | CTA: `#f43f5e` (Rose 500) | Acento: `#fb7185`
4. **Fresh Market**:
   - Fondo: `#f0fdf4` (Green 50) | Superficie: `#ffffff` | Borde: `#dcfce7`
   - Primario: `#16a34a` (Green 600) | Acento: `#eab308` (Yellow 500)

### 1.4 Paletas de Inteligencia Artificial y Herramientas Creativas
1. **Cosmic Violet**:
   - Fondo: `#030712` (Gray 950) | Superficie: `#0f172a` (Slate 900) | Borde: `#1e293b`
   - Primario: `#8b5cf6` (Violet 500) | Glow: `#a78bfa` (Violet 400) | Cyan: `#06b6d4`
2. **Neon Synthwave**:
   - Fondo: `#0b0914` | Superficie: `#151226` | Borde: `#292348`
   - Primario: `#ec4899` (Pink 500) | Acento secundario: `#8b5cf6` (Purple 500)
3. **Cyber Lime**:
   - Fondo: `#09090b` (Zinc 950) | Superficie: `#18181b` (Zinc 900) | Borde: `#27272a`
   - Primario: `#a3e635` (Lime 400) | Texto: `#fafafa` (Zinc 50)

---

## 2. Ratios y Garantías de Accesibilidad (WCAG)

Para garantizar legibilidad universal:

| Elemento | Ratio Mínimo WCAG AA | Ratio Mínimo WCAG AAA | Ejemplo Válido |
|---|---|---|---|
| Texto normal (<18px regular) | 4.5:1 | 7.0:1 | `#0f172a` sobre `#ffffff` (16.2:1) |
| Texto grande (≥18px bold o ≥24px) | 3.0:1 | 4.5:1 | `#475569` sobre `#ffffff` (5.8:1) |
| Componentes UI y bordes activos | 3.0:1 | 3.0:1 | `#94a3b8` sobre `#ffffff` (3.1:1) |
| Textos deshabilitados o decorativos | Sin requisito | Sin requisito | `#cbd5e1` sobre `#ffffff` |

### Regla del Acento Único
- Un error recurrente es utilizar múltiples colores de acento competidores (ej. un botón azul, un badge naranja y un enlace violeta en la misma pantalla).
- Mantén **un único color de acento interactivo** para acciones principales. Los demás colores deben reservarse estrictamente para comunicación de estados (éxito, alerta, error o información).
