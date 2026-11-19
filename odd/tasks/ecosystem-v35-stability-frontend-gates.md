# Feature: Ecosystem v3.5 Stability & 3-Phase Frontend Gates

Branch: `feat/frontend-v35-three-phase-gates` | Route: `default-inline` | Size: `Large` (Risk: item 3 shared scripts/contracts + item 5 installer/kernels; Auto-EGM audited by `egm-zoom-out` & `egm-codebase-details`; Engram mirror skipped due to server `cwd` mismatch with workspace)

## Specs

- **S1 (3-Phase Frontend Engine & D1b Anti-Slop Fixes)**: "Bueno, si esto mejorará nuestros resultados en el frontend de una manera satisfactoria, procedamos con el plan para mejorar este aspecto en el frontend."
- **S2 (Ecosystem-Wide Stability Audit & Systemic Bug Fixes)**: "Antes de seguir investigando, me gustaría indicarte que este tipo de problema no se repite en el resto del proyecto o, generalmente en el proyecto, no hay más problemas del estilo que se que se pueda llegar a presentar en el resto del ecosistema. Necesito que se evalúe generalmente el ecosistema para detectar este tipo de errores. Para dejar Una versión lo más estable posible. Aprovechamos y dejamos una mejora sustancial al sistema."
- **S3 (Auto-EGM Guardrails Incorporated)**:
  - `verify-frontend-gates.mjs` must be zero-`_shared`-import, declare `allows-script-exec` in `05-frontend/design-driven/SKILL.md`, use `spawnSync(process.execPath, [...])` (Windows space-path safe), skip missing sibling scripts gracefully, avoid brittle aesthetic regexes, and support `--json` cleanly.
  - Fix systemic `findProjectRoot(__dirname)` across all 28 ecosystem scripts, standalone `src/` fallback, `check-module-level-loads.mjs` `new Map()` false positive, `check-pkg-exists.mjs` `node:` builtin false positive, `check-deep-links.mjs` / `check-eas-config.mjs` CLI args & `JSON.parse` guard, `check-lottie.mjs` `--srcDir` respect, `token-audit.mjs` multiline CSS custom property exemption, `check-tokens.mjs` `#1842` & spacing/multiline fixes, and `validate-build-config.mjs` Tailwind v4 + non-Vite + standalone `tsconfig.app.json`/`tsconfig.json` support.
  - Preserve all `validate:strict`, `catalog-doctor`, `pnpm test`, and `test:addon` invariants.

## Tasks

