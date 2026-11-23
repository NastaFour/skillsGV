---
name: security-audit
description: "Trigger: security audit, auditoria de seguridad, owasp audit, vulnerability scan, hardening, vbsec check, cloudflare security audit. Act as an Application Security (AppSec) Auditor executing OWASP 2026 Web/API/LLM checks, VBSec vibe-coding reviews, Cloudflare 6-phase coverage-ledger audits, Trail of Bits differential analysis, and authentication/authorization audits. Do NOT use for offensive exploitation."
license: MIT
compatibility: "Compatible with Gentle-AI 5.0.0+, Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*,pnpm:*,git:*) Read Glob Grep
metadata:
  trigger: ["security audit", "cloudflare security audit", "vulnerability scan", "owasp", "penetration testing", "hardening", "vbsec", "defending code", "bug hunter"]
  scope: [global, project]
  version: "2.2.0"
---

# 🛡️ Application Security (AppSec) Auditor — OWASP 2026, VBSec & Cloudflare Audit Standard

Comprehensive defensive AppSec auditor uniting **OWASP Top 10 (Web, API & LLM 2026)**, **VBSec** (AI-generated code flaws), **Cloudflare `security-audit-skill`** (6-phase coverage ledger & certainty contract), **`bug-hunter` / `defending-code`**, and cross-cutting orchestration with [`live-cve-security-intel`](../live-cve-security-intel/SKILL.md), [`ai-safety-agent-guard`](../../03-ai-ml/ai-safety-agent-guard/SKILL.md), [`prompt-shield`](../../03-ai-ml/prompt-shield/SKILL.md), and [`supply-chain-runtime-security`](../../06-code-quality/supply-chain-runtime-security/SKILL.md).

---

## 🚫 Hard Security Invariants (Non-Negotiable)

1. **ZERO HARDCODED SECRETS**: Never commit API keys, private keys, JWT secrets, or connection strings in code, tests, or client bundles (`NEXT_PUBLIC_*` / `VITE_*`).
2. **BOUNDARY SCHEMA VALIDATION**: Every external input (HTTP params/body/headers, Server Actions, WebSockets, webhooks, CLI args) must validate via strict schema (Zod) before domain execution.
3. **OBJECT-LEVEL AUTHORIZATION (NO IDOR/BOLA)**: Scope every read/mutation by the authenticated principal's tenant/owner ID (`WHERE id = $1 AND org_id = $2`), never trusting client-supplied IDs alone.
4. **SAFE TOKEN STORAGE**: Web refresh tokens must use `httpOnly: true, secure: true, sameSite: 'strict'|'lax'` cookies; mobile apps use `Keychain` / `Keystore` / `expo-secure-store`.
5. **FAIL-CLOSED DEFAULTS & SANITIZED ERRORS**: Default-deny authz, zero secret fallbacks (`|| 'secret'`), parameterized queries, `execFile(..., { shell: false })`, SSRF IP-range blocks (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.169.254`, `::1`), and zero raw stack traces in production responses.

---

## 🧭 Cloudflare Operating Modes & Certainty Contract

Select audit depth proportionally to the target surface:

- **Guidance Mode** (fast inline review): Apply the 5 AppSec Pillars below during active coding or focused PR checks.
- **Full Audit Mode** (`quick` / `standard` / `deep` profiles across 6 phases): Recon & Threat Model → `coverage-ledger.json` (`surface × boundary × attack_class × subsystem`) → Scoped Hunting → Independent Verification → Race-Safe Promotion → Reporting. See [`references/cloudflare-audit-protocol.md`](references/cloudflare-audit-protocol.md).

**Certainty vs Severity Rule (`confirmed` vs `needs_validation`):**
1. Assign severity (`Critical | High | Medium | Hardening`) **ONLY** to `confirmed` findings backed by a **6-Element Proof Tuple**: *(1) Lower-trust principal, (2) Accepted input/action, (3) Intended control, (4) Crossed trust boundary, (5) Affected principal/resource, (6) Concrete observable impact*.
2. Mark findings whose mitigation depends on controls external to the repo (WAF, edge proxy, cloud IAM, upstream TLS termination) as **`needs_validation` with NO speculative severity**, stating the exact external verification probe required.
3. **Budget Reservation & Scratch Isolation**: In multi-agent audits, reserve `>= 30%` budget for independent verifiers and coverage-critics before launching hunters. Hunters write strictly inside isolated `<scratch>/agents/<id>/`; parent promotes only regular non-symlinked (`no-follow`) artifacts under size caps.

---

## 🔍 The 5-Pillar AppSec Checklists

1. **Auth, Sessions & Crypto**: `Argon2id`/`bcrypt` (cost `>= 12`), explicit JWT `algorithms` allowlists, short access TTLs (`5–15m`), refresh token rotation + reuse detection, `crypto.timingSafeEqual` for HMAC comparisons.
2. **VBSec AI Code Traps**: Missing auth/Zod inside `"use server"` Server Actions, unmounted/verb-gap middleware, non-atomic `read -> check -> write` TOCTOU races (`SELECT ... FOR UPDATE`), and raw `req.body` ORM mass assignment.
3. **Injection, SSRF & Path Traversal**: Parameterized SQL, `shell: false`, HTTPS-only SSRF validation per redirect hop, canonical `path.resolve(root, p).startsWith(root + path.sep)` with magic-byte upload checks.
4. **API Resilience & Headers**: Sliding-window rate limits on auth/OTP/expensive routes, CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, strict CORS allowlists.
5. **`bug-hunter` Triage & Ecosystem Handoffs**:
   - Confirm reachability → mutate boundary/concurrency/auth edge cases → sweep sibling endpoints → lock fix with regression test.
   - Pre-scan untrusted PRs/repos with [`prompt-shield`](../../03-ai-ml/prompt-shield/SKILL.md); check live advisories & PHP2Shell worker lifecycle with [`live-cve-security-intel`](../live-cve-security-intel/SKILL.md).

---

## 🧭 Floor, Not Ceiling (`[Beyond-Baseline]`)

This protocol establishes the mandatory verification floor. Auditors may introduce stronger guarantees (WebAuthn/Passkeys, DPoP sender-constrained tokens, PostgreSQL Row-Level Security, formal threat trees, or property-based security fuzzing) annotated with `[Beyond-Baseline: <security reason>]`.
