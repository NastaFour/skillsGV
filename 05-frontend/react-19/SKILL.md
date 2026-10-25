---
name: react-19
description: "React 19 standards — React Compiler vs non-Compiler memoization trade-offs, use() hook for promises and context, Server Actions with useActionState, ref-as-prop, and Server Components first. Use when writing, refactoring, or optimizing React 19 applications. Do NOT use for React 18 legacy codebases or non-React frontend frameworks."
license: Apache-2.0
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires React 19+, Node 20+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["react 19", "react compiler", "usememo", "usecallback", "server components", "use hook", "useActionState", "actions", "ref as prop"]
  scope: [global, project]
  version: "2.1.0"
---

# ⚛️ React 19 Standards & Engineering Trade-Offs

Use this skill when developing React 19 applications. It enforces modern React 19 primitives (`useActionState`, `use()`, `ref` as a standard prop, Server Components first) and provides clear engineering rules for memoization depending on whether **React Compiler** is enabled in the project.

---

## 🚫 Core Anti-Patterns & Replacements

| Anti-Pattern | Why It Is Problematic | Modern React 19 Standard |
|---|---|---|
| **Blanket `useMemo` / `useCallback` with React Compiler** | When `babel-plugin-react-compiler` is active, the compiler memoizes values and closures automatically; manual wrappers add visual noise. | Write plain inline functions and derived constants; let React Compiler optimize re-renders. |
| **Unmemoized Heavy Work without React Compiler** | In React 19 projects *without* React Compiler, omitting memoization on expensive $O(N)$ transforms or effect dependencies causes jank and infinite effect loops. | Use targeted `useMemo` / `useCallback` for expensive calculations, `useEffect` dependencies, and virtualized list item callbacks. |
| **`forwardRef` Wrappers** | React 19 passes `ref` as a standard component prop; wrapping components in `forwardRef` is redundant legacy boilerplate. | Accept `ref` directly in component props (`function Input({ ref, ...props })`). |
| **Data Fetching in `useEffect`** | Causes client-side waterfalls, race conditions, and layout shift. | Use async Server Components (RSC), the `use()` hook with `<Suspense>`, or dedicated cache/query libraries (TanStack Query / SWR). |
| **Default React Imports** | `import React from 'react'` is unnecessary with the modern JSX transform. | Use named imports (`import { useState, useActionState, use } from 'react'`). |
| **Manual Pending Booleans for Forms** | Juggling `isSubmitting`, `error`, and `data` manually via `useState` creates state synchronization bugs. | Use Actions with `useActionState`, `useFormStatus`, and `useOptimistic`. |

---

## ⚖️ Memoization Trade-Offs: With vs Without React Compiler

Before adding or removing `useMemo` and `useCallback`, inspect `package.json`, `vite.config.ts`, or `next.config.ts` to verify whether **React Compiler** (`babel-plugin-react-compiler` / `experimental.reactCompiler`) is enabled:

### 1. React 19 WITH React Compiler Enabled (Default in Compiler-Configured Apps)
- **Rule**: Do **not** write routine `useMemo` or `useCallback` around standard derived values or JSX event handlers. The compiler automatically tracks fine-grained reactivity.
- **When Explicit Memoization Still Applies (`[Beyond-Baseline]`)**:
  - When stabilizing a reference passed into a third-party imperative hook or external store that relies on strict referential equality across renders and falls outside compiler guarantees.

### 2. React 19 WITHOUT React Compiler Enabled
- **Rule**: Do **not** blindly strip `useMemo` or `useCallback`. Apply them intentionally where they solve a concrete performance or correctness problem:
  1. **Expensive Computations**: Filtering, sorting, or aggregating large collections ($N \ge 500$ items) or complex structural parsing.
  2. **Referential Stability for Effects & Subscriptions**: Functions or objects listed in a `useEffect` / `useLayoutEffect` dependency array.
  3. **Virtualized Lists & Memoized Subtrees**: Passing callbacks or config objects to `React.memo` row renderers (`@tanstack/react-virtual`, canvas/grid cells).
- **Avoid Premature Memoization**: Even without the compiler, do not wrap trivial primitive expressions (`const fullName = `${first} ${last}``) or cheap inline handlers on native DOM elements (`<button onClick={() => setOpen(true)}>`).

---

## 🏛️ Core Architectural Patterns

### 1. Server Components First (When Using RSC Frameworks)
- Components are Server Components by default (no directive required).
- Add `"use client"` at the leaf boundary only when interactive hooks (`useState`, `useActionState`), event listeners, or browser APIs are needed.

### 2. The `use()` API
- Unwraps promises directly during render in coordination with `<Suspense>` and `<ErrorBoundary>`.
- Reads React Context conditionally (e.g., after an early return or inside a loop, which `useContext` cannot do).

### 3. Actions, `useActionState`, & `useOptimistic`
- Form submissions and async transitions manage pending states, optimistic UI updates, and error payloads declaratively.

---

## 📊 Before & After React 19 Patterns

### 1. Form Mutations & Pending State

**❌ Anti-Pattern (React 18 Manual State Juggling):**
```tsx
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
      setError(err instanceof Error ? err.message : 'Failed');
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
```

**✅ Approved Pattern (React 19 Action & `useActionState`):**
```tsx
import { useActionState } from 'react';
import { updateProfileAction } from '@/actions/profile';

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

---

### 2. Passing Component Refs

**❌ Anti-Pattern (Legacy `forwardRef`):**
```tsx
import { forwardRef } from 'react';

export const TextInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

**✅ Approved Pattern (Direct `ref` Prop):**
```tsx
import type { ComponentPropsWithRef } from 'react';

export function TextInput({ ref, ...props }: ComponentPropsWithRef<'input'>) {
  return <input ref={ref} {...props} />;
}
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

React 19 primitives (`useActionState`, `use()`, `ref`-as-prop) and compiler-aware memoization form the baseline. When building complex client-side engines—such as real-time collaborative canvases, high-frequency streaming financial tickers, WebGL/Three.js bridges, or React 19 apps running without `babel-plugin-react-compiler`—explicit `useMemo`, `useCallback`, `useSyncExternalStore`, or fine-grained signals/stores are fully authorized when justified with `[Beyond-Baseline: <technical reason>]`.

---

## 🧪 Verification Protocol
1. **Type Checking**: Verify with `pnpm dlx tsc --noEmit`.
2. **Compiler & Lint Alignment**: Match ESLint `react-hooks` rules to whether `babel-plugin-react-compiler` is active in the workspace.
3. **Tests**: Verify interactive states with Vitest and `@testing-library/react`.
