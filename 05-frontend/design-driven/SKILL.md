---
name: design-driven
description: "Trigger: design-driven, design gate, D1b, DESIGN_SYSTEM.md, design read, think outside the box, chasis arquetipico, verify-frontend-gates, frontend studio. Use before generating or refactoring any UI/frontend to run the 3-Phase Frontend Engine v4 (Phase 1 1-message Creative Pitch & DESIGN_SYSTEM.md manifest, Phase 2 Positive-Only Canvas with <=5 capability skills, Phase 3 deterministic DOM-geometry/ui-diff gate + blind Subtractive critic). Do NOT use for backend-only services without visual surfaces."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*,pnpm:*,git:*) Read Write
allows-script-exec: "verify-frontend-gates.mjs spawns sibling skill audit scripts via node:child_process"
metadata:
  trigger: ["design-driven", "design driven", "DESIGN_SYSTEM.md", "design system", "ui mockup", "ux validation", "color palette", "stitch", "d1b", "think outside the box", "verify-frontend-gates", "frontend studio"]
  scope: [global, project]
  version: "4.0.0"
---

# 🎨 Design-Driven Development v4 — Frontend Engine, Creative Pitch & Visual Gate

Enforces intentional, anti-slop UI across **2 execution tiers** and **3 non-blocking phases** (`<= 5` skills/turn) anchored on **`DESIGN_SYSTEM.md`**, the **3-Line `Design Read`**, **`verify-frontend-gates.mjs`**, and **`ui-diff`**.

## 🚦 Execution Topology & User API-Key Model Protocol

- **Tier 0 — Inline Fast-Path (`< 50` UI lines / tweak, single surface, `builder_model == inherit`)**: Read `DESIGN_SYSTEM.md` `## Runtime Contract`, emit a 1-line `Design Read`, edit inline, run `verify-frontend-gates.mjs` (`0` subagents).
- **Tier 1 — Frontend Studio (Greenfield, archetype overhaul, `>= 2` visual/kinetic domains, or Model-Offload)**:
  - Main orchestrator stays **thin** (`0` heavy craft skills loaded in coordinator context), runs Phase 1 Creative Pitch, writes `DESIGN_SYSTEM.md`, and dispatches **`frontend-builder`** (Phase 2) + **1 blind `frontend-critic`** (Phase 3) with exact `## Allowed edit surfaces` + `## Skills to load before work`.
  - **User API-Key Model Override (`L1–L4`)**: If the user specifies `--frontend <model>` / `--agent frontend-builder:<model>` or picks a model in D1b, pass it across `L1` (per-call ID) → `L2` (tier enum) → `L3` (`apply.mjs` config) → `L4` (host inherit) and print `[ModelDispatch: role=<r> requested=<p> resolved=<m> level=L<1-4>]`. **If the runtime/API key rejects or lacks that model, fail fast and ask for a valid model ID (or explicit `inherit`) — NEVER silently downgrade to `cheap`.**

## 🚫 Hard Invariants vs Open Creative Upper-Bound (`Floor, Not Ceiling`)

