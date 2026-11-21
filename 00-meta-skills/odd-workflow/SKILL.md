---
name: odd-workflow
description: "Trigger: odd workflow, organic driven development, flujo odd, trabajo sustancial, odd task. Use when executing development under Gentle-AI 4.6.0 Organic Driven Development (ODD) in harnesses without native gentle-ai: authorize, explore, keep authorized work moving, classify by 3 criteria, track in odd/tasks/<feature>.md, synthesize a 5-line One-Shot Pre-Flight Blueprint, enforce parent-adjudicated Allowed Edit Surfaces and 3-tier verification in mktemp -d, commit in ~400-line reviewable slices (high-risk isolated), run Pre-Release Live CVE Gate, and close with observed evidence and Risk line. Do NOT use when gentle-ai is already active in the system prompt."
trigger: ["odd workflow", "organic driven development", "flujo odd", "implementar feature multi archivo", "iniciar feature", "trabajo sustancial", "odd task"]
license: MIT
allowed-tools: Read Write Bash(git:*,gh:*)
metadata:
  author: gentleman-programming
  version: "1.5.0"
---

# 🌿 odd-workflow — Organic Driven Development (Gentle-AI 4.6.0)

The universal, disciplined protocol for software delivery across AI agents. Combines **Gentle-AI 4.6.0 ODD** (Provider Contract `1.6.0`) with **One-Shot Pre-Flight Blueprinting**, **3-Tier Delegated Verification (`_shared/verify-method.md`)**, **Auto-EGM Plan Gate**, and **Pre-Release Live CVE Gate**.

---

## 🚫 HARD INVARIANTS (Non-Negotiable)

1. **NO WRITING BEFORE TRACKING ON LARGE WORK**: When the resume test fails (large task), NEVER touch a source file before passing **Auto-EGM Plan Gate** (`egm-spec-review`) and creating `odd/tasks/<feature>.md` + its Engram mirror `odd/<feature>/tasks`.
2. **NO CLASSIFICATION BY FILE OR STEP COUNT**: Never classify task size by counting files, steps, commands, tests, or a todo list. Use only the 3 Task Size criteria.
3. **AUTHORIZED WORK KEEPS MOVING & TOOL-BACKED DECISIONS**: Never ask permission to continue already-authorized work. Surface a blocker only for a genuine human choice, explicit stop, denial, missing consent, or exhausted limit; use an available compatible decision tool when a real human choice fits it, or ask at most ONE focused text question and STOP until answered. When evidence is missing for one unit, keep only that unit partial while independent authorized work continues.
4. **NO VERBAL CLAIMS WITHOUT OBSERVED EVIDENCE & `Risk:` LINE**: Never claim completion without running verification commands, observing output, and closing with `Risk: item N (reason)` or `Risk: none`.
5. **NO UI/BACKEND MUTATION WITHOUT PHASE GATES**: For UI/visual work, activate `design-driven` v4 (Tier 0 inline `< 50` lines; Tier 1 1-message Creative Pitch + `DESIGN_SYSTEM.md` + optional `frontend-builder` under Model-Offload/Greenfield + `verify-frontend-gates.mjs --live` / `ui-diff` + max 1 blind `frontend-critic` pass). For backend services, apply `backend-driven` (`Backend Read` + `verify-backend-gates.mjs`).
6. **REMOTE OPERATION AUTHORIZATION**: Local development access never authorizes remote execution, `git push`, PR creation, or external transfers without explicit human approval for destination, operation, and session.

---

## 🧭 The 7-Step ODD Protocol (Gentle-AI 4.6.0)

1. **Authorize**: Establish explicit mutation permission. Investigations, reviews, audits, and planning remain strictly read-only.
2. **Explore (CodeGraph First)**: For structural questions, consult **CodeGraph** (`codegraph_explore` or read-only `codegraph status|query|impact`) before broad Read/Glob/Grep sweeps; keep inline evidence to `<= 1` batch (`<= 3` calls / `~10k` tokens).
3. **Resolve Uncertainty**: Optional research only for a named uncertainty; route genuine human choices through a compatible decision tool or at most ONE focused text question, then stop and wait.
4. **Classify (Task Size & Resume Test)**: **Small** when all three hold: (a) **Understood** within `<= 1` batch (`~10k` tok), (b) **Contained risk** (touches none of High-Risk items `1–6`), (c) **Resumable from `git diff` alone**. Large only when the Resume Test fails.
5. **Auto-EGM Plan Gate & Track**: For Large plans, major upgrades, or heavy-logic/high-compute specs, pass the plan draft through [`egm-spec-review`](../../01-planning-process/egm-spec-review/SKILL.md) (`3` zero-context Goldfishes by default; `5` on critical security/architecture; `0` on Small tasks) before writing `odd/tasks/<feature>.md` (`Header -> ## Specs -> ## Tasks -> ## Log`) and its Engram mirror (`capture_prompt: false`). Never author custom sync scripts for the mirror.
6. **Implement (5-Line One-Shot Blueprint + Work Units)**:
   - Synthesize a 5-line micro-blueprint before each edit (target files, signatures/types, invariants & helpers to reuse, edge/lifecycle failure modes, exact verification probe).
   - Work inline by default (`default-inline`). Commit work units in reviewable slices (`~400` authored changed lines heuristic, code + tests + docs together). High-Risk (`1–6`) units get their own isolated commit. Delivery strategy per feature: `ask-on-risk` (default), `auto-chain`, `single-pr`, or `exception-ok`. Record every commit hash in `odd/tasks/<feature>.md`.
