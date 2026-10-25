---
name: rdd-defect-workflow
description: "Trigger: RDD, receipt-driven development, review authority, receipt/lineage, correction/recovery, delivery gate/kill switch, bounded review defects. Guide work under Gentle-AI 4.2.0 and Provider Contract 1.4.0."
allowed-tools: Read Write Bash(gentle-ai:*,git:*,node:*) Glob Grep
license: Apache-2.0
metadata:
  trigger: ["rdd defect","remediar defecto","defecto rdd","defect workflow"]
  author: gentleman-programming
  version: "1.2.0"
---

## Activation Contract

Load when the frontmatter trigger terms apply to a defect or review-authority workflow.

RDD is opt-in and user-owned: it is enabled only through the native command `gentle-ai review mode enable --scope global` (`status` and `disable` accept scope `global|clone`). The catalog never enables or disables it.
- **When disabled**: No receipt is required, the pipeline does not fail by its absence, and you report `disabled/unmanaged` under ordinary repository policy.
- **When unavailable**: If the `gentle-ai` binary or native `review` subcommand is not installed, unreachable in the active runtime, or invoked from an unsupported SMB/UNC network path (`\\server\share`), degrade gracefully: report `receipt-driven development: unavailable` and proceed under ordinary repository policy without fabricating receipts or blocking delivery.

This skill guides public collaboration. It does not grant issue approval, label, review, exception, or merge authority.

## Hard Rules

- Check the user-owned RDD kill switch first (`gentle-ai review mode status`; activation is only `gentle-ai review mode enable --scope global`). When disabled, report `disabled/unmanaged`; when the binary is absent, report `receipt-driven development: unavailable`.
- Require an approved issue (`status:approved`) and clean current `main` reproduction before implementation. Audit existing PRs for supersession or conflict; stop or narrow stale claims.
- Group by causal authority invariant. Use one issue and one PR or explicit chain per independent invariant and rollback boundary. Split independent causes; never merge a superseded or conflicting authority line.
- **High-Risk Commit Isolation (Gentle-AI 4.2.0)**: Close and commit any pending `under_budget` slice before starting or committing a High-Risk unit (`Risk: item 1-6`) so the high-risk commit is assessed and reviewed alone.
- **No Small-Model Verifier Bias**: Independent verification and review escalation run ONLY when a High-Risk item (`1-6`) holds via `--escalate-item <1-6> --escalate-reason "<reason>"`, never merely because a writer used a smaller/cheaper model or lower effort tier.
- Inventory every operator flow claimed by the issue or PR, including entry, mode, environment, expectation, and negative controls. Require one truthful black-box bench journey per CLI or lifecycle flow, or actual runtime E2E proof when the core bench cannot represent it. Synthetic proxy coverage never proves another runtime.
- Use CodeGraph-first impact mapping, a dedicated worktree, and behavior-first tests. Run source-mutating normalization before candidate freeze.
- Forecast authored changes before edits. The reviewable slice budget is `~400` additions plus deletions; above it, split into chained work-unit slices or stop for an explicit maintainer-approved exception.
- Only when RDD is enabled, bind lineage, correction, recovery, and acknowledgement to the exact candidate: run the selectorless STATUS preflight (`gentle-ai review status --contract gentle-ai.review-integration/v2 --next-transition`) before continuing, route only from its returned `next_transition`, never re-review an already-acknowledged target (`target_already_acknowledged`), and never open a new review budget outside a native action. Only the exact acknowledgement burns authority (`gentle-ai.review-acknowledged/v1`); delivery gates never decide delivery. Keep bounded review defects in one correction transaction.
- Require independent read-only candidate validation before publication when escalated. Validation cannot edit source or authority; findings require a new candidate.

## ODD Integration Points (Gentle-AI 4.2.0, Provider Contract `1.4.0`)

The catalog integrates with the native review lifecycle for each candidate slice; the full lifecycle contract is `_shared/review-ledger-contract.md` (Native Compact Review Orchestration, Gentle-AI 4.2.0, Provider Contract `1.4.0`). Under 4.2.0 the review is proportionate: `review assess` reports `review_due: true` only for High-Risk candidates (`items 1-6`, or explicit `--escalate-item <1-6> --escalate-reason`), while medium/low candidates report `under_budget` or `passive`. When `review_due` holds, the agent selects the fitting 4R lenses at START via `--lenses <r,...> --lenses-reason <text>`:

