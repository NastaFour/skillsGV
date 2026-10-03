---
name: rdd-defect-workflow
description: "Trigger: RDD, receipt-driven development, review authority, receipt/lineage, correction/recovery, delivery gate/kill switch, bounded review defects. Guide work."
allowed-tools: Read Write Bash(gentle-ai:*,git:*,node:*) Glob Grep
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0.0"
---

## Activation Contract

Load when the frontmatter trigger terms apply to a defect workflow.

RDD is opt-in and user-owned: it is enabled only through the native command `gentle-ai review mode enable --scope global` (`status` and `disable` accept scope `global|clone`). The catalog never enables or disables it. When disabled, no receipt is required, the pipeline does not fail by its absence, and you report `disabled/unmanaged` under ordinary policy.

This skill guides public collaboration. It does not grant issue approval, label, review, exception, or merge authority.

## Hard Rules

- Check the user-owned RDD kill switch first (`gentle-ai review mode status`; activation is only `gentle-ai review mode enable --scope global`). When disabled, do not start receipt reviews or fabricate approval; follow ordinary policy and report `disabled/unmanaged`.
- Require an approved issue (`status:approved`) and clean current `main` reproduction before implementation. Audit existing PRs for supersession or conflict; stop or narrow stale claims.
- Group by causal authority invariant. Use one issue and one PR or explicit chain per independent invariant and rollback boundary. Split independent causes; never merge a superseded or conflicting authority line.
- Inventory every operator flow claimed by the issue or PR, including entry, mode, environment, expectation, and negative controls. Require one truthful black-box bench journey per CLI or lifecycle flow, or actual runtime E2E proof when the core bench cannot represent it. Synthetic proxy coverage never proves another runtime.
- Use CodeGraph-first impact mapping, a dedicated worktree, and behavior-first tests. Run source-mutating normalization before candidate freeze.
- Forecast authored changes before edits. The hard limit is 400 additions plus deletions; above it, STOP for a chain or explicit maintainer-approved exception.
- Only when RDD is enabled, bind lineage, correction, recovery, and acknowledgement to the exact candidate: run the selectorless STATUS preflight (`gentle-ai review status --contract gentle-ai.review-integration/v2 --next-transition`) before continuing, route only from its returned `next_transition`, never re-review an already-acknowledged target (`target_already_acknowledged`), and never open a new review budget outside a native action. Only the exact acknowledgement burns authority (`gentle-ai.review-acknowledged/v1`); delivery gates never decide delivery. Keep bounded review defects in one correction transaction.
- Require independent read-only candidate validation before publication. Validation cannot edit source or authority; findings require a new candidate.
- Keep communication humane and evidence-based. Repository labels and workflow metadata are maintainer-owned, never evidence of contributor blame.

## SDD Integration Points (native review lifecycle)

The catalog integrates with the native review lifecycle at two active positions; the full lifecycle contract is `_shared/review-ledger-contract.md` (Native Compact Review Orchestration, orchestrator and native CLI only), and the catalog-side contract lives in `_shared/sdd-phase-common.md` section G:

1. **Post-apply, per work unit**: at the close of each `apply` WU, the harness runs the selectorless STATUS preflight over the current worktree candidate and routes only from the returned `next_transition` (an exact START freezes lineage, target, lenses, and budgets); it never opens a review budget on its own.
2. **Pre-archive**: the pipeline is `sdd-verify → review preflight → sdd-archive`; same preflight, same routing. An already-acknowledged target is consumed and is not re-reviewed.

`review validate` and the delivery gates (`post-apply`, `pre-commit`, `pre-push`, `pre-pr`, `release`) are compatibility/informational only: enabled gates return `invalidated/unmanaged`, disabled gates return `disabled/unmanaged`, and they never discover authority, decide delivery, or launch reviewers. Commit, push, PR, and release stay outside the lifecycle under ordinary repository policy.

## Bounded Correction Budget

The bounded correction budget is FROZEN BY THE BINARY at review START, derived from the candidate's original changed-line count (the native layer owns the exact formula; the 3.4.0 compact contract does not restate it). The Markdown contract does NOT enforce it mechanically — it declares the contract and the agent duties:

1. Before any corrective edit, run the positive correction forecast (native `capture-correction-plan` with `--correction-lines` > 0 when RDD is enabled).
2. Never edit before the forecast is admitted.
3. ONE bounded correction transaction per candidate — later observations are follow-ups, not another correction. Correction also draws from a per-role context budget frozen at START (200 KiB in 3.4.0); `correction_context_budget_exceeded` means releasing authority with `gentle-ai review abandon`, not overrunning.
4. If the fix exceeds budget, stop and request a new candidate/chain instead of overrunning.

## Decision Gates

| Condition | Action |
| --- | --- |
| RDD disabled | Ordinary policy; `disabled/unmanaged`; no receipt or approval claim. |
| Issue gate or reproduction fails | Wait, stop, or narrow with evidence. |
| Invariant or rollback is independent | Separate issue and authoritative PR line. |
| Core bench fits / does not fit | Bench journey / actual runtime E2E; never proxy. |
| Forecast exceeds 400 lines | Chain or approved exception before edits. |

## Execution Steps

1. Check mode, approval, PR conflicts, and current-main reproduction.
2. Name invariant and rollback; isolate the worktree; CodeGraph-map code, tests, evidence, docs, distribution, and registration.
3. Inventory flows and controls; add failing tests and the smallest correction.
4. Normalize, enforce budget, run tests, and record each flow's exact candidate, command, scenario, and result.
5. Freeze, validate read-only, and give the verdict, evidence, and one humane next action.

## Output Contract

Return `rdd_mode`, `issue_pr`, `causal_invariant`, `operator_flows`, `journey_runtime_evidence`, `changed_line_budget`, `tests`, `rollback`, and `unresolved_authority_decisions`.

Identify approved and superseded/conflicting authority lines; every flow, negative control, and candidate-bound proof; additions plus deletions and chain/exception; test results; independent rollback; and unresolved maintainer decisions.

## References

- `_shared/review-ledger-contract.md` — full native receipt contract (orchestrator and native CLI only).
- `_shared/sdd-phase-common.md` (section G) — catalog-side RDD integration contract across SDD phases.
- `00-meta-skills/harness-map.md` — harness extension points (RDD active positions and lens mapping).

Current repository policy remains authoritative.
