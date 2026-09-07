---
name: taste-skill
description: "Trigger: taste-skill, anti-slop, design read, AI slop, lila rule, DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY. Aesthetic governance framework with 3-dial calibration and 10 absolute bans. Use when auditing or enforcing anti-slop rules."
license: MIT
compatibility: Requires Node 20+ and pnpm 9+. Compatible with modern CSS, Tailwind and React ecosystems.
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["taste-skill", "anti-slop", "design read", "AI slop", "lila rule", "DESIGN_VARIANCE", "MOTION_INTENSITY", "VISUAL_DENSITY"]
  scope: [global, project]
allowed-tools: Read Write Edit Bash(git:*,pnpm:*)
---

# 👁️ taste-skill — Gobernanza Estética y Prevención de AI Slop

> **Atribución (contenido adaptado)**: adaptación catálogo-nativa del framework [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (Leonxlnx), licencia MIT. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io, estructura references/). Fuente: `skills/taste-skill/SKILL.md` de `Leonxlnx/taste-skill`.

Framework de control de calidad visual y erradicación determinista de "AI slop". Audita interfaces mediante la declaración previa del Design Read, calibración triaxial de diales numéricos (1-10) y 10 Absolute Bans de fallo automático.

## 📋 Cuándo Usar

- Usar para auditar código frontend contra sesgos estéticos genéricos de IA (AI-purple, Inter default, cards anidadas).
- Usar para calibrar variabilidad espacial, intensidad de animación y densidad de información.
- **NO usar** para ejecutar la entrevista de producto/marca completa (usar `design-driven` D1/D1b).
- **NO usar** para administrar flujos mediante comandos específicos de Bakaus (usar `impeccable`).

## 🚦 Reglas Duras

1. **Regla Cero (Design Read Obligatorio)**: ANTES de emitir o modificar código de UI, declarar en el chat exactamente:
   > `Reading this as: [Audience] for [Product], with a [Style/Vibe] language, leaning toward [Stack].`
2. **Regla Uno (Fijación Triaxial)**: fijar los 3 diales (1-10) `DESIGN_VARIANCE`, `MOTION_INTENSITY` y `VISUAL_DENSITY`. Si no están definidos, BLOQUEAR y solicitar elección.
3. **Regla Dos (Tolerancia Cero a Absolute Bans)**: violar cualquiera de los 10 Absolute Bans es un fallo automático de producción, no una simple advertencia.
4. **Delimitación de Alcance**: esta skill audita y gobierna; no conduce la entrevista de 5 bloques de unicidad (deferir a `design-driven`).

## ⚙️ Vector Triaxial de Diales (1-10)

$$\vec{T} = \begin{bmatrix} \text{DESIGN\_VARIANCE} \\ \text{MOTION\_INTENSITY} \\ \text{VISUAL\_DENSITY} \end{bmatrix}$$

- **DESIGN_VARIANCE**: 1-3 simétrico / 4-7 offset / 8-10 editorial. (En <768px, dial 4-10 colapsa a 1 columna: `w-full px-4 py-8`).
- **MOTION_INTENSITY**: 1-3 estático / 4-7 CSS GPU / 8-10 GSAP/Motion. Ban absoluto: `window.addEventListener('scroll')`.
- **VISUAL_DENSITY**: 1-3 galería / 4-7 app diaria / 8-10 cockpit (`font-mono` obligatorio en números).

## 🛠️ Flujo de Verificación (Preflight)

1. **Declarar**: emitir la línea formal de Design Read.
2. **Calibrar**: fijar o confirmar los diales triaxiales.
3. **Escanear Bans**: revisar ausencia de em-dashes en copy visible, gradientes lila y paleta beige cliché.
4. **Verificar Locks**: 1 acento OKLCH (<80% sat), hero clamp (max 6rem, tracking floor -0.04em), cards radius (max 12-16px).
5. **Ejecutar Preflight**: pasar la matriz mecánica de verificación antes de declarar el componente listo.

## 📦 Contrato de Salida

- Declaración de Design Read visible en chat.
- Valores calibrados de diales triaxiales.
- Verificación de 10 Absolute Bans cumplida (0 violaciones).

## 📚 Referencias

- [Calibración de Diales](references/dials.md)
- [Matriz de 10 Absolute Bans](references/absolute-bans.md)
- [Pre-Flight Check Mecánico](references/preflight.md)
- [Guía Completa de Referencia UI](references/full-guide.md)
