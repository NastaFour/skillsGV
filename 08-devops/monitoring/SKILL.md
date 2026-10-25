---
name: monitoring
description: "Logging, healthchecks, and observability telemetry standards for backend services. Covers structured logging (Pino/Winston), liveness/readiness healthcheck probes, correlation-ID and OpenTelemetry tracing, and alerting thresholds. Use when configuring backend observability and health monitoring. Do not use for CI/CD pipelines or infrastructure provisioning."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["logging", "healthcheck", "telemetría", "monitoreo", "pino", "winston", "correlation-id", "alertas", "métricas"]
  scope: [global, project]
  version: "1.1.0"
---

# 📊 Monitoring — Structured Logging, Healthchecks & Observability

Use this skill when configuring observability, health probes, distributed tracing, and operational alerting for backend services.

---

## 📝 Structured Logging Standard (Pino)

```typescript
// packages/observability/src/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    '*.password',
    '*.token',
    '*.secret',
  ],
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      correlationId: req.headers['x-correlation-id'],
    }),
  },
});
```

**Core Rules:**
- Use structured `logger.info` / `logger.warn` / `logger.error` — never raw `console.log` in production paths.
- Every log entry must include `correlationId` (and `traceId`/`spanId` when OpenTelemetry is active).
- Redact credentials, session cookies, tokens, and PII fields automatically at the logger root.
- Emit newline-delimited JSON (NDJSON) in production for log aggregation pipelines.

---

## 🏥 Liveness & Readiness Healthcheck Probes

Separate lightweight liveness checks (`/health/live`) from dependency readiness checks (`/health/ready` or `/api/health`):

```typescript
// Dependency-injected readiness probe (framework- and ORM-agnostic)
export interface HealthDependency {
  name: string;
  check: (signal: AbortSignal) => Promise<void>;
}

export async function evaluateReadiness(dependencies: HealthDependency[]) {
  const results = await Promise.allSettled(
    dependencies.map(async (dep) => {
      const start = performance.now();
      await dep.check(AbortSignal.timeout(3_000));
      return { name: dep.name, status: 'up', latencyMs: Math.round(performance.now() - start) };
    })
  );

  const checks = results.map((res, idx) =>
    res.status === 'fulfilled'
      ? res.value
      : { name: dependencies[idx].name, status: 'down', error: 'Dependency check failed' }
  );
  const healthy = checks.every((c) => c.status === 'up');

  return {
    httpStatus: healthy ? 200 : 503,
    body: {
      status: healthy ? 'ok' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks,
    },
  };
}
```

- Orchestrators (Kubernetes, Railway, Render, Fly.io, ECS) poll readiness probes to route traffic only to healthy instances.
- Enforce a strict per-dependency timeout (`< 3–5 seconds`) so a hung database or cache connection never stalls the health endpoint indefinitely.

---

## 🔗 Distributed Correlation-ID Tracing

Every incoming request is assigned or forwards an `x-correlation-id` (and W3C `traceparent` header), propagated across:
- Downstream HTTP/RPC calls
- Real-time WebSocket / SSE events
- Message broker / background queue metadata
- Database query commentary or logger context

```typescript
import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.headers['x-correlation-id'] = id;
  res.setHeader('x-correlation-id', id);
  next();
}
```

Refer to `../../04-backend/microservices/SKILL.md` for cross-service context propagation.

---

## 🚨 Operational Alerting Thresholds

| Signal / Condition | Severity | Target Action |
|---|---|---|
| Readiness probe fails 3x consecutively | 🔴 Critical | Pager / On-Call Alert + Auto-restart |
| HTTP p95 latency > SLO threshold (e.g., 2s) | 🟡 Warning | Engineering Alert Channel |
| HTTP 5xx error rate > 2–5% over 5 min window | 🔴 Critical | Pager / Incident Channel |
| LLM / External API fallback rate spike | 🟡 Warning | FinOps & Reliability Dashboard |
| Disk / Memory saturation > 85% | 🔴 Critical | Infrastructure Alert |

---

## 📈 Metrics & OpenTelemetry (`[Beyond-Baseline]`)

Structured logs + health probes are the observability floor. Adopt full OpenTelemetry instrumentation when operating distributed or high-throughput workloads (annotate with `[Beyond-Baseline: <reason>]`):
- **RED Metrics (`/metrics` or OTLP)**: Track Rate (`http_requests_total`), Errors (`http_Unhandled_errors_total`), and Duration histograms (`http_request_duration_seconds`) plus active pool/connection gauges.
- **OpenTelemetry SDK (`@opentelemetry/sdk-node`)**: Export unified traces, metrics, and logs via OTLP to Grafana Tempo/Loki/Prometheus, Datadog, or Honeycomb.
- Refer to `../../03-ai-ml/ai-scalability-mlops/SKILL.md` for LLM-specific latency and token telemetry.
