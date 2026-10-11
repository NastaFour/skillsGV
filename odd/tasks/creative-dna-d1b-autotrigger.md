# Feature: Creative DNA Archetypes, Generative Grammar & UI Auto-Trigger

- **Status**: IN PROGRESS
- **Branch**: feat/creative-dna-d1b-autotrigger
- **Engram Topic**: odd/creative-dna-d1b-autotrigger/tasks
- **Route**: Delegated Direct (Multi-file cross-cutting skill update)
- **Forecast Lines**: ~350 authored lines

## Objective
Implement the 6 Creative DNA Archetypes into D1b Block 2 (fusing dial calibration with archetype choice), define Generative Grammar (3 mechanical layout rules + spring physics per archetype), add a11y/Tufte safety locks, and auto-trigger the Design Gate in `skill-router.mjs` and `AGENTS.md` whenever frontend/UI tasks are encountered.

## Tasks

- [x] **T1: D1b Questionnaire & Dials Fusion**: Update `05-frontend/design-driven/references/d1b-questionnaire.md` and `05-frontend/taste-skill/references/dials.md` with the 6 Archetypes (Chassis vs Livery), auto-preset dials, and 3 Generative Mechanical Rules. (Commit: `d153883`)
- [x] **T2: Design-Driven & Taste-Skill Hardening**: Update `05-frontend/design-driven/SKILL.md`, `05-frontend/taste-skill/SKILL.md`, and `references/absolute-bans.md` with the auto-trigger contract, physics locks (spring physics per archetype), WCAG 2.2 12px clamp floor, zoned monospace, and anti-faux-density rules. (Commit: `19f517d`)
- [x] **T3: Auto-Trigger in Skill Router & Router Tests**: Update `00-meta-skills/skill-router/scripts/skill-router.mjs` with `UI_SURFACE_MARKERS` to automatically inject `design-driven` and `taste-skill` in `tier1toLoad` when UI queries are routed. Add unit tests in `test/router.test.mjs`. (Commit: `76c546f`)
- [x] **T4: ODD Contract & AGENTS.md Enforcement**: Update `AGENTS.md` and `00-meta-skills/odd-workflow/SKILL.md` to encode the non-negotiable Design Gate before writing any frontend/UI code. (Commit: `98f8f54`)
- [x] **T5: Catalog Integrity & Full Verification Suite**: Run `node 00-meta-skills/skill-registry/scripts/generate-indexes.mjs --write`, sync addon (`node scripts/sync-addon.mjs --write`), run `pnpm test` (136/136 pass), `pnpm validate:strict` (230/230 pass), `pnpm doctor` (6/6 pass), and `pnpm benchmark` (100% routing, 84.4% reduction).
- [x] **T6: Adversarial Judgment Day & RDD**: Ran RDD receipt capture (sha256:222c1e6d, acknowledged and burned) and 2 blind independent judges (Red Judge & Blue Judge). Both returned PASS WITH CONDITIONS. All 4 conditions remediated in commits `847e21f` and `59146c6`.
- [ ] **T7: Merge & Push to Origin**: Merge feature branch to main, run final validation check, and push to origin/main.

## Verification Evidence
- T1: Commit `d153883` — D1b questionnaire Bloque 2 fused with 6 archetypes and dials auto-presets; dials.md updated with quantitative spring physics.
- T2: Commit `19f517d` — design-driven and taste-skill hardened with header comment injection (`/* @design-archetype: ... */`), a11y floor clamp (min 12px), zoned monospace, anti-faux density.
- T3: Commit `76c546f` — skill-router UI_SURFACE_MARKERS auto-injects `design-driven` into `tier1toLoad`. Unit test in `test/router.test.mjs` verified (10/10 pass).
- T4: Commit `98f8f54` — AGENTS.md rule 4 and odd-workflow absolute ban 5 encode mandatory Design Gate before writing UI code.
- T5: Full verification green:
  - `pnpm validate:strict`: 230 pass · 0 errors · 0 warnings
  - `pnpm test`: 136 pass · 0 fail
  - `pnpm test:addon`: 3 pass · 0 fail
  - `pnpm doctor`: 6/6 passed
  - `pnpm benchmark`: 100% routing, 100% suite evals (164/164)
- T6: RDD & Judgment Day verification:
  - RDD receipt captured: `gentle-ai.review-acknowledged/v1` burned against hash `sha256:222c1e6d45230a492f68f0c64a7287812a686bfedbbcbcff82df79b7f279775b`.
  - Red Judge & Blue Judge blind adversarial evaluations: both returned PASS WITH CONDITIONS.
  - Condition fixes committed: `847e21f` (unicode regex & bilingual markers) and `59146c6` (Fast-Path 1-line read for maintenance, mobile override for dense archetypes, multi-format comments & CSS native fallbacks).
