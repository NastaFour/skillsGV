---
name: catalog-doctor
description: "Trigger: catalog doctor, doctor, check catalog health, diagnostico del catalogo, verificar estado del catalogo. Run unified catalog diagnostic checks: validate --strict, install dry-run, loader status, manifest consistency, dependency check, and MCP parity. Use when verifying catalog consistency, before PRs, or after install. Do NOT use for mutating catalog files or applying changes."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  trigger: ["catalog doctor", "doctor", "check catalog health", "diagnostico del catalogo", "verificar estado del catalogo"]
  scope: [global, project]
  version: "1.0.0"
allows-script-exec: "Spawns validator, installer dry-run, loader status and index checks for unified catalog diagnosis"
---

# Catalog Doctor — Unified Catalog Health Check

Unified diagnostic aggregator for the skills catalog.

## Activation Contract

Run when the user asks to check catalog health, run diagnostics, or verify environment and manifest consistency before PRs or after installation.

## Hard Rules

- **Read-only**: NEVER mutate files, manifests, or installation states.
- Always report actionable causes when any check fails.
- Exit code 0 if and only if all checks pass; non-zero on any failure.

## Diagnostic Checks

1. **Validator strict mode**: `validate-skills.mjs --strict --json`
2. **Installer simulation**: `install-skills.mjs --dry-run --all-tools`
3. **Loader & cache status**: `skills-loader.mjs --status`
4. **Manifest & index consistency**: `generate-indexes.mjs --check`
5. **Dependency check**: `validate-skills.mjs --check-deps --json`
6. **MCP parity check**: Bidirectional verification of `mcp-manifest.json` against frontmatters.

## Execution

```bash
pnpm doctor
# or
node 00-meta-skills/catalog-doctor/scripts/catalog-doctor.mjs
```

## References

- [`00-meta-skills/skill-validator`](../skill-validator/SKILL.md) — agentskills.io spec validator.
- [`00-meta-skills/skill-registry`](../skill-registry/SKILL.md) — index generator and manifest consistency checker.
