# Better Typography System (`/type`) & Zero-CLS Font Loading Reference

Companion reference for [`../SKILL.md`](../SKILL.md) synthesizing `jpoindexter/typography-skills` and `Hue`'s explicit monospace flags.

---

## 1. Decision Procedures With Named Inputs (Never Arbitrary Constants)

Evaluate typography choices using four concrete inputs:
1. **Apparent Size (`x-height`)**: A `16px` typeface with a tall x-height reads larger than an editorial `16px` typeface with a compact x-height — adjust base `font-size` and tracking visually on `x-height`, not raw nominal pixels.
2. **Reading Distance**:
   - Handheld mobile (`~35cm`): slightly smaller base possible, tighter container (`~40 CPL`), concise `line-height` (`1.4–1.55`).
   - Desktop/Laptop (`50–70cm`): body `15–18px` depending on density, `45–75 CPL` measure, `line-height` `1.45–1.65`.
   - Presentation/TV (`3m+`): display dominance, minimal copy per frame.
3. **Density-Driven Modular Scale**:
   - **Dense Product UI / Admin (`Spec-Sheet`, `Precision`, `System Native`)**: `1.125` (Major Second) or `1.200` (Minor Third) keeps headings disciplined inside panels; pair with `>= 2` explicit `display` steps (`clamp()`) if sharing a system with marketing pages.
   - **Editorial / Gallery (`Monograph`, `Gallery`)**: Wider contrast ratio (`1.333`–`1.618`) with negative headline tracking (`-0.02em` to `-0.04em`).
   - Round computed token steps cleanly to whole/half pixels and keep **`space-above > space-below`** on headings so each heading binds visually to its following section.
4. **Monospace Intent (`mono_for_code` vs `mono_for_metrics`)**:
   - `mono_for_code: true` (`<code>`, `<pre>`, `<kbd>`, git SHAs, API keys).
   - `mono_for_metrics: true|false` (true for terminal/telemetry UIs; often `false` for consumer pricing/editorial cards that keep currency and counters in clean proportional sans + `tabular-nums`).

---

## 2. Zero-CLS Self-Hosted `.woff2` & Metric-Matched `@font-face` Fallbacks

Modern browsers partition HTTP caches by top-level origin, so public Google Fonts CDNs no longer provide cross-site caching benefits and add DNS/TLS round-trips.

- **Self-host `.woff2`** subsets (use `font-display: swap` or `optional` depending on LCP sensitivity).
- **Preload ceiling**: Preload at most `<= 2` critical above-the-fold `.woff2` files, ALWAYS including `crossorigin` even for same-origin URLs (without `crossorigin`, browsers double-fetch fonts):
  ```html
  <link rel="preload" href="/fonts/primary-latin.woff2" as="font" type="font/woff2" crossorigin />
  ```
- **Metric-Matched System Fallback (`CLS = 0`)**: Match local system metrics (`x-height` + character width + glyph geometry `G, W, a, y, g`) before generating overrides:
  ```css
  @font-face {
    font-family: "Primary Sans Fallback";
    src: local("Arial"), local("Helvetica Neue");
    size-adjust: 105%;
    ascent-override: 92%;
    descent-override: 22%;
    line-gap-override: 0%;
  }

  :root {
    --font-sans: "Primary Sans", "Primary Sans Fallback", ui-sans-serif, system-ui, sans-serif;
  }
  ```

---

## 3. Triple WCAG 2.2 Typography Gate + Grayscale & Locale Test

Never treat `1.4.3` color contrast alone as "accessible typography":
1. **WCAG 1.4.3 (Contrast)**: Normal text `>= 4.5:1`, large text `>= 3:1`.
2. **WCAG 1.4.4 (200% Zoom)**: Zoom browser to `200%` — zero clipped buttons, overlapping nav labels, or horizontal scroll.
3. **WCAG 1.4.12 (Text Spacing Override)**: Inject override bookmarklet (`line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important;`) and verify zero clipped cards/badges/inputs.
4. **Grayscale & Longest-Locale Check**: Desaturate screen to verify hierarchy holds via weight/size/whitespace alone, and test worst-case labels in expansive languages (German/Finnish ~`+35%` width).
