---
name: jwt-bcrypt
description: "Security standards for User Authentication and Authorization. Covers password hashing (Argon2id/bcrypt), short-lived Access Tokens, HTTP-Only Refresh Token rotation, and RBAC/ABAC permission enforcement. Use when implementing login, password hashing, token refresh flows, or role-based route protection. Do not use for third-party API billing quotas."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["JWT", "bcrypt", "argon2", "autenticación", "token", "refresh token", "RBAC"]
  scope: [global, project]
  version: "1.1.0"
---

# 🔑 Authentication & Token Security (2026 Standards)

Use this skill when implementing user authentication, password hashing, session refresh flows, or role/attribute-based endpoint authorization.

## 🚨 Security Standards

1. **Password Hashing (Argon2id / Bcrypt)**:
   - Prefer `argon2` (`argon2id` variant with OWASP-recommended memory/time cost) or `bcryptjs` (minimum cost factor `12`) before persisting credentials.
   - Never log plaintext passwords, password reset tokens, or raw secret hashes.

2. **Access Token Lifespan & Client Storage**:
   - Keep JWT access tokens short-lived (`5–15 minutes`) with explicit `iss`, `aud`, `sub`, and `exp` claims.
   - In browser SPAs, keep access tokens in memory or use a Backend-for-Frontend (BFF) `HttpOnly` session cookie. Never store raw tokens in `localStorage` or `sessionStorage`.

3. **Refresh Tokens, Rotation & Reuse Detection**:
   - Issue refresh tokens with a bounded lifespan (e.g., `7–30 days`) inside an `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax` for top-level OAuth navigations) cookie scoped to the refresh path:
     ```typescript
     res.cookie('refreshToken', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
       path: '/api/v1/auth/refresh',
       maxAge: 7 * 24 * 60 * 60 * 1000,
     });
     ```
   - **Refresh Token Rotation**: Track token families (`jti` / `familyId`) in Redis or the database. Revoke the consumed refresh token on every refresh call; if a revoked token is replayed, invalidate the entire token family immediately.

## 🛡️ Universal RBAC & ABAC Authorization Patterns

Enforce authorization checks using verified claims (`sub`, `tenantId`, `roles`, `scopes`) plus database ownership checks:
- **Role-Based Access Control (RBAC)**: Coarse-grained principal roles such as `VIEWER` (read-only access), `MEMBER` (standard workspace mutations), `MANAGER` (workflow approvals), and `ADMIN` (tenant configuration & user management).
- **Attribute-Based / Scope-Based Access Control (ABAC)**: Fine-grained permissions (`scopes: ['documents:read', 'billing:manage']`) and tenant/resource ownership assertions (`resource.tenantId === principal.tenantId`) to prevent Broken Object Level Authorization (BOLA/IDOR).

## 🔐 Hashing and Verification Flow

```typescript
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Stateless JWT + Refresh Rotation is the baseline. Upgrade to stronger identity primitives when supported by the architecture (annotate with `[Beyond-Baseline: <reason>]`):
- **Asymmetric Signing & JWKS**: Use `EdDSA` (`Ed25519`) or `RS256` with key IDs (`kid`) and a JWKS endpoint instead of shared `HS256` secrets in multi-service deployments.
- **Passkeys / WebAuthn & Managed Auth**: Prefer phishing-resistant Passkeys (WebAuthn), OAuth 2.1 with PKCE, or battle-tested auth libraries (Better Auth, Auth.js, Lucia patterns) over hand-rolled credential flows when applicable.
