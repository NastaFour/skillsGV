---
name: web-animation-sources
description: Referencias curadas de animaciones web (hover effects, loading animations, entrance animations, microinteracciones, librerías CSS y componentes React) con autor, URL y propósito. Use when searching animation references or inspiration sources.
license: MIT
metadata:
  trigger: ["hover effects", "loading animation", "entrance animation", "animate.css"]
  scope: [global, project]
  version: "1.0.0"
allowed-tools: Read
---

# 🎞️ Web Animation Sources

Lista curada de las 10 referencias de animación web agrupadas por tópico, con autor y propósito por entrada. Es un índice de fuentes para buscar inspiración y ejemplos: NO embebe instrucciones ni código del contenido externo.

## 📋 When to Use

- Use when searching referencias o inspiración de animación antes de diseñar/implementar
- Use when necesitas ejemplos canónicos por tópico (hover, loading, entrada, fondo, cursor…)
- Do NOT use for implementación directa (use `motion-framer`, `motion-gsap`, `micro-interactions` o `visual-effects`)
- Do NOT use for animación 3D en tiempo real (use `three-js-web`)

## 🚦 Hard Rules

- **Always** citar autor/fuente al usar una referencia externa como base
- **Never** copiar código o procedimientos del sitio fuente sin verificar licencia
- **Always** preferir el tópico sobre el enlace exacto: si una URL cae, buscar la fuente vigente del mismo autor/tópico

## 🛠️ Workflow

1. Identificar el tópico de animación en la tabla de [animation-sources.md](references/animation-sources.md)
2. Abrir la referencia correspondiente y extraer dirección visual/patrones
3. Implementar con la skill de motion apropiada (`motion-framer`, `motion-gsap`, `micro-interactions`, `visual-effects`)

## 📚 References

- [Animation Sources](references/animation-sources.md) — las 10 referencias curadas agrupadas por tópico
- [`micro-interactions`](../micro-interactions/SKILL.md) — implementación de microinteracciones
- [`motion-framer`](../motion-framer/SKILL.md) — implementación de animaciones en React/mobile
