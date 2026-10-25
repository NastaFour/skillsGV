## odd-workflow
Use when executing substantial features or multi-step development in harnesses without native gentle-ai. Governs Organic Driven Development (ODD): authorize, explore, clarify, track before first write in odd/tasks/<feature>.md, implement task-by-task with work-unit commits, and close with verified evidence. Do NOT use when gentle-ai is already active in the system prompt.

## skill-router
Deterministic router that pre-selects which skills an agent should load, replacing ~80% of stochastic LLM-based skill selection with exact trigger matching. Outputs primary skill + secondary candidates + ODD/trivial flags. Use BEFORE any agent turn that might invoke another skill, to shrink the agent's decision surface from 237 skills to 3-5.

## skill-loader
Tier 0/1 enforcement for the skills catalog. Caches skill frontmatter with mtime, emits tier0-context.json (9 always-on skills) on first run, and per-turn emits tier1-instructions.txt with ONLY the bodies of skills the router selected via tier1toLoad[]. Enforces the "route first" rule: a skill outside the current tier1toLoad must be re-routed before being read. Use at agent boot to bootstrap tier-0 context, and at every turn before reading another skill's body.

## skill-validator
Validates that all SKILL.md files in the catalog comply with the agentskills.io specification. Checks name constraints, description length, frontmatter structure, and folder-name matching. Exits non-zero on any failure. Use in pre-commit hooks, CI pipelines, or before publishing a skill catalog.

## testing-patterns
Unit, integration, and E2E testing patterns for the ecosystem. Use when writing tests with Vitest, Supertest, or React Native Testing Library. Do not use for load testing, pentesting, or security audits.

## code-reviewer
Conduct a rigorous, professional-grade code review (Pull Request simulation) on new code. Enforces security guardrails, audits SOLID/DRY/KISS, and integrates ECC verification loops (checkpoint vs continuous evals). Use before committing, before PR creation, or during feature verification.

## engram-integration
Persistent cross-session memory for AI coding agents via the Engram binary — one-liner setup (engram setup <agent>), 20 MCP tools (mem_save/mem_search/mem_judge...), SQLite+FTS5, git sync, optional cloud. Use when an agent should remember decisions and bugs across sessions instead of starting over.

## dod-checker
Act as the strict Gatekeeper for the "Definition of Done" (DoD). Run this skill to evaluate a feature or task. Blocks checkoffs if SOLID, DRY, or 2026 security guardrails are bypassed.

## decision-gate
Decision-support system that compresses the human's last-20% judgment from 30 min to 3 min. Presents trade-offs as an ordered matrix, surfaces conflicts with prior decisions (via Engram), offers safe defaults to override, and records the decision + reasoning in Engram. Use when judgment-day or a PRD leaves a decision the human must make and you want it fast, well-informed, and traceable.