---
name: web-animation-sources
description: "Curated index of web animation inspiration sources, CSS/React motion libraries, and the 22-repo Open-Source Motion Studio reference (hover effects, loading animations, entrance animations, micro-interactions, WebGL shaders, and timeline engines). Use when searching animation references or inspiration sources before implementation. Do NOT use as an implementation runtime guide (use motion-framer, motion-gsap, micro-interactions, or motion-video-pipeline)."
license: MIT
metadata:
  trigger: ["hover effects", "loading animation", "entrance animation", "animate.css", "web animation sources", "animation references", "animation inspiration", "motion ideas", "wow animation", "efectos interactivos"]
  scope: [global, project]
  version: "1.1.0"
allowed-tools: Read
---

# 🎞️ Web Animation Sources

Índice curado de fuentes de animación web agrupadas por tópico (hover, loading, 3D, entrada, microinteracciones, background, cursor, librerías CSS/React) enlazado con la referencia completa de **22 repositorios Open-Source Motion Studio**. Es un mapa de inspiración con atribución: NO embebe instrucciones ni código propietario externo.

## 📋 When to Use

- Use when searching referencias o inspiración de animación antes de diseñar o prototipar en StageShow.
- Use when necesitas ejemplos canónicos por tópico o evaluar librerías de motion por categoría.
- Do NOT use for implementación directa en código (use `motion-framer`, `motion-gsap`, `micro-interactions` o `visual-effects`).
- Do NOT use para pipelines completos de renderizado de video (use `motion-video-pipeline`).

## 🚦 Hard Rules

- **Always** citar autor/fuente al adaptar una referencia externa.
- **Never** copiar código o assets protegidos del sitio fuente sin verificar su licencia.
- **Always** priorizar el tópico y la física deseada sobre una URL concreta; si una URL cae, usar el recurso vigente equivalente.

## 🛠️ Workflow

1. Localizar el tópico en [references/animation-sources.md](references/animation-sources.md).
2. Si el caso requiere un motor completo o pipeline `code-to-video` / WebGL / capture, consultar [`../../11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md`](../../11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md).
3. Implementar con la skill de ejecución correspondiente (`motion-framer`, `motion-gsap`, `micro-interactions`, `three-js-web` o `motion-video-pipeline`).

## 📚 References

- [Animation Sources](references/animation-sources.md) — índice curado ampliado por tópico (CSS/React/UX/3D)
- [Open-Source Motion Studio (22 Repos)](../../11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md) — stack completo de 22 repositorios Tiers A–D
- [`micro-interactions`](../../02-dev-roles/micro-interactions/SKILL.md) — implementación de microinteracciones
- [`motion-framer`](../motion-framer/SKILL.md) — implementación declarativa en React/DOM
