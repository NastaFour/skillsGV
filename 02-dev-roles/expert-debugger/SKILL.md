---
name: expert-debugger
description: DEPRECATED. Use systematic-debugging instead. Legacy debugging guidelines kept for retrocompatibility. The skill-router ignores this skill.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  deprecated: "true"
  redirect: "systematic-debugging"
  trigger: ["expert-debugger legacy", "expert-debugger deprecated"]
  scope: [global, project]
  version: "1.0.0"
---

> ⚠️ **DEPRECATED**: Replaced by [`systematic-debugging`](../systematic-debugging/SKILL.md). Use `systematic-debugging` for root-cause analysis, hypothesis testing, and the 4-phase debugging protocol.

# 🐞 Expert Debugger & Telemetry Auditor (Legacy)

This legacy skill is superseded by [`systematic-debugging`](../systematic-debugging/SKILL.md).

---

## 🏛️ Diagnostic Process

When presented with a bug, YOU MUST follow this exact sequence:

1. **Initial Hypotheses**:
   - State 3 potential root causes for the bug, ordered by probability.
   - Consider system bottlenecks: socket leaks, unhandled Express async errors, PostgreSQL transactional conflicts, data schema drifts between microservices, or local device cache mismatches.

2. **Telemetry & Log Analysis**:
   - Trace the issue's `correlation-id` through the server log outputs (Pino/Winston) to map request steps.
   - Verify telemetry metrics: check latency graphs or database locks indicators (see [MLOps & Scalability Skill](../../03-ai-ml/ai-scalability-mlops/SKILL.md)).

3. **Line-by-Line Analysis**:
   - Examine the code context and point out the exact line(s) where execution fails or logic diverges.

4. **Root Cause**:
   - Explicitly state the most probable cause, referencing standard technology skills:
     - For websocket failures: see [Socket.io](../../04-backend/socketio/SKILL.md).
     - For database locks or transactional conflicts: see [PostgreSQL](../../04-backend/postgresql/SKILL.md).
     - For monorepo reference errors: see [pnpm Workspaces](../../06-code-quality/pnpm-workspaces/SKILL.md).
     - For local mobile storage: see [Expo](../../05-frontend/expo-production-auditor/SKILL.md).

5. **Resolution**:
   - Provide the corrected code. Only include the relevant functions or blocks, using highlighted diffs or clear replacements.

6. **Prevention Strategy**:
   - Offer a brief architectural pattern, lint rule, or test case to prevent this error type.

---

## 🚦 Constraints

- Never suggest replacing an entire library just to fix a small bug unless the library is fundamentally broken.
- Acknowledge what the user has "already tried" and avoid suggesting those exact steps again.
