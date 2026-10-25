---
name: typescript
description: "Guidelines for strict TypeScript development — precise type safety, unknown narrowing, return-type inference trade-offs (explicit public contracts vs inferred RPC/Zod/hooks), and discriminated unions. Use when writing TypeScript types, narrowing unknown, designing generics, or configuring compiler strictness. Do NOT use for runtime schema validation libraries or backend database modeling."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["typescript", "tipos", "interface", "strict", "no any", "generics", "type guards"]
  scope: [global, project]
  version: "2.1.0"
---

# 🛡️ Strict TypeScript Safety & Inference Trade-Offs

Use this skill when defining domain models, API contracts, state machines, or utility functions. It pairs strict compile-time safety (`strict: true`, zero unverified casts) with idiomatic TypeScript inference where explicit annotations would create redundant maintenance noise.

---

## 🚫 Hard Type-Safety Invariants

| Anti-Pattern | Why It Is Dangerous | Engineering Standard |
|---|---|---|
| **Unchecked `any` Types** | Disables the type checker and spreads silent runtime assumptions across callers. | Use `unknown` at untrusted boundaries and narrow via type predicates, discriminated unions, or Zod schemas. |
| **Unsafe Type Assertions (`as T`)** | Forcing types via `as SomeType` lies to the compiler without verifying runtime shape. | Narrow with `in`, `instanceof`, type predicates (`x is T`), or `.safeParse()`. Use `satisfies T` when validating literals without widening. |
| **Blind Non-Null Assertions (`!`)** | Asserts a value exists without runtime proof, risking `TypeError` crashes. | Handle optionality with optional chaining (`?.`), nullish coalescing (`??`), or explicit guard clauses. |
| **Suppressing Compiler Errors** | `@ts-ignore` and `@ts-nocheck` permanently mask structural regressions. | Fix the underlying type mismatch or use `@ts-expect-error` with a tracking comment only in negative type tests. |
| **Untyped Error Catching** | Assuming caught values are always `Error` instances breaks when strings or objects are thrown. | Catch as `unknown` and narrow with `err instanceof Error` before reading `.message` or `.stack`. |

---

## ⚖️ Return Type Trade-Offs: Explicit Contracts vs Idiomatic Inference

Do not apply a blanket ban on inferred return types across every function. Choose between explicit return annotations and compiler inference based on boundary stability:

### 1. When to Require Explicit Return Types
- **Public Package & Library Boundaries**: Exported functions in shared packages, SDKs, or `isolatedDeclarations` builds where accidental return-type drift would break downstream consumers and slow down `.d.ts` generation.
- **Domain Service & Repository Contracts**: Functions implementing an architectural port/interface where the signature is the contract.
- **Recursive or Multi-Branch Functions**: Functions with early returns where an explicit return type catches accidental union widening at the return site rather than at the caller.

### 2. When to Prefer TypeScript Inference (`[Beyond-Baseline]`)
- **Schema-Driven Types (`z.infer`)**: Derive types directly from Zod/Valibot schemas (`type User = z.infer<typeof UserSchema>`) instead of maintaining duplicate manual interfaces.
- **End-to-End Typed RPC & Routers (tRPC, Hono, Server Actions)**: Let procedure handlers infer their return types so client hooks (`useQuery`, `hc<AppType>`) automatically receive exact end-to-end payload types without manual generic duplication.
- **Generic Higher-Order Functions, React Custom Hooks & Components**: Functions returning complex tuple/object closures or JSX (`ReactElement`) where manual return annotations obscure generic inference.
- **Internal Module Helpers**: Private/local closures (`map`, `filter`, `reduce`, local helpers) within a module where full context is already known.

---

## 🏛️ Strict Compiler Configuration

Enforce strict compiler settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 📊 Typing Patterns in Practice

### 1. Narrowing Untrusted External Payloads (`unknown` + Schema Inference)

```typescript
import { z } from 'zod';

const UserPayloadSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }),
});

// Idiomatic inference from single source of truth
export type UserPayload = z.infer<typeof UserPayloadSchema>;

// Explicit return type on public domain boundary
export function extractNormalizedEmail(raw: unknown): string {
  const result = UserPayloadSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid payload schema: ${result.error.message}`);
  }
  return result.data.user.email.toLowerCase();
}
```

---

### 2. Validating Configuration Literals with `satisfies`

Instead of widening a literal object with a broad `: Record<string, RouteConfig>` annotation (which loses autocomplete on exact keys) or casting with `as`, use `satisfies`:

```typescript
interface RouteDefinition {
  path: `/${string}`;
  authRequired: boolean;
}

export const ROUTES = {
  home: { path: '/', authRequired: false },
  settings: { path: '/settings', authRequired: true },
} satisfies Record<string, RouteDefinition>;

// ROUTES.settings.path preserves literal type '/settings'
```

---

### 3. Safe Error Narrowing in `try / catch`

```typescript
export async function fetchResourceSafely(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(url);
    return { ok: response.ok };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network exception';
    return { ok: false, error: message };
  }
}
```

---

### 4. Discriminated Unions over Optional Field Soup

**❌ Fragile Pattern (Ambiguous Optional Booleans):**
```typescript
interface FragileAsyncState<T> {
  isLoading: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
}
```

**✅ Robust Pattern (Exhaustive Discriminated Union):**
```typescript
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Zero `any`, safe narrowing of `unknown`, and strict compiler flags are non-negotiable safety invariants. For return-type annotations, generic utilities, template-literal DSLs, or framework-specific RPC routers (tRPC, Hono, TanStack Start, Next.js Actions), leverage TypeScript's type inference when it produces stronger end-to-end guarantees than manual annotations, documenting intentional boundary trade-offs with `[Beyond-Baseline: <technical reason>]`.
