---
name: backend-driven
description: "Trigger: backend-driven, verify-backend-gates, Backend Read, api architecture, backend gate, rest endpoint, microservice, database schema. Use before generating or refactoring any API, service, worker, or backend module to run the 3-Phase Backend Engine (Phase 1 3-line Backend Read & contract design, Phase 2 composable <=5 capability loading, Phase 3 deterministic verify-backend-gates.mjs audit). Do NOT use for purely visual UI/CSS tasks without API, data, or server logic."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, Antigravity. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*,pnpm:*,git:*) Read Write
allows-script-exec: "verify-backend-gates.mjs spawns sibling 04-backend audit scripts via node:child_process"
metadata:
  trigger: ["backend-driven", "verify-backend-gates", "backend read", "backend gate", "api architecture", "rest endpoint", "graphql api", "database schema", "backend service"]
  scope: [global, project]
  version: "1.0.0"
---

# ⚙️ Backend-Driven Development — 3-Phase Backend Engine & Gate

Enforces secure, schema-validated, bounded backend engineering across **3 non-blocking phases** (`<= 5` skills/turn) anchored on the **3-Line `Backend Read`**, composable domain skills, and deterministic **`verify-backend-gates.mjs`**.

## 🚦 Execution Topology & Fast-Path

- **Small Change (`< 50` backend lines, single module/endpoint)**: Emit a 1-line `Backend Read`, edit inline following RED -> GREEN TDD, run focused tests + `verify-backend-gates.mjs`.
- **Large / High-Risk Change (auth, schema migrations, public contracts, concurrency)**: Track in `odd/tasks/<feature>.md` + Engram mirror, emit full 3-line `Backend Read`, slice work units (`~400` lines), and pass independent high-risk verification.

## 🔄 The 3-Phase Backend Engine

### Phase 1 — `Backend Read` & Contract First (before first write)
Emit before touching backend code:
- **Runtime & Boundary**: Target framework, transport, entrypoints, and environment/secret boundaries (zero hardcoded fallbacks).
- **Schema & Validation**: Request/payload schema validator (`zod`, `valibot`, `pydantic`, SQL constraints) at every trust boundary + typed error envelopes.
- **Data & Bounds**: Parameterized queries only, bounded pagination (`take`/`limit`), idempotency/locking on mutations, and explicit timeouts on I/O.

### Phase 2 — Composable Backend Capability Matrix (`<= 5` skills/turn)
Load only relevant domain skills cleanly alongside `backend-driven`:
- **Contracts & Auth**: `api-design`, `modern-ts-backend`, `api-response-normalizer`, `jwt-bcrypt`, `security-audit`
- **Data & Concurrency**: `postgresql`, `prisma-orm`, `booking-scheduling-domain`
- **Resilience & Ops**: `rate-limiting-design`, `background-jobs-queues`, `file-uploads-storage`, `notifications-multichannel`, `reports-exports`, `nodejs-module-loading`, `performance-refactor`, `observability`, `monitoring`

### Phase 3 — Deterministic Gate (`verify-backend-gates.mjs`)
Run after implementation and before completion:
```bash
node 04-backend/backend-driven/scripts/verify-backend-gates.mjs --srcDir <src-dir> --rootDir <root-dir> --json
```
- Automatically chains applicable sibling checkers (`check-id-consistency`, `check-limiters`, `check-jobs`, `check-booking-queries`, `check-uploads`, `check-notifications`, `check-reports`, `check-env-loading`) based on detected stack signals.
- Runs 6 built-in deterministic guards (`raw-sql-interpolation`, `hardcoded-secret-fallback`, `unsafe-cors-wildcard-credentials`, `empty-catch-block`, `unvalidated-mutation-body`, `unbounded-list-query`). Pass `--strict` in CI/release audits to fail on warnings.
