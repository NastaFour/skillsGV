---
name: frontend-slides-deck
description: "Trigger: frontend slides, html presentation, slide deck, pitch deck html, diagram design, architecture diagram, svg diagram, mermaid diagram. Use when creating zero-dependency interactive HTML slide presentations, converting PowerPoint/Markdown into web decks, or designing high-craft architectural diagrams (Mermaid, SVG, clean ASCII). Do NOT use for multi-page web apps or CRUD dashboards."
license: MIT
compatibility: "Compatible with Gentle-AI 4.3.1+, modern browsers, Mermaid, inline SVG, and single-file HTML5. Requires zero external runtime dependencies."
allowed-tools: Read Write Edit Bash(node:*,pnpm:*) Glob Grep
metadata:
  trigger: ["frontend slides", "html presentation", "slide deck", "pitch deck", "diagram design", "architecture diagram", "svg diagram", "presentacion html", "diagramas de arquitectura"]
  scope: "global, project"
  version: "1.0.0"
  author: skillsGV
---

# 📊 Frontend Slides Deck & High-Craft Diagram Design

Harmonized adaptation of **zarazhangrui/frontend-slides** (zero-dependency HTML slide decks) and **Diagram Design** (high-craft architectural SVG/Mermaid/ASCII visualizations). Fully aligned with `design-driven` (`DESIGN_SYSTEM.md`), `taste-skill`, and the 8 Archetypal Chassis.

---

## 🚫 Hard Invariants (Floor)

1. **ZERO RUNTIME DEPENDENCY SINGLE-FILE PORTABILITY**: HTML slide decks must run natively by opening `index.html` in any browser — zero `node_modules` required at view time, zero broken external CDN scripts Required for core slide navigation.
2. **ONE IDEA PER SLIDE & STRICT DENSITY CAP**: Never cram a wall of text onto a slide. Limit each slide to **1 core thesis headline + at most 3 supporting data points or 1 focal diagram/code walkthrough**.
3. **FULL KEYBOARD, TOUCH & PRINT ACCESSIBILITY**: Every deck must support `ArrowRight`/`ArrowLeft`/`Space`/`Home`/`End`, touch swipe gestures, an on-screen progress indicator (`1 / N`), `prefers-reduced-motion`, and clean `@media print` (`page-break-after: always` per slide for instant PDF export).
4. **DIAGRAM SYNTAX SAFETY**: In Mermaid diagrams, always quote node labels containing parentheses, brackets, or colons (`id["Label (Detail)"]`) and use only supported diagram types (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`, `xychart-beta`).

---

## 🏛️ 1. Slide Deck Archetypes & Design Read Pairing

Before generating slides, emit the **3-Line `Design Read`** referencing **Archetype A, B, E, or H** and anchor the deck in a cohesive visual preset (mapped to our semantic tokens `--surface-*`, `--text-*`, `--accent-*`, `--border-*`):

| Deck Archetype | Visual Character | Best For |
|---|---|---|
| **Archetype A — Technical Monograph (Swiss Editorial Deck)** | Warm alabaster paper (`oklch(0.98 0.01 85)`), exposed `1px` hairlines, high-contrast Serif + Mono | Technical RFCs, research talks, architecture reviews |
| **Archetype B — High-Craft Spec-Sheet (Executive Architecture Review)** | Crisp high-density 12-column bento grid, zero decorative gradients, verifiable comparison matrices | Board updates, financial/infrastructure proposals, post-mortems |
| **Archetype E — Atmospheric Minimalism & Dark Precision (Keynote Deck)** | Deep carbon (`oklch(0.13 0.01 260)`), subtle luminance borders, `tabular-nums` oversized KPIs | Product launches, developer tool demos, engineering all-hands |
| **Archetype H — Bespoke / Think Outside the Box (Exhibition Deck)** | Custom metaphor (e.g., blueprint cyanotype, terminal HUD, museum exhibition catalog) | Keynote storytelling (`[Beyond-Baseline: <reason>]`) |

---

## 📐 Phase 2: High-Craft Diagram Design (`Diagram Design` Protocol)

When embedding diagrams inside slides, documentation, or `TRD.md`/`APP_FLOW.md`:
1. **Choose the Right Medium**:
   - **Inline Bespoke SVG**: Best for hero architecture slides, data-flow pipelines, and visual metaphors where custom typography, exact OKLCH tokens, and subtle CSS pulse animations elevate comprehension.
   - **Mermaid (`flowchart LR/TD`, `sequenceDiagram`)**: Best for living markdown specifications (`TRD.md`, `APP_FLOW.md`, `odd/tasks/<feature>.md`).
   - **Box-Drawing ASCII (`┌─┐ │ └─┘`)**: Best for inline code comments, CLI help output, and terminal-native documentation.
2. **Visual Hierarchy in Diagrams**:
   - Limit any single diagram to **`<= 12` nodes**. If a system has 30 components, split it into a **Level-1 System Context Diagram** and **Level-2 Subsystem Zoom Diagrams**.
   - Color-code by **semantic role** (e.g., `--accent-primary` for the active critical path, `--surface-2` for existing infrastructure, `--accent-warning` for trust boundaries / external I/O) — never rainbow-color every box randomly.

---

## 🛠️ Canonical Single-File Slide Shell Blueprint

Structure HTML decks around `<section class="slide" data-slide="1">` with `100dvw x 100dvh` (`overflow: hidden` on screen, `overflow: visible` in `@media print`), fluid typography (`clamp()`), and a lightweight `<60`-line vanilla JS controller for keyboard, touch, URL hash (`#slide-3`), and speaker notes (`N` key toggle).

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Agents may elevate decks beyond static slides (`[Beyond-Baseline: <reason>]`) by embedding live interactive micro-sandboxes (e.g., interactive latency sliders, live algorithm steppers, or toggleable before/after architecture diffs) directly inside a slide.
