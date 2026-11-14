---
name: brainstorming
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
allowed-tools: Bash(node:*) Read
license: MIT
allows-script-exec: "local brainstorm server launches the URL opener via exec/execFile"
metadata:
  trigger: ["brainstorming", "ideas", "specs", "requirements discovery"]
  scope: [global, project]
  version: "1.0.0"
---

# Brainstorming Ideas Into Designs

Turn ideas into validated designs through collaborative dialogue scaled to task scope.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have told your human partner what you intend and they have approved it. This applies to EVERY task on EVERY path below — the ceremony scales with the task; the approval gate never does.
</HARD-GATE>

## Three Paths (Announce Classification First)

| Path | Scope | Approval Artifact |
|---|---|---|
| **Spike** | Feasibility probe ("can we...?"); output is an answer, throwaway code | 2–3 sentence probe plan → nod → recommendation report |
| **Bounded** | Well-scoped edit to an existing repo flow (new flag, small endpoint, 1-file fix) | Short in-chat design (files + testing) → explicit yes (no spec file) |
| **Architectural** | New projects, subsystems, or shared contract changes | Clarifying questions → 2–3 approaches → sectioned design → written spec + review |

**One-way ratchet**: When in doubt, pick the heavier path. Hidden complexity discovered mid-task steps up; never downgrade mid-task.

## Red Flags (Anti-Skip Guards)

| Thought | Reality |
|---|---|
| "Too simple to need a design" | Simple means two sentences in chat, never skipping approval. |
| "I'll call it bounded to skip the spec" | Reaching for a label to skip rigor triggers the heavier path. |
| "Obvious design — start while they read" | Wait for explicit approval before touching code. |
| "I know this app kind, so it's bounded" | Bounded measures existing repo flows; new projects are Architectural. |
| "Spike works / grew mid-task" | Keeping spike code is a new request; mid-task growth steps up the path. |

## Core Protocol & Visual Companion

1. **Explore & Scope**: Check current repo state first; decompose multi-subsystem requests before refining one piece. Ask **one question per message** (multiple choice preferred).
2. **Design & Trade-offs**: For Architectural paths, compare 2–3 approaches with YAGNI, single-purpose unit boundaries, and self-review (`TBD`/`TODO` scan) before requesting written spec approval.
3. **Visual Companion (Just-in-Time)**: Never offer upfront. Offer in its own standalone message only when a genuinely visual mockup/diagram choice arises; per-question choose browser (wireframes/diagrams) vs terminal (text tradeoffs). See [`visual-companion.md`](visual-companion.md) and [`references/ideation-frameworks.md`](references/ideation-frameworks.md).

## Transition to Downstream Pipeline

- Product requirements → [`../idea-to-prd-express/SKILL.md`](../idea-to-prd-express/SKILL.md) (`PRD.md`).
- UI direction & design tokens → [`../../05-frontend/design-driven/SKILL.md`](../../05-frontend/design-driven/SKILL.md) (`DESIGN_SYSTEM.md`).
- Execution under ODD → [`../../00-meta-skills/odd-workflow/SKILL.md`](../../00-meta-skills/odd-workflow/SKILL.md) creating `odd/tasks/<feature>.md` plus a **5-line One-Shot Execution Blueprint** per task (1. Target files, 2. Public signatures/types, 3. Invariants/helpers, 4. Edge/lifecycle failure modes, 5. Verification probe command).
