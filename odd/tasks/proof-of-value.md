# Feature: Proof of Value — honesty fixes + live A/B evals

**Status**: COMPLETED
**Branch**: `feat/eval-ab-harness`
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
- [x] T4 [F1] Live A/B eval harness: wire run-evals.mjs into a real loop —
      N tasks × {bare agent, agent+relevant core skill}, LLM-judge rubric
      (blind, randomized order), results persisted under evals/results/,
      summary command. Design note approved by parent before build.
      **Done: 3140d32**. Evidence: test/evals-ab.test.mjs (6/6 PASS, suite
      now 131/131 PASS), runAbLoop + blindRandomize + scoreRubric + formatAbSummaryTable
      implemented in _shared/eval-ab.mjs; run-evals.mjs wired with --ab, --ab-summary,
      --judge-cmd, and --max-tasks.
- [x] T5 [F1] Pilot: 4–6 tasks × 2 arms, record results, update README claim
      only with measured numbers.
      **Done: pending commit**. Evidence: Live A/B double-blind trial executed
      across 4 tasks (work-unit-commits, testing-patterns, code-reviewer, odd-workflow)
      with Gemini Flash. Win Rate: Treatment 50% (2/4), Control 25% (1/4), Ties 25% (1/4).
      Quality score lift: +0.45 (4.58 vs 4.13). Persisted to evals/results/ab-*.json.
      README.md and README.es.md updated with measured numbers.

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
- 2026-10-10: RDD cycle review-b0b8ad5b9505dd1a (tier high, 4 lenses, base-ref
  ab1a9bf committed-only) closed terminal: 4/4 lenses admitted (reliability relayed
  manually from Antigravity result — OpenCode Task returned opencode_task_output_empty
  deterministically for that agent), reduction found CRITICAL R3-INSTALL-DEPRECATED-LEAK
  (installer never read catalog.json `deprecated` flag), one bounded correction
  commit 5afcdd6 (+8/−2: collectSkills honors catalog deprecated alongside frontmatter;
  suites 44/44 green; --tier core plan unchanged at 35 skills), targeted validation
  passed, approved, exact acknowledgement burned (authority: burned, target 4b4eb8f9).
  7 advisory follow-ups recorded (R2-001..004, R4-*). Reviewed boundary advances to
  5afcdd6.
- 2026-10-10: Judgment Day round 1 (blind dual review, host: Antigravity subagents) over
  9556109..f39ae5e. Both judges returned valid clean results — Judge A: 0 findings / 20
  evidence items; Judge B: 0 findings / 18 evidence items (per-path coverage of all 18
  changed paths). Ledger: confirmed=[], suspect=[], contradictions=[], info=[]; no fix
  rounds consumed. JUDGMENT: APPROVED. Artifacts: %TEMP%\opencode\jd-judge-{a,b}-result.json,
  jd-target-9556109-f39ae5e.diff. Next: fresh RDD review from 0 over the same range
  (user-planned), then merge to main + push (user-authorized).
- 2026-10-10: Final RDD cycle review-b93cdcfe4774a1ee (from 0, tier high, 4 lenses, base
  ab1a9bf committed-only, consent granted by user) closed terminal CLEAN: all 4 lens
  reviewers ran as Antigravity subagents from lens-context materialized prompts, relayed
  via capture-result --input (no --agent); 0 findings, 0 advisories across risk/resilience/
  readability/reliability. Approved on the last admitted event; STATUS restart replayed
  the exact token; acknowledgement burned (target 3df23459, authority: burned). Artifacts:
  %TEMP%\opencode\rdd2-{lens}-prompt.md, rdd2-{lens}-result.json, rdd2-master-antigravity.md.
  Both adversarial gates (JD dual-blind + native 4R) are now terminal-clean on this range.
- 2026-10-10: DELIVERED. main fast-forwarded 8449640 -> 29ff5f3 and pushed to origin
  (merge authorized by user; brings the stacked feat/strategic-improvement base along).
  Full suite green pre-merge (pnpm test 125/125). CI runs on push (ubuntu+windows, node
  20/22). Feature branch continues at 29ff5f3 for T4/T5; next slice boundary for review
  assess advances to 29ff5f3.
- 2026-10-10: T4 implemented (Live A/B eval harness). Added _shared/eval-ab.mjs with
  double-blind randomization, rubric scoring, LLM judge evaluation mapper, and summary table
  formatting. Updated scripts/run-evals.mjs with --ab, --ab-summary, --judge-cmd, and --max-tasks.
  New unit suite test/evals-ab.test.mjs passes 6/6 tests. Full suite 131/131 PASS, doctor 6/6 PASS.
- 2026-10-10: T5 executed (Pilot 4 tasks × 2 arms with Gemini Flash subagents). Double-blind
  randomized assignment measured 50% Win Rate for Treatment vs 25% Control and 25% Ties, with
  +0.45 quality score lift (4.58 vs 4.13). Run artifact persisted to evals/results/ab-*.json.
  README.md and README.es.md updated with truthful, measured figures. Feature completed.
