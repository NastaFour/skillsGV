---
name: modern-web-guidance
description: "Trigger: modern web guidance, legacy scan, native css, popover api, anchor positioning, container queries, view transitions, subgrid, scroll-driven animations. Replaces 2015 JS/CSS boilerplate with modern baseline browser APIs across CSS layout, native dialogs/popovers, scroll timelines, and INP performance, driven strictly by legacy-scan.mjs without flooding prompts. Do NOT use for legacy IE11 support or server-side database logic."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["modern web guidance", "legacy scan", "native css", "popover api", "anchor positioning", "container queries", "view transitions", "subgrid", "scroll driven animations"]
  scope: [global, project]
  version: "1.0.0"
---

# 🌐 Modern Web Guidance — Script-Indexed Native Web Platform Floor

Prevents generating 2015 JavaScript workarounds for problems browsers already solve natively in 4 lines of CSS/HTML. **Never preload all guides into context**: run `legacy-scan.mjs` first and open ONLY the flagged section in [`references/modern-platform-map.md`](references/modern-platform-map.md).

## 🚦 Hard Rules

1. **Progressive Disclosure via Scanner**: Execute `node 05-frontend/modern-web-guidance/scripts/legacy-scan.mjs --srcDir src --json` and inspect only the reported `guideRef` anchors.
2. **Native First**: Prefer `<dialog>` + `[popover]` + CSS Anchor Positioning over hand-rolled portal/click-outside/focus-trap scripts; prefer `@container` + CSS `subgrid` over `ResizeObserver` layout state; prefer `animation-timeline: view()` / `scroll()` over `window.addEventListener('scroll')`.
3. **Viewport & Compositor Safety**: Use `100svh` (heroes) / `100dvh` (app shells) instead of `100vh`; animate only GPU-composited `transform`/`opacity` in `@keyframes` (never `top`/`left`/`width`/`height`).
4. **INP & Modern Interop**: Yield heavy work, avoid `document.execCommand`, and pair `navigator.clipboard.writeText()` with async error feedback.
5. **Astro Hydration Rule**: On Astro sites, keep static sections zero-JS and hydrate interactive/motion islands strictly with `client:visible` or `client:idle` plus `astro:before-swap` cleanup.

## 📚 References

- [Modern Platform Map](references/modern-platform-map.md) — targeted CSS, HTML/DOM, and INP replacement patterns by scanner anchor.
- [`legacy-scan.mjs`](scripts/legacy-scan.mjs) — deterministic zero-dependency detector wired into `verify-frontend-gates.mjs`.
