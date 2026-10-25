---
name: feature-implementer
description: "Implement production-ready features and domain logic following senior engineering standards. Use this skill when asked to generate functional code, API endpoints, UI flows, or complex domain logic. Do not use for read-only code reviews or architecture-only discovery."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["feature implementer", "implement feature", "production code"]
  scope: [global, project]
  version: "1.1.0"
---

# 🛠️ Feature Implementer (Production Engineering Standards)

This skill sets the baseline for senior-level code implementation, preventing trivial, non-production "tutorial-grade" code while leaving room for architectural evolution.

## 🚨 Implementation Standards

When writing code, adhere to these foundational principles:
- **Production-Ready**: Include boundary input validation (e.g., Zod/Valibot), structured error handling, and explicit edge-case management. Never rely on bare `console.log` for error handling in production paths.
- **Single Responsibility**: Every module, function, hook, or class should have one clear reason to change.
- **Strict Typing**: In TypeScript or typed languages, define accurate domain types and narrow `unknown` at boundaries. Avoid `any`.

## 🧭 Contextual Awareness

Before coding, align with existing repository context:
- Sync with the [Project Tracker](../../01-planning-process/project-tracker/SKILL.md) or active ODD feature spec (`odd/tasks/<feature>.md`) for architectural and styling conventions.
- Map code logic to the [Application Workflow & Domain State Machines](../../01-planning-process/application-workflow/SKILL.md).
- Prioritize stack-specific guidelines when applicable:
  - **Backend Services**: Refer to [Node.js](../../04-backend/nodejs/SKILL.md), [Express.js](../../04-backend/expressjs/SKILL.md), [Prisma ORM](../../04-backend/prisma-orm/SKILL.md), [Socket.io](../../04-backend/socketio/SKILL.md), and [JWT/Bcrypt](../../04-backend/jwt-bcrypt/SKILL.md).
  - **Web Applications**: Refer to [React/Vite](../../05-frontend/react-vite/SKILL.md) and [Tailwind CSS](../../05-frontend/tailwind-4/SKILL.md).
  - **Mobile Applications**: Refer to [React Native](../../05-frontend/react-native/SKILL.md) and [Expo](../../05-frontend/expo-production-auditor/SKILL.md).

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

These standards establish the engineering floor, not a rigid ceiling. You may adopt superior patterns or modern stack idioms when justified by the project architecture (annotate with `[Beyond-Baseline: <reason>]`):
- **Architecture Fit**: Use Layered Architecture, Hexagonal/Clean Ports & Adapters, or Vertical Slice Architecture depending on domain complexity rather than forcing a single folder template.
- **Modern Runtime & Frameworks**: Prefer Hono, Fastify, tRPC, or Next.js/Remix Server Actions over classic Express/REST when the project stack already targets edge runtimes or end-to-end type safety.
- **Invariants that never bend**: Zero hardcoded secrets, `pnpm-only` package management, boundary validation, and observed test evidence before declaring completion.

## 📦 Delivery Format

1. **Dependencies**: If new packages are required, provide the `pnpm add` command first (respecting workspace lockfiles).
2. **Code Organization**: Group changes clearly by file path.
3. **Comments**: Comment only on non-obvious domain invariants, concurrency hazards, or algorithmic trade-offs. Code should be self-explanatory.
4. **Verification**: End with the exact test or verification command observed to prove the feature works.
5. **Skill Handoff**: Conclude by asking if the user wants to invoke `qa-tester` for destructive edge-case coverage or `dod-checker` to audit task closure.
