# Feature: harness-rot-fixes — repair reference rot and broken gates

Created: 2026-10-12 · Branch: `fix/harness-rot-gates` (from main @ 4a02568) · Route: delegated direct (writer) + inline parent steps.

## Objective

Repair the four defects found in the 2026-10-12 harness audit and land them on `main` with tests, RDD review per work unit, and a final Judgment Day adversarial pass (user-requested).

## Problem & Evidence (audit 2026-10-12)

1. **Dangling gate**: `05-frontend/design-driven/SKILL.md` D6 gate references `scripts/token-audit.mjs --srcDir <proyecto>` — the file does not exist anywhere in the repo. Also its `allowed-tools` frontmatter (`Read Task Bash(git:*,gh:*,od:*)`) cannot run a node script.
2. **No inter-skill reference validation**: `catalog-doctor` checks manifest consistency but never validates file references between skills (the dangling `token-audit.mjs` proves the gap).
3. **Manifest drift**: `catalog.json` totals 230 skills vs 231 `SKILL.md` counted on disk (needs `generate-indexes.mjs --check` verdict, then resync).
4. **D1b question-floor ambiguity**: SKILL.md says "mínimo 8 preguntas" but the questionnaire has 17 numbered items; which 8 are the mandatory floor is undefined (non-deterministic executor interpretation).

## Scope

**In**: the four defects above, all dangling references surfaced by the new reference check, tests for every new script, doc clarifications, manifest/index regeneration.
**Out** (explicitly deferred, product decisions): D1b compact mode for greenfield interviews, frontend skills consolidation (52 skills), expanding A/B eval task corpus.

## Constraints

- pnpm only; test runner is `node --test test/**/*.test.mjs` (via `pnpm test`).
- Tests must follow existing style: `node:test` + `assert/strict`, fixtures in `os.tmpdir()`, never touch home/global configs.
- New checks must integrate with `catalog-doctor.mjs` CHECKS table architecture (id/name/run, exit codes).
- `token-audit.mjs` CLI must match the contract already published in design-driven SKILL.md: `scripts/token-audit.mjs --srcDir <proyecto>` (plus `--json`, documented exit codes).
- Reference check must not false-positive on URLs, placeholder paths (`<project>`, `<fecha>`), or design-artifacts template dirs.
- TDD mandatory: RED observed before implementation, GREEN after, no refactor breaking green.
- Artifacts (code, comments, tests) in English.

## Tasks

