---
name: shader-dev
description: "Trigger: shader dev, glsl, wgsl, shadertoy, signed distance field, sdf shader, fluid shader, fragment shader, procedural webgl. On-demand WebGL2/GLSL/WGSL shader techniques (2D/3D SDFs, FBM noise, fluid advection, procedural lighting) strictly scoped to approved focal zones in DESIGN_SYSTEM.md Craft Budget. Do NOT use for standard SaaS/CRUD forms, utility dashboards, or simple hover CSS effects."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires WebGL2/WebGPU browser context."
allowed-tools: Read Write
metadata:
  trigger: ["shader dev", "glsl", "wgsl", "shadertoy", "signed distance field", "sdf shader", "fluid shader", "fragment shader", "procedural webgl"]
  scope: [global, project]
  version: "1.0.0"
---

# 🌌 Shader Dev — Procedural GLSL / SDF / Fluid Effects (Budgeted)

Provides bespoke real-time WebGL2/ShaderToy surface and background artistry when Phase 1 (`Pitch 3` / `Archetype H`) approves an immersive visual focal zone.

## 🚦 Hard Rules (`Craft Budget` Enforced)

1. **Single Focal Canvas (`Rule of One`)**: Max `1` active shader `<canvas>` per route (`focal_zone` only); cap device pixel ratio at `Math.min(window.devicePixelRatio, 2)`.
2. **Reduced-Motion & Static Poster**: Detect `matchMedia("(prefers-reduced-motion: reduce)")` — render a frozen single-frame poster or high-craft CSS gradient fallback instead of an animation loop.
3. **Mandatory Lifecycle & Context Recovery**: Wire `webglcontextlost` (`e.preventDefault()`), cancel `requestAnimationFrame`, and call `.dispose()` / `.deleteProgram()` on unmount and Astro `astro:before-swap`.
4. **Legibility & Contrast Guard**: Any hero copy over a live shader MUST keep `>= 4.5:1` WCAG AA contrast via a controlled dark/light luminance floor in the fragment shader (`smoothstep` contrast envelope), never raw noisy colors behind text.
5. **Lazy Hydration**: Never block initial LCP — mount shader islands lazily (`client:visible` / dynamic `import()`) with `IntersectionObserver` pausing `rAF` when offscreen.

## 🧱 Core Shader Recipes (GLSL ES 3.00)

- **Lipschitz-Safe FBM & Organic Silk/Aurora**: Keep FBM octave sum `<= 4` (`lacunarity = 2.0`, `gain = 0.5`) mapped through smooth OKLCH-aligned cosine palettes (`a + b * cos(6.28318 * (c * t + d))`) matching `--accent-primary`.
- **2D SDF Primitives & Smooth Min (`smin`)**: Compose crisp anti-aliased `fwidth()` borders and soft metaball blends (`k = 0.2..0.4`) driven by normalized `uPointer` (`vec2`) with damped spring inertia.
- **No Unbounded Raymarch on Mobile**: Limit raymarch steps `<= 48` on coarse pointers / viewports `< 768px`, or fall back to 2D analytical SDFs for consistent 60fps.
