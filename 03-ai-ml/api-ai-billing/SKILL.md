---
name: api-ai-billing
description: "Guidelines for managing AI API billing, FinOps token budgets, and usage quotas. Covers input/output token accounting, tenant quota middleware, multi-tier model routing, and cost observability. Use when metering LLM token costs, enforcing AI usage quotas, or routing across model pricing tiers. Do not use for general Stripe/fiat checkout flows."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["billing AI", "costos API", "quotas", "token usage", "AI finops", "token budget"]
  scope: [global, project]
  version: "1.1.0"
---

# 🪙 AI Billing, Token Budgets & Quota FinOps

Use this skill when implementing features that meter LLM token consumption, enforce per-user or per-tenant AI budgets, or route requests across model cost tiers.

## 🚨 Billing & FinOps Standards

1. **Pre-Flight Estimation & Post-Call Metering**:
   - Estimate input tokens before dispatching an LLM call (using provider tokenizers, `js-tiktoken`, or a conservative byte/character heuristic) and enforce a hard `max_output_tokens` cap on every request.
   - Record exact `prompt_tokens`, `cached_tokens`, `completion_tokens`, model identifier, and computed USD micro-cost (`costMicros`) from the provider response in an append-only usage ledger.

2. **Atomic Quota Enforcement Middleware**:
   - Before executing an LLM request, verify the principal's or tenant's remaining token/cost budget in Redis or PostgreSQL.
   - If the budget is exhausted, short-circuit with HTTP `429 Too Many Requests` (including `Retry-After` and quota reset metadata) before incurring upstream provider costs.

3. **Multi-Tier Model Routing**:
   - Route requests dynamically by task complexity and tenant subscription tier:
     - **Standard / High-Volume Tier**: Route classification, extraction, and summarization to fast, cost-efficient models (e.g., `gemini-2.5-flash`, `gpt-4o-mini`, `claude-3-5-haiku`) with strict daily token budgets.
     - **Pro / Enterprise Tier**: Allow complex reasoning, code generation, or deep synthesis on frontier models with higher token ceilings and dedicated rate limits.

## 🏗️ Universal FinOps Schema & Usage Ledger

```prisma
model TenantAiQuota {
  tenantId          String   @id
  tier              String   @default("STANDARD") // "STANDARD" | "PRO" | "ENTERPRISE"
  monthlyTokenLimit Int      @default(500000)
  tokensUsedMonth   Int      @default(0)
  periodResetAt     DateTime
  updatedAt         DateTime @updatedAt
}

model AiUsageLedger {
  id               String   @id @default(uuid())
  tenantId         String
  correlationId    String
  model            String
  promptTokens     Int
  cachedTokens     Int      @default(0)
  completionTokens Int
  costMicros       BigInt   // 1 USD = 1_000_000 micros for exact integer accounting
  createdAt        DateTime @default(now())

  @@index([tenantId, createdAt])
}
```

- **Abuse & Runaway Loop Protection**: Combine per-minute request rate limiting with per-day/per-month token budget caps so automated scripts or recursive agent loops cannot drain API credits.
- **Scheduled Quota Rollover**: Use an idempotent scheduled job or lazy window evaluation (`now > periodResetAt`) to reset periodic counters cleanly.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

These controls establish the FinOps baseline. You may layer advanced cost-optimization strategies when justified (annotate with `[Beyond-Baseline: <reason>]`):
- **Semantic & Prefix Caching**: Leverage provider prompt caching and Redis semantic caching for repetitive read-heavy queries to cut input token spend by up to 80%.
- **Reservation + Reconciliation Pattern**: For concurrent streaming requests, atomically reserve estimated `max_tokens` in Redis via Lua script before calling the LLM, then reconcile the delta against actual usage on stream completion.
