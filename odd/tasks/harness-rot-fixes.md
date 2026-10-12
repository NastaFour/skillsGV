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

- [ ] **WU1 · token-audit gate** (route: delegated writer) — Create `05-frontend/design-driven/scripts/token-audit.mjs` (scan srcDir for hardcoded hex colors, raw `bg-white|text-black|bg-black|text-white` + non-semantic Tailwind palette literals; allowlist token/theme definition files; `--srcDir` + `--json`; exit 0 clean / 1 findings / 2 usage error) + `test/token-audit.test.mjs` (RED first) + fix `allowed-tools` in design-driven SKILL.md to permit running it (`Bash(node:*)`). Commit: `feat(design): add token-audit gate script with tests`.
- [ ] **WU2 · reference-integrity check** (route: delegated writer) — Add check `skill-references` to `catalog-doctor.mjs` CHECKS table: walk SKILL.md files, extract relative file references (markdown links + backtick paths with known extensions .md/.mjs/.js/.json/.yaml/.yml/.png), verify existence (skill-dir-relative and repo-root-relative), skip URLs/placeholders; document in catalog-doctor SKILL.md; extend `test/catalog-doctor.test.mjs` (RED first). Commit: `feat(meta): add skill reference integrity check to catalog-doctor`.
- [ ] **WU3 · repair dangling references** (route: parent inline from check output) — Run `pnpm doctor --check skill-references` (or script equivalent), fix every dangling reference surfaced (minimum known: WU1 closes token-audit). Commit: `fix(catalog): repair dangling skill references`.
- [ ] **WU4 · D1b question floor** (route: parent inline, decision owned by parent) — Define the mandatory 8-question core: #1-#3 (3 P's), #4 (chasis), #6 (reglas generativas), #9 (firma), #13 (heartbeat), #14 (bans); remaining items are calibration. Align SKILL.md F1 text + d1b-questionnaire.md header. Commit: `docs(design): define D1b mandatory question floor`.
- [ **WU5 · manifest resync** (route: parent inline) — Run `generate-indexes.mjs --check` for verdict, then `--write`; verify `--check` green after. Commit: `chore(catalog): regenerate manifest and indexes after reference repair`.

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

WU1+WU2 done. Next: delegate WU3 (a: check hardening; b: repairs + strict tests; c: token-audit multiline). Then WU4 docs, WU5 manifest, Judgment Day, merge.
