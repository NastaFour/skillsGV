---
name: expressjs
description: "Guidelines for Express.js API development. Enforces route modularization, Zod request validation, secure authentication/RBAC middleware, rate-limiting, and structured error boundaries. Use when creating or modifying HTTP routes, REST endpoints, middlewares, or error handlers. Do not use for WebSocket event handlers or frontend routing."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["express", "API REST", "middleware", "ruta", "endpoint"]
  scope: [global, project]
  version: "1.1.0"
---

# 🚀 Express.js API Development

Use this skill when defining HTTP routes, REST endpoints, middlewares, or error boundaries in Express.js services.

## 🚨 API Implementation Standards

1. **Express 4.19+ / 5.x Guidelines**:
   - Never trust raw `req.body`, `req.query`, or `req.params` without schema validation.
   - Leverage native async error propagation in Express 5.x; in Express 4.x, wrap async handlers in a deterministic `asyncHandler` utility so rejected promises always reach the global error middleware.

2. **Schema Validation Middleware (Zod)**:
   - Parse and validate incoming `body`, `query`, and `params` through a Zod schema before invoking route controllers:
     ```typescript
     export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
       const result = schema.safeParse(req.body);
       if (!result.success) {
         return res.status(400).json({ error: 'Validation Failed', details: result.error.flatten() });
       }
       req.body = result.data;
       next();
     };
     ```

3. **Global Error Boundary**:
   - Register a single centralized error-handling middleware at the end of the pipeline to log structured JSON with `correlationId` and return safe, non-leaking HTTP responses:
     ```typescript
     app.use((err: AppError, req: Request, res: Response, _next: NextFunction) => {
       logger.error({ err, correlationId: req.headers['x-correlation-id'] });
       res.status(err.statusCode || 500).json({
         error: err.isOperational ? err.message : 'Internal Server Error',
         correlationId: req.headers['x-correlation-id'],
       });
     });
     ```

## 🔒 Security & Protection

1. **Authentication & Authorization Middleware**:
   - Extract access tokens from `Authorization: Bearer <token>` headers or secure HTTP-only cookies.
   - Enforce Role-Based (RBAC) or Attribute/Scope-Based (ABAC) checks via composable middleware (`requireRole('ADMIN')`, `requireScope('resources:write')`) and verify resource ownership to prevent BOLA/IDOR.

2. **Tiered Rate Limiting**:
   - Apply `express-rate-limit` (backed by Redis in multi-instance deployments) tailored to endpoint sensitivity:
     - **Authentication / Token endpoints** (`/api/v1/auth/*`): Strict threshold (e.g., 20–100 requests per 15 minutes per IP/account).
     - **Authenticated domain mutations**: Keyed by authenticated principal ID (`req.user.id`) with IP fallback.

3. **Security Headers & CORS**:
   - Enable `helmet` for strict security headers and disable `X-Powered-By`.
   - Configure `cors` with an explicit allowlist of trusted origins from environment configuration. Never combine `origin: '*'` with credentials.

## 🗺️ Domain-Driven Route Modularization

Group routers by bounded domain context and version prefix:
- `/api/v1/auth`: Session authentication, token rotation, and principal profile.
- `/api/v1/workspaces` or `/api/v1/resources`: Core domain CRUD and state transitions (protected by RBAC/ABAC and tenant isolation).
- `/api/v1/webhooks`: Signature-verified inbound webhook handlers (raw body verification before JSON parsing).
- `/api/health`: Liveness and readiness probes.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Express is a proven baseline for Node.js HTTP APIs. When starting new services or optimizing performance-critical paths, consider modern alternatives (annotate with `[Beyond-Baseline: <reason>]`):
- **Modern Type-Safe Frameworks**: Prefer Hono, Fastify, or NestJS/tRPC when Web Standard `Request`/`Response` portability, OpenAPI auto-generation (`@hono/zod-openapi`), or higher throughput is required.
- **Problem Details Standard**: Format error responses following RFC 9457 (`application/problem+json`) for standardized machine-readable API diagnostics.
