# Feature: harness-100-closure — close every deferred ledger item

Created: 2026-10-12 (late session) · Branch: `fix/harness-100-closure` (from main @ 640c560) · Route: delegated direct preferred (fallback inline — OpenCode subagent permission may be denied).

## Objective

Close 100% of the deferred items from `odd/tasks/harness-rot-fixes.md` (its ledger + the JD findings), with the user-confirmed SDD decision: SOFT DEPRECATION.

## User decisions (authoritative)

- **SDD suite**: soft deprecation — mark deprecated with redirects, autoInvoke off, rewrite escalation texts, stop shipping `_shared/sdd-*` to targets. Content stays as reference.

## Constraints

- pnpm only; `node --test` via `pnpm test`; TDD (RED→GREEN) for behavior changes; artifacts in English (Spanish docs extended in neutral Spanish).
- All gates must stay green at every work unit: `pnpm test`, `pnpm doctor`, `pnpm validate:strict`, `generate-indexes --check`, `sync-addon --check` (regenerate mirror after ANY canonical SKILL.md edit).
- Never `git add -A` blindly: `.atl/skill-registry.md` may be poisoned with absolute paths by prior test runs (verify `git diff -- .atl/` before staging; restore if poisoned).
- Mirror regen after SKILL.md edits (bit us twice).

## Tasks

- [x] **WU-A · SDD soft deprecation** — 19 sdd-* skills + professional-planner + speckit-integration: frontmatter `deprecated: true` + `redirect: odd-workflow` (follow existing pattern from state-management→zustand-5). autoInvoke off for deprecated entries (verify generate-indexes merge behavior). Rewrite escalation texts: idea-to-prd-express (escalates to SDD full), jira-epic L182, jira-task L224, research-first L110/119, ai-ui-generation L24, skill-router SKILL L23 (skip SDD / invoke sdd-orchestrator), decision-gate, speckit-integration L3/99 — point to ODD (odd-workflow) instead. install-skills.mjs: exclude `_shared/sdd-phase-common.md` + `_shared/sdd-status-contract.md` from target copies (keep in repo). Regenerate indexes + mirror. Commit: `4841d87` (`feat(catalog): soft-deprecate SDD suite toward ODD`).
- [x] **WU-B · references/*.md scanning** — extend checkSkillReferences to also scan `references/*.md` inside skill dirs (extraction identical; resolution ladder anchored at the FILE's directory, plus repo root, plus existing skips/ladder; findings carry file path). TDD: RED tests (healthy references/ file passes; broken `../../` from references/ flagged — the pre-commit-gga class). Run real tree: fix all true rot surfaced (expect: `_shared/model-routing/profiles.schema.js` family, `harness-map.md`, `install.sh`, `docs/providers.md`/`docs/configuration.md` — investigate each context: fix path, create owed file, or rephrase external). Update catalog-doctor SKILL.md + docs/skill-style-guide.md scope notes. Commit: `937824b` (`feat(meta): scan references docs for reference integrity`).
- [x] **WU-C · registry absolute-path guard** — locate the emitter that regenerates `.atl/skill-registry.md` with absolute paths during test runs; make OUR emitter(s) write repo-relative paths (search: skills-loader --emit-registry, validator registry sync, scripts). Add regression test: after running the emitter, registry contains no `C:/` or `/home/` style absolute paths. Commit: `eaed537` (`fix(registry): emit repo-relative paths and guard absolute-path poisoning`).
- [x] **WU-D · frontmatter parser consolidation** — single shared parser `_shared/frontmatter.mjs` (getField/getNestedField/trigger parsing + folded scalars `>`/`|` + key lookahead fix `[A-Za-z0-9_-]` instead of `[a-z-]`); import in skill-router, skill-validator (validate-skills), catalog-manifest (_shared), skills-loader. TDD: RED tests for folded-scalar description + underscore keys against each consumer behavior; full suite green (this is the riskiest unit — run everything). Commit: `c937ca9` (`refactor(meta): consolidate frontmatter parsing into shared module`).
- [x] **WU-E · installer honesty + verify** — kernel-inject: for antigravity workspace injection emit an explicit warning citing canary evidence (GEMINI.md not autoloaded) instead of silent success; bootstrap-kernel-full.md: replace stochastic "elegí hasta 5 skills" guidance with router-aware instruction (use the router when available; manifest fallback documented); install-skills.mjs: lightweight post-install verification (re-read injected files, confirm kernel marker present, report per-runtime). Tests where feasible (kernel-inject is testable; install verify via temp dir fixture). Commit: `6b41e30` (`feat(install): honest channel warnings and post-install verification`).
- [ ] **WU-F · robustness batch** — catalog-manifest: atomic writes (write `.tmp` + renameSync for catalog.json/SKILLS.md/AGENTS.md); skill-router turn cache: key per workspace (hash of cwd) instead of one global `~/.skill-router-turn.json`; token-audit collectSourceFiles: ignore `dist/`, `build/`, `out/`, `coverage/`. TDD each. Commit: `fix(harness): atomic index writes, workspace-scoped turn cache, build-dir ignores`.
- [ ] **WU-G · docs/budget batch** — SKILLS.md: generate-indexes fills empty notes with the description's first clause (truncate ~80 chars) — regen; evals: add `evals/LIMITATIONS.md` documenting A/B bias (trap prompts penalize compliance; HISTORICAL_KERNEL_BYTES=24667 magic constant; n=5) honestly; Tier0 CI trap: validator emits explicit remediation text when tier0 tokens exceed budget (which skills to move down). Commit: `docs(harness): index notes, eval limitations, tier0 remediation guidance`.
- [ ] **WU-H · token-audit color functions** — flag raw `rgb(`/`rgba(`/`hsl(`/`oklch(` literals in non-token source files (same allowlists: token/theme/variables files exempt; CSS custom-property lines exempt). TDD. Commit: `feat(design): audit raw color functions in token-audit`.

## Verification (per work unit)

`pnpm test` + `pnpm doctor` + `pnpm validate:strict` + `generate-indexes --check` + `sync-addon --check` (post-regen). RDD assess per accumulated slice at commit boundaries.

## Delivery

Direct merge `fix/harness-100-closure` → `main` + push (same user authorization as harness-rot-fixes, confirmed for this closure).

## Progress / Next step

- WU-A: completed (`4841d87`).
- WU-B: completed (`937824b`).
- WU-C: completed (`eaed537`).
- WU-D: completed (`c937ca9`).
- WU-E: completed (`6b41e30`).
Next: WU-F · robustness batch.
