# Feature: skillsGV Strategic Improvement Plan — ODD Feature Document

- **Feature Name**: `strategic-improvement`
- **File Locator**: `odd/tasks/strategic-improvement.md`
- **Engram Topic**: `odd/strategic-improvement/tasks`
- **Project**: `skills-catalog`
- **Branch**: `feat/strategic-improvement`
- **Delivery Strategy**: `ask-on-risk` (target ~400 lines per task)
- **Status**: IN PROGRESS

## Problem Statement
`skillsGV` is a portable 229-skill catalog with harness capabilities (ODD, RDD, Engram, persona) that can run on any agent (Claude Code, Gemini CLI, Cursor, Codex, OpenCode). However:
1. It is virtually undiscoverable on GitHub (Spanish-only README, no one-line install via `skills.sh`, no CI badges, no video/demo).
2. Always-on token cost is excessive (~6,200 tokens for AGENTS.md alone, forced by validator requiring all skills in AGENTS.md).
3. The skill router still defaults to `needsSDD: true` on multi-category tasks, contradicting ODD-by-default.
4. 52/229 skills lack triggers and can never be selected by the router.
5. Duplication (7 pairs of overlapping skills) and repo bloating (gentle-ai-dsh mirror taking 45% of git tracked files).
6. Lack of evals across 98% of skills.

## Objective
Execute the 17-task Strategic Improvement Plan across 5 phases to make skillsGV popular, ultra-token-efficient, fully aligned with ODD v4, and clean.

## Actionable Checklist

### Phase 1 — Foundation & Discoverability
- [x] T1: English-First README + Hero Presentation + Badges (`README.md`, `README.es.md`)
- [x] T2: Packaging & One-Command Install (`.claude-plugin/marketplace.json`, `gemini-extension.json`, `skills.sh` compatibility)
- [ ] T3: GitHub Actions CI Workflow (`.github/workflows/ci.yml`, dynamic validator test count)

### Phase 2 — Token Efficiency (Flash-Model Optimization)
- [ ] T4: Decouple Validator from AGENTS.md → Validate against `catalog.json` (`validate-skills.mjs`, `validator-gates.test.mjs`)
- [ ] T5: Slim AGENTS.md to ≤60 lines (<1,500 tokens) Contract
- [ ] T6: Skip Deprecated Skills by Default in Installer (`install-skills.mjs`, `catalog.json`)
- [ ] T7: Add Triggers to 52 Triggerless Skills (Matt Pocock skills, review-*, roles, etc.)
- [ ] T8: Curated Core Tier System (`--tier core|extended|full` in installer and catalog metadata)

### Phase 3 — ODD Alignment & Technical Debt
- [ ] T9: Fix Router `needsSDD` → `suggestsStructuredFlow` & Generalize `CRITICAL_MARKERS` (`skill-router.mjs`)
- [ ] T10: Resolve AGENTS.md & Kernel Contradictions (version 4.0.0, ≤5 skills, no forced turns)
- [ ] T11: Update `references/model-mapping.md` to canonical tiers & update v3.0.0 feature doc header
- [ ] T12: Extract Shared `normalizeTier()` module (`_shared/agent-roster/normalize-tier.mjs`)

### Phase 4 — Catalog Deduplication & Hygiene
- [ ] T13: Deprecate/Redirect 7 Overlapping Skill Pairs (`electronjs`, `tailwindcss`, `frontend-designer`, etc.)
- [ ] T14: Strip Project-Specific Content (admin panels, cash registers) into optional preset
- [ ] T15: untrack or packaging-time build for `gentle-ai-dsh` mirror

### Phase 5 — Credibility & Community
- [ ] T16: Expand Evals to 15+ Core Skills with with-vs-without metrics script
- [ ] T17: Community Files: `CONTRIBUTING.md`, GitHub Issue Templates & Release setup

---

## Progress and Work-Unit Commits Evidence
- **T1** (English-First README + Spanish archive `README.es.md`):
  - `README.md` completely rewritten in English with official badges (version, spec, license, pnpm-only, 229 skills, ODD process), value proposition, Mermaid architecture flow, comparison matrix, quickstart, and full categories index.
  - `README.es.md` created preserving comprehensive Spanish documentation.
  - Fixed test fixture in `test/validator-gates.test.mjs` to target `SKILLS.md` instead of historical `openspec/config.yaml`.
  - Commit: `9f8eca2`
  - Verification: `pnpm validate:strict` (229 pass, 0 errors, 0 warnings), `pnpm test` (112 tests PASS, 0 fail), `pnpm test:addon` (3 tests PASS), `node scripts/sync-addon.mjs --check` (229 skills in full parity).
- **T2** (Packaging & One-Command Install):
  - Created `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json` for Claude Code plugin marketplace discovery.
  - Created `gemini-extension.json` for Gemini CLI extensions (`gemini extensions install`).
  - Added native one-command install commands (Skills CLI / `pnpm dlx skills add`, Claude Code marketplace, Gemini CLI) to `README.md`.
  - Verification: `pnpm validate:strict` (229 pass), `pnpm test` (112 tests PASS).


