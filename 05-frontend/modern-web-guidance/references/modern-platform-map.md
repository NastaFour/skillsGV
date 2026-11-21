# Modern Web Platform Map (Script-Indexed Quick Reference)

Open ONLY the section matching a `guideRef` emitted by `legacy-scan.mjs`.

## Scroll-Driven Animations & Sticky Reveal {#scroll-driven-animations}
- Replace `window.addEventListener('scroll', ...)` + `window.pageYOffset` for reveal/progress bars with CSS:
  ```css
  .reveal { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }
  ```
- Always respect `@media (prefers-reduced-motion: reduce)`. Use JS (`motion-gsap` ScrollTrigger) ONLY for scrubbed multi-timeline pins approved in `Craft Budget`.

## Native Popover, Modal & Anchor Positioning {#popover-and-dialog}
- Replace custom backdrop/ESC/portal JS state machines with native `<dialog>` (`.showModal()`) or `[popover="auto"]` + `@starting-style` + CSS Anchor Positioning (`anchor-name` / `position-anchor`).
- Provide `@supports not (position-anchor: --x)` fallback positioning for older engines.

## Container Queries & CSS Subgrid {#container-queries-and-subgrid}
- Replace `ResizeObserver` breakpoint JS with `container-type: inline-size` + `@container (min-width: 32rem) { ... }`.
- Align card rows/headers across sibling bento/pricing columns using `grid-template-rows: subgrid; grid-row: span 3;`.

## Modern Viewport Units {#modern-viewport-units}
- Replace `100vh` / `h-screen` (which clips behind iOS/Android address bars) with `100svh` for hero sections and `100dvh` for locked full-viewport app shells (`Chasis D`).

## Async Clipboard API {#clipboard-api}
- Replace deprecated `document.execCommand('copy')` with `await navigator.clipboard.writeText(value)` inside `try/catch` + accessible `aria-live` confirmation.

## GPU-Composited Keyframes {#gpu-composited-keyframes}
- Replace `top` / `left` / `width` / `height` inside `@keyframes` with `transform: translate3d(...)` and `scale(...)` to keep animations off the main layout thread and protect INP.
