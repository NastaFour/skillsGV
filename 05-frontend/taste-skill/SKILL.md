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

> **Atribución (contenido adaptado)**: adaptación catálogo-nativa del framework [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (Leonxlnx), licencia MIT. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io, estructura references/). Fuente: `skills/taste-skill/SKILL.md` de `Leonxlnx/taste-skill`.

Framework de control de calidad visual y erradicación determinista de "AI slop". Audita interfaces mediante la declaración previa del Design Read, calibración triaxial de diales numéricos (1-10) vinculados a Chasis Arquetípicos y 10 Absolute Bans de fallo automático con Locks de Diseño.

## 📋 Cuándo Usar

- Usar para auditar código frontend contra sesgos estéticos genéricos de IA (AI-purple, Inter default, cards anidadas, faux-density).
- Usar para calibrar variabilidad espacial, intensidad de animación y densidad de información.
- **NO usar** para ejecutar la entrevista de producto/marca completa (usar `design-driven` D1/D1b).
- **NO usar** para administrar flujos mediante comandos específicos de Bakaus (usar `impeccable`).

## 🚦 Reglas Duras

1. **Regla Cero (Design Read Obligatorio)**: ANTES de emitir o modificar código de UI, declarar en el chat exactamente:
   > `Reading this as: [Audience] for [Product], with a [Archetype: Monograph|Spec-Sheet|Gallery|Kinetic|Precision|Humanist] language, leaning toward [Stack].`
2. **Regla Uno (Fijación Triaxial y Chasis)**: fijar los 3 diales (1-10) `DESIGN_VARIANCE`, `MOTION_INTENSITY` y `VISUAL_DENSITY` a través del Chasis Arquetípico elegido en D1b o calibración manual. Prohibido codificar con diales en estado ambiguo.
3. **Regla Dos (Tolerancia Cero a Absolute Bans & Locks)**: violar cualquiera de los 10 Absolute Bans o Locks de Diseño (suelo 12px a11y, no monospace en prosa, física de resortes, anti-faux-density) es un fallo automático de producción.
4. **Regla Tres (Inyección de Reglas Generativas)**: Todo archivo de UI nuevo debe declarar en su cabecera las 3 reglas mecánicas derivadas del arquetipo (`/* @design-archetype: ... */`) para evitar el decaimiento de atención.
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

## 🛠️ Flujo de Verificación (Preflight)

1. **Declarar**: emitir la línea formal de Design Read con arquetipo.
2. **Calibrar**: confirmar diales triaxiales y las 3 reglas generativas mecánicas.
3. **Escanear Bans**: revisar ausencia de em-dashes en copy visible, gradientes lila, paleta beige cliché y faux-density.
4. **Verificar Locks**: 1 acento OKLCH (<80% sat), hero clamp (max 6rem), suelo a11y (min 12px con clamp), monospace solo en tablas, cards radius (max 12-16px).
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
