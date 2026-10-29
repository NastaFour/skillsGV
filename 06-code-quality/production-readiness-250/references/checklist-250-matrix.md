# 📋 Senior Production Readiness 250-Point Matrix

Domain-partitioned matrix of senior production engineering checks across the 8 critical system domains.

### 1. Security, Auth & Cryptography (`#1–40`)
| Area | Check & Invariant |
|---|---|
| **Auth & Sessions** | Enforce argon2id/bcrypt passwords, rotate JWT secret keys, bind session to user agent/IP hash, short-lived access tokens + rotating refresh tokens. |
| **Secrets & Transport** | Zero hardcoded secrets/API keys; strict TLS 1.3 only; HSTS `preload` header enabled; CSP headers blocking untrusted scripts. |
| **Access Control** | Server-side RBAC/ABAC authorization on every endpoint; prevent IDOR with tenant/owner assertions; constant-time comparison for auth tokens. |

### 2. Databases, Indexing, ACID & Migrations (`#41–75`)
| Area | Check & Invariant |
|---|---|
| **Schema & Types** | Explicit `NOT NULL` constraints; foreign keys with index on referencing columns; UUIDv7 or monotonic BigInt PKs; no plaintext PII. |
| **ACID & Concurrency** | Use transactions with appropriate isolation (`REPEATABLE READ` / `SERIALIZABLE` on money transfers); optimistic locking (`version` column). |
| **Migrations & Pool** | Zero-downtime expand-and-contract migrations; statement timeouts on migrations; tuned connection pool sizing (`max_connections`). |

### 3. Distributed Systems, Caching, Queues & Resilience (`Prelim #1–19` & `#76–115`)
| Area | Check & Invariant |
|---|---|
| **Resilience Patterns** | Bounded timeouts (`AbortSignal.timeout`) on all RPCs; Exponential backoff with Full Jitter; Circuit Breakers on external dependencies. |
| **Messaging & Queues** | Transactional outbox for DB-broker dual writes; at-least-once consumers with Idempotency-Key; Dead-Letter Queue (DLQ) with alert trigger. |
| **Caching & Invalidation** | Cache stampede prevention (mutex/single-flight); jittered cache TTLs; never cache unauthenticated tenant-specific queries globally. |

### 4. Networking, APIs & Protocols (`#116–140`)
| Area | Check & Invariant |
|---|---|
| **API Contract** | Request validation via strict Zod/JSON Schema before execution; RFC 7807 problem details error format; API versioning strategy. |
| **Rate Limiting** | Sliding window rate limiting per IP/user; DDoS protection & WAF; CORS restricted to explicit origin allowlist (never `*` with credentials). |

### 5. Cloud Infrastructure, K8s, SRE & Observability (`#141–201`)
| Area | Check & Invariant |
|---|---|
| **Lifecycle & Pods** | Split `/healthz` (liveness) vs `/readyz` (readiness); graceful `SIGTERM` drain with 10–30s timeout; CPU/Memory requests & limits configured. |
| **Telemetry & Metrics** | W3C `traceparent` correlation IDs across microservices; low-cardinality metric tags; structured JSON logging with level filtering. |
| **Backups & Recovery** | Automated daily database backups with verified point-in-time recovery (PITR); multi-region/AZ disaster recovery drills documented. |

### 6. Testing, Edge Cases, Money, Timezones, Unicode & Concurrency (`#202–231`)
| Area | Check & Invariant |
|---|---|
| **Monetary Math** | Never use float/double for currency; store integer minor units (cents) or SQL `NUMERIC(19,4)` paired with ISO-4217 currency. |
| **Timezones & DST** | Store UTC timestamps (`TIMESTAMPTZ`); calculate billing/calendar boundaries using IANA names (`America/New_York`), never fixed offsets. |
| **Unicode & Concurrency** | Normalize external text with `normalize('NFC')`; prevent event-loop blocking; guard against off-by-one and integer overflow. |

### 7. Compliance, Privacy, Email Deliverability & Commercial Protection (`#232–243`)
| Area | Check & Invariant |
|---|---|
| **Privacy & Audit** | Redact PII in logs; maintain immutable audit logs (`actor_id`, `action`, `diff`, `timestamp`); GDPR right-to-be-forgotten export/wipe tooling. |
| **Email Deliverability** | Authenticate SPF, DKIM, DMARC (`p=reject`); handle bounce/complaint webhooks immediately; enforce spam suppression lists. |
| **FinTech & Abuse** | Integrate fraud/bot scoring before checkout; chargeback defense webhooks; automated cloud billing anomaly spending caps. |

### 8. AI, LLMs, Prompt Security & Context Governance (`#244–250`)
| Area | Check & Invariant |
|---|---|
| **Safety & Injection** | Spotlight delimiters around untrusted RAG chunks; least-privilege tool access; HITL gate on destructive agent actions. |
| **Cost & Latency** | Pinned model versions; token/spend budget ceilings per user/tenant; streaming timeouts and fallback model routing. |
