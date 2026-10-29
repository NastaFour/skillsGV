---
name: distributed-resilience-sre
description: "Architect resilient distributed systems, fault-tolerant messaging, and SRE production lifecycles: circuit breakers, timeouts, exponential backoff with jitter, idempotency keys, transactional outbox, Saga pattern, dead-letter queues, backpressure, graceful SIGTERM shutdown, liveness/readiness probes, OpenTelemetry tracing, and S3 presigned URLs. Use when designing microservices, webhooks, message queues, retries, or high-availability backends. Don't use for basic CRUD endpoints, database schema migrations (use database-migrations), or CI/CD YAML authoring (use ci-cd-pipelines)."
license: MIT
compatibility: "Node.js 20+, TypeScript 5+, Go, Rust, Python, Redis, Kafka/RabbitMQ/BullMQ, Kubernetes, OpenTelemetry"
allowed-tools: Read Write Edit Bash(node:*,pnpm:*,git:*) Glob Grep
metadata:
  author: skills-catalog
  version: "1.0.0"
  scope: backend
  trigger: "distributed resilience, circuit breaker, exponential backoff, jitter, idempotency key, transactional outbox, saga pattern, dead letter queue, backpressure, load shedding, bulkhead, graceful shutdown, sigterm, liveness readiness probes, opentelemetry, presigned url, distributed lock"
---

# 🛡️ Distributed Systems Resilience, Messaging & SRE Operations

Production engineering guide for mission-critical microservices, asynchronous messaging, and zero-downtime SRE lifecycles.

---

## ⚖️ Floor, Not Ceiling (Hard Invariants vs Open Upper-Bound)

### Hard Invariants (Floor)
1. **Bounded Outbound Calls**: Every external HTTP/RPC/DB call MUST enforce an explicit timeout (`AbortSignal.timeout`), bounded retries with **Exponential Backoff + Full Jitter** (never fixed-delay retry storms), and Circuit Breaker protection.
2. **Idempotent Mutations**: Every payment, webhook, or state-mutating endpoint MUST validate an `Idempotency-Key` with an atomic lock/record before executing side effects.
3. **Atomic Event Publication**: Never dual-write to a database and a message broker without atomicity; use the **Transactional Outbox Pattern** (or CDC) and isolate poison messages in a **Dead-Letter Queue (DLQ)**.
4. **Zero-Downtime Lifecycle & Observability**: Separate **Liveness** (`/healthz` — process alive) from **Readiness** (`/readyz` — DB/downstream ready), drain in-flight requests on `SIGTERM`, and propagate W3C `traceparent` / correlation IDs with low-cardinality metric labels.
5. **Private Storage by Default**: Never expose public cloud storage buckets (`S3`/`GCS`) for user or application data; issue short-lived, scope-bounded **Presigned URLs**.

### Guided Heuristics & Open Upper-Bound (`[Beyond-Baseline: <reason>]`)
- Adaptive concurrency limits (Little's Law / TCP Vegas load shedding), deterministic workflow engines (Temporal / Restate), and eBPF zero-instrumentation kernel tracing.

---

## 🔄 Core Resilience & Shutdown Reference

```typescript
// Bounded retry with Exponential Backoff + Full Jitter
export async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  opts: { retries?: number; baseMs?: number; maxMs?: number; timeoutMs?: number } = {}
): Promise<T> {
  const { retries = 3, baseMs = 100, maxMs = 2000, timeoutMs = 5000 } = opts;
  let attempt = 0;
  while (true) {
    try {
      return await fn(AbortSignal.timeout(timeoutMs));
    } catch (err) {
      if (++attempt > retries) throw err;
      const cap = Math.min(maxMs, baseMs * 2 ** attempt);
      const sleepMs = Math.random() * cap; // Full jitter prevents thundering herds
      await new Promise((resolve) => setTimeout(resolve, sleepMs));
    }
  }
}

// Graceful SIGTERM drain for zero-downtime deployments
export function registerGracefulShutdown(server: { close: (cb: () => void) => void }, cleanup: () => Promise<void>): void {
  const handler = async (signal: string) => {
    server.close(async () => {
      try { await cleanup(); process.exit(0); } catch { process.exit(1); }
    });
    setTimeout(() => process.exit(1), 10000).unref(); // 10s backstop kill
  };
  process.on("SIGTERM", () => handler("SIGTERM"));
  process.on("SIGINT", () => handler("SIGINT"));
}
```

---

## 🧭 Architectural Patterns Summary

| Pattern | Failure Mode Prevented | Implementation Mechanism |
|---|---|---|
| **Circuit Breaker** | Cascading failure of downstream services | Trip OPEN after $N$ consecutive failures, return fallback fast |
| **Transactional Outbox** | State vs message broker desynchronization | Write event to DB in same ACID transaction; worker relays to broker |
| **Dead-Letter Queue** | Malformed poison message stalling partition | Max receive count $\to$ divert payload to DLQ + alert on duty |
| **Bulkhead** | Single tenant/subsystem consuming all worker threads | Separate thread/connection pools per downstream dependency |
