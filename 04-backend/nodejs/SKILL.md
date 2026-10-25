---
name: nodejs
description: "Guidelines for backend Node.js development. Enforces ESM modules, non-blocking event loop discipline, worker_threads for CPU-bound tasks, graceful shutdown, structured JSON logging, and non-root execution. Use when developing backend servers, CLI tools, or background workers. Do not use for browser-only frontend code."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["nodejs", "node.js", "ESM", "clustering", "backend", "worker_threads", "graceful shutdown"]
  scope: [global, project]
  version: "1.1.0"
---

# ⚙️ Node.js Backend Development (2026 Standards)

Use this skill when developing Node.js backend servers, background workers, or scheduled jobs.

## 🚨 Backend Core Standards

1. **Native ESM (ECMAScript Modules)**:
   - Declare `"type": "module"` in `package.json`.
   - Use standard `import` / `export` syntax and explicit `node:` specifiers for built-in modules (`import { randomUUID } from 'node:crypto'`). Never mix legacy `require()` in new ESM packages.

2. **Event Loop Discipline & Async Handling**:
   - Never block the main event loop with synchronous I/O (`fs.readFileSync` in request paths), catastrophic regexes, or heavy CPU loops.
   - Offload CPU-intensive workloads (cryptographic hashing batches, large file parsing, image/PDF processing) to `node:worker_threads` or a background job queue.
   - Propagate `AbortSignal` (`AbortController`) to outbound `fetch` calls, streams, and database queries to enforce strict timeouts.

3. **Environment-Driven Binding & Graceful Shutdown**:
   - Bind ports dynamically from validated environment configuration and handle `SIGTERM` / `SIGINT` to drain in-flight requests and close database/queue pools cleanly:
     ```typescript
     const PORT = Number(process.env.PORT ?? 3000);
     const server = app.listen(PORT, () => logger.info({ port: PORT }, 'Server listening'));

     const shutdown = async (signal: string) => {
       logger.info({ signal }, 'Graceful shutdown initiated');
       server.close(async () => {
         await closeDatabasePools();
         process.exit(0);
       });
       setTimeout(() => process.exit(1), 10_000).unref();
     };
     process.on('SIGTERM', () => shutdown('SIGTERM'));
     process.on('SIGINT', () => shutdown('SIGINT'));
     ```

## 🔒 Security & Observability

1. **Least-Privilege Process Execution**:
   - Never run Node.js as `root` in production containers. Run under a non-privileged user (e.g., `USER node` in Docker) with read-only root filesystems where possible.

2. **Structured JSON Logging & Context Propagation**:
   - Use `pino` (preferred for low overhead) or `winston` for structured JSON logs; never use raw `console.log` in production services.
   - Attach `correlationId` (`node:async_hooks` / `AsyncLocalStorage`) to trace requests across HTTP handlers, background jobs, and WebSockets.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

These practices form the Node.js operational floor. Adopt modern Node 22/24+ capabilities when available (annotate with `[Beyond-Baseline: <reason>]`):
- **AsyncLocalStorage Context**: Use `AsyncLocalStorage` to propagate `correlationId`, `tenantId`, and OpenTelemetry spans automatically without threading context arguments through every function call.
- **Native Runtime Features**: Leverage Node's built-in test runner (`node --test`), native `--env-file` loading in local dev, and Web Streams API for memory-bounded backpressure handling.
