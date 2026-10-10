---
name: typescript
description: Guidelines for strict TypeScript development. Enforces precise type safety, prevents 'any', and implements SOLID principles in class and interface contracts. Use when writing TypeScript types, narrowing 'unknown', designing generics, or configuring compiler strictness. Do NOT use for runtime schema validation libraries or backend database modeling.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["typescript", "tipos", "interface", "strict", "no any", "generics", "type guards"]
  scope: [global, project]
  version: "2.0.0"
---

# 🛡️ Strict TypeScript Safety Guidelines

Use this skill when defining domain models, API response types, state contracts, or utility functions. Strict compile-time typing is required across all packages and applications.

---

## 🚫 Absolute Bans

| Anti-Pattern | Why It Is Banned | Enforced Alternative |
|---|---|---|
| **Any Form of \`any\`** | \`any\` disables all compiler checks, spreading unchecked assumptions across the codebase. | Use \`unknown\` for unverified data and narrow with type guards or Zod schemas. |
| **Unsafe Type Assertions (\`as T\`)** | Forcing types via \`as Type\` bypasses validation and causes runtime crashes. | Use type predicates (\`is\`), discriminated unions, or runtime schema validation. |
| **Non-Null Assertions (\`!\`)** | The exclamation mark asserts a value exists without proof, leading to \`Cannot read properties of undefined\`. | Handle optionality with optional chaining (\`?.\`), nullish coalescing (\`??\`), or early guard returns. |
| **Suppressing Compiler Errors** | \`// @ts-ignore\` and \`// @ts-nocheck\` mask structural defects. | Fix the underlying type signature or create an explicit adapter/type helper. |
| **Untyped Error Catching** | \`catch (err: any)\` risks runtime crashes when inspecting error properties. | Catch as \`unknown\` and inspect via \`err instanceof Error\` before accessing \`.message\`. |
| **Implicit Return Signatures** | Letting exported functions infer return types allows accidental API contract changes. | Declare explicit return types on all exported functions, methods, and hooks. |

---

## 🏛️ Strict Compiler Configuration

Every project must enforce strict compiler settings in `tsconfig.json`:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true
  }
}
\`\`\`

---

## 📊 Before & After Typing Patterns

### 1. Handling Untrusted External Payloads

**❌ Anti-Pattern (Unsafe Type Assertion):**
\`\`\`typescript
// Unsafe: compiler trusts assertion, runtime crashes if structure changes
export function processPayload(raw: any): string {
  const data = raw as { user: { id: string; email: string } };
  return data.user.email.toLowerCase(); // Runtime error if raw.user is undefined
}
\`\`\`

**✅ Approved Pattern (Safe Narrowing with Type Predicate or Zod):**
\`\`\`typescript
import { z } from 'zod';

const UserPayloadSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }),
});

export type UserPayload = z.infer<typeof UserPayloadSchema>;

export function processPayload(raw: unknown): string {
  const result = UserPayloadSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(\`Invalid payload schema: \${result.error.message}\`);
  }
  return result.data.user.email.toLowerCase();
}
\`\`\`

---

### 2. Error Handling in Try/Catch

**❌ Anti-Pattern:**
\`\`\`typescript
try {
  await executeNetworkCall();
} catch (err: any) {
  logger.error(err.message); // Crashes if err is a string or non-Error object
}
\`\`\`

**✅ Approved Pattern:**
\`\`\`typescript
try {
  await executeNetworkCall();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown exception occurred';
  logger.error(message);
}
\`\`\`

---

### 3. Discriminated Unions for Complex State

**❌ Anti-Pattern (Optional Field Soup):**
\`\`\`typescript
interface AsyncState<T> {
  isLoading: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
}
\`\`\`

**✅ Approved Pattern (Discriminated Union):**
\`\`\`typescript
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
\`\`\`
