---
name: tailwind-4
description: "Tailwind CSS 4 patterns — cn() utility, semantic @theme token classes (never var(), hex, or raw palette literals in className), style constants for chart libraries, and responsive/dark-mode patterns. Use when styling with Tailwind 4 so the AI avoids the className-as-inline-CSS anti-pattern. Do NOT use for legacy Tailwind v3 configuration or non-Tailwind CSS-in-JS."
license: Apache-2.0
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Tailwind CSS 4+, Node 20+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["tailwind 4", "tailwind css 4", "cn utility", "clsx twmerge", "dark mode", "responsive", "theme variables"]
  scope: [global, project]
  version: "1.2.0"
---

# Tailwind CSS 4

> [!IMPORTANT]
> Consult [_shared/references/docs-cache/tailwind-4.md](../../_shared/references/docs-cache/tailwind-4.md) before querying Context7

## Styling Decision Tree

```
Semantic @theme token exists? → className="bg-surface-primary text-text-primary"
Dynamic runtime value?        → style={{ width: `${x}%` }}
Conditional styles?           → cn("base", condition && "variant")
Static only?                  → className="..." (no cn() needed)
Library can't use class?      → style prop with var(--...) constants
```

## Bridging DESIGN_SYSTEM.md Tokens via `@theme`

Tailwind CSS 4 replaces `tailwind.config.js` with CSS-first `@theme` definitions. Always map your semantic design tokens (defined in OKLCH or HSL custom properties per `design-driven`) into Tailwind utility classes so components pass `token-audit.mjs` with zero hardcoded colors:

```css
@import "tailwindcss";

:root {
  --surface-primary: oklch(0.99 0.002 240);
  --surface-elevated: oklch(0.96 0.004 240);
  --text-primary: oklch(0.18 0.01 240);
  --text-secondary: oklch(0.45 0.015 240);
  --accent-primary: oklch(0.55 0.18 255);
  --accent-hover: oklch(0.48 0.18 255);
  --border-subtle: oklch(0.88 0.008 240);
}

.dark {
  --surface-primary: oklch(0.14 0.01 240);
  --surface-elevated: oklch(0.19 0.012 240);
  --text-primary: oklch(0.95 0.005 240);
  --text-secondary: oklch(0.68 0.01 240);
  --accent-primary: oklch(0.65 0.17 255);
  --accent-hover: oklch(0.72 0.16 255);
  --border-subtle: oklch(0.26 0.012 240);
}

@theme inline {
  --color-surface-primary: var(--surface-primary);
  --color-surface-elevated: var(--surface-elevated);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-fg-primary: var(--text-primary);
  --color-fg-secondary: var(--text-secondary);
  --color-accent-primary: var(--accent-primary);
  --color-accent-hover: var(--accent-hover);
  --color-border-subtle: var(--border-subtle);
}
```

## Critical Rules

### Never Use `var()` in `className`

```tsx
// ❌ NEVER: arbitrary var() in className
<div className="bg-[var(--surface-primary)]" />

// ✅ ALWAYS: Use Tailwind semantic classes mapped via @theme
<div className="bg-surface-primary" />
```

### Never Use Hex Literals or Unmapped Raw Palette Classes

```tsx
// ❌ NEVER: Hex colors or raw unmapped palette utilities in components
<p className="text-[#ffffff] bg-blue-500" />

// ✅ ALWAYS: Use semantic token classes backed by OKLCH/HSL CSS variables
<p className="bg-accent-primary text-surface-primary" />
```

## The `cn()` Utility

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### When to Use `cn()`

```tsx
// ✅ Conditional classes
<div className={cn("bg-surface-primary", isActive && "bg-surface-elevated")} />

// ✅ Merging component props with potential utility conflicts
<button className={cn("px-4 py-2 bg-accent-primary text-surface-primary", className)} />

// ✅ Multiple semantic variants
<div
  className={cn(
    "rounded-lg border border-border-subtle",
    variant === "primary" && "bg-accent-primary text-surface-primary",
    variant === "secondary" && "bg-surface-elevated text-text-primary",
    disabled && "opacity-50 cursor-not-allowed"
  )}
/>
```

### When NOT to Use `cn()`

```tsx
// ❌ Static classes - unnecessary runtime wrapper
<div className={cn("flex items-center gap-2")} />

// ✅ Just use className directly
<div className="flex items-center gap-2" />
```

## Style Constants for Charts/Libraries

When third-party canvas/SVG libraries don't accept `className` (like Recharts or Visx):

```tsx
// ✅ Constants with var() - ONLY for imperative/SVG library props
const CHART_COLORS = {
  primary: "var(--accent-primary)",
  surface: "var(--surface-elevated)",
  text: "var(--text-secondary)",
  gridLine: "var(--border-subtle)",
};

<XAxis tick={{ fill: CHART_COLORS.text }} />
<CartesianGrid stroke={CHART_COLORS.gridLine} />
```

## Dynamic Values

```tsx
// ✅ style prop for truly runtime-computed coordinates or percentages
<div style={{ width: `${percentage}%` }} />

// ✅ CSS custom properties for dynamic runtime interpolation
<div style={{ "--progress": `${value}%` } as React.CSSProperties} />
```

## Common Patterns

### Flexbox & Grid

```tsx
<div className="flex items-center justify-between gap-4" />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" />
```

### States & Responsive

```tsx
<button className="bg-accent-primary text-surface-primary hover:bg-accent-hover focus-visible:ring-2 active:scale-95" />
<div className="w-full md:w-1/2 lg:w-1/3 hidden md:block" />
```

### Dark Mode via Semantic Tokens

Prefer switching `--surface-*`, `--text-*`, and `--border-*` in CSS (`.dark`) rather than duplicating `dark:*` classes on every component:

```tsx
// ✅ Preferred: Automatic adaptation through semantic tokens
<section className="bg-surface-primary text-text-primary border border-border-subtle">
  <p className="text-text-secondary">Adapts to light and dark themes automatically.</p>
</section>
```

## Arbitrary Structural Values (Escape Hatch)

```tsx
// ✅ OK for one-off structural grid/sizing values not in the spacing scale
<div className="grid-cols-[1fr_2fr_1fr]" />

// ❌ Never use arbitrary values for colors — register semantic tokens in @theme
<div className="bg-[#1e293b]" /> // NO
```

## Floor, Not Ceiling (`[Beyond-Baseline]`)

Semantic `@theme` tokens (`bg-surface-*`, `text-text-*` / `text-fg-*`, `bg-accent-*`, `border-border-*`) are the engineering floor that keeps `DESIGN_SYSTEM.md`, `design-driven`, and `token-audit.mjs` aligned.

When a project requires specialized visual treatments beyond standard semantic surfaces—such as multi-stop perceptual OKLCH mesh gradients, data-visualization categorical palettes, or bespoke CSS Houdini / shader uniforms—define dedicated scoped custom properties in `@theme` and annotate the architectural decision with `[Beyond-Baseline: <technical/creative reason>]`.

## Keywords
tailwind, css, styling, cn, utility classes, responsive, semantic tokens, oklch
