---
name: code-reviewer
description: "Trigger: code reviewer, review, code review, PR review, verification loop, audit code. Conduct a rigorous, causal code review using the 4R Framework, Gentle-AI 4.2.0 proportionate review rules (Provider Contract 1.4.0), and ECC verification loops. Use before committing, before PR creation, or during High-Risk (1-6) verification. Do NOT use to mutate code during a read-only review pass."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["code reviewer", "review", "code review", "PR review", "verification loop", "audit code"]
  scope: [global, project]
  version: "2.1.0"
---

# 🔍 Code Reviewer & SOLID Auditor (Gentle-AI 4.2.0 & ECC Patterns)

This skill acts as a strict, constructive Senior Peer Reviewer enforcing causal review disposition, the 4R Framework, and Gentle-AI 4.2.0 proportionate verification rules.

---

## 🔄 ECC Verification Loops & Gentle-AI 4.2.0 Proportionate Review

Choose the review mode proportionate to the candidate's risk assessment:

| Mode | When | What |
|---|---|---|
| **High-Risk Escalated Review (`items 1-6`)** | Candidate touches High-Risk items `1-6` (`--escalate-item <1-6> --escalate-reason`) | Close any pending `under_budget` slice first; isolate the high-risk commit; run independent verifier / selected 4R lenses |
| **Checkpoint Review (`~400`-line slice)** | End of a reviewable work-unit slice or before PR creation | Audit across the 4R Framework and 5 review dimensions; record assessed tier/outcome per commit |
| **Continuous Inline Check (`under_budget`)** | Low/medium-risk task (`Risk: none`) | Author runs focused test and suite inline; no independent verifier spawned for writer model size/effort |

### Fresh Context & Escalation Rules (Gentle-AI 4.2.0)

1. **High-Risk Commit Isolation**: Before reviewing or committing a High-Risk unit (`Risk: item 1..6`), ensure any pending `under_budget` slice was committed separately first so the high-risk commit is reviewed alone.
2. **No Small-Model Verifier Bias**: Independent verification and review escalation (`--escalate-item <1-6> --escalate-reason`) trigger **ONLY** on the 6 High-Risk items (1: data/migrations, 2: security/auth, 3: shared contracts/CLI/parsers, 4: concurrency, 5: delivery/CI/deps, 6: untested regression surface) — never merely because the writer ran on a smaller/cheaper model or lower effort tier.
3. **Causal Disposition**: Only findings **introduced or worsened** by the candidate diff block approval. Pre-existing debt outside the diff is logged as a non-blocking follow-up.

---

## ⚖️ The 4R Framework (Structured Review)

Run the four Rs in order. Every review answers the selected lenses explicitly — see [`references/4r-framework.md`](references/4r-framework.md):

| R | Lens | Question & What It Catches |
|---|---|---|
| **R1 — Risk** (`Reverse-Engineer`) | Security & Blast Radius | "What does this code actually execute and expose?" Auth bypass, injection, secret leaks, data loss, shared-contract breaks (item 3). |
| **R2 — Readability** (`Reason`) | Maintainability & Intent | "Why is it written this way, and is the control flow clear?" Stale abstractions, dead branches, naming drift. |
| **R3 — Reliability** (`Reuse`) | Contracts, Tests & Invariants | "Does it reuse existing helpers and preserve invariants?" Missing edge-case tests, ordering/uniqueness/normalization drift, DRY violations. |
| **R4 — Resilience** (`Resolve`) | Operations & Smallest Fix | "What is the smallest change that resolves the root cause safely?" Missing timeouts, unsafe retries, broken rollback boundaries. |

**Rules**: Diagnose before prescribing (R1-R3 before R4); never combine read-only review with source edits in the same pass.

**Native RDD Note (Provider Contract `1.4.0`)**: When native RDD is enabled (`gentle-ai review mode status`), `gentle-ai review assess --json` records the assessed tier/outcome (`passive`, `under_budget`, `review_due`) per commit, and the bounded correction budget is frozen by the binary at review START (`_shared/review-ledger-contract.md`). If the native `gentle-ai` review binary is unavailable, report `receipt-driven development: unavailable` and apply this 4R review under ordinary repository policy.

---

## 🪝 Pre-commit Automation via GGA (Gentleman Guardian Angel)

Automate pre-commit AI review with [`gga`](https://github.com/Gentleman-Programming/gentleman-guardian-angel) — see [`references/pre-commit-gga.md`](references/pre-commit-gga.md):

```bash
brew install gentleman-programming/tap/gga        # or scoop on Windows
cd ~/your-project
gga init                                          # Configure PROVIDER=claude|gemini|codex|opencode|ollama
gga install                                       # Install pre-commit hook
```

## 🧨 Adversarial Escalation (`judgment-day`)

When a change carries high architectural or security blast radius, escalate to [`judgment-day`](../judgment-day/SKILL.md) — two blind, independent judges review the same target in parallel and synthesize confirmed findings.

---

## 🏛️ 5 Core Review Dimensions

1. **Security & Trust Boundaries (2026 Standards)**:
   - Verify zero hardcoded secrets, API keys, or credentials.
   - Verify short-lived access tokens stay in memory and refresh tokens use `httpOnly: true, secure: true, sameSite: 'strict'` cookies (see `../../04-backend/jwt-bcrypt/SKILL.md`).
   - Verify external inputs, webhooks, and realtime payloads are validated with schemas (e.g., Zod) at the boundary (see `../../04-backend/socketio/SKILL.md`).
   - Verify mobile credentials use hardware-backed secure storage rather than plaintext storage.
2. **Invariants, SOLID & Clean Code (DRY/KISS)**:
   - **Helper Reuse & Invariants**: Confirm edits to shared state reuse existing repository helpers and preserve ordering, uniqueness, validation, and normalization invariants.
   - **Proportionality**: Flag gratuitous abstractions or functions that mix orchestration with low-level I/O (see `../../06-code-quality/solid-clean-code/SKILL.md`).
3. **Performance & Resource Bounds**: Spot N+1 queries, unbounded in-memory buffering, missing pagination/timeouts, or uncleaned listeners.
4. **Architecture & Traceability**: Verify workspace boundaries, ODD task spec coverage (`S1..Sn`), and isolated High-Risk commits.
5. **Error Handling & Observability**: Verify structured error handling with correlation context and safe fallback behavior.

---

## 📋 Feedback & Closure Format

- **Status per Dimension**: `[✅ Pass / ⚠️ Follow-up / 🚨 Causal Blocker]`
- **Findings**: File, line range (`path:line`), causal proof, and minimal R4 remediation snippet.
- **Assessed Review Outcome**: Record `tier` (`passive | under_budget | review_due` or `receipt-driven development: unavailable`) and `Risk: item N (reason)` or `Risk: none`.

> **[Beyond-Baseline]**: Reviewers may pair static 4R inspection with a `Differential Check` (comparing CLI/API output against a clean `mktemp -d` baseline worktree) when shared helpers or parsers are modified, annotating `[Beyond-Baseline: differential baseline proof]`.

## 📚 References

- [`references/4r-framework.md`](references/4r-framework.md) — 4R checklist
- [`references/review-policy.md`](references/review-policy.md) — Causal review policy
- `_shared/review-ledger-contract.md` — Native Compact Review Orchestration (Gentle-AI 4.2.0, Provider Contract `1.4.0`)
- `../rdd-defect-workflow/SKILL.md` — Receipt-Driven Development workflow