7. **Close, Pre-Release Live CVE Gate & Verify**:
   - Run [`live-cve-security-intel`](../../02-dev-roles/live-cve-security-intel/SKILL.md) on releases; pre-scan untrusted third-party inputs with [`prompt-shield`](../../03-ai-ml/prompt-shield/SKILL.md) (`safe_read.py`); report observed commands/output; close with `Risk: item N (reason)` or `Risk: none` (always checking item 3 if shared helpers/options/parsers changed).

---

## ⚠️ The 6 High-Risk Items, Delegation & 3-Tier Verification (Gentle-AI 4.6.0)

High-Risk items: **(1)** Irreversible data/schema/storage mutation, **(2)** Security (auth, secrets, guards, sandbox), **(3)** Contracts others consume (public API, CLI flags, config formats, mirrored prompts, unrequested breaks in shared helpers), **(4)** Concurrency (locks, races, async ordering), **(5)** Delivery/environment (installers, CI, deploy, dependencies), **(6)** Untested surface.

- **Ask / Mapping Triggers**: Mapping triggers ONLY when understanding exceeds 1 inline batch (`> 3` calls / `> ~10k` tokens) or `> ~5` sequential lookups (`<= 2k` tok `path:line` handoff + 1 parent spot-check).
- **Writer Trigger & Mandatory Worker Contract (4.6.0)**: Delegate bounded writers ONLY for `2+` independent behavioral units with disjoint edit surfaces launched together, at the `~150k` parent-context advisory backstop, or for **Frontend Studio / Model-Offload** (`>= 50` UI lines / greenfield with `DESIGN_SYSTEM.md` and distinct `frontend-builder` model). Every writer prompt MUST include:
  1. `## Allowed edit surfaces` (exact repo-relative paths/globs; never `.` or absolute paths). Workers never widen surfaces themselves — they report needed candidate paths to the parent. The parent **adjudicates technical extensions itself** when they serve the already-authorized objective in the same repository without ownership/concurrency conflicts, issuing a **replacement** `## Allowed edit surfaces` section carrying all still-needed paths (replacement is not a union).
  2. `## Skills to load before work` (exact `SKILL.md` paths resolved from `.atl/skill-registry.md` / `skill-router.mjs`, checking `skill_resolution` on return).
  *(Note: as of Gentle-AI `4.6.0`, workers are no longer required to append a `## Key Learnings` closing block.)*
- **3-Tier Delegated Verification Gate & Differential Check (`_shared/verify-method.md`)**:
  - `passive` (docs/comments/images): structural readback only.
  - `medium` (ordinary behavior): writer self-verification + parent spot-check.
  - `high` (named High-Risk item `1–6`): writer self-verification + independent read-only verifier running [`_shared/verify-method.md`](../../_shared/verify-method.md) inside an isolated scratch copy (`mktemp -d`, without `.git`, `HOME`/`TMPDIR` inside scratch) + differential check (`base` vs `change` on shared code). Max 1 correction batch + 1 scoped recheck; when a worker exhausts its corrections, the **orchestrator owns the next step** (resolve inline, mark partial, or surface `Needs your decision` without looping).
- **Scratch State Discipline**: Subagents NEVER delete outside scratch directories — they report exact scratch paths to the parent orchestrator, which cleans them up after use.

---

## 🧭 Floor, Not Ceiling (`[Beyond-Baseline]`)

ODD establishes the verification and safety floor. Preserving security invariants, `pnpm-only`, observed test proof, and mandatory `Risk:` closure, agents may apply higher-leverage techniques (property-based tests, formal state checks, differential harnesses) annotated with `[Beyond-Baseline: <technical reason>]`.
