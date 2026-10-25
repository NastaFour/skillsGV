---
name: microservices
description: "Guidelines for Microservices and Modular Monolith architectures. Covers bounded context decomposition, API gateway routing, event-driven outbox messaging, correlation-id propagation, and failure isolation. Use when decoupling domains, designing distributed systems, or splitting services. Do not use for single-file scripts or simple CRUD apps."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["microservicios", "API gateway", "circuit breaker", "correlation-id", "distributed systems"]
  scope: [global, project]
  version: "1.1.0"
---

# 🏗️ Microservices & Distributed Systems Architecture

Use this skill when defining service boundaries, API gateways, inter-service communication contracts, or fault-isolation patterns.

## 🚨 Architectural Boundaries

1. **Bounded Context Decomposition**:
   - Align service boundaries with high-cohesion, low-coupling business capabilities (Domain-Driven Design bounded contexts), such as:
     - **Identity & Access Service**: Authentication, token issuance, RBAC/ABAC policies, and tenant membership.
     - **Core Domain Service(s)**: Primary business entities, state machines, and domain invariants.
     - **Billing & Metering Service**: Subscriptions, usage ledgers, invoicing, and payment provider webhooks.
     - **Notifications & Communications Service**: Email, push, webhook delivery, and real-time fan-out.

2. **Data Ownership per Bounded Context**:
   - Each service owns its persistence schema exclusively. Never couple services via shared mutable database tables; integrate through versioned APIs or domain events.

3. **API Gateway & Edge Routing**:
   - Expose a unified edge entry point (API Gateway / Reverse Proxy) responsible for TLS termination, rate limiting, correlation-ID injection, and route forwarding (`/api/v1/identity/*`, `/api/v1/billing/*`).

## 📡 Communication & Event-Driven Flows

1. **Asynchronous Domain Events (Transactional Outbox)**:
   - Use message brokers (Redis Streams, RabbitMQ, Kafka, or NATS) for asynchronous cross-service workflows.
   - Persist domain mutations and outbox events in the same local database transaction (Transactional Outbox Pattern), and enforce **idempotent consumers** keyed by `eventId`.

2. **Synchronous Service-to-Service Calls**:
   - Use typed HTTP/REST, gRPC, or ConnectRPC with explicit timeouts (`AbortSignal.timeout(3000)`) and mutual authentication (mTLS or short-lived service JWTs).

3. **Distributed Tracing (`correlation-id` / W3C `traceparent`)**:
   - Assign or forward `x-correlation-id` and W3C `traceparent` headers at the gateway and propagate them across every HTTP request, queue message header, and structured log entry.

## 🔒 Resilience & Failure Isolation

1. **Principal Context Propagation**:
   - Verify external tokens at the edge and pass signed internal claims or verified principal headers to downstream services.

2. **Circuit Breakers, Retries & Bulkheads**:
   - Wrap synchronous downstream calls with bounded retries (exponential backoff + jitter for idempotent operations) and circuit breakers (e.g., `opossum`) so a degraded downstream dependency returns a controlled fallback rather than exhausting caller thread/connection pools.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Physical microservices introduce network and operational overhead. Apply architectural proportionality (annotate with `[Beyond-Baseline: <reason>]`):
- **Modular Monolith First**: Unless independent scaling, polyglot runtimes, or separate team deployment cadences require network boundaries, prefer a **Modular Monolith** with strict package/module boundaries and in-process domain events before extracting network services.
- **OpenTelemetry Native Instrumentation**: Use `@opentelemetry/sdk-node` for automatic span propagation across HTTP, database, and broker boundaries.
