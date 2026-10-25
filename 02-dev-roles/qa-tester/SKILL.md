---
name: qa-tester
description: "Generate comprehensive automated test suites with adversarial boundary, concurrency, idempotency, and authorization matrices. Use this skill when writing unit, integration, or E2E tests using the project's testing framework. Do not use for production feature implementation without tests."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["qa tester", "test matrix", "edge case tests", "adversarial testing"]
  scope: [global, project]
  version: "1.1.0"
---

# 🧪 QA Tester (Adversarial & Boundary Verification)

This skill guides the agent to think adversarially—designing test suites that expose boundary bugs, race conditions, authorization gaps, and partial-failure state corruption.

## 🎯 Universal Testing Coverage Matrix

Your test suites must evaluate the target feature across these 6 verification dimensions:

1. **Happy Path & Contract Compliance**: Verify the nominal flow produces the exact expected return values, HTTP status codes, persisted records, and emitted events (minimum 2 tests).
2. **Boundary & Malformed Input Matrix**: Empty payloads, `null`/`undefined`, numeric boundaries (`0`, `-1`, `MAX_SAFE_INTEGER`, `NaN`), Unicode/control characters, oversized payloads, and invalid state transitions (minimum 3 tests).
3. **Authentication & Authorization (RBAC/ABAC/BOLA)**: Verify unauthenticated requests are rejected (`401`), unauthorized role/scope actions fail (`403`), and cross-tenant / horizontal privilege escalation attempts (BOLA/IDOR) cannot read or mutate another principal's resources.
4. **Concurrency, Idempotency & Lifecycle Cleanup**: Test duplicate requests with the same idempotency key, concurrent conflicting mutations (optimistic locking / version checks), and proper cleanup of event listeners, timers, or WebSocket subscriptions on teardown.
5. **Transactional & State Integrity**: Verify multi-step database mutations roll back atomically when an intermediate step or invariant fails, leaving zero orphaned records or inconsistent state.
6. **Type Safety & Clean Code Regression**: Confirm no `any` leaks into public contracts, shared schemas are imported from their canonical package, and public interfaces are exercised rather than internal implementation details. Refer to [SOLID & Clean Code](../../06-code-quality/solid-clean-code/SKILL.md).

## 🛠️ Code Standards for Tests

- **Behavioral Naming**: Test names must state the scenario and observable outcome (e.g., `should_rollback_transaction_when_audit_log_write_fails` or `should_reject_cross_tenant_resource_update_with_403`).
- **Proportional Isolation**: Mock external third-party network boundaries (payment gateways, LLM APIs, webhooks) via MSW or dependency injection. Prefer real lightweight databases (e.g., PGlite, SQLite in-memory, or Testcontainers) for persistence integration tests over brittle ORM mocks.
- **Deterministic Setup/Teardown**: Isolate state between tests (`beforeEach` transaction rollback or table truncation) and close open handles in `afterAll`.
- **Coverage Summary**: Conclude with a concise matrix mapping each implemented test to the 6 dimensions above.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

When a module requires deeper verification beyond standard unit/integration assertions, extend the suite (annotating `[Beyond-Baseline: <reason>]`):
- **Property-Based Testing (`fast-check`)**: Use generative fuzzing for parsers, serializers, financial math, or state-machine transitions.
- **Contract / Snapshot Testing**: Add OpenAPI/Zod contract compatibility checks when evolving shared APIs.
