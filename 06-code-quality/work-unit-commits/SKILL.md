---
name: work-unit-commits
description: "Plan commits as reviewable work units. Use when splitting commits, chaining PRs, or keeping tests with code. Do NOT use for branch merging or release tagging."
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Read Bash(git:*) Glob Grep
license: Apache-2.0
metadata:
  trigger: ["work unit commits","conventional commit","commit atomico","work unit","commit splitting","atomic commits","implementation commits"]
  scope: "global, project"
  author: gentleman-programming
  version: "1.1.0"
---

# 📦 Work Unit Commits — Atomic Conventional Commits

Plan and execute git commits as reviewable, deliverable work units. Every commit represents a coherent slice of deliverable behavior with its tests and docs.

---

## 🚫 ABSOLUTE BANS (Non-Negotiable)

1. **NO AI ATTRIBUTION TRAILERS**: NEVER include `Co-Authored-By: AI`, `Co-authored-by: Assistant`, or any AI disclaimer. Use pure conventional commits.
2. **NO COMMITS BY FILE CATEGORY**: NEVER commit `models/`, then `services/`, then `tests/` across separate commits if none works alone. Code + tests + docs belong in the same commit.
3. **NO MONOLITHIC COMMITS (>400 lines)**: Never lump unrelated features or entire projects into a single mega-commit. Respect the ~400 authored lines reviewer budget.
4. **NO BROKEN INTERMEDIATE COMMITS**: Every commit MUST leave the test suite green and the project compiling cleanly (`git bisect`-safe).

---

## 📐 Conventional Commit Format

```
<type>(<scope>): <imperative summary in lowercase>

[optional body describing the WHY and deliverable behavior]

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

## ⚖️ Before & After: Work Unit Decomposition

| ❌ Anti-Pattern (Weak / Categorical) | ✅ Work Unit Pattern (Behavioral & Atomic) |
|---|---|
| `git commit -m "add models"`<br>`git commit -m "add services"`<br>`git commit -m "add tests"` | `git commit -m "feat(auth): add user token validation model and unit tests"`<br>`git commit -m "feat(auth): integrate token validation into login endpoint with tests"` |
| `git commit -m "fix bugs and refactor whole app (850 lines)"` | `git commit -m "fix(payment): prevent duplicate charges on network retry"`<br>`git commit -m "refactor(payment): extract currency conversion helper"` |
| `git commit -m "feat: user profile\n\nCo-Authored-By: Claude"` | `git commit -m "feat(user): add profile avatar upload with validation tests"` |

---

## ✅ Work Unit Verification Checklist

Before running `git commit`, confirm:
- [ ] **Single deliverable purpose**: Represents exactly one coherent behavior, fix, or migration.
- [ ] **Tests included**: Unit or integration tests are staged together with the behavior change.
- [ ] **Docs included**: If the behavior alters user contracts or CLI flags, docs are committed alongside it.
- [ ] **Clean rollback boundary**: Can be reverted cleanly with `git revert <hash>` without breaking unrelated code.
- [ ] **Clean message**: Summarizes the outcome and intent, never a mere list of modified file names.

---

## 🔗 ODD Integration & Budget Guard

- **Budget Heuristic**: ~400 authored lines per work unit (additions + deletions, excluding generated files).
- **Chained PRs**: When a feature requires >400 lines, group work-unit commits into logical slices and open chained PRs rather than a single bloated pull request.
- **Task Identity**: Every ODD task in `odd/tasks/<feature>.md` closes with at least one work-unit commit; record the commit hash in the task doc as verifiable evidence.
