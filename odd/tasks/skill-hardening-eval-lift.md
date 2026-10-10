# Feature: Skill Hardening & Evaluation Lift (80%+ Win Rate Target)

- **Feature Name**: `skill-hardening-eval-lift`
- **File Locator**: `odd/tasks/skill-hardening-eval-lift.md`
- **Engram Topic**: `odd/skill-hardening-eval-lift/tasks`
- **Project**: `skills-catalog`
- **Branch**: `feat/skill-hardening-eval-lift`
- **Delivery Strategy**: `ask-on-risk` (target ~400 lines per task)
- **Status**: IN PROGRESS

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
- [ ] T4: Update `scripts/pilot-eval.mjs` with 5 trap-driven evaluation scenarios.
- [ ] T5: Execute live Gemini Flash A/B trial, record measured results under `evals/results/`, and update README metrics.

## Constraints & Gates
- pnpm only. Zero npm/npx.
- Conventional commits per task.
- `pnpm validate:strict`, `pnpm test`, `pnpm doctor` must remain 100% green.
- Ground all reported metrics in observed results.
