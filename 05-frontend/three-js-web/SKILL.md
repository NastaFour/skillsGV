---
name: three-js-web
description: Desarrollo web 3D en tiempo real con three.js, react-three-fiber y drei en React: escenas WebGL, modelos GLTF, performance de GPU y Spline como alternativa no-code. Use when building 3D scenes, WebGL experiences, or react-three-fiber components.
license: MIT
metadata:
  trigger: ["three.js", "threejs", "react-three-fiber", "drei", "webgl", "3d scene"]
  scope: [global, project]
  version: "1.0.0"
allowed-tools: Read
---

# 🧊 Three.js + React Three Fiber + Drei

El stack 3D web como una sola unidad: three.js es el motor WebGL, react-three-fiber (R3F) lo hace declarativo en React y drei provee los helpers listos para producción. Incluye Spline documentado como alternativa no-code.

## 📋 When to Use

- Use when building escenas 3D en tiempo real con WebGL (three.js puro o R3F)
- Use when composing escenas declarativas en React (`<Canvas>`, hooks, componentes)
- Use when loading modelos GLTF/GLB, environments, controles u otros helpers de drei
- Use when optimizing performance de GPU/CPU en escenas WebGL
- Do NOT use for animación UI 2D (use `motion-framer` / `motion-gsap`)
- Do NOT use for efectos CSS 3D transforms sin WebGL (use `visual-effects`)
- Do NOT use for generación de imagen raster (use `nano-banana`)

## 🚦 Hard Rules

- **Always** liberar recursos WebGL al desmontar (`dispose()` de geometrías, materiales y texturas)
- **Always** pausar el render loop cuando el canvas no está visible (`frameloop="demand"` o IntersectionObserver)
- **Never** crear geometrías/materiales dentro de `useFrame` (ejecuta 60×/segundo)
- **Always** limitar `dpr` (`<Canvas dpr={[1, 2]}>`) en pantallas de alta densidad
- **Always** respetar `prefers-reduced-motion` en cámaras y animaciones de escena

## 🛠️ Workflow

1. Núcleo three.js (scene/camera/renderer/loop): [core-threejs.md](references/core-threejs.md)
2. Patrones R3F en React: [r3f-patterns.md](references/r3f-patterns.md)
3. Helpers de drei: [drei-helpers.md](references/drei-helpers.md)
4. Performance WebGL: [performance-webgl.md](references/performance-webgl.md)
5. Alternativa no-code: [spline-no-code.md](references/spline-no-code.md)

## 🧊 Spline (alternativa no-code)

Cuando el equipo no escribe código WebGL, Spline permite diseñar la escena visualmente y embeberla. Es una sección de alternativa dentro de esta skill, no un stack separado: evalúe trade-offs en [spline-no-code.md](references/spline-no-code.md) antes de elegir.

## 📚 References

- [Core three.js](references/core-threejs.md) — scene, camera, renderer, render loop
- [Patrones R3F](references/r3f-patterns.md) — Canvas, hooks, composición declarativa
- [Helpers drei](references/drei-helpers.md) — OrbitControls, Environment, useGLTF, Text
- [Performance WebGL](references/performance-webgl.md) — draw calls, instancing, dpr, memoria
- [Spline no-code](references/spline-no-code.md) — cuándo elegirlo frente a código
- [`motion-framer`](../motion-framer/SKILL.md) — animación UI 2D (no WebGL)
- [`visual-effects`](../visual-effects/SKILL.md) — CSS 3D transforms (no WebGL)
