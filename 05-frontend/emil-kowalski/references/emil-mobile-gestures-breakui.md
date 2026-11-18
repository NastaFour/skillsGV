# Emil Kowalski Mobile-Native (11 Fixes), Gestures, UI Cheatsheet, Break-UI & Learn-Taste Reference

Companion reference for [`../SKILL.md`](../SKILL.md).

---

## 1. The 11 `mobile-native` Web Fixes

1. **Eliminate Sticky Hover on Touch**: Wrap all `:hover` styles inside `@media (hover: hover) and (pointer: fine) { ... }`.
2. **Suppress Android/iOS Tap Flash**: Apply `-webkit-tap-highlight-color: transparent` globally on interactive buttons/links, paired with an intentional `:active` state.
3. **Choose Viewport Units Deliberately**: Use `100dvh` for locked full-screen interactive **app shells** (`The Kinetic Utility`), and `100svh` for scrollable **heroes** so mobile URL bar collapse never causes layout jumps.
4. **Prevent iOS Input Auto-Zoom Without Breaking Zoom A11y**: Never disable pinch-zoom (`maximum-scale=1` is banned); instead, ensure `<input>`, `<select>`, and `<textarea>` use `font-size >= 16px` inside `@media (pointer: coarse)`.
5. **Instant Tap Feedback**: Apply `touch-action: manipulation` on buttons to drop legacy tap delays and style `:active` / `onPointerDown` responsively.
6. **Contain Rubber-Band Overscroll**: Set `overscroll-behavior: none` on `html, body` in native-feeling web apps and `overscroll-behavior: contain` inside scrollable sheets, drawers, and modals.
7. **Keyboard & Safe-Area Viewport Meta**: Configure `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">` and pad bottom/top bars with `env(safe-area-inset-top, 0px)` / `env(safe-area-inset-bottom, 0px)`.
8. **Surgical `user-select` Control**: Apply `user-select: none` strictly on interactive chrome (buttons, drag handles, tabs) — NEVER on `body`, articles, code blocks, or readable text.
9. **Directional Pan Lock in Carousels**: Set `touch-action: pan-y` on horizontal swipe tracks or `pan-x` on vertical scrubbers so page scroll and gesture axes never fight.
10. **Theme-Matched Browser Chrome**: Include dual `<meta name="theme-color" media="(prefers-color-scheme: light|dark)" content="...">` tags matching `--surface-base`.
11. **Dual-Axis Motion Respect**: Pair CSS `@media (prefers-reduced-motion: reduce)` with Framer/Motion `useReducedMotion()` across every spring and drag snap.

---

## 2. `gestures` (Velocity Flick & Rubber-Band Damping Checklist)

- Capture pointer on press (`e.currentTarget.setPointerCapture(e.pointerId)`) and abort multi-touch interference (`if (activePointerId !== null && e.pointerId !== activePointerId) return`).
- Dismiss drawers/toasts if drag offset crosses threshold (`distance > height * 0.4`) **OR** flick velocity passes `Math.abs(distance) / Math.max(elapsedMs, 1) > 0.11`.
- Apply progressive rubber-band resistance (`overflow / (1 + overflow / k)`) when dragged past bounds rather than hard clipping.

---

## 3. `break-ui` Extreme-Data Stress Matrix & `learn-taste` Loop

Test every interactive component against all 6 adversarial inputs before declaring done:
1. **Ultra-Short & Ultra-Long Strings**: 1-character names (`"A"`) alongside 80-character unbroken tokens/emails with `min-w-0`, `truncate`, or deliberate wrapping.
2. **High-Magnitude Metrics**: 7-digit counters (`1,284,990`), multi-currency decimals, `tabular-nums`, and pill overflow.
3. **Zero & Empty States**: `0` items, empty search query, zero unread badges (never show empty badges or `"0"` containers unintentionally).
4. **Locale-Correct Pluralization**: Use `Intl.PluralRules` / explicit singular-plural keys — never append naive `"(s)"`.
5. **Time Boundary Drift**: Relative labels (`"2h ago"`) transition cleanly into formatted absolute dates (`Intl.DateTimeFormat`) once age `> 7 days`.
6. **`learn-taste` Session Capture**: Whenever the human user corrects visual spacing, timing, radius, or color during review, encode the generalized invariant into `DESIGN_SYSTEM.md` so the correction never repeats.
