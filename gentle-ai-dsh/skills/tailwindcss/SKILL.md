---
name: tailwindcss
description: DEPRECATED. Use tailwind-4 instead. Legacy Tailwind CSS v3 guidelines kept for retrocompatibility. The skill-router ignores this skill.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  deprecated: "true"
  redirect: "tailwind-4"
  trigger: ["tailwindcss legacy", "tailwindcss deprecated"]
  scope: [global, project]
  version: "1.0.0"
---

> ⚠️ **DEPRECATED**: Replaced by [`tailwind-4`](../tailwind-4/SKILL.md). Use `tailwind-4` for modern Tailwind CSS 4 patterns, `cn()` utility, and semantic theme tokens.

# 🎨 Tailwind CSS Design Guidelines (Legacy)

Use this skill only for legacy Tailwind v3 references. For modern implementations, use [`tailwind-4`](../tailwind-4/SKILL.md).

## 🚨 Tailwind CSS Guardrails

1. **Zero String Interpolation in ClassNames**:
   - Queda prohibido inyectar clases Tailwind de manera dinámica interpolando strings (ej: `className={`bg-${color}-500`}`). El compilador estático (JIT) eliminará estas clases del bundle final.
   - **Forma Correcta**: Mapear los valores a nombres de clases completos:
     ```typescript
     const statusColors = {
       PENDING: 'bg-yellow-500 text-yellow-950',
       PACKING: 'bg-blue-500 text-blue-950',
       SHIPPED: 'bg-purple-500 text-purple-950',
       DELIVERED: 'bg-green-500 text-green-950',
       CANCELLED: 'bg-red-500 text-red-950',
     };
     const colorClasses = statusColors[orderStatus];
     ```

2. **Clean Component Layouts**:
   - Limit class listings by separating complex blocks into modular sub-components. Do not write a single line of 150 utility classes.
   - Use `@apply` directives inside `index.css` sparingly and ONLY when extracting repetitive layout blocks (like global buttons or standard form inputs). Prefer standard utility-first inline patterns.

3. **Responsive Grid & Flexboxes**:
   - Use Tailwind's screen breakpoints (`sm:`, `md:`, `lg:`, `xl:`) systematically.
   - Design with mobile-first layout systems (e.g. mobile app has a simple vertical catalog layout, while admin dashboard has a multi-column grid layout).

## 📊 Dashboard Layouts

- **Grid Skeletons**: Structure analytical dashboards with responsive grid columns:
  ```html
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
    <!-- Metric Cards, Status Feeds, Data Visualizations -->
  </div>
  ```
- **Status Cards**: Cards representing monitored entities should visually indicate states with semantic borders (`border-amber-500` for warnings, `border-red-500` for critical errors).
- **Flexible Panels**: Ensure flexbox containers allow content areas to shrink/grow and scroll independently from side navigation.
