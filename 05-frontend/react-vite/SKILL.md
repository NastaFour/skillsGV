---
name: react-vite
description: "Standards and guidelines for React and Vite SPA development. Enforces Single Responsibility (SRP) for components, custom hook extraction, Vite build configurations, and frontend security guardrails. Use when developing or modifying React components, managing client/server state, or configuring Vite. Do not use for Next.js App Router SSR-specific server components."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["react", "vite", "SPA", "componentes", "hooks"]
  scope: [global, project]
  version: "1.1.0"
---

# ⚡ React & Vite SPA Development (2026 Standards)

Use this skill when developing or modifying React components, managing local or remote state, or configuring Vite single-page and multi-module web applications.

---

## 🏛️ Single Responsibility Principle (SRP) for Components

To keep UI code maintainable and testable, separate rendering from side-effect orchestration:

1. **Presentational vs Stateful Orchestration**:
   - **Presentational Components**: Focus on visual layout, accessibility semantics, and styling tokens. They receive data and callbacks via typed props and remain easy to preview and test in isolation.
   - **Feature Containers / Route Views**: Coordinate route parameters, data queries, subscriptions, and domain mutations, passing normalized props down to presentational views.

2. **Custom Hooks for Side Effects & Domain Logic**:
   - Extract data fetching, real-time stream subscriptions, and complex state transitions into focused custom hooks (e.g., `useResourceQuery(resourceId)`, `useWorkspaceStream(workspaceId)`, `useOptimisticMutation()`).
   - Keep component bodies concise and declarative.

---

## 🚨 2026 Guardrails & Security

1. **Modern Functional Architecture**:
   - Use functional components and hooks exclusively; class components are reserved only for legacy Error Boundary wrappers when not using `react-error-boundary`.

2. **Public Environment Variable Hygiene**:
   - Only non-sensitive public configuration may use the `VITE_` prefix (e.g., `VITE_API_BASE_URL`, `VITE_WS_URL`).
   - Never expose private API keys, database URLs, or signing secrets in `VITE_*` variables, as Vite statically embeds them into the client bundle.

3. **XSS & Injection Prevention**:
   - Avoid `dangerouslySetInnerHTML`.
   - When rendering rich user-generated HTML or markdown is required, sanitize strictly with `dompurify` before mounting.

4. **Subscription & Effect Lifecycle**:
   - Declare WebSocket, `EventSource`, or DOM event listeners inside `useEffect` (or `useSyncExternalStore`) and always return a deterministic cleanup function (`socket.off(...)`, `controller.abort()`) to prevent memory leaks.

---

## 🧩 Universal SPA Integration Patterns

- **Optimistic UI & Server State**: Pair local UI feedback with server-state synchronization (e.g., TanStack Query) so mutations feel instant while rolling back cleanly on network errors.
- **Real-Time Stream Isolation**: Subscribe to live telemetry or collaborative room updates inside dedicated hooks so high-frequency events do not trigger full-page re-renders.
- **Code Splitting & Bundle Budgets**: Use `React.lazy()` and route-level dynamic imports in Vite to keep initial entry chunks fast.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

These rules establish the React + Vite baseline. Adopt modern ecosystem primitives when beneficial (annotate with `[Beyond-Baseline: <reason>]`):
- **React 19 & Compiler**: Leverage React 19 actions (`useActionState`, `useOptimistic`), `use()`, and the React Compiler instead of manual `useMemo`/`useCallback` boilerplate where enabled.
- **Type-Safe Routers & Query Caches**: Prefer TanStack Router + TanStack Query (or Remix/React Router v7 framework mode) over manual `useEffect` data fetching.
