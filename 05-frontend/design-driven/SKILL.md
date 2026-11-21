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

## 🔄 The 3-Phase Frontend Engine v4 (Temporal Split)

1. **Phase 1 — 1-Message Creative Pitch & `DESIGN_SYSTEM.md` Contract (Thin Orchestrator)**:
   - Run the **1-Message 3-Concept Creative Pitch** ([`references/d1b-questionnaire.md`](references/d1b-questionnaire.md)), proposing 3 concrete domain-tailored Signature concepts gated by the **Domain Eligibility Matrix** (no gimmicky 3D on CRUD/admin/docs/lead-gen; `Immersive 2D/3D/Shader` unlocked for Brand/Studio/Portfolio/Launch/Media or explicit request). One-shot auto-inference applies only on `"one-shot"` / `"sorprendeme"` / swarms.
   - Persist [`references/design-system-template.md`](references/design-system-template.md) into `DESIGN_SYSTEM.md` with its 3 machine-readable header blocks: **`## Runtime Contract`** (`<= 30` lines), **`## Craft Budget`** (`signature_skill`, `focal_zone`, `quiet_zones`, `guards`), and **`## Capability & Skill Manifest`** (`chassis`, `phase2_skills <= 5`, `phase3_skills <= 3`, `gates`).
2. **Phase 2 — Positive-Only Canvas (`frontend-builder`, Zero Audit Skills)**:
   - Load ONLY `DESIGN_SYSTEM.md` + stack (`tailwind-4`/`react-19`/`nextjs-15`/`openseo`) + tactile craft ([`micro-interactions`](../../02-dev-roles/micro-interactions/SKILL.md) — concentric radii, optical padding, press `0.96`, OKLCH shadows; [`emil-kowalski`](../emil-kowalski/SKILL.md) + Disney choreography) + the Pitch's situational skills (`motion-gsap`, `three-js-web`, `scroll-world-storytelling`, `shader-dev`, `visual-effects`, `frontend-slides-deck`, `web-animation-sources`, `modern-web-guidance`).
   - **Prohibition**: Audit/critique skills (`taste-skill`, `impeccable`, `web-design-guidelines`, `ai-design-check-stageshow`, `refactoring-ui`) are **FORBIDDEN** during Phase 2 so conflicting rules never paralyze creative composition. For Astro, bind interactive pieces cleanly via `client:visible` / `client:idle` with `astro:before-swap` cleanup.
3. **Phase 3 — Deterministic Geometry First + Blind Subtractive Critic**:
   - **Layer 0 (`0` LLM tokens — ALL edits)**: Run `node 05-frontend/design-driven/scripts/verify-frontend-gates.mjs --srcDir src --webDir .` (or `.agents/skills/design-driven/scripts/...`). For live apps/greenfield/major builds, add `--live <url>` (chains `ui-diff` + `legacy-scan` across `.astro/.tsx/.vue/.svelte`, catching sibling alignment drift, fold clipping, overflow, and mobile tap targets `< 40px`). **If Layer 0 reports geometry failures, short-circuit back to builder without spending vision tokens.**
   - **Layer 1 (Greenfield / `>= 3` routes / `> 200` UI lines)**: Dispatch **1 blind `frontend-critic`** receiving ONLY `(DESIGN_SYSTEM.md, git diff, Layer 0 telemetry, 1 stitched 2×2 Contact Sheet PNG)` loading `web-design-guidelines` + `phase3_skills` (`impeccable` | `ai-design-check-stageshow` | `refactoring-ui` | `humanizer`) under a **Subtractive-Only Charter** (align, declutter, deslop; **forbidden** from reverting `[Beyond-Baseline]` into generic SaaS cards). Hard cap: **max 1 fix + 1 Layer 0 recheck**.

## 🏛️ The 8 Archetypal Chassis & Unified 3-Line `Design Read`

- **A. `Technical Monograph`** `[7,2,8]` · **B. `Industrial Spec-Sheet`** `[3,1,9]` · **C. `The Gallery`** `[9,4,2]` · **D. `The Kinetic Utility`** `[4,8,7]` · **E. `The Precision Instrument`** `[4,5,7]` · **F. `The Humanist Companion`** `[5,4,5]` · **G. `The System Native`** `[3,2,7]` · **H. `Bespoke / Out of the Box`** (Cliché Inversion + Cross-Domain Metaphor + 3 Mechanical Laws + `[Beyond-Baseline]`).

```text
Design Read:
1. Direction/Chassis: [Archetype A-H] — [Target audience & Think-Outside-the-Box thesis]
2. Hierarchy & Tokens: [--surface-*, --text-*, --accent-*, --border-* in OKLCH + typographic scale]
3. Craft Signature: [3 mechanical rules + focal zone signature [Beyond-Baseline: <reason>]]
```
