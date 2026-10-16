---
name: taste-skill
description: "Trigger: taste-skill, anti-slop, design read, AI slop, lila rule, DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY. Aesthetic governance framework with 3-dial calibration and 10 absolute bans. Use when auditing or enforcing anti-slop rules."
license: MIT
compatibility: Requires Node 20+ and pnpm 9+. Compatible with modern CSS, Tailwind and React ecosystems.
metadata:
  author: gentleman-programming
  version: "2.0.0"
  trigger: ["taste-skill", "anti-slop", "design read", "AI slop", "lila rule", "DESIGN_VARIANCE", "MOTION_INTENSITY", "VISUAL_DENSITY"]
  scope: [global, project]
allowed-tools: Read Write Edit Bash(git:*,pnpm:*)
---

# 👁️ taste-skill — Gobernanza Estética y Prevención de AI Slop

> **Atribución (contenido adaptado)**: adaptación catálogo-nativa del framework [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (Leonxlnx), licencia MIT. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io, estructura references/). Fuente: el `SKILL.md` de la skill `taste-skill` en el repositorio upstream.

Framework de control de calidad visual y erradicación determinista de "AI slop". Audita interfaces mediante la declaración previa del Design Read, calibración triaxial de diales numéricos (1-10) vinculados a Chasis Arquetípicos y 10 Absolute Bans de fallo automático con Locks de Diseño.

## 📋 Cuándo Usar

- Usar para auditar código frontend contra sesgos estéticos genéricos de IA (AI-purple, Inter default, cards anidadas, faux-density).
- Usar para calibrar variabilidad espacial, intensidad de animación y densidad de información.
- **NO usar** para ejecutar la entrevista de producto/marca completa (usar `design-driven` D1/D1b).
- **NO usar** para administrar flujos mediante comandos específicos de Bakaus (usar `impeccable`).

## 🚦 Reglas Duras

1. **Regla Cero (Design Read Unificado de 3 Líneas)**: ANTES de emitir o modificar código de UI, declarar en el chat:
   > `Design Read:`
   > `1. Dirección/Chasis: [Chasis: Monograph|Spec-Sheet|Gallery|Kinetic|Precision|Humanist|System-Native|Bespoke] — [Por qué para esta audiencia/producto]`
   > `2. Jerarquía y Tokens: [Tokens clave: --surface-*, --text-*, --accent-*, escala tipográfica/densidad]`
   > `3. Firma de Oficio: [Detalle memorable o propuesta creativa del modelo [Beyond-Baseline: <razón>]]`
   *(Para mantenimiento menor con diff < 50 líneas, usar Fast-Path de 1 línea: `Design Read: [Chasis] — heredando tokens de DESIGN_SYSTEM.md; [ajuste puntual]`).*
2. **Regla Uno (Fijación Triaxial y Chasis)**: fijar los 3 diales (1-10) `DESIGN_VARIANCE`, `MOTION_INTENSITY` y `VISUAL_DENSITY` a través del Chasis Arquetípico elegido en D1b o calibración manual. Prohibido codificar con diales en estado ambiguo.
3. **Regla Dos (Piso de Calidad con Techo Abierto — Floor, Not Ceiling)**: respetar los Invariantes de Nivel 1 (cero datos falsos, accesibilidad WCAG 2.2, estados completos, `prefers-reduced-motion`). Las heurísticas de Nivel 2 contra clichés de IA son adaptables al dominio y se pueden flexibilizar justificando la propuesta en el Design Read (`[Beyond-Baseline: <razón>]`).
4. **Regla Tres (Inyección de Reglas Generativas)**: El comentario de cabecera `/* @design-archetype: ... */` es requerido únicamente en el archivo raíz de entrada de la UI o cuando no exista `DESIGN_SYSTEM.md` en el proyecto. No es necesario forzarlo en cada archivo secundario durante mantenimientos.
5. **Delimitación de Alcance**: esta skill audita y gobierna; no conduce la entrevista de unicidad (deferir a `design-driven` D1b).

## ⚙️ Vector Triaxial de Diales (1-10)

$$\vec{T} = \begin{bmatrix} \text{DESIGN\_VARIANCE} \\ \text{MOTION\_INTENSITY} \\ \text{VISUAL\_DENSITY} \end{bmatrix}$$

- **Presets de Chasis**:
  - `Technical Monograph`: [7, 2, 8] (Grid asimétrico 1:3, hairlines 1D, sin cards)
  - `Industrial Spec-Sheet`: [3, 1, 9] (12-col hairlines, tabular nums, monospace zonificado)
  - `The Gallery`: [9, 4, 2] (Vacío ≥45%, escala bipolar, escalón intermedio)
  - `The Kinetic Utility`: [4, 8, 7] (100dvh fijo, canvas hero, HUDs flotantes ≤24px)
  - `The Precision Instrument`: [4, 5, 7] (Linear-style, atajos, micro-radios 6-8px)
  - `The Humanist Companion`: [5, 4, 5] (Notion/Airbnb style, orgánico, conversacional)
  - `The System Native`: [3, 2, 7] (Enterprise workhorse, Shadcn/Radix/Tailwind nativo, tokens heredados)
  - `Bespoke / Creative Exploration`: [Diales libres + 3 reglas generativas mecánicas justificadas]

## 🛠️ Flujo de Verificación (Preflight)

1. **Declarar**: emitir el Design Read unificado de 3 líneas (o 1 línea en Fast-Path).
2. **Calibrar**: confirmar diales triaxiales y las 3 reglas generativas mecánicas.
3. **Escanear Invariantes**: verificar cumplimiento estricto de Nivel 1 y adecuar Nivel 2 al dominio.
4. **Verificar Tokens**: usar tokens semánticos CSS (`--surface-*`, `--text-*`, `--accent-*`, `--border-*` en OKLCH/HSL) de `DESIGN_SYSTEM.md`, suelo a11y min 12px y física de resortes coherente.
5. **Ejecutar Preflight**: pasar la matriz mecánica de verificación antes de declarar el componente listo.

## 📦 Contrato de Salida

- Declaración de Design Read visible en chat.
- Valores calibrados de diales triaxiales y arquetipo.
- Verificación de 10 Absolute Bans y Locks de diseño cumplida (0 violaciones).

## 📚 Referencias

- [Calibración de Diales y Chasis Arquetípicos](references/dials.md)
- [Matriz de 10 Absolute Bans y Locks](references/absolute-bans.md)
- [Pre-Flight Check Mecánico](references/preflight.md)
- [Guía Completa de Referencia UI](references/full-guide.md)
