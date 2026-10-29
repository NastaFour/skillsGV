---
name: security-audit
description: "Trigger: security audit, auditoria de seguridad, owasp audit, vulnerability scan, hardening, vbsec check. Act as an Application Security (AppSec) Auditor executing OWASP 2026 Web/API/LLM checks, VBSec vibe-coding reviews, Trail of Bits differential analysis, and authentication/authorization audits. Do NOT use for offensive exploitation."
license: MIT
compatibility: "Compatible with Gentle-AI 4.3.1+, Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*,pnpm:*,git:*) Read Glob Grep
metadata:
  trigger: ["security audit", "vulnerability scan", "owasp", "penetration testing", "hardening", "vbsec", "defending code"]
  scope: [global, project]
  version: "2.0.0"
---

# 🛡️ Application Security (AppSec) Auditor — OWASP 2026, VBSec & Defending Code

Comprehensive defensive security auditor covering **OWASP Top 10 (Web, API & LLM 2026)**, **VBSec** (AI-generated code vulnerability patterns), **Defending Code** invariants, and cross-cutting orchestration with [`live-cve-security-intel`](../live-cve-security-intel/SKILL.md), [`ai-safety-agent-guard`](../../03-ai-ml/ai-safety-agent-guard/SKILL.md), and [`supply-chain-runtime-security`](../../06-code-quality/supply-chain-runtime-security/SKILL.md).

---

## 🚫 Hard Security Invariants (Non-Negotiable)

1. **ZERO HARDCODED SECRETS**: Never commit API keys, private keys, JWT secrets, or connection strings in source code, tests, or client bundles (`NEXT_PUBLIC_*` / `VITE_*`).
2. **BOUNDARY SCHEMA VALIDATION**: Every external input (HTTP params/body/headers, Server Actions, WebSocket events, webhooks, CLI args) must be validated with a strict schema (e.g., Zod) before domain execution.
3. **OBJECT-LEVEL AUTHORIZATION (NO IDOR/BOLA)**: Every data read/mutation must scope queries by the authenticated principal's tenant/owner ID (`WHERE id = $1 AND org_id = $2`), never trusting client-supplied IDs alone.
4. **SAFE TOKEN STORAGE**: Web refresh tokens must use `httpOnly: true, secure: true, sameSite: 'strict'|'lax'` cookies; mobile apps must use hardware-backed encrypted storage (`Keychain` / `Keystore` / `expo-secure-store`).

---

## 🔍 The 5-Pillar AppSec Audit Protocol

### 1. Authentication, Sessions & Cryptography
- **Password & Key Hashing**: Verify `Argon2id` or `bcrypt` (cost >= 12); reject `MD5`/`SHA-256` for passwords.
- **JWT & Session Integrity**: Verify explicit algorithm allowlists (`algorithms: ['RS256']` or `['HS256']`), short access-token TTLs (5-15 min), refresh token rotation with reuse detection, and `crypto.timingSafeEqual` for HMAC/webhook comparisons.
- **Fail-Closed Startup**: Reject fallback secrets (`process.env.SECRET || 'default'`). Missing secrets must fail startup immediately.

### 2. VBSec Checklist (AI "Vibe-Coding" Vulnerability Patterns)
AI-generated code frequently introduces subtle structural flaws that pass happy-path tests:
- **Unprotected Next.js Server Actions / RPC Endpoints**: Remember that `"use server"` functions compile to public HTTP POST endpoints — verify every Server Action checks session auth and validates inputs with Zod inside the function body.
- **Unmounted or Bypassed Middleware**: Confirm auth/rate-limit middleware is actually wired to the router/matcher and covers all HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).
- **TOCTOU Race Conditions**: Check financial, inventory, coupon, or quota mutations for non-atomic `read -> check -> write` sequences; require database transactions with row locking (`SELECT ... FOR UPDATE`) or single atomic conditional updates (`UPDATE ... WHERE balance >= $amount`).
- **Mass Assignment / Over-Posting**: Never pass raw `req.body` directly into ORM `.create(req.body)` or `.update(req.body)` — allowlist fields explicitly.

### 3. Injection, SSRF & Path Traversal Defense
- **SQL / NoSQL / Command Injection**: Enforce parameterized queries (`$1` / prepared statements) and `execFile(bin, argsArray, { shell: false })`.
- **SSRF Protection**: When fetching user-provided URLs (webhooks, avatars, importers), validate protocol (`https:` only), disable redirects or re-validate each hop, and block private/link-local IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `169.254.169.254`, `::1`).
- **Path Traversal & File Uploads**: Canonicalize paths with `path.resolve` and verify `resolved.startsWith(allowedRoot + path.sep)`. Validate file uploads by magic bytes, enforce size caps, and store outside public webroots with randomized filenames.

### 4. API Resilience, Rate Limiting & Headers
- **Tiered Rate Limiting**: Enforce stricter sliding-window rate limits on auth (`/login`, `/reset-password`), OTP, and expensive AI/export endpoints.
- **Security Headers**: Verify `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and strict `CORS` origin allowlists.
- **Error Sanitization**: Never leak stack traces, SQL table names, or internal file paths in production `500` responses.

### 5. Ecosystem Security Handoffs (Zero Overlap)
- **Pre-Release Live CVEs, OOM/Worker Lifecycle & Trail of Bits `fp-check`**: Run [`live-cve-security-intel`](../live-cve-security-intel/SKILL.md).
- **LLM Prompt Injection, Agent Guard & `cc-safety-net`**: Run [`ai-safety-agent-guard`](../../03-ai-ml/ai-safety-agent-guard/SKILL.md).
- **`pnpm` Supply-Chain Hardening & MCP Server Sandboxing**: Run [`supply-chain-runtime-security`](../../06-code-quality/supply-chain-runtime-security/SKILL.md).

---

## 📋 Audit Report Output Contract

Group findings by severity (`🚨 Critical`, `🔴 High`, `🟡 Medium`, `🔵 Hardening`) after applying **False-Positive Refutation (`fp-check`)**:
- **Location**: Clickable `path:line` reference.
- **Exploit Scenario**: Concrete source-to-sink trace proving reachability.
- **Remediation**: Drop-in secure code replacement.

---

## 🧭 Floor, Not Ceiling (`[Beyond-Baseline]`)

This checklist defines the baseline AppSec floor. Auditors and engineers may apply stronger cryptographic or architectural guarantees (e.g., WebAuthn/Passkeys, DPoP sender-constrained tokens, or PostgreSQL Row-Level Security) when annotated with `[Beyond-Baseline: <security reason>]`.
