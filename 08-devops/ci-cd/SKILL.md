---
name: ci-cd
description: "CI/CD pipeline configuration for modern workspaces and monorepos. Covers GitHub Actions workflows, pnpm caching, automated deployments (Railway, Render, Fly.io, VPS, Cloud), database migration gates, and environment promotion. Use when setting up continuous integration, automated deployment, or release promotion. Do not use for application runtime logging."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["deploy", "desplegar", "CI/CD", "github actions", "pipeline", "railway", "render", "producción", "staging"]
  scope: [global, project]
  version: "1.1.0"
---

# 🚀 CI/CD — Continuous Integration & Deployment Pipelines

Use this skill when configuring continuous integration, automated deployment workflows, or environment promotion gates for single-package repositories and multi-package `pnpm` workspaces.

---

## 📋 Environment Promotion Topology

| Environment | Branch / Ref | Trigger | Target Purpose |
|---|---|---|---|
| **Preview / Ephemeral** | `feat/*`, PRs | Pull Request opened/updated | Isolated preview verification |
| **Staging** | `develop` or `main` | Merge to integration branch | Pre-production integration & E2E checks |
| **Production** | `main` or release tag `v*` | Approved release + green gates | Live production traffic |

---

## 🔧 Baseline GitHub Actions CI Workflow (`pnpm`)

```yaml
# .github/workflows/ci.yml
name: CI — Lint, Typecheck, Test & Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: ci_user
          POSTGRES_PASSWORD: ci_password
          POSTGRES_DB: app_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -r lint

      - name: Typecheck
        run: pnpm -r typecheck

      - name: Unit & Integration Tests
        run: pnpm -r test
        env:
          DATABASE_URL: postgresql://ci_user:ci_password@localhost:5432/app_test
          JWT_ACCESS_SECRET: ci-ephemeral-test-secret

      - name: Build Verification
        run: pnpm -r build
```

---

## ☁️ Automated Service Deployment Template

```yaml
# .github/workflows/deploy.yml
name: Deploy Services

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy API Service
        uses: railwayapp/railway-deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: api-service
          environment: production

      - name: Deploy Web Client
        uses: railwayapp/railway-deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: web-client
          environment: production
```

---

## 🔐 Secrets & Supply-Chain Hygiene

**Never hardcode credentials or tokens in workflow files.**
- Store sensitive values in **GitHub Actions Environments / Secrets** (`Settings > Environments`) or cloud secret managers (GCP Secret Manager, AWS Secrets Manager, Doppler, Infisical).
- Typical required secrets:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
  - Deployment provider credentials (prefer **OIDC federated workload identity** over long-lived static API tokens whenever supported)
  - Third-party provider keys (`OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, etc.)

---

## 🛡️ Release & Promotion Guardrails

1. **Gatekeeper Verification**: Require passing CI checks (`lint`, `typecheck`, `test`, `build`) and review sign-off before merging to `main`.
2. **Safe Production Migrations**: Run deterministic migration deploy commands (`pnpm prisma migrate deploy` or equivalent expand-and-contract migrations) — never run destructive dev-only schema syncs (`migrate dev` / `db push --force-reset`) against production.
3. **Pre-Migration Backup & Rollback Readiness**: Ensure automated point-in-time recovery (PITR) or a verified snapshot exists before applying schema changes.
4. **Post-Deploy Readiness Probe**: Verify the service readiness endpoint (`GET /api/health` or `/health/ready`) returns HTTP `200` within `< 5s` before completing traffic cutover.
5. Refer to `../../04-backend/docker/SKILL.md` for multi-stage container builds and `../../08-devops/monitoring/SKILL.md` for healthcheck contracts.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

This pipeline is the CI/CD baseline. Scale build speed and supply-chain security when appropriate (annotate with `[Beyond-Baseline: <reason>]`):
- **Affected-Only Graph Execution**: Use Turborepo (`pnpm turbo run test --filter=...[origin/main]`) or Nx affected graphs to run expensive checks only on impacted workspace packages.
- **Immutable Action Pinning & OIDC**: Pin third-party GitHub Actions to full 40-character commit SHAs and use keyless OIDC authentication for cloud deployments.
