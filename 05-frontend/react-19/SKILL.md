---
name: react-19
description: React 19 standards with React Compiler — no manual useMemo or useCallback, use() hook for promises and context, Server Actions, ref-as-prop, and Server Components first. Use when writing, refactoring, or optimizing React 19 applications to avoid regressing to React 18 patterns. Do NOT use for React 18 legacy codebases or non-React frontend frameworks.
license: Apache-2.0
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires React 19+, Node 20+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["react 19", "react compiler", "usememo", "usecallback", "server components", "use hook", "useActionState", "actions", "ref as prop"]
  scope: [global, project]
  version: "2.0.0"
---

# ⚛️ React 19 Standards & Best Practices

Use this skill when developing React 19 applications. It enforces modern React 19 primitives, leverages the React Compiler, and prevents legacy React 18 habits (manual memoization, `forwardRef`, data-fetching in `useEffect`).

---

## 🚫 Absolute Bans

| Anti-Pattern | Why It Is Banned | Enforced Alternative |
|---|---|---|
| **Manual \`useMemo\` & \`useCallback\`** | The React Compiler optimizes re-renders automatically; manual memoization adds noise and dependency array bugs. | Write standard inline functions and derived state; let the compiler optimize. |
| **\`forwardRef\` Wrappers** | React 19 passes \`ref\` as a standard component prop; wrapping in \`forwardRef\` is deprecated. | Accept \`ref\` directly in component arguments (\`function Input({ ref, ...props })\`). |
| **Data Fetching in \`useEffect\`** | Causes waterfall fetches, race conditions, and layout shift. | Use async Server Components (RSC), the \`use()\` hook with Suspense, or dedicated query libraries. |
| **Default React Imports** | \`import React from 'react'\` bloats bundles and is unnecessary with modern JSX transform. | Use named imports (\`import { useState, useActionState } from 'react'\`). |
| **Manual Pending Booleans for Forms** | Juggling \`isSubmitting\`, \`error\`, and \`data\` manually creates state sync errors. | Use Server Actions with \`useActionState\` and \`useFormStatus\`. |

---

## 🏛️ Core Architectural Patterns

### 1. Server Components First
- Components are Server Components by default (no directive required).
- Add `"use client"` only for interactivity: hooks (`useState`, `useActionState`), event listeners, and browser APIs.

### 2. The `use()` Hook
- Reads promises directly in render; integrates natively with `<Suspense>`.
- Allows reading React Context conditionally (impossible with `useContext`).

### 3. Server Actions & Form Mutations
- Form submissions handle pending states, server errors, and revalidations automatically via `useActionState`.

---

## 📊 Before & After React 19 Patterns

### 1. Form Mutations & Pending State

**❌ Anti-Pattern (React 18 Manual State Juggling):**
\`\`\`tsx
export function ProfileForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name });
    } catch (err: unknown) {
      setError('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      {error && <p>{error}</p>}
    </form>
  );
}
\`\`\`

**✅ Approved Pattern (React 19 Action & useActionState):**
\`\`\`tsx
import { useActionState } from 'react';
import { updateProfileAction } from '@/actions/profile';

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      <button disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
\`\`\`

---

### 2. Passing Component Refs

**❌ Anti-Pattern (Legacy forwardRef):**
\`\`\`tsx
import { forwardRef } from 'react';

export const TextInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
\`\`\`

**✅ Approved Pattern (Direct ref prop):**
\`\`\`tsx
interface InputProps extends React.ComponentProps<'input'> {
  ref?: React.Ref<HTMLInputElement>;
}

export function TextInput({ ref, ...props }: InputProps) {
  return <input ref={ref} {...props} />;
}
\`\`\`

---

## 🧪 Verification Protocol
1. **Type Checking**: Verify with `tsc --noEmit`.
2. **Linting**: Ensure zero missing dependencies and no manual `useMemo` in compiler-enabled repositories.
3. **Tests**: Test components using React Testing Library or Vitest with `@testing-library/react`.