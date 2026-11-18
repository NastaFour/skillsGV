---
name: micro-interactions
description: "Copy-paste catalog of premium micro-interactions — Jakub Krehel make-interfaces-feel-better polish, hover lift, press scale, focus glow, contextual icon animations, optical alignment, shadows, and staggered choreography. Covers CSS-only, Motion, and React Native implementations. Use when buttons/elements feel dead or flat, lists lack choreography, or auditing UI craft polish. Do NOT use for heavy 3D/WebGL scenes."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+."
metadata:
  trigger: ["micro interaction", "make interfaces feel better", "jakub krehel", "hover effect", "press animation", "button hover", "stagger", "list animation", "entrance animation", "skeleton shimmer", "tap feedback", "focus ring", "icon animation", "optical alignment", "UI feel"]
  scope: [global, project]
  version: "2.0.0"
allowed-tools: Bash(node:*) Read
---

# 🎭 Micro-Interactions & Interface Polish (`make-interfaces-feel-better`)

The craft layer between static wireframes and tactile, alive UI — uniting practical copy-paste micro-interactions with **Jakub Krehel's 19 `make-interfaces-feel-better` polish principles**. Coordinate high-frequency vs rare motion budgets with [`emil-kowalski`](../../05-frontend/emil-kowalski/SKILL.md).

---

## 🚦 Hard Rules (The Polish Floor)

1. **Complete Interactive States**: Interactive controls (`<button>`, `<a>`, cards) MUST implement hover (`@media (hover: hover) and (pointer: fine)`), keyboard `focus-visible`, tactile `:active`, and `disabled` styling.
2. **Compositor-Only Transitions**: Never use `transition: all`; transition strictly `transform`, `opacity`, `filter`, or color properties — never animate `width`, `height`, `top`, `left`, or parent `--css-vars`. Respect `prefers-reduced-motion`.
3. **No Animate-on-Mount Artifacts**: Wrap stateful swaps in `AnimatePresence initial={false}` so lists/icons do not jitter during initial page render.

---

## 💎 Jakub Krehel's Exact Recipes (`make-interfaces-feel-better`)

- **Contextual Icon Swaps (Copy/Check, Toggle, Status)**:
  - *Motion*: `scale: 0.25 -> 1`, `opacity: 0 -> 1`, `filter: blur(4px) -> blur(0px)` with `{ type: "spring", duration: 0.3, bounce: 0 }` (`bounce` MUST be `0`).
  - *Zero-Dependency CSS Fallback*: Keep both icons mounted (second `absolute inset-0`) and cross-fade with `transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]`.
- **Tactile Press Scale (`0.96`)**: Use `active:not-disabled:scale-[0.96]` (never `< 0.95`); expose an optional `static` prop on shared `<Button>` primitives to suppress scale where stillness fits better.
- **Optical Padding & Play Icons**: On buttons combining text + icon, trim `2px` on the icon side (`padding-icon-side = padding-text-side - 2px`, e.g., `pl-4 pr-3.5`); nudge triangular "play" glyphs `+2px` horizontally so their center of mass aligns visually.
- **Concentric Radii (`<= 24px` Cap)**: Enforce `outerRadius = innerRadius + padding`; when `padding > 24px`, treat inner and outer layers as independent surfaces rather than bloating outer corners.
- **OKLCH Depth Polarity (3-Layer Light vs 1-Ring Dark)**:
  - *Light mode*: `0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px 0 oklch(0 0 0 / 0.04)`.
  - *Dark mode*: collapse to a single crisp edge ring `0 0 0 1px oklch(1 0 0 / 0.08)` (`0.13` hover); keep semantic `1px` borders for dividers and inputs.
- **Neutral Inner Image Outlines**: Always frame photos/avatars with pure neutral inner outlines (`outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px` in light, `oklch(1 0 0 / 0.1)` in dark) — NEVER palette-tinted grays (`slate-900`/`zinc-900`), which pick up muddy background tints.
- **Icon Weight Pairing & RTL Matrix**: Match SVG `stroke-width` to adjacent text (`1.5px` regular `400`, `2px` medium/semibold `500–600`, `2.5px` bold `700`). Under `[dir="rtl"]`, flip directional navigation/send arrows (`scale: -1 1`), NEVER flip logos, checkmarks, clocks, pencils, or media playback icons.
- **Length-Scoped Text Wrapping**: Apply `text-wrap: balance` to headings (`<= 6` lines), `text-wrap: pretty` to short/medium paragraphs and captions (`< 10` lines), and neither to `10+`-line prose blocks.
- **Inspection Method**: Audit key state transitions at **10% playback speed** in browser DevTools to catch icon overlap, jitter, and clipped focus rings.

---

## 🛠️ Workflow & References

1. [Hover/Press/Focus](references/hover-press-focus.md) — CSS + Tailwind + Reanimated recipes.
2. [Stagger Entrance](references/stagger-entrance.md) & [Skeleton Shimmer](references/skeleton-shimmer.md).
3. [Advanced Effects](references/advanced-effects.md) — count pulse, text reveal, magnetic affordances.
4. Run interaction check: `node 02-dev-roles/micro-interactions/scripts/check-interactions.mjs`.

## 🧭 Floor, Not Ceiling (`[Beyond-Baseline]`)

These craft defaults define the anti-flatness floor. Teams may layer View Transitions, scroll-driven `animation-timeline`, or custom haptic audio/springs when documented with `[Beyond-Baseline: <craft rationale>]`.
