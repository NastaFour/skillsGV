# Feature: Skill Hardening & Evaluation Lift (80%+ Win Rate Target)

- **Feature Name**: `skill-hardening-eval-lift`
- **File Locator**: `odd/tasks/skill-hardening-eval-lift.md`
- **Engram Topic**: `odd/skill-hardening-eval-lift/tasks`
- **Project**: `skills-catalog`
- **Branch**: `feat/skill-hardening-eval-lift`
- **Delivery Strategy**: `ask-on-risk` (target ~400 lines per task)
- **Status**: COMPLETED

## Problem Statement
The preliminary Gemini Flash A/B trial showed a 50% Win Rate (2 wins, 1 loss, 1 tie) and +0.45 quality lift.
Analysis revealed why bare models tie or score closely:
1. LLMs already possess general pre-training on standard git and testing syntax.
2. Existing skills lack explicit Negative Constraints (ABSOLUTE BANS). LLMs ignore polite recommendations.
3. High prose-to-code ratio creates attention dilution in fast/flash models.
4. Evaluation prompts lacked engineering traps (e.g., monorepo pnpm command leaks, race conditions, atomic commit splitting).

## Objective
Harden core skills with Negative Constraints, high context density, and Before/After patterns, and test against a 5-task Trap-Driven benchmark to lift Win Rate from 50% to 80%+.

## Actionable Checklist
- [x] T1: Harden `work-unit-commits` with Absolute Bans (no AI attribution, no type-based commits, ~400-line budget) and concrete Before/After diffs.
- [x] T2: Harden `testing-patterns` with Absolute Bans (`pnpm`-only, zero network/db leakage, AAA structure) and Before/After test patterns.
- [x] T3: Harden `odd-workflow` with strict ODD protocol gates and Before/After execution patterns.
- [x] T4: Update `scripts/pilot-eval.mjs` with 5 trap-driven evaluation scenarios.
- [x] T5: Execute live Gemini Flash A/B trial, record measured results under `evals/results/`, and update README metrics.

## Observed Verification Evidence
- **Task T1-T3 Commit**: `4355005`
- **Engram Memory Sync**: Observation `#554` (`odd/skill-hardening-eval-lift/tasks`)
- **Live A/B Run Artifact**: `evals/results/ab-2026-10-10T23-10-47-414Z.json`
- **Measured Metrics**:
  - Win Rate: 100% (5/5 wins, 0 losses, 0 ties)
  - Quality Score: 4.72 (Treatment) vs 2.46 (Control)
  - Score Lift: +2.26
  - Duration Delta: +170 ms
  - Output Delta: +777 chars
- **Gates**:
  - `pnpm validate:strict`: 229 pass, 0 errors, 0 warnings
  - `node --test test/**/*.test.mjs`: 131 pass, 0 fail
  - `pnpm doctor`: 6/6 checks passed

