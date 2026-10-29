---
name: work-unit-commits
description: "Trigger: work unit commits, conventional commit, commit atomico, commit splitting, atomic commits. Plan and execute git commits as reviewable ~400-line work-unit slices on the feature branch (Gentle-AI 4.3.1), isolating any High-Risk (1-6) unit into its own commit and recording commit hashes per task. Do NOT use for branch merging or release tagging."
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Read Bash(git:*) Glob Grep
license: Apache-2.0
metadata:
  trigger: ["work unit commits","conventional commit","commit atomico","work unit","commit splitting","atomic commits","implementation commits"]
  scope: "global, project"
  author: gentleman-programming
  version: "1.2.0"
---

# 📦 Work Unit Commits — Reviewable Slices & High-Risk Isolation (Gentle-AI 4.3.1)

Plan and execute git commits as reviewable, deliverable work-unit slices on the feature branch. Every commit represents a coherent slice of deliverable behavior with its code, tests, and docs together.

---

## 🚫 ABSOLUTE BANS (Non-Negotiable)

1. **NO AI ATTRIBUTION TRAILERS**: NEVER include `Co-Authored-By: AI`, `Co-authored-by: Assistant`, or any AI disclaimer. Use pure Conventional Commits.
2. **NO COMMITS BY FILE CATEGORY**: NEVER commit `models/`, then `services/`, then `tests/` across separate commits if none works alone. Code + tests + docs of a behavior belong in the same commit.
3. **NO MIXING HIGH-RISK UNITS WITH PENDING SLICES**: Any work unit whose `Risk:` line names a High-Risk item (`1-6`) MUST get its own isolated commit. Close and commit any pending `under_budget` slice first so the high-risk commit is assessed and reviewed alone.
4. **NO UNBOUNDED MONOLITHIC COMMITS (`> ~400` lines)**: Group low/medium-risk work units into reviewable slices of `~400` authored changed lines (additions + deletions). Never dump an entire multi-slice feature into a single mega-commit.
5. **NO BROKEN INTERMEDIATE COMMITS**: Every commit MUST leave the test suite green and the project compiling cleanly (`git bisect`-safe).

---

## 📐 Conventional Commit Format

```text
<type>(<scope>): <imperative summary in lowercase>

[optional body describing the WHY, deliverable behavior, and Risk: item N (reason) | Risk: none]

[optional issue reference: closes #123]
```

### Allowed Types
- `feat`: Delivers user- or consumer-facing behavior.
- `fix`: Patches a bug or regression.
- `refactor`: Changes code structure without altering external behavior.
- `test`: Adds or repairs tests alongside behavior or isolated fix.
- `docs`: Documentation updates only.
- `perf`: Verified performance improvement.
- `chore`: Tooling, build configuration, or dependency updates.

---

## ⚖️ Before & After: Work Unit & Slice Decomposition (Gentle-AI 4.3.1)

| ❌ Anti-Pattern (Categorical / Mixed Risk) | ✅ Gentle-AI 4.3.1 Pattern (Reviewable Slice & High-Risk Isolated) |
|---|---|
| `git commit -m "add models"`<br>`git commit -m "add services"`<br>`git commit -m "add tests"` | `git commit -m "feat(auth): add token validation model, endpoint, and unit tests"` |
| Mixing a 120-line UI tweak (`under_budget`) with an auth guard rewrite (`Risk: item 2`) in one commit | 1. Commit the pending `under_budget` UI slice first.<br>2. Commit `feat(auth): enforce strict session guard` in its own isolated high-risk commit. |
| `git commit -m "feat: user profile\n\nCo-Authored-By: Claude"` | `git commit -m "feat(user): add profile avatar upload with validation tests"` |

---

## ✅ Work Unit & Slice Verification Checklist

Before running `git commit`, confirm:
- [ ] **Coherent behavioral slice (`~400` lines)**: Groups related low/medium-risk tasks up to `~400` authored changed lines, or isolates a single coherent behavior.
- [ ] **High-Risk isolation (`items 1-6`)**: If the unit touches data/migrations (1), security/auth (2), shared contracts/parsers/CLI flags (3), concurrency (4), delivery/CI/installers (5), or untested surfaces (6), any prior `under_budget` work was committed first and this unit is committed alone.
- [ ] **Code + Tests + Docs together**: Tests and user/CLI documentation updates are staged in the same commit as the behavior change.
- [ ] **Clean rollback boundary**: Can be reverted cleanly with `git revert <hash>` without breaking unrelated slices.
- [ ] **Recorded in `odd/tasks/<feature>.md`**: Record the commit hash (and assessed review tier/outcome when RDD is active) for every task covered by the commit.

---

## 🔗 ODD 4.3.1 Integration & Review Slice Rules

- **Reviewable Slice Heuristic (`~400` lines)**: In Gentle-AI 4.3.1, small/medium `under_budget` tasks may share a reviewable work-unit slice commit up to `~400` authored changed lines on the feature branch (branch first when on the default branch).
- **High-Risk Commit Isolation**: Whenever a task's closure declares `Risk: item 1..6 (<reason>)`, flush any pending `under_budget` changes in a separate commit first, then commit the high-risk unit by itself so `gentle-ai review assess` (`--escalate-item <1-6> --escalate-reason`) evaluates it in isolation.
- **Task Logbook Evidence**: Every task in `odd/tasks/<feature>.md` records the exact commit hash holding its implementation (`commit: <sha>`) alongside its `Risk:` line and assessed review status.
