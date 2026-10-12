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
- [ ] **WU6 · addon mirror regen** (route: parent inline) — `sync-addon --check` exit 1 after WU3 SKILL.md repairs (banana-claude, nano-banana, code-review + more drifted). Run `pnpm build:addon` + `pnpm test:addon`, commit regenerated mirror. Sequenced AFTER review-2 lifecycle closes (dirty tree risk during capture). Commit: `build(addon): regenerate gentle-ai-dsh mirror after reference repairs`.
- [ ] **WU7 · gentle-ai 4.1.x harness sync** (route: delegated research + writer) — NEW (user, 2026-10-12): gentle-ai upgraded; installed binary is **4.1.1** (user cited 4.1.0). Bring the skills-harness (odd-workflow skill, AGENTS.md ODD section, rdd-defect-workflow, gentle-orchestrator, work-unit-commits/branch-pr contracts) up to par with 4.1.x deltas. Research: GitHub releases Gentleman-Programming/gentle-ai (no local changelog cmd) → delta map 4.0.0→4.1.1 → apply → verify. Scope guard: only contract-bearing docs/skills that encode gentle-ai versions/commands/behaviors.

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

WU1-WU5 done (WU5 no-op, premise was parent miscount). Next: RDD assess of accumulated range (base 4a02568) → native review → Judgment Day (2 blind judges) → merge to main + push (user-authorized).
