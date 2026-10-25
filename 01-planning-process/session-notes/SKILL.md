---
name: session-notes
description: "ECC-inspired session-to-session context transfer. Records key decisions, discoveries, and context at session end so the next session starts with awareness. Use at the end of each development session or before context compaction. Do not use for permanent architecture decision records (ADRs) or user-facing documentation."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["session notes", "end session", "save context", "session summary", "before compaction", "handoff", "apuntes", "registro de sesión"]
  scope: [global, project]
  version: "1.1.0"
---

# 📝 Session Notes (ECC Pattern)

Inspired by ECC's session persistence hooks. When context resets (new session, compaction, next day), the agent starts blind. Session notes bridge that gap.

## 📋 When to Use

- Use at the end of every development session (always, no exceptions)
- Use before context compaction (the agent is about to forget everything)
- Use when handing off work to another developer or agent
- Use at natural checkpoints (Phase completion, bug fix, merge)

## 🚦 Hard Rules

- **Always** save session notes before ending a session
- **Always** include WHAT was done, WHY decisions were made, and WHAT is pending
- **Always** update `project-tracker` decision log with key entries
- **Never** save raw chat logs (noise) — synthesize only
- **Never** skip this when the session was productive

## 🛠️ Session Note Template

Save as `.codewhale/sessions/YYYY-MM-DD-<topic>.md` or `.sessions/YYYY-MM-DD.md`:

```markdown
# Session: <brief title>

- **Date**: 2026-06-14
- **Duration**: ~2h
- **Phase**: Phase 3 (Feature Implementation) — Workspace Billing & Audit Module
- **Agent**: OpenCode / Antigravity

## 🎯 Goals
- [x] Design the audit event persistence schema
- [x] Define shared API contracts for resource CRUD
- [ ] Implement role-based authorization middleware (deferred to next session)

## 🧠 Key Decisions
1. **Decision**: Use database enum for resource lifecycle states vs raw string
   - **Why**: Compile-time and DB-level type safety, prevents invalid state transitions
   - **Rejected alternative**: Free-form string column (harder to validate across services)
2. **Decision**: Separate `audit_events` append-only table from primary `resources` table
   - **Why**: Immutable historical trail needed for compliance without bloating primary read queries

## 🐞 Bugs Found & Fixed
- **WebSocket reconnection timeout**: Adjusted backoff ceiling to 10s for unstable client networks
- **ORM migration drift**: Added `pnpm prisma migrate dev --create-only` to pre-commit workflow

## 🔬 Discoveries
- Background sync API requires explicit foreground/background permission declarations on mobile targets
- Upstream third-party webhook rate limit is 60 req/min; requires local token-bucket throttling

## 📂 Files Modified
- `packages/database/prisma/schema.prisma` — added `AuditEvent` model
- `packages/contracts/src/resource.ts` — Zod schemas for resource CRUD
- `apps/web/src/features/audit/AuditLogTable.tsx` — new presentational table component

## ⏭️ Next Session
1. Implement RBAC/ABAC authorization middleware
2. Wire `AuditLogTable` to paginated query endpoint
3. Write integration tests for resource state transitions

## 📊 Project Tracker Status
- **Active Phase**: `[/]` Phase 3 — 60% complete
- **Next Phase**: Phase 4 (End-to-End Verification)
- **Blockers**: None
```

## 🔄 Integration with Project Tracker

After saving session notes, update `01-planning-process/project-tracker/SKILL.md`:

```markdown
## 4. 🧠 Decision Log
- [2026-06-14] Session: Audit schema & contracts design. Decisions: DB enum for lifecycle states, append-only `audit_events` table. See `.sessions/2026-06-14-audit-design.md`.
```

## 🔗 Compact Survival Protocol

When the context is about to compact, the agent must:

1. **Save session notes immediately** (use this template)
2. **Call mem_context if MCP is available** (engram)
3. **Update project-tracker** with current phase status
4. **Leave a breadcrumb** in the chat for the next agent:

```
--- COMPACTION BOUNDARY ---
Session notes saved: .sessions/2026-06-14.md
Active phase: Phase 3 (Feature Implementation)
Next task: Wire AuditLogTable to paginated API
Key decision: Separate append-only audit_events table for compliance trail
```

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

This template is the baseline for session continuity. You are encouraged to adapt storage or structure when a project provides stronger persistence primitives (annotated with `[Beyond-Baseline: <reason>]`):
- **Engram / ODD Task Mirror**: When working under ODD with `odd/tasks/<feature>.md` and Engram MCP (`mem_save` / `mem_session_summary`), synchronize decisions directly into the feature logbook instead of duplicating markdown files.
- **Automated Git-Linked Notes**: Attach commit SHAs and test runner summaries directly to the session handoff for deterministic resume checks.

## 📚 References

- [ECC Session Persistence](https://github.com/affaan-m/ECC/blob/main/the-longform-guide.md)
- `01-planning-process/project-tracker/SKILL.md` — Decision Log
- `01-planning-process/engram-integration/SKILL.md` — MCP memory (if available)

## 🧠 Continuous Learning Rule (ECC Pattern)

Inspired by ECC's continuous learning pattern. When a session reveals a repeatable problem or pattern, extract it into a reusable skill.

### When to Create a Skill

If you had to repeat a prompt **2+ times** or the agent ran into the **same problem twice**, that pattern must become a skill:

1. **Identify the pattern**: What did you fix? What workaround did you discover?
2. **Create the skill** with `00-meta-skills/skill-creator`:
   ```
   "Create a new skill called <name>. It should cover <pattern discovered>."
   ```
3. **Add to Auto-Invoke List** in `AGENTS.md` with the trigger
4. **Run `skill-sync`** to distribute to all tools
5. **Note in session notes**: what skill was created and why

### Example

```
Session notes:
- Pattern discovered: Native prebuild fails when unlinked native dependencies are added
- Created skill: `expo-native-deps` with trigger "expo install", "native dependency"
- Added auto-invoke entry: "Install native Expo dependency" → `expo-production-auditor`
```

This prevents wasting tokens and time on the same problem in future sessions.
