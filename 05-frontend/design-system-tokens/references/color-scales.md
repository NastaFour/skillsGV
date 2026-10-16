# Color Scales

## Why HSL Not HEX

HSL allows dynamic manipulation: change lightness for shades, saturation for vibrancy, hue for variants. HEX is opaque.

```css
/* BAD: can't derive shades */
--color-primary: "#0ea5e9";

/* GOOD: can generate full scale by changing lightness */
--color-primary-500: hsl(199 89% 48%);
--color-primary-400: hsl(199 89% 60%);  /* +12% lightness */
--color-primary-600: hsl(199 89% 40%);  /* -8% lightness */
```

## Scale Generation Formula

From a base color (500), generate the full 50-950 scale:

| Shade | Lightness delta | Usage |
|---|---|---|
| 50 | +48% | Page background tint |
| 100 | +42% | Hover background |
| 200 | +32% | Active background |
| 300 | +22% | Border accent |
| 400 | +12% | Hover text |
| 500 | base (0) | DEFAULT — buttons, links, accents |
| 600 | -8% | Button hover |
| 700 | -16% | Button active |
| 800 | -24% | Dark backgrounds |
| 900 | -32% | Darker backgrounds |
| 950 | -40% | Darkest — page bg in dark mode |

## Semantic vs Primitive Tokens

**Primitive**: raw color values (`--color-primary-500`)
**Semantic**: role-based (`--color-accent`, `--color-success`)

```css
/* Primitive (don't use directly in components) */
--color-primary-500: hsl(199 89% 48%);
--color-green-500: hsl(142 71% 45%);

/* Semantic (use in components) */
--color-accent: var(--color-primary-500);
--color-success: var(--color-green-500);
--color-button-bg: var(--color-accent);
--color-button-hover: var(--color-primary-600);
```

This lets you re-theme without touching components — just change the semantic mapping.

## Dark Mode Strategy

Don't create separate dark palettes. Use the same scale, swap semantic mappings:

```css
:root {
  --color-bg: var(--color-neutral-50);
  --color-surface: var(--color-neutral-100);
  --color-text-primary: var(--color-neutral-900);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: var(--color-neutral-950);
    --color-surface: var(--color-neutral-900);
    --color-text-primary: var(--color-neutral-50);
  }
}
```

## Modern Color Space: OKLCH & Canonical Semantic Tokens

While HSL is widely supported, **OKLCH** is the preferred modern format for design systems because of its perceptual uniformity (lightness is consistent across hues, preventing optical contrast illusions).

The canonical semantic token contract standardizes surfaces, text, borders, and accents:

```css
:root {
  /* Surfaces */
  --surface-base: oklch(0.98 0.005 240);       /* Canvas / general background */
  --surface-raised: oklch(1.00 0.000 0);        /* Cards / modals (alias: --surface-card) */
  --surface-card: var(--surface-raised);
  --surface-overlay: oklch(0.95 0.008 240);     /* Hover / elevated layers */

  /* Text & Contrast (WCAG 2.2 AA) */
  --text-primary: oklch(0.15 0.010 240);        /* Headings & body copy */
  --text-secondary: oklch(0.45 0.015 240);      /* Captions, metadata, subtitles */
  --text-muted: oklch(0.60 0.010 240);          /* Placeholders, disabled states */

  /* Borders */
  --border-subtle: oklch(0.90 0.005 240);       /* Dividers and container outlines */
  --border-focus: var(--accent-primary);        /* High-contrast focus rings */

  /* Accents */
  --accent-primary: oklch(0.55 0.220 142);      /* Primary CTA & active indicator (sat < 80%) */
  --accent-foreground: oklch(0.99 0.000 0);     /* Text on accent */
}

/* Dark Theme Mapping */
[data-theme="dark"], .dark {
  --surface-base: oklch(0.14 0.010 240);
  --surface-raised: oklch(0.18 0.012 240);
  --surface-card: var(--surface-raised);
  --surface-overlay: oklch(0.22 0.015 240);

  --text-primary: oklch(0.96 0.005 240);
  --text-secondary: oklch(0.70 0.010 240);
  --text-muted: oklch(0.50 0.010 240);

  --border-subtle: oklch(0.26 0.010 240);
  --border-focus: var(--accent-primary);

  --accent-primary: oklch(0.65 0.200 142);
  --accent-foreground: oklch(0.10 0.000 0);
}
```

## Accent Color Palette Ideas (Non-Generic)

To avoid "AI slop" blue defaults, consider these distinctive palettes:

| Vibe | Hue | Sat | Light (500) | Example |
|---|---|---|---|---|
| Cyberpunk neon | 280 (purple) | 90% | 65% | `hsl(280 90% 65%)` |
| Warm sunset | 25 (orange) | 85% | 55% | `hsl(25 85% 55%)` |
| Forest premium | 160 (teal) | 70% | 40% | `hsl(160 70% 40%)` |
| Royal elegant | 265 (violet) | 80% | 50% | `hsl(265 80% 50%)` |
| Electric energy | 50 (yellow) | 95% | 55% | `hsl(50 95% 55%)` |
| Ice premium | 195 (cyan) | 85% | 50% | `hsl(195 85% 50%)` |
