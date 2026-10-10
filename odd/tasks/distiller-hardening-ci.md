# Feature: Project-Scoped Skill Distiller, Core Skill Hardening, and CI/CD Benchmark Gate

- **Feature Name**: `distiller-hardening-ci`
- **File Locator**: `odd/tasks/distiller-hardening-ci.md`
- **Engram Topic**: `odd/distiller-hardening-ci/tasks`
- **Project**: `skills-catalog`
- **Branch**: `feat/distiller-hardening-ci`
- **Delivery Strategy**: `ask-on-risk` (target ~400 lines per task)
- **Status**: COMPLETED

## Problem Statement
1. **Project-Scoped Skills Missing**: Currently, skills are either installed globally or manually copied. When a target project has proprietary architecture, custom domain invariants, or internal libraries, there is no automated tool to discover catalog matches AND synthesize a project-local skill (`<target>/.agent/skills/<domain>/SKILL.md`) following `agentskills.io` standards.
2. **Remaining High-Impact Core Skills Need Hardening**: The first hardening cycle proved that adding Absolute Bans and Before/After tables lifts model win rate to 100%. Critical core skills (`solid-clean-code`, `typescript`, `react-19`, `systematic-debugging`) still use narrative guidance without explicit negative constraints.
3. **CI Missing Benchmark Automation**: While CI runs tests and validation, `pnpm benchmark` is not executed in `.github/workflows/ci.yml`, risking silent regression in routing precision or token budgets.

## Objective
Execute the three strategic initiatives in order:
1. Build `skill-distiller` (auto-detect catalog matches + synthesize project-scoped skills with Absolute Bans).
2. Harden `solid-clean-code`, `typescript`, `react-19`, and `systematic-debugging`.
3. Add benchmark gates to GitHub Actions CI workflow.

## Actionable Checklist
- [x] T1: Implement `00-meta-skills/skill-distiller` (SKILL.md + `scripts/distill-project-skills.mjs`) and register in `package.json` as `pnpm distill`.
- [x] T2: Add comprehensive unit tests in `test/skill-distiller.test.mjs` validating stack scanning, catalog linking, and project-scoped skill generation.
- [x] T3: Harden `06-code-quality/solid-clean-code` and `06-code-quality/typescript` with Absolute Bans and Before/After pattern tables.
- [x] T4: Harden `05-frontend/react-19` and `02-dev-roles/systematic-debugging` with Absolute Bans and Before/After pattern tables.
- [x] T5: Add benchmark verification step to `.github/workflows/ci.yml`, run all full repository gates, and verify clean status.

## Observed Verification Evidence
- **T1-T2 Commit**: `23a6ab9`
- **T3-T4 Commit**: `d282428`
- **Engram Memory Sync**: Observation `#555` (`odd/distiller-hardening-ci/tasks`)
- **Full Repository Gates**:
  - `pnpm validate:strict`: 230 pass · 0 errors · 0 warnings
  - `node --test test/**/*.test.mjs`: 135 pass · 0 fail
  - `pnpm doctor`: 6/6 health checks green
  - `pnpm benchmark`: 100% routing precision, 86.3% context reduction
  - `node scripts/sync-addon.mjs --check`: 230 skills in full parity

