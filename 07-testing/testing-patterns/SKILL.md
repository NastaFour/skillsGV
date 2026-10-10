---
name: testing-patterns
description: "Unit, integration, and E2E testing patterns for fullstack apps. Use when writing tests with Vitest, Supertest, or React Testing Library. Do NOT use for penetration testing or security audits."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["escribir tests", "crear pruebas", "unit test", "integration test", "e2e", "vitest", "jest", "supertest", "coverage"]
  scope: [global, project]
  version: "1.1.0"
---

# 🧪 Testing Patterns — Automated Fullstack Testing

Rigorous, deterministic testing standards for backend and frontend services. Emphasizes pure isolation, strict assertion, and zero flaky side-effects.

---

## 🚫 ABSOLUTE BANS (Non-Negotiable)

1. **PNPM ONLY**: Strictly use `pnpm test`, `pnpm test:coverage`, or `pnpm dlx`. All legacy package managers (non-pnpm) are strictly forbidden in this repository.
2. **NO UNMOCKED NETWORK OR DB IN UNIT TESTS**: Unit tests MUST NEVER make live HTTP calls or touch persistent disks/databases. Use `vi.mock` or `vi.fn()`.
3. **NO SHARED MUTABLE STATE**: Every test suite MUST reset mocks before or after each test via `beforeEach(() => { vi.clearAllMocks(); })`.
4. **NO TAUTOLOGICAL TESTS**: Never assert `expect(true).toBe(true)` or test mock implementations instead of system-under-test behavior.
5. **NO UNTYPED TESTS OR `any`**: Test fixtures and mock signatures must be strictly typed.

---

## 🏛️ Structure: The AAA Pattern (Arrange, Act, Assert)

Every test must follow the 3 clean phases:
```typescript
it('processes payment and confirms order in happy path', async () => {
  // 1. Arrange: setup inputs, fixtures, and deterministic mocks
  const input = { orderId: 'ord-123', amount: 99 };
  paymentGatewayMock.charge.mockResolvedValueOnce({ id: 'tx-456', status: 'SUCCESS' });

  // 2. Act: invoke SUT
  const result = await sut.processOrder(input);

  // 3. Assert: verify results, mock invocations, and state
  expect(result.status).toBe('CONFIRMED');
  expect(paymentGatewayMock.charge).toHaveBeenCalledTimes(1);
  expect(paymentGatewayMock.charge).toHaveBeenCalledWith(99);
});
```

---

## ⚖️ Before & After: Testing Anti-Patterns vs Best Practices

| ❌ Anti-Pattern | ✅ Best Practice Pattern |
|---|---|
| Invoking tests via unapproved legacy runners | `pnpm dlx vitest run`<br>`pnpm add -D @vitest/coverage-v8` |
| Live database calls or random sleep timers:<br>`await new Promise(r => setTimeout(r, 1000));` | Deterministic fake timers or async awaiting:<br>`vi.useFakeTimers(); vi.advanceTimersByTime(1000);` |
| Lingering mock state across tests (flaky suites) | `beforeEach(() => { vi.clearAllMocks(); });` in every describe block |
| `describe('test', () => { it('works', () => { ... }) })` | Clear describe/it naming describing SUT and expected contract |

---

## 📋 Obligatory Coverage Matrix (6 Scenarios)

Every non-trivial service or domain entity must verify:
1. **Happy Path** (>=2 tests): Normal expected behavior with valid inputs.
2. **Edge Cases** (>=3 tests): Null, undefined, empty collections, negative numbers, boundary limits.
3. **Auth & Authorization**: Rejection of missing tokens or insufficient permissions (401/403).
4. **Resource Teardown**: Proper closing of connections, stream cleanup, listener removal.
5. **Transactional Integrity / Rollback**: Automatic abort and rollback when downstream operations fail.
6. **SOLID & Error Handling**: Explicit throwing and mapping of domain exceptions (no uncaught rejections).

---

## 🚀 Execution Commands

```bash
# Run unit tests in watch/run mode
pnpm test

# Run tests with strict coverage thresholds (>=80%)
pnpm test:coverage

# Run a specific focused test file
pnpm dlx vitest run path/to/service.test.ts
```
