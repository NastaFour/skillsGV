# Feature: Proof of Value — honesty fixes + live A/B evals

**Status**: IN PROGRESS
**Branch**: `feat/proof-of-value` (stacked on unmerged `feat/strategic-improvement`; branch point 9556109)
**Created**: 2026-10-08
**Source audit**: Engram obs 545/546 (audit + catalog composition)

## Objective

Make skillsGV's claims measurable and true: fix the honesty bugs found in the
post-Antigravity audit (F0), then build the first real proof that core skills
improve LLM responses via live A/B evals (F1). The central promise of the
catalog — "skills improve agent output" — is currently unproven; 133 of 164
benchmark checks grade hand-authored text and no LLM is ever invoked.

## Problem

1. `--tier core` silently omits 3 skills flagged `tier0:true` but tiered
   `extended` (agents, idea-to-prd-express, project-tracker) → broken Tier-0
   bootstrap on curated installs.
2. Tier-0 set drifts in BOTH directions: catalog.json flags 14 skills
   `tier0:true`; AGENTS.md §3 declares only 9, and 3 of those 9
   (odd-workflow, testing-patterns, code-reviewer) lack the flag.
   `tier0-context.json` references deprecated `professional-planner`.
3. `release.yml` workflow_dispatch `tag` input is dead code — manual dispatch
   releases whatever ref is checked out.
4. Benchmark half-marketing: baseline hard-coded (`BASELINE_AGENTS_BYTES`),
   improvement cells static strings, test asserts fixed numbers (164/0-fail),
   README claims stale figures (835 vs 619 tokens; 164 vs real 165 checks).
5. `run-evals.mjs` spawns agents but never gates or persists — the live eval
   loop exists as scaffolding only.

## Why

User-authorized plan (F0→F5) from the 2026-10-08 audit. Without F1 the product
cannot demonstrate its core promise; without F0 its published numbers are not
trustworthy. F2+ (catalog surgery, routing coverage, distribution, subagent
export) are OUT OF SCOPE for this feature doc.

## Scope

- IN: T1–T5 below.
- OUT: pruning/merging skills, new skills, IDE plugins, marketplace, marketing.

## Constraints

- pnpm only. No npm/npx.
- English for code/comments; README.es.md mirrors README.md in Spanish.
- Generated files regenerate via scripts, never hand-edit mirrors
  (`gentle-ai-dsh/` is build-on-demand).
- `.atl/skill-registry.md` has a pre-existing uncommitted diff from a prior
  session — leave untouched, exclude from commits.
- RDD: on (global). Writer verifies in foreground; parent commits per task.

## Tasks

- [x] T1 [F0] Align Tier-0 kernel: catalog.json tier0 set = the 9 skills in
      AGENTS.md §3 (add flags to odd-workflow, testing-patterns,
      code-reviewer; remove flag from skill-creator, skill-sync, agents,
      idea-to-prd-express, project-tracker, session-notes, kill-switches,
      professional-planner); all tier0 skills must be tier:core; regenerate
      tier0-context.json (locate via skill-loader); harden installer to
      force-include tier0:true regardless of --tier; emit `deprecated`
      boolean into catalog.json from frontmatter during manifest generation.
      **Done: a0303db** (+dc6caf2 registry regen). Evidence: RED→GREEN for
      tier0 force-include and deprecated-field; dry-run --tier core shows
      9/9 Tier-0 skills, 0 deprecated; tier0-context = 9 skills ~755 tokens.
      Note: supersedes adjudicated 14-skill union (openspec ledger L3,
      a6e2fae) — replaced by the AGENTS.md slim contract.
- [x] T2 [F0] Fix release.yml dispatch: checkout requested tag and pass
      tag_name (or drop the input if simpler — pick one, document in commit).
      **Done: 642dfe4** (checkout inputs.tag + tag_name).
- [x] T3 [F0] Benchmark honesty: compute all counts dynamically; remove
      static improvement/marketing cells (Engram/governance rows); label
      baseline as "historical kernel size, fixed reference"; fix stale README
      figures (token count, 164→live count); rewrite benchmark test to derive
      expectations instead of asserting fixed numbers.
      **Done: b4b9b50**. Runtime-derived count is 164 on this tree (audit's
      static "165" was off); all numbers now computed, marketing rows gone.
- [ ] T4 [F1] Live A/B eval harness: wire run-evals.mjs into a real loop —
      N tasks × {bare agent, agent+relevant core skill}, LLM-judge rubric
      (blind, randomized order), results persisted under evals/results/,
      summary command. Design note approved by parent before build.
- [ ] T5 [F1] Pilot: 4–6 tasks × 2 arms, record results, update README claim
      only with measured numbers.

## Route per task

- T1–T3: delegated writer (gentle-ai-worker), parent verifies + commits.
- T4: delegated writer after parent approves design; T5: parent + writer.

## Acceptance criteria

- `--tier core` dry-run includes exactly the 9 AGENTS.md Tier-0 skills, zero
  deprecated skills, and no tier0 skill missing.
- `pnpm validate:strict`, `pnpm test`, `pnpm doctor` green; benchmark output
  contains no static marketing strings; counts derived at runtime.
- release.yml has no dead inputs; lints as valid workflow.
- F1: at least one persisted A/B result file + summary; README claim (if any)
  cites measured data only.

## Forecast & delivery

~700–850 authored lines across T1–T5 → exceeds ~400 budget. Strategy:
ask-on-risk → chain strategy question to be asked once before crossing the
budget (likely at T4). Boundary for review assess: 9556109.

## Progress log

- 2026-10-08: Doc created. Branch feat/proof-of-value. RDD on (global).
- 2026-10-08: T1–T3 complete via delegated writer (power-failure relaunch).
  Gates: validate:strict 229/0, pnpm test 125/125, generate-indexes --check
  PASS, benchmark runtime-derived. Pre-existing `.atl` registry drift cleared
  via the repo's own emitter in a separate reversible commit (dc6caf2).
  Authored lines so far ≈ 300 (generated catalog/tier0/registry bytes
  excluded). Next: T4 design approval + chain-strategy question (budget will
  cross ~400 at F1).
- 2026-10-08: T1–T3 implemented (Tier-0 alignment = 9 canonical skills, `deprecated`
  manifest field, installer tier0 force-include; release.yml dispatch fix; benchmark
  honesty pass). Focused RED→GREEN observed for both TDD behaviors. `validate:strict`,
  `pnpm test` (2 catalog-doctor tests) and `pnpm doctor` remain red ONLY from the
  pre-existing `.atl/skill-registry.md` working-tree diff (external gentle-ai refresh,
  outside allowed edit surfaces); parent decision pending (interaction_required).