- [x] **T1** (`S2`, `S3`) — Harden `_shared/script-utils.mjs` (`--json` in `printResult`, `resolveDefaultDirs`, safe `findProjectRoot(cwd)`) + fix all 28 scripts using `findProjectRoot(__dirname)`, `check-module-level-loads.mjs`, `check-deep-links.mjs`, `check-eas-config.mjs`, `check-lottie.mjs`, `check-pkg-exists.mjs` + unit tests (`test/ecosystem-scripts.test.mjs`) | Route: `inline` | Commit: `49c7a30`
- [x] **T2** (`S1`, `S3`) — Fix `token-audit.mjs` (multiline CSS vars), `check-tokens.mjs` (safe hex + multiline + spacing), `validate-build-config.mjs` (TW4 + non-Vite + standalone tsconfig) + build `verify-frontend-gates.mjs` + TDD tests (`test/frontend-gates.test.mjs`) | Route: `inline` | Commit: `c94ebc3`
- [x] **T3** (`S1`, `S2`, `S3`) — Harmonize Frontend & Build skills (`design-driven`, `d1b-questionnaire.md`, `hallmark-design-study`, `hallmark-v2-hue-stitch.md`, `taste-skill`, `absolute-bans.md`, `ai-design-check-stageshow`, `impeccable`, `web-design-guidelines`, `motion-framer`, `design-system-tokens`, `tailwind-4`, `oklch-theme-injector`, `build-config-validator`) + minimal 1-line kernel delta (`AGENTS.md`, `_shared/bootstrap-kernel-*.md`) | Route: `inline` | Commit: `651dea9`
- [x] **T4** (`S1`, `S2`, `S3`) — Sync catalog (`registry:sync`, `build:addon`), run full verification (`pnpm test` 252/252, `pnpm run test:addon` 3/3, `pnpm run validate:strict` 251/251, `pnpm run doctor` 7/7), flat-install verification in `mktemp`, live smoke-test `verify-frontend-gates.mjs` against `investigacion monolitica` & `Radar CVE`, and close with Risk line | Route: `inline` | Commit: `5d4d6d5`
- [x] **T5** (`S4` Gentle-AI 4.6.0) — Audit upstream `Gentleman-Programming/gentle-ai` `v4.5.0...v4.6.0` (Provider Contract `1.6.0`, PRs `#6145` & `#6159`), remove obsolete `## Key Learnings` worker requirement, adopt parent-adjudicated edit surfaces, authorized work continuity, tool-backed human decisions, and orchestrator-owned next step on exhausted corrections across `AGENTS.md`, `_shared/bootstrap-kernel-*.md`, `odd-workflow`, `gentle-orchestrator`, `gentle-ai-review-4r`, `README*`, `package.json` (`3.5.0`), `test/kernel-inject.test.mjs`, `SKILLS.md`, `tier0-context.*`, and `gentle-ai-dsh` mirror | Route: `inline` | Commit: pending

## Log

- **L1**: User authorized proceeding with the 3-Phase Frontend Engine + unified gates plan (`S1`) and requested a full ecosystem stability audit and fix pass (`S2`) to eliminate systemic bugs across the entire `skillsGV` catalog.
- **L2 (Auto-EGM Findings)**: `egm-zoom-out` and `egm-codebase-details` reviewed `design_draft_v35_frontend.md` (`egm-implementation-readiness` stopped on 429 quota). Incorporated all 11 verified technical blockers/guardrails into `S3`.
- **L3 (Ecosystem Audit)**: Programmatic scan of all 49 skill scripts & 252 `SKILL.md` files uncovered 28 scripts calling `findProjectRoot(__dirname)`, `check-module-level-loads.mjs` flagging `new Map()` as exit-1 error, `check-pkg-exists.mjs` missing `node:` prefix builtins, `check-deep-links.mjs` & `check-eas-config.mjs` having zero CLI args + hardcoded `apps/mobile-client`, and `check-lottie.mjs` ignoring `--srcDir`. All 80 `.mjs` files pass `node --check`; baseline `validate:strict` (251/251) and `doctor` (7/7) green.
- **L4 (Verification & Smoke Evidence)**:
  - `pnpm test` → `252/252` passed (`0` failed, includes new `test/ecosystem-scripts.test.mjs` 6/6 + `test/frontend-gates.test.mjs` 7/7 + `test/token-audit.test.mjs` 32/32).
  - `pnpm run doctor` → `7/7` passed (`validator-strict` 251/251 0 errors/warnings, `skill-references` 378 files 0 dangling).
  - `pnpm run test:addon` → `3/3` passed (`gentle-ai-dsh` mirror synced).
  - Flat `.agents/skills/` temp-dir install test → `verify-frontend-gates.mjs` resolved and passed `6/6` sibling scripts (`0` errors, `0` warnings, `0` skipped).
  - Real-world smoke runs: `Radar CVE` (`validate-build-config` 0 errors/warnings; `token-audit` dropped 14 false positives from multiline CSS custom properties; caught `z-index: 9999`), `investigacion monolitica` (`6/6` scripts run, `0` errors).
  - Global user rule synced outside repo: `C:\Users\j1347\.gemini\config\rules\00-skillsgv-always-on.md`.
  - Independent verifier subagent skipped due to active 429 subagent quota exhaustion; full inline + `mktemp` flat-install verification observed directly.
