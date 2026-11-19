---
name: web-design-guidelines
description: "Review UI code for Web Interface Guidelines compliance using an embedded offline 25-rule baseline (with optional live upstream refresh). Use when asked to review UI, check accessibility, audit design, or run Phase 3 frontend verification. Do NOT use for backend APIs or non-visual libraries."
metadata:
  trigger: ["web design guidelines","guias de diseno web","accesibilidad web","wcag","jerarquia visual"]
  author: vercel
  version: "1.1.0"
  argument-hint: <file-or-pattern>
allowed-tools: Bash(node:*) Read
license: MIT
---

# Web Interface Guidelines (Offline Baseline + Optional Live Refresh)

Audit web UI files against the 25-rule offline baseline below (zero network dependency), and optionally refresh from the upstream Vercel guidelines URL when online access is available.

## Embedded Offline Baseline (25 Core Rules)

### Accessibility & Keyboard
1. Use native interactive HTML (`<button>`, `<a>`, `<dialog>`, `<input>`) — never `<div onClick>` without full keyboard & ARIA semantics.
2. Provide visible `:focus-visible` outlines (`>= 2px`, `>= 3:1` contrast); never strip outlines without a stronger replacement.
3. Guard `Enter` submit handlers against IME composition (`!e.nativeEvent.isComposing && e.keyCode !== 229`).
4. Set `scroll-margin-top` on anchored headings/sections so sticky headers never obscure focused elements (`focus-not-obscured`).
5. Use semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) and a single `<h1>` per page.
6. Announce dynamic filters, counters, toasts, and validation errors via `aria-live="polite"` or `role="alert"`.
7. Restore focus to the trigger element when closing modals/drawers (checking `isConnected` before calling `.focus()`).
8. Provide accessible `aria-label` on icon-only buttons and `aria-hidden="true"` on decorative icons/SVGs.

### Touch, Hit Targets & Forms
9. Enforce touch/click hit targets `>= 40–44px` on mobile/coarse pointers (`>= 24x24px` minimum on compact desktop controls).
10. Keep mobile form `<input>` / `<select>` / `<textarea>` font-size `>= 16px` under `@media (pointer: coarse)` to prevent iOS Safari auto-zoom.
11. Gate hover-only styles inside `@media (hover: hover) and (pointer: fine)` to eliminate sticky hover states on touchscreens.
12. Pair every form control with an explicit `<label htmlFor>` (placeholders are not labels), inline error text, and `autocomplete` hints where relevant.
13. Prevent double-submit on async forms with explicit loading/disabled states and real error recovery.
14. Use `touch-action: manipulation` on interactive controls to eliminate mobile tap delay.

### Typography, Layout & Responsiveness
15. Enforce WCAG 2.2 AA contrast (`>= 4.5:1` body text, `>= 3:1` large text & UI boundaries) in both light and dark modes.
16. Constrain long-form prose to `45–75ch` (`~40ch` mobile) with `line-height: 1.5–1.7`; never use `font-mono` for narrative paragraphs.
17. Apply `font-variant-numeric: tabular-nums` on dynamic counters, prices, timers, and numeric columns.
18. Use `text-wrap: balance` on display headings and `text-wrap: pretty` on body prose; protect compact badges/units with `whitespace-nowrap`.
19. Verify zero horizontal page overflow (`scrollWidth <= clientWidth`) from `375px` to `1440px`, and use `min-h-[100dvh]` instead of `h-screen`.
20. Prevent mid-word breakage on long identifiers/URLs/packages using deliberate `break-words` / `truncate` + title tooltip.

### Motion, Media & State Hygiene
21. Honor `@media (prefers-reduced-motion: reduce)` by collapsing non-essential motion to instant or opacity-only transitions.
22. Animate only GPU-composited properties (`transform`, `opacity`, `clip-path`) — never `transition: all` or layout properties (`width`, `height`, `top`, `left`).
23. Provide `overscroll-behavior: contain` inside scrollable modals/drawers to avoid background scroll chaining.
24. Include explicit empty, loading, error, and populated states for every data-driven view (zero `Lorem ipsum`, zero unwired buttons).
25. Supply `@supports not (backdrop-filter: ...)` fallbacks for glass/blurred backdrops and reserve explicit image dimensions (`width`/`height` or `aspect-ratio`) to prevent CLS.

## Optional Live Refresh & Output Format

When online `WebFetch` is available and a fresh upstream diff is requested, optionally fetch:
```text
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Report findings tersely in `file:line — [rule] — fix` format.
