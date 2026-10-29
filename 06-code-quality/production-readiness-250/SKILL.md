---
name: production-readiness-250
description: "Execute the 250-point Senior Production Engineering, Data Precision, Edge-Case, and Compliance Readiness Audit: monetary integer/decimal math (never floats for money), UTC/IANA timezone & DST safety, Unicode NFC normalization, event-loop & concurrency guards, GDPR/PII redaction, immutable audit logs, SOC2/PCI-DSS baselines, SPF/DKIM/DMARC email deliverability, and chargeback/bot protection. Use when auditing a system before production launch, handling money/timezones/encoding, or implementing compliance and email deliverability. Don't use for deep CVE hunting (use live-cve-security-intel) or UI visual polish (use design-driven)."
license: MIT
compatibility: "Universal — Web, API, Distributed Systems, Databases, Cloud, FinTech, SaaS, AI Systems"
allowed-tools: Read Write Edit Bash(node:*,pnpm:*,git:*) Glob Grep
metadata:
  author: skills-catalog
  version: "1.0.0"
  scope: quality
  trigger: "production readiness, 250 checklist, production checklist, money as float, monetary precision, timezone dst, unicode normalization, event loop blocking, gdpr pii, audit logs, soc 2, pci dss, spf dkim dmarc, email bounce, chargebacks"
---

# 🚀 250-Point Senior Production Engineering Readiness & Precision Audit

Comprehensive production readiness audit synthesized from senior principal SRE, FinTech, security, and systems engineering standards.

---

## ⚖️ Floor, Not Ceiling (Hard Invariants vs Open Upper-Bound)

### Hard Invariants (Floor)
1. **Monetary Precision (`#215-216`)**: Never store, serialize, or calculate money using IEEE-754 floating-point numbers (`float`/`double`/`number` dollars). Store integer minor units (`BigInt` cents/micros) or arbitrary-precision `Decimal` / SQL `NUMERIC(19,4)` paired with an explicit ISO-4217 currency code.
2. **Temporal & Encoding Determinism (`#217-220`)**: Store all timestamps in UTC (`TIMESTAMPTZ` / ISO-8601 `Z`), compute calendar/billing boundaries using IANA timezone names (`America/New_York`, never fixed offsets) to survive DST transitions, and normalize external UTF-8 input (`str.normalize('NFC')`).
3. **Runtime & Concurrency Safety (`#221-225`)**: Never block the event loop with synchronous crypto, compression, or catastrophic backtracking regexes on request threads; handle `unhandledRejection` with structured telemetry; guard against off-by-one and integer overflow boundaries.
4. **Compliance, Privacy & Deliverability (`#199-201, #232-243`)**: Redact PII/secrets in logs (`GDPR`/`SOC 2`), write immutable `Audit Logs` (`actor_id`, `action`, `target_id`, `diff`, `ip`, `created_at`) for privileged actions, configure `SPF + DKIM + DMARC` with bounce/complaint webhooks for email, and enforce cloud billing alerts.

### Guided Heuristics & Open Upper-Bound (`[Beyond-Baseline: <reason>]`)
- Double-entry immutable ledger tables for financial balances, cryptographic hash-chained audit logs, property-based testing (`fast-check`) over monetary/timezone edge cases.

---

## 📋 The 250-Point Domain Audit Matrix

Load the complete domain-partitioned matrix from [`references/checklist-250-matrix.md`](references/checklist-250-matrix.md) on demand:

```typescript
// Sample monetary precision & Unicode normalization invariants
export function toMinorUnits(amountDecimal: string, currency: string = "USD"): bigint {
  const [whole, fraction = ""] = amountDecimal.split(".");
  const paddedFraction = (fraction + "00").slice(0, 2);
  return BigInt(`${whole}${paddedFraction}`);
}

export function sanitizeUserInput(input: string): string {
  return input.normalize("NFC").trim();
}
```

Audit systems domain by domain using [`references/checklist-250-matrix.md`](references/checklist-250-matrix.md) before production launches.