- [x] **WU1 · token-audit gate** — DONE `3deba18` (RED 11/11→GREEN 11/11; CLI exit 0/1/2; allowlists; allowed-tools += node:*)
- [x] **WU2 · reference-integrity check** — DONE `d163c76` (RED 8/12→GREEN 12/12; CHECKS table entry `skill-references`; real tree: 29 findings, 28 false-positive class + 1 resolved by WU1)
- [x] **WU3 · harden check + repair references** — DONE `bf48dab` + `f782b17` + `6aebf3f` (29→8 true rot→0 findings; 13 SKILL.md repaired; `docs/skill-style-guide.md` created normative; strict doctor gate restored 7/7; token-audit multiline literals; 162/162 tests; determinism byte-identical; disclosed deviation: TARGET_PROJECT_SOURCE_ROOTS skip class added+tested; branch-pr rephrased per git-history evidence)
- [x] **WU4 · D1b question floor** — DONE (this commit): núcleo duro = #1-#4, #6, #9, #13, #14; rest = calibración heredable del preset; both SKILL.md F1 and questionnaire header aligned.
- [x] **WU5 · manifest resync** — NO-OP: `generate-indexes.mjs --check` already green (230 skills, SKILLS.md/AGENTS.md/catalog.json consistent). The audit's "231 vs 230" was a parent counting error (included non-catalog SKILL.md fixtures), not manifest drift. Verified twice (writer + parent).
- [x] **WU6 · addon mirror regen** — VERIFIED NO-DIFF: `gentle-ai-dsh/skills/` is intentionally gitignored (built in CI via `build:addon`); parity gate = local write+check (both exit 0 after WU3; re-verified after 70ce241 and a4ae6b1). The earlier `--check` exit 1 was a transient (same class as the 5447≠5448 flake). JD-confirmed design note: parity against committed bytes is impossible by design — CI regenerates then tests.
- [x] **WU7 · gentle-ai 4.1.x harness sync** — DONE `70ce241` + extended in WU10 (README 4.1.x + honest install commands, rdd-defect-workflow 4.1.x + provider contract 1.3.0 + proportionate review note, bootstrap-kernel-minimal 4.1.x, counts 210→230). odd-workflow "2+ files" tracking triggers kept deliberately (tracking=resumability heuristic, delegation never by count per 4.1.x).
- [x] **WU8 · Judgment Day round-1 router/doctor fixes** — DONE `a4ae6b1`: (1) catalog-doctor no longer skips ALL `../` refs (the dotdir rule ate parent-relative references — J1-Red CRITICAL verified real); (2) skill-router category parsing POSIX-safe (`relative()+sep` replace of backslash concat — J2-Red BLOCKER verified real; all skills were `category:"root"` on Linux); (3) acronym triggers <4 chars with UPPERCASE declaration now route (JWT/ORM/E2E/DRY...; 4 RED tests→GREEN); (4) tier1toLoad excludes Tier0 skills (slot cannibalization); (5) tier1-instructions.txt untracked (loader mutated a git-tracked file every --turn); (6) invalid `~/` .gitignore lines removed. Real tree still clean with `../` validated (WU3b depth repairs hold).
- [x] **WU9 · token-audit coverage fixes** — DONE `9bb7dd3`: multiline opener broadened (value starting on opener line, template literals, clsx/cn/cva calls), backtick quote tracking, neutral palettes (zinc/neutral/stone), border/ring/divide/fill/stroke prefixes, 4-digit hex. 21/21 tests.
- [x] **WU10 · hygiene + docs sync** — canonical `00-meta-skills/agent-roster/preset/roster.routing.json` created (kills the canonical→mirror dependency inversion); pre-commit-gga.md 3 broken `../../`→`../../../` links fixed; skill-creator points at normative style guide; D1b floor clarified (#6 = agent-derived directive, Block 3 = calibration); README/counts/versions synced.

## Judgment Day ledger (dual, 2026-10-12)

- **JD1 (branch diff)**: Red=FIX, Blue=FIX. **JD2 (whole system)**: Red=FIX, Blue=FIX. Unanimous 4/4 FIX → merge BLOCKED, round 1 executed (WU8-WU10).
- **Verified single-judge claims fixed**: `../` skip bug (J1R-C1), POSIX categories (J2R-B1), mirror gitignore design (J2R-B3, documented), roster inversion (J1B-L4).
- **Overlaps fixed**: mirror parity regen, token-audit opener+palettes, acronym silencing, tier1 tracked-file mutation, Tier0 slot cannibalization.

## Deferred (next iteration — recorded, NOT blocking this merge)

1. `references/*.md` reference scanning extension (~112 files uncovered; 3 real broken links fixed ad hoc in pre-commit-gga.md).
2. **SDD suite fate — USER DECISION PENDING**: 19 sdd-* skills + openspec/ + professional-planner + `autoInvoke:true` on deprecated entries + idea-to-prd-express SDD escalation + `_shared/sdd-*` infra shipped to targets. Contradicts ODD-only contract.
3. Frontmatter parser consolidation (4 divergent regex parsers; folded scalars `>`/`|`, underscore/uppercase key lookahead).
4. Installer target-context gaps: router path broken in installed repos, Antigravity GEMINI.md KERNEL-MISSING (canary-activation.md:28), Cursor/Windsurf channel rules, no post-install verification, bootstrap-kernel-full reverting to stochastic selection in targets.
5. Non-atomic manifest writes (tmp+rename); global `~/.skill-router-turn.json` cache race (per-session key); Tier0 2048-token CI strict trap; SKILLS.md >50% empty notes; eval A/B bias documentation (trap prompts, HISTORICAL_KERNEL_BYTES constant); token-audit rgb()/hsl()/oklch() and non-JSX helper contexts; dist/build/coverage ignore dirs.

## Acceptance criteria

- `pnpm test` green (all existing + new tests).
- `pnpm validate:strict` green.
- `pnpm doctor` green including the new `skill-references` check.
- `generate-indexes.mjs --check` green (no manifest/index drift).
- No dangling references remain (proven by the new check over the whole catalog).
- RDD: assess after every work-unit commit; terminal receipt per due review (granted/declined/passive/under-budget recorded here).
- Judgment Day (2 blind judges) run over the branch; confirmed findings fixed and re-verified before merge.

## Delivery strategy

Direct merge `fix/harness-rot-gates` → `main` + push (user-authorized in-session: "para subirlo al main"). No PR chain. Slice boundaries = WU commits below.

## Verification evidence (fill per task)

- WU1: RED 11/11 fail (script absent) → GREEN 11/11 pass; commit `3deba18`. token-audit.mjs 204 lines, exit codes 0/1/2, allowlists (token/theme/variables paths, `--*:` CSS lines, data-token-audit-ignore).
- WU2: RED 8/12 fail (unknown check id) → GREEN 12/12 pass; commit `d163c76`. skill-references check in doctor CHECKS table; real-tree run: 29 dangling refs (token-audit ref resolved by WU1).
- Full suite after WU1+WU2: 152/152 pass (`pnpm test`).
- Feature doc committed: `docs(odd): add harness-rot-fixes feature doc`.

## RDD ledger

| WU | Commit | Assessed tier | Outcome |
|----|--------|---------------|---------|
| WU1+WU2+doc | 4a02568..HEAD (7 files, 734 lines) | medium (executable_change, slice_budget_reached) | review lineage `review-b3d9138686bbcd47` CONSENT GRANTED → 1 lens review-reliability (relay via Antigravity manual `--input` after OpenCode transport refused) → capture admitted → **escalated** (`native_stop_required`, `unknown_causality` on R3-relaxed-tests-mask-regressions-and-break-ci; location unverifiable by native). Informational for maintainer; both CRITICALs are addressed by WU3. No terminal receipt for this slice. |

### R3 findings to resolve in WU3

1. CRITICAL R3-false-positives-break-catalog-doctor-gate (deterministic, introduced) → WU3a target-project skip rules + resolution ladder.
2. CRITICAL R3-relaxed-tests-mask-regressions-and-break-ci (escalated/unknown causality; content real) → WU3b repairs + re-tighten tests → `pnpm doctor` 7/7 green.
3. WARNING R3-nondeterministic-finding-order → sort traversal/findings in WU3a.
4. SUGGESTION R3-extension-allowlist-false-negatives → extend extensions in WU3a.
5. SUGGESTION R3-token-audit-multiline-jsx-false-negatives → multiline class tracking in WU3c.

## Progress / Next step

**FEATURE COMPLETE — merged to main.** Round-2 fixes (`949e705`) verified by final closing verifier: SHIP (0 blocking; all Red findings + blind spots resolved with adversarial repros; gates 183/183 tests, doctor 7/7, validator 0 errors, mirror parity, references clean). Dual Judgment Day closed: 4/4 FIX → round-1 fixes → split verdict (Blue SHIP / Red FIX) → round-2 fixes → SHIP. RDD: review-2 terminal approved receipt burned; post-receipt deltas all under_budget. Deferred items live in the ledger above for the next iteration.