1. **Close pending `under_budget` slice before High-Risk**: If an `under_budget` slice is open when a High-Risk (`1-6`) change is ready, commit the `under_budget` slice first so the high-risk unit gets its own isolated commit and isolated review transaction.
2. **Per work-unit slice or isolated high-risk commit**: At commit closure on the feature branch, run `gentle-ai review assess --json` (recording the assessed tier and outcome per commit in `odd/tasks/<feature>.md`) and the selectorless STATUS preflight over the candidate diff, routing only from the returned `next_transition`.
3. **Per PR slice**: When preparing a PR slice or closing a feature branch, run the same preflight and routing. An already-acknowledged target (`target_already_acknowledged`) is consumed and is not re-reviewed.

`review validate` and the delivery gates (`post-apply`, `pre-commit`, `pre-push`, `pre-pr`, `release`) are compatibility/informational only: enabled gates return `invalidated/unmanaged`, disabled gates return `disabled/unmanaged`, and they never discover authority, decide delivery, or launch reviewers. Commit, push, PR, and release stay outside the lifecycle under ordinary repository policy.

## Bounded Correction Budget

The bounded correction budget is FROZEN BY THE BINARY at review START, derived from the candidate's original changed-line count (the native layer owns the exact formula under Provider Contract `1.4.0`). The Markdown contract declares the agent duties:

1. Before any corrective edit, run the positive correction forecast (native `capture-correction-plan` with `--correction-lines` > 0 when RDD is enabled).
2. Never edit before the forecast is admitted.
3. ONE bounded correction transaction per candidate — later observations are follow-ups, not another correction. Correction also draws from a per-role context budget frozen at START (200 KiB); `correction_context_budget_exceeded` means releasing authority with `gentle-ai review abandon`, not overrunning.
4. If the fix exceeds budget, stop and request a new candidate/chain instead of overrunning.

## Decision Gates

| Condition | Action |
| --- | --- |
| RDD binary/command unavailable or SMB/UNC path | Report `receipt-driven development: unavailable`; follow ordinary policy. |
| RDD disabled | Ordinary policy; `disabled/unmanaged`; no receipt or approval claim. |
| Pending `under_budget` slice before High-Risk (`1-6`) unit | Commit `under_budget` slice first; isolate High-Risk unit in its own commit. |
| High-Risk item `1-6` triggered | Pass `--escalate-item <1-6> --escalate-reason`; record assessed tier/outcome per commit. |
| Issue gate or reproduction fails | Wait, stop, or narrow with evidence. |
| Forecast exceeds `~400` lines | Split into reviewable slices / chain or approved exception before edits. |

## Execution Steps

1. Check mode (`enabled`, `disabled/unmanaged`, or `receipt-driven development: unavailable`), approval, PR conflicts, and current-main reproduction.
2. Name invariant, `Risk:` assessment (`item 1-6` or `none`), and rollback; isolate the worktree; CodeGraph-map code, tests, evidence, and docs.
3. Inventory flows and controls; add failing tests and the smallest correction.
4. Normalize, enforce slice budget (`~400` lines, high-risk isolated), run tests, and record each commit's assessed tier/outcome and `Risk:` line in `odd/tasks/<feature>.md`.
5. Freeze, validate read-only, and give the verdict, evidence, `Risk:` line, and one humane next action.

## Output Contract

Return `rdd_mode`, `provider_contract` (`1.4.0`), `assessed_tier_outcome`, `risk_line`, `issue_pr`, `causal_invariant`, `operator_flows`, `journey_runtime_evidence`, `changed_line_budget`, `tests`, `rollback`, and `unresolved_authority_decisions`.

## References

- `_shared/review-ledger-contract.md` — full native receipt contract (Gentle-AI 4.2.0, Provider Contract `1.4.0`).
- `_shared/sdd-phase-common.md` (section G) — catalog-side RDD integration contract.
- `00-meta-skills/harness-map.md` — harness extension points (RDD active positions and lens mapping).
