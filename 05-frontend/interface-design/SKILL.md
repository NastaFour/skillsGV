---
name: interface-design
description: Craft-first interface design for dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces, and interactive products. Covers layout hierarchy, semantic design tokens, interactive states, typographic intention, and visual polish. Use when designing, building, reviewing, or refining product UI where visual craft and consistency matter. Do NOT use for marketing landing pages or brand campaign copywriting.
allowed-tools: Bash(node:*) Read
license: MIT
metadata:
  trigger: ["interface design", "dashboard design", "SaaS UI", "admin panel UI", "craft UI", "design read"]
  scope: [global, project]
  version: "2.0.0"
---

# 🎨 Interface Design — Craft-First Product UI

Build product interfaces with the craft and polish of top design teams (Linear, Stripe, Vercel, Apple). Focuses on clear visual hierarchy, purposeful typography, semantic token architecture, and complete state handling.

---

## 🏛️ Craft Foundations (The Visual Floor)

### 1. Visual Hierarchy & Typographic Intention
- **One Focal Element Per View**: Every screen has a primary task. The focal element leads unmistakably through size, contrast, or surrounding whitespace; demote secondary actions into quiet structural tiers.
- **Weight and Opacity Over Raw Size**: A single font size (e.g. 14px) holds three clear tiers through weight and contrast alone (`primary: 600 / 100%`, `secondary: 500 / 70%`, `muted: 400 / 40%`).
- **Tabular Numbers**: Apply `font-variant-numeric: tabular-nums` to financial data, counters, timestamps, and table figures.

### 2. Spatial Rhythm & Elevation Architecture
- **Grid Discipline**: Use consistent multiples of 4px / 8px for spacing, padding, and gaps (`4, 8, 12, 16, 24, 32, 48px`).
- **Concentric Radii**: Maintain `outerRadius = innerRadius + padding` across nested rounded surfaces.
- **Semantic CSS Token Contract**:
  - Surfaces: `--surface-canvas`, `--surface-card`, `--surface-overlay`, `--surface-inset`
  - Text: `--text-primary`, `--text-secondary`, `--text-muted`
  - Borders: `--border-subtle`, `--border-default`, `--border-strong`
  - Accents: `--accent-primary`, `--accent-hover`, `--accent-subtle`
- **Quiet Elevation**: Prefer whisper-quiet lightness shifts (dark mode) or subtle layered ambient rings (light mode) over harsh solid black borders or heavy drop shadows.

### 3. Complete State Coverage (Non-Negotiable)
Every interactive element and data container MUST implement all applicable states:
- **Interactive Controls**: `default`, `hover`, `focus-visible`, `active`, `disabled`.
- **Data Containers**: `loading` (skeleton/spinner), `empty` (actionable guidance), `error` (recovery path).

---

## ⚡ Pre-Code Ceremony: Unified `Design Read`

Before writing or mutating UI code, declare the standard 3-line check (or 1-line Fast-Path for minor maintenance):

```
1. Direction / Chassis: [Archetype] — [Why it fits the domain]
2. Hierarchy & Tokens:  [Hero element, --surface-*, --accent-*]
3. Craft Signature:     [Fine detail, micro-interaction, or [Beyond-Baseline: <reason>]]
```

---

## 🚀 Floor, Not Ceiling (Craft Baseline > Dogma)

> [!TIP]
> This skill defines the engineering and aesthetic floor (contrast, accessibility, complete states, spacing rhythm). You are explicitly authorized and encouraged to propose or implement superior visual patterns, modern CSS features, bespoke layouts, and expressive micro-interactions whenever they elevate the user experience (`[Beyond-Baseline: <reason>]`).

---

## 📚 In-Depth Craft Reference

For extended essays on overcoming AI defaults, domain color world exploration, motion timing curves, and deep-dive design examples, consult [`references/craft-principles.md`](references/craft-principles.md).
