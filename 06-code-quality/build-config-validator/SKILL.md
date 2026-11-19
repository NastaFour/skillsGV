---
name: build-config-validator
description: "Validates web build config files for both Tailwind CSS v4 (@tailwindcss/vite or @tailwindcss/postcss) and legacy Tailwind v3 (postcss.config, tailwind.config), Vite or non-Vite frameworks, and standalone or monorepo strict TypeScript configs. Use when setting up a web app, debugging CSS not loading, or before pnpm dev/build. Do NOT use for Expo mobile apps (use expo-production-auditor)."
license: MIT
compatibility: "Requires Node 20+ and pnpm 9+. No external dependencies."
metadata:
  trigger: ["build config", "postcss missing", "tailwind DEFAULT", "vite config", "css not loading", "config validator"]
  scope: [global, project]
  version: "1.1.0"
allowed-tools: Bash(node:*) Read
---

# 🛠️ Build Config Validator

Verifies that web build configuration files exist and are wired properly before running `pnpm dev` or `pnpm build`. Automatically distinguishes **Tailwind CSS v4** CSS-first setups (`@tailwindcss/vite` / `@tailwindcss/postcss`) from **legacy Tailwind v3** (`postcss.config.js` + `tailwind.config.js`), **Vite vs non-Vite** stacks (Next.js, Astro, Angular), and **standalone vs monorepo** strict TypeScript configs.

## 📋 When to Use

- Use when a web app renders without CSS or fails to process Tailwind directives.
- Use after scaffolding a new standalone or monorepo web app, or as part of `verify-frontend-gates.mjs` Phase 3.
- Do NOT use for mobile (Expo) — Metro config is different, use `expo-production-auditor`.

## 🚦 Hard Rules

- **Tailwind CSS v4**: Must wire either `@tailwindcss/vite` (in Vite config) or `@tailwindcss/postcss` (in PostCSS config) — do NOT require legacy `tailwind.config.js` or `postcss.config.js` when using `@tailwindcss/vite`.
- **Legacy Tailwind v3**: Must provide `postcss.config.{js,cjs,mjs}` with Tailwind + Autoprefixer and a Tailwind config defining `DEFAULT` shades for palette tokens.
- **Vite projects**: When `vite` is in `package.json`, a Vite config with `@vitejs/plugin-react` (for React apps) must exist; non-Vite frameworks (Next.js, etc.) skip Vite checks.
- **TypeScript strictness**: Enforce `"strict": true` in `tsconfig.base.json` (monorepo) or standalone `tsconfig.json` / `tsconfig.app.json`.

## 🛠️ Workflow

1. Run the validator script:
   ```bash
   node 06-code-quality/build-config-validator/scripts/validate-build-config.mjs --webDir .
   ```
2. Add `--json` for machine-readable output (also called automatically by `verify-frontend-gates.mjs`).
3. For legacy Tailwind v3 apps missing PostCSS config, `--fix` creates a baseline config (skipped safely on Tailwind v4).

## 🔍 What It Checks

| Check | Scope | Condition |
|---|---|---|
| Tailwind v4 plugin | Tailwind v4 projects | `@tailwindcss/vite` in Vite config OR `@tailwindcss/postcss` in PostCSS config |
| PostCSS + Tailwind config | Legacy Tailwind v3 only | PostCSS includes Tailwind + Autoprefixer; Tailwind config defines `DEFAULT` shade |
| Vite config | Vite projects only | Vite config exists and registers React plugin when React is installed |
| TypeScript strict | Monorepo or standalone | `"strict": true` in `tsconfig.base.json`, `tsconfig.json`, or referenced `tsconfig.app.json` |

## 📚 References

- [`tailwind-4`](../../05-frontend/tailwind-4/SKILL.md) — Tailwind CSS 4 CSS-first `@theme` standards
- [`react-vite`](../../05-frontend/react-vite/SKILL.md) — Vite React setup
- [`frontend-debugging-protocol`](../../02-dev-roles/frontend-debugging-protocol/SKILL.md) — diagnostic tree for "CSS not loading"
