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
- [x] T3: GitHub Actions CI Workflow (`.github/workflows/ci.yml`, dynamic validator test count)

### Phase 2 — Token Efficiency (Flash-Model Optimization)
- [x] T4: Decouple Validator from AGENTS.md → Validate against `catalog.json` (`validate-skills.mjs`, `validator-gates.test.mjs`)
- [x] T5: Slim AGENTS.md to ≤60 lines (<1,500 tokens) Contract
- [x] T6: Skip Deprecated Skills by Default in Installer (`install-skills.mjs`, `catalog.json`)
- [x] T7: Add Triggers to 52 Triggerless Skills (Matt Pocock skills, review-*, roles, etc.)
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
  - Commit: `aaa37fe`
  - Verification: `pnpm validate:strict` (229 pass), `pnpm test` (112 tests PASS).
- **T3** (GitHub Actions CI Workflow):
  - Created `.github/workflows/ci.yml` running cross-platform (ubuntu-latest & windows-latest) across Node.js 20 & 22 with pnpm 11.9.0.
  - CI pipeline executes `pnpm validate:strict`, `pnpm test`, `pnpm test:addon`, and `pnpm doctor`.
  - Added CI status badge to `README.md`.
  - Verified test suite has dynamic counts across all test files (0 hardcoded test counts).
  - Commit: `95d6d91`
  - Verification: `pnpm validate:strict` (229 pass), `pnpm test` (112 tests PASS), `pnpm doctor` (6/6 checks PASS).
- **T4** (Decouple Validator from AGENTS.md):
  - Replaced `agents-sync-missing-skill` (which forced every skill into AGENTS.md prose) with `catalog-sync-missing-skill` in `validate-skills.mjs`.
  - Skills are now strictly validated against `catalog.json` and `SKILLS.md`, liberating `AGENTS.md` from mandatory token bloat.
  - Added new unit test in `test/validator-gates.test.mjs` asserting `catalog-sync-missing-skill` failure on missing skills in `catalog.json`.
  - Synced addon mirror via `scripts/sync-addon.mjs --write`.
  - Commit: `f803d9e`
  - Verification: `pnpm validate:strict` (229 pass, 0 issues), `pnpm test` (113 tests PASS, 0 fail), `pnpm test:addon` (3 tests PASS).
- **T5** (Slim AGENTS.md Contract):
  - Made categories table optional in `_shared/catalog-manifest.mjs` (`checkCatalog` & `generateIndexes`) so `AGENTS.md` is treated as a lean agent behavior contract, not a bloated index duplicate.
  - Slimmed `AGENTS.md` from 234 lines (24,667 bytes / ~6,167 tokens) to 37 lines (2,476 bytes / ~619 tokens), achieving an **89.9% always-on token reduction**.
  - Retained core behavioral rules: activation kernel, ODD process authority, Tier 0/1 progressive disclosure via dynamic router, and non-negotiables (pnpm only, TDD, persistent memory, adversarial review, anti-slop).
  - Commit: `98ffea3`
  - Verification: `pnpm validate:strict` (229 pass), `pnpm test` (113 tests PASS), `pnpm test:addon` (3 tests PASS).
- **T6** (Skip Deprecated Skills by Default in Installer):
  - Added `--skip-deprecated` (default: true) and `--include-deprecated` flags to `install-skills.mjs`.
  - Installer parses frontmatter during folder traversal and automatically excludes the 15 deprecated skills (12 legacy SDD skills + professional-planner + nextjs + state-management) from being copied into agent configurations unless explicitly requested.
  - Commit: `fa5e5ad`
  - Verification: `install-skills.mjs --dry-run` confirms 15 deprecated skills skipped; `pnpm validate:strict` (229 pass), `pnpm test` (113 tests PASS).
- **T7** (Add Triggers to Triggerless Skills):
  - Analyzed and mapped curated trigger arrays for all 65 active skills that previously lacked YAML frontmatter triggers (all 27 Matt Pocock skills, 6 review-* lenses, 3 judgment day agents, dev roles, backend frameworks, and MCP hybrids).
  - Cleaned up string-vs-array trigger duplicates to maintain strict single-array `metadata.trigger` formatting.
  - 100% of active skills in the catalog now have triggers and are discoverable by `skill-router.mjs`.
  - Synced addon mirror via `scripts/sync-addon.mjs --write`.
  - Verification: `pnpm validate:strict` (229 pass, 0 issues), `pnpm test` (113 tests PASS, 0 fail), `node scripts/sync-addon.mjs --check` (full parity).







