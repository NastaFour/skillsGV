---
name: testing-patterns
description: "Unit, integration, and E2E testing patterns for fullstack apps — fast deterministic unit tests vs ephemeral-database integration tests (PGlite, Testcontainers, SQLite in-memory). Use when writing tests with Vitest, Supertest, or React Testing Library. Do NOT use for penetration testing or security audits."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["escribir tests", "crear pruebas", "unit test", "integration test", "E2E", "vitest", "jest", "supertest", "coverage"]
  scope: [global, project]
  version: "1.2.0"
---

# 🧪 Testing Patterns — High-Signal Automated Testing

Rigorous, deterministic testing standards for backend and frontend applications. Combines fast isolated unit tests for pure domain logic with realistic ephemeral-database integration tests (`PGlite`, `Testcontainers`, in-memory SQLite) where mocking persistence would hide real SQL/constraint bugs.

---

## 🚫 Hard Testing Invariants (Non-Negotiable)

1. **PNPM ONLY**: Strictly use `pnpm test`, `pnpm test:coverage`, or `pnpm dlx`. Legacy non-pnpm package runners are forbidden in this repository.
2. **ZERO LIVE PRODUCTION / EXTERNAL THIRD-PARTY NETWORK CALLS**: Tests must be hermetic and offline-capable. Never hit live Stripe, OpenAI, or shared staging databases; stub external HTTP APIs (MSW / injected fakes) and use ephemeral local instances for databases.
3. **NO SHARED MUTABLE STATE LEAKS**: Every test must run deterministically in isolation regardless of execution order. Reset mocks (`vi.clearAllMocks()`) or isolate database transactions (`BEGIN` / `ROLLBACK` or per-test schema) in `beforeEach`/`afterEach`.
4. **NO TAUTOLOGICAL OR IMPLEMENTATION-COUPLED TESTS**: Never assert `expect(true).toBe(true)` or assert that a mock ORM method was called with an internal query object when the actual behavior under test is data persistence.
5. **STRICT TYPING IN TESTS**: Test fixtures, factories, and fakes must respect TypeScript types rather than silencing errors with unsafe casts.

---

## ⚖️ Choosing the Right Test Tier: Unit Fakes vs Ephemeral Real DBs

Do not force 6 mocked dependencies onto every class or mock out database drivers when testing data access. Match the testing strategy to the layer under test:

| Layer Under Test | Recommended Test Strategy | Why |
|---|---|---|
| **Pure Domain Logic, Pricing, Parsers & State Machines** | **Fast Unit Tests** (zero I/O, or lightweight in-memory fakes for ports) | Executes in milliseconds; ideal for exhaustive edge-case combinatorics, boundary values, and business rules. |
| **Repositories, SQL Queries, Migrations, Constraints & Vertical Slices** | **Ephemeral Real Database Integration Tests** (`@electric-sql/pglite`, `Testcontainers`, SQLite `:memory:`) | Mocking Prisma/Drizzle/SQL (`vi.mock('@/db')`) tests your mock, not your query. Ephemeral DBs catch broken joins, unique constraint violations, nullability bugs, and transaction rollbacks with full determinism. |
| **HTTP Routes, Auth Guards & Serialization Boundaries** | **API Integration Tests** (`supertest`, Hono `app.request`, Fastify `.inject()`) | Verifies status codes (`200`, `400`, `401`, `403`), Zod validation errors, headers, and cookie flags through the real router pipeline. |
| **Critical User Journeys (Signup, Checkout)** | **Focused E2E Tests** (Playwright) | Verifies browser rendering, network wiring, and accessibility across the full stack. |

---

## 🏛️ Structure: The AAA Pattern (Arrange, Act, Assert)

### 1. Unit Test with Focused Port Fake (Domain Orchestration)
```typescript
it('confirms order and records transaction id on successful charge', async () => {
  // 1. Arrange: setup typed inputs and deterministic boundary stub
  const input = { customerId: 'cust-1', items: [{ unitPriceCents: 2500, quantity: 2 }], paymentToken: 'tok_visa' };
  paymentGatewayFake.charge.mockResolvedValueOnce({ id: 'tx-456', status: 'SUCCESS' });

  // 2. Act: invoke system under test through its public contract
  const result = await checkoutUseCase.execute(input);

  // 3. Assert: verify observable domain outcome and boundary interaction
  expect(result.totalCents).toBe(5000);
  expect(result.transactionId).toBe('tx-456');
  expect(paymentGatewayFake.charge).toHaveBeenCalledWith('tok_visa', 5000);
});
```

### 2. Ephemeral Database Integration Test (PGlite / In-Memory DB)
```typescript
import { PGlite } from '@electric-sql/pglite';
import { beforeEach, describe, expect, it } from 'vitest';

describe('OrderRepository (PGlite Ephemeral DB)', () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();
    await db.exec(`
      CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        total_cents INTEGER NOT NULL CHECK (total_cents >= 0)
      );
    `);
  });

  it('enforces non-negative total_cents constraint in real SQL', async () => {
    await expect(
      db.query('INSERT INTO orders (id, customer_id, total_cents) VALUES ($1, $2, $3)', ['ord-1', 'c-1', -100])
    ).rejects.toThrow();
  });
});
```

---

## ⚖️ Testing Anti-Patterns vs High-Signal Practices

| ❌ Anti-Pattern | ✅ High-Signal Practice |
|---|---|
| Mocking the ORM/SQL builder in repository tests (`vi.mock('drizzle-orm')`) | Run queries against an ephemeral in-memory database (`PGlite`, SQLite `:memory:`, or `Testcontainers`). |
| Arbitrary sleep timers (`await new Promise(r => setTimeout(r, 1000))`) | Deterministic fake timers (`vi.useFakeTimers(); vi.advanceTimersByTime(1000);`) or condition polling. |
| Lingering mock state across tests causing order-dependent flakes | `beforeEach(() => { vi.clearAllMocks(); });` and isolated per-test data state. |
| Vague test names (`it('works', ...)`) | Behavior-driven descriptions (`it('returns 403 when user lacks tenant-admin role', ...)`). |

---

## 📋 Risk-Proportional Coverage Checklist

Instead of forcing an identical mechanical quota onto every trivial helper, cover the scenarios that apply to the component's risk profile:
1. **Happy Path**: Primary expected behavior and observable return/persisted state.
2. **Boundary & Edge Cases**: Empty collections, `0` / negative values, unicode/diacritics, payload limits.
3. **Auth & Tenant Isolation** *(when applicable)*: Unauthenticated (`401`), unauthorized (`403`), and cross-tenant access rejection.
4. **Transactional Integrity & Rollback** *(when mutating state)*: Verification that partial failures leave zero corrupted or orphaned records.
5. **Error Mapping & Resilience**: Deterministic handling of downstream timeouts, duplicate keys, or invalid schemas.
6. **Resource Cleanup** *(when managing streams/timers/listeners)*: Proper teardown without memory or handle leaks.

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Hermetic execution, `pnpm`-only runners, and behavior-focused assertions are non-negotiable invariants. Beyond unit and integration suites, teams are encouraged to adopt **Property-Based Testing (`fast-check`)** for parsers/serializers, **Mutation Testing** for critical financial algorithms, or **Snapshot/Visual Regression Testing** for design systems, annotating specialized harnesses with `[Beyond-Baseline: <testing strategy reason>]`.

---

## 🚀 Execution Commands

```bash
# Run test suite
pnpm test

# Run tests with coverage report
pnpm test:coverage

# Run a focused test file during TDD / RED-GREEN iteration
pnpm dlx vitest run path/to/feature.test.ts
```
