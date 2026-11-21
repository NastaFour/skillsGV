# Editorial HTML + SVG Diagram Craft (`diagram-design` Patterns)

Use self-contained HTML + inline `<svg>` when building explanatory architecture figures, exploded stack diagrams, or process pipelines on web pages or decks — eliminating "Mermaid slop" (generic rounded boxes, muddy drop shadows, and crooked auto-routing).

## 🎨 Editorial Diagram Laws

1. **Brand Token Match**: Read `DESIGN_SYSTEM.md` (`--surface-base`, `--surface-raised`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--border-subtle`) directly into SVG `stroke`/`fill` CSS vars so the diagram looks native to the page in both light and dark modes.
2. **Restrained Palette & Hairline Geometry**: Use neutral surface fills + `1px` crisp strokes (`stroke-width="1"` with `vector-effect="non-scaling-stroke"`) and **1 single primary accent color** exclusively for the active critical path or focal node. Zero random rainbow boxes.
3. **Node & Label Budget (`<= 12` Nodes)**:
   - Label every diagram with an editorial figure header (`FIG. 01 · SYSTEM ARCHITECTURE`) and short 1–3 word titles inside nodes (`tabular-nums` for latencies/counts).
   - Keep connector paths orthogonal (`M x1 y1 H xm V y2 H x2`) or clean quadratic curves with crisp `4px` arrowheads (`<marker>`).
4. **High-Craft Visual Archetypes**:
   - **Exploded Isometric / Axonometric Stack**: `rotateX(55deg) rotateZ(-45deg)` or SVG skewed planes with side callout leader lines linking each layer to a concise spec note.
   - **Swimlane Sequence / Request Flow**: Crisp horizontal time lanes, hairline vertical lifelines, dashed return arrows, and inline pill timing markers along the critical path.
   - **State Machine / Lifecycle Graph**: Distinct start/terminal rings, orthogonal transition arcs with condition labels placed cleanly off the line (`paint-order: stroke`).
5. **Accessibility**: Include `role="img"`, `<title>`, and `<desc>` inside the root `<svg>`, plus `viewBox` without fixed pixel widths so the figure scales cleanly down to `390px` mobile without overflow.