- **Floor**: (1) Prior 3-line `Design Read` (1-line `< 50` lines); (2) Real domain data + full states (`hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`); (3) Semantic OKLCH tokens (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`); (4) WCAG 2.2 AA, `prefers-reduced-motion`, zero `0–2px` wireframe box-walls and zero `" / "` clutter.
- **Ceiling (`[Beyond-Baseline]`)**: Archetypes `A–G` are launchpads; **Archetype H (`Bespoke`)** unlocks bold lateral aesthetics governed by the **`Rule of One` (`Craft Budget`)**: 1 high-craft focal zone, 80% calm readable canvas.
- **On-Demand Detail / Reference Fidelity**: Default Phase 2 builds prioritize clean verified real media (`naturalWidth > 0`), DOM geometry, typography hierarchy, and tactile micro-interactions; heavy procedural texturing, bespoke multi-part vector emblems, and shader post-processing remain **opt-in** when explicitly requested or anchored to a user-supplied reference image extracted in Phase 1.

## 🔄 The 3-Phase Frontend Engine v4 (Subagent Context-Split across All Frontend Skills)

Divide work across **phase-scoped subagents** (`<= 5` skills per subagent context; spawn parallel/staged subagent slices `2A`+`2B` or `3A`+`3B` when a build spans multiple domains so **100% of relevant catalog skills get used without overloading any single agent**):

1. **Phase 1 — D1b Questions + 3-Concept Creative Pitch & `DESIGN_SYSTEM.md` (Orchestrator + Optional Discovery Subagent)**:
   - Run the **1-Message 3-Concept Creative Pitch + 5 D1b Design Questions** ([`references/d1b-questionnaire.md`](references/d1b-questionnaire.md)) gated by the **Domain Eligibility Matrix**.
   - **Phase 1 Skills (DNA, Tokens, Copy, CRO & Assets — load or delegate before freezing `DESIGN_SYSTEM.md`)**:
     - *Reference & DNA Extraction*: `hallmark-design-study`, `component-scrapper-mcp`, `figma-mcp`, `figma-implement`, `open-design`
     - *Tokens & Brand*: `design-system-tokens`, `oklch-theme-injector`, `brand-guidelines`
     - *Messaging & CRO*: `storybrand-messaging`, `copywriting`, `lean-ux`, `page-cro`, `onboarding-cro`, `signup-flow-cro`, `popup-cro`
     - *Visual Assets*: `nano-banana`, `banana-claude`, `asset-generator-mcp`
   - Persist [`references/design-system-template.md`](references/design-system-template.md) into `DESIGN_SYSTEM.md` (`## Runtime Contract`, `## Craft Budget`, and `## Capability & Skill Manifest` listing the exact `phase2a`, `phase2b`, `phase3a`, `phase3b` skills).

2. **Phase 2 — Positive-Only Canvas (`frontend-builder`: 1-Builder Default vs. `data-kinetic-*` Disjoint Island Split)**:
   - **Default Topology (`<= 5` build skills or `< 250` UI lines)**: Spawn **1 `frontend-builder`** that includes `micro-interactions` + `emil-kowalski` in its baseline so tactile choreography and structure are authored in one pass with zero handoff overhead.
   - **Multi-Domain Island Topology (`needsBuilder2B == true`, `> 5` build skills, or heavy 3D/Shader/GSAP focal island)**: Split **vertically by disjoint file surfaces** using the **TRIZ `data-kinetic-*` Anchor Contract** declared in `DESIGN_SYSTEM.md`:
     - **Builder `2A` (Core Stack, Structure, Forms, State & Platform — `src/components/**`, `src/sections/**`, `src/pages/**`, `src/styles/**`)**:
       - Stamps declarative `data-kinetic-root`, `data-kinetic-item`, and `data-kinetic-canvas` hooks on the focal zone DOM without importing heavy WebGL/GSAP timelines.
       - *Web Stack & Foundations*: `tailwind-4`, `react-19`, `nextjs-15`, `react-vite`, `vercel-composition-patterns`, `vercel-react-best-practices`, `frontend-design`, `ui-ux-pro-max`, `ai-ui-generation`, `modern-web-guidance`, `micro-interactions`, `emil-kowalski`
       - *Forms, Data, State, i18n & Perf*: `forms-validation-react`, `zod-4`, `zustand-5`, `prisma-frontend-types`, `i18n-localization`, `lazy-loading-patterns`, `openseo` (Astro Local SEO)
       - *Angular / Mobile / Desktop*: `angular-core`, `angular-architecture`, `angular-forms`, `angular-performance`, `react-native`, `pwa-capacitor`, `electron`, `deep-linking-mobile`, `offline-sync-mobile`, `push-notifications`, `maps-gps`
     - **Builder `2B` (Isolated Kinetic / 3D / Shader / Deck Island — `src/kinetic/**`, `src/shaders/**`)**:
       - Attaches GSAP/ScrollTrigger timelines, R3F/Three.js canvases, or GLSL shaders exclusively via `[data-kinetic-*]` selectors or isolated island components in `src/kinetic/**` and `src/shaders/**` (zero file overlap with `2A`).
       - *Tactile & Physics Choreography*: `micro-interactions`, `emil-kowalski` (Disney choreography), `motion-framer`, `lottie-animations`, `page-transitions`, `vercel-react-view-transitions`
       - *Scroll, 3D, Shaders & Decks*: `motion-gsap`, `scroll-animations`, `scroll-world-storytelling`, `three-js-web`, `shader-dev`, `visual-effects`, `web-animation-sources`, `motion-video-pipeline`, `frontend-slides-deck` (editorial SVG diagrams)
   - **Prohibition**: Audit/critique skills (`taste-skill`, `impeccable`, `web-design-guidelines`, `ai-design-check-stageshow`, `refactoring-ui`, `interface-design`, `ux-auditor-agent`) are **FORBIDDEN** during Phase 2 (`skill-router.mjs --phase 2a|2b` strips them deterministically).

3. **Phase 3 — Deterministic Geometry First + Read-Only Blind Subtractive Critics (`frontend-critic` `3A` & `3B`)**:
   - **Layer 0 (`0` LLM tokens — ALL edits)**: Run `node 05-frontend/design-driven/scripts/verify-frontend-gates.mjs --srcDir src --webDir .` (add `--live <url>` on live/greenfield/major builds to chain `ui-diff`, `legacy-scan`, `token-audit`, `check-interactions`, `motion-accessibility`, `build-config-validator`, and `check-offline-sync` / `check-deep-links` on mobile). Short-circuit back to builder on geometry failures.
   - **Layer 1 (Strictly Read-Only Blind Subtractive `frontend-critic` Subagents — 1 critic by default; split into `3A` & `3B` only on major builds when `> 5` evaluation skills apply)**:
     - **Critic `3A` (Visual Craft, Dials, Hierarchy & Anti-Slop)**: `impeccable`, `taste-skill`, `refactoring-ui`, `interface-design`, `ai-design-check-stageshow`
     - **Critic `3B` (UX, Accessibility, Guidelines, Copy Deslop & Debugging)**: `web-design-guidelines`, `ux-auditor-agent`, `motion-accessibility`, `humanizer` (`deslop`), `frontend-debugging-protocol`
     - **Read-Only Subtractive Charter**: Critics are **read-only evaluators** (`allowed_edit_surfaces: []`) that inspect `(DESIGN_SYSTEM.md, git diff, Layer 0 telemetry, 2×2 Contact Sheet PNG)` and return 1 unified subtractive punchlist (align, declutter, polish legibility — **forbidden** from reverting `[Beyond-Baseline]` into generic SaaS cards). The builder executes at most **1 remediation pass + 1 Layer 0 recheck**.

## 🏛️ The 8 Archetypal Chassis & Unified 3-Line `Design Read`

- **A. `Technical Monograph`** `[7,2,8]` · **B. `Industrial Spec-Sheet`** `[3,1,9]` · **C. `The Gallery`** `[9,4,2]` · **D. `The Kinetic Utility`** `[4,8,7]` · **E. `The Precision Instrument`** `[4,5,7]` · **F. `The Humanist Companion`** `[5,4,5]` · **G. `The System Native`** `[3,2,7]` · **H. `Bespoke / Out of the Box`** (Cliché Inversion + Cross-Domain Metaphor + 3 Mechanical Laws + `[Beyond-Baseline]`).

```text
Design Read:
1. Direction/Chassis: [Archetype A-H] — [Target audience & Think-Outside-the-Box thesis]
2. Hierarchy & Tokens: [--surface-*, --text-*, --accent-*, --border-* in OKLCH + typographic scale]
3. Craft Signature: [3 mechanical rules + focal zone signature [Beyond-Baseline: <reason>]]
```
