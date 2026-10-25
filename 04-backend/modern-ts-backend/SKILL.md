---
name: modern-ts-backend
description: "Trigger: Hono, Fastify, Drizzle ORM, Kysely, PGlite, WinterCG, modern TypeScript backend, RPC client, SSE streaming. Use when architecting greenfield TypeScript APIs, edge/serverless services, type-safe SQL layers, or high-throughput streaming backends beyond legacy Express and Prisma. Do NOT use for frontend-only static sites or when an existing project mandates Express/NestJS without migration authorization."
license: MIT
compatibility: "Compatible with Node.js 22+, Bun, Deno, Cloudflare Workers, Hono 4+, Fastify 5+, Drizzle ORM, Kysely, and pnpm 9+."
allowed-tools: Read Write Edit Bash(pnpm:*,node:*) Glob Grep
metadata:
  trigger: ["modern ts backend", "hono", "drizzle orm", "kysely", "pglite", "fastify", "wintercg", "backend moderno typescript", "hono rpc"]
  scope: "global, project"
  version: "1.0.0"
  author: skillsGV
---

# ⚡ Modern TypeScript Backend (2026) — Web-Standard HTTP, SQL-First ORMs & Zero-Cold-Start Testing

Inspirational architecture guide for high-performance 2026 TypeScript backends. While **Express + Prisma** remains a valid baseline for traditional Node.js servers, modern greenfield services achieve superior type safety, zero cold-start overhead, portable runtime execution, and sub-millisecond integration testing with **Web-Standard HTTP (`Hono` / `Fastify`) + SQL-First TypeScript (`Drizzle ORM` / `Kysely`) + In-Memory WASM Postgres (`PGlite`)**.

---

## 🧭 Architectural Decision Matrix: When to Choose Which Stack

| Dimension | Legacy / Established (`Express 5 + Prisma`) | High-Throughput Node (`Fastify 5 + Kysely`) | Portable / Edge / Full-Stack RPC (`Hono 4 + Drizzle ORM`) |
|---|---|---|---|
| **HTTP Primitive** | Node `req`/`res` monkey-patched streams | Node HTTP with pre-compiled JSON schemas | Web-Standard Fetch `Request` / `Response` (WinterCG) |
| **Runtime Portability** | Node.js only | Node.js primary | Node.js, Bun, Deno, Cloudflare Workers, Vercel, AWS Lambda |
| **End-to-End Type Safety** | Requires OpenAPI codegen or separate tRPC layer | Schema-driven via TypeBox / Zod plugins | Native zero-codegen RPC (`hc<AppType>()`) built into router |
| **Database Layer** | Rust/WASM query engine + `.prisma` DSL | Pure TypeScript SQL query builder (zero overhead) | Pure TypeScript SQL-like relational & query builder |
| **Cold Start & Bundle** | Heavy (~15MB+ engine footprint) | Lightweight (~2MB) | Ultra-lightweight (<50KB router + ~50KB ORM) |
| **Best Fit** | Existing Express codebases, rapid CRUD with Prisma Studio | High-RPS microservice APIs on dedicated Node VMs/containers | Greenfield SaaS, AI streaming APIs, monorepos, serverless/edge |

---

## 🏗️ 1. Web-Standard HTTP & End-to-End RPC with Hono + Zod

Hono builds directly on the WinterCG `Request` and `Response` standards. By chaining routes and using `@hono/zod-validator`, the backend exports a single `AppType` consumed directly by the frontend with zero code generation:

```typescript
// src/app.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "./db/client.js";
import { orders } from "./db/schema.js";

const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  currency: z.enum(["USD", "EUR", "ARS"]),
});

export const app = new Hono()
  .post("/api/orders", zValidator("json", createOrderSchema), async (c) => {
    const payload = c.req.valid("json");
    const [created] = await db.insert(orders).values(payload).returning();
    return c.json({ data: created }, 201);
  });

export type AppType = typeof app;
```

```typescript
// Frontend / SDK consumer — 100% inferred input & status-code output types
import { hc } from "hono/client";
import type { AppType } from "../server/src/app.js";

const client = hc<AppType>("https://api.example.com");
const res = await client.api.orders.$post({
  json: { customerId: "cf902c78-8430-416e-86c9-e08420c78d1c", amountCents: 4500, currency: "USD" },
});
if (res.status === 201) {
  const body = await res.json(); // body.data is strictly typed!
}
```

---

## 🗄️ 2. SQL-First Type-Safe Persistence with Drizzle ORM

Unlike black-box ORMs that hide SQL joins and suffer from N+1 query cascades, **Drizzle ORM** defines schemas in pure TypeScript and compiles relational queries into a **single deterministic SQL statement**:

```typescript
// src/db/schema.ts
import { pgTable, uuid, integer, text, timestamp, index } from "drizzle-orm/pg-core";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("orders_customer_idx").on(table.customerId)]
);
```

### Key Drizzle & Kysely Engineering Rules
- **Single-Query Relational Joins**: Use Drizzle's `db.query.orders.findMany({ with: { items: true } })` or explicit `leftJoin` in Kysely so nested relations execute as one SQL query using lateral joins—never N+1 loops.
- **Prepared Statements on Hot Paths**: Use `.prepare("get_order_by_id")` for high-frequency queries to skip SQL planning overhead on repeated executions.
- **Explicit Transactions**: Wrap multi-table mutations in `await db.transaction(async (tx) => { ... })` with explicit rollback on invariant failure.

---

## 🌊 3. Native Streaming & Server-Sent Events (SSE) for AI/Realtime

Modern backends frequently stream LLM tokens, progress updates, or live telemetry. Use Hono's `streamSSE` helper over standard HTTP/2 or HTTP/3 without WebSocket state complexity:

```typescript
import { streamSSE } from "hono/streaming";

app.get("/api/orders/:id/events", (c) =>
  streamSSE(c, async (stream) => {
    let eventId = 0;
    stream.onAbort(() => {
      // Clean up upstream listeners or abort controllers immediately
    });
    await stream.writeSSE({
      id: String(++eventId),
      event: "order.status",
      data: JSON.stringify({ orderId: c.req.param("id"), state: "processing" }),
    });
  })
);
```

---

## 🧪 4. Instant Real-Postgres Testing with PGlite (Zero Docker Wait)

Replace brittle SQLite mocks and slow Docker boot cycles during unit/integration TDD with **`@electric-sql/pglite`** (real PostgreSQL compiled to WASM running in-memory in <50ms):

```typescript
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../src/db/schema.js";

export async function createEphemeralTestDb() {
  const client = new PGlite(); // In-memory real Postgres instance
  const db = drizzle({ client, schema });
  // Run migrations or push schema once per test suite
  return { client, db };
}
```

---

## 🚀 Floor, Not Ceiling ([Beyond-Baseline])

Our catalog's `expressjs` and `nodejs` skills establish the foundational floor for HTTP security, validation, and error handling. Use this skill (`[Beyond-Baseline: <reason>]`) when modernizing or building greenfield systems:

- **Web-Standard Request Testing Without Network Ports**: Test routes directly via `await app.request("/api/orders", { method: "POST", body: ... })` in Vitest or `node --test` without binding TCP sockets (`[Beyond-Baseline: Zero-socket WinterCG integration testing]`).
- **OpenAPI 3.1 + Scalar Auto-Documentation**: Pair `@hono/zod-openapi` with `@scalar/hono-api-reference` so Zod schemas simultaneously enforce runtime validation, infer RPC client types, and serve interactive OpenAPI documentation.
