# skillsGV v3.3.0: Catalog Token Compression, Gentle-AI 4.4.0 Alignment, Resource Efficiency, Prompt-Shield & Anti-Slop Design/Motion

*   **Author:** NastaFour
*   **Status:** Approved
*   **Date:** 2026-11-14

--------------------------------------------------------------------------------

## Overview

`skillsGV v3.3.0` upgrades the portable AI agent skill catalog from **246 skills (`v3.2.0`) to 251 skills (`v3.3.0`)** under the **Gentle-AI 4.4.0** Organic-Driven Development (ODD) runtime, Google's external **Elephant-Goldfish Model (EGM)** specification and review workflow (`~/.gemini/config/plugins/egm`), and the **Floor, Not Ceiling (`Enseñanza > Dogma`)** governance rule.

The upgrade solves five concrete system problems in the current catalog:
1.  **Catalog and Tier-1 Token Waste**: Reclaims `~37,000 tokens` currently stored in 20 deprecated `SKILL.md` files and `~4,500 tokens` across `02-dev-roles/decision-gate/SKILL.md` and `01-planning-process/brainstorming/SKILL.md` without breaking path backward compatibility, frontmatter validation, legacy redirect triggers (`sdd-orchestrator/evals.json`), or offline evaluations.
2.  **Canonical Walker Contamination from Nested Workspaces**: Centralizes directory traversal onto `_shared/catalog-manifest.mjs` (`walkSkillPaths`) across all 7 active skill walkers and `test/catalog-integrity.test.mjs`, excluding dot-directories and nested workspaces (`Anti rats/`) and restricting `REPO_ROOT` scans to numbered category directories (`00-` through `12-`, skipping unused `10-`, i.e., `00-..09-`, `11-mcp-hybrid`, `12-matt-pocock`) plus `ROOT_SKILL_ALLOWLIST = ["professional-planner"]`.
3.  **Coding Output Quality & Runtime Resource Efficiency**: Adds cohesive Tier-1 skills for application runtime resource budgets (`06-code-quality/app-resource-efficiency`), anti-overengineering surgical discipline (`06-code-quality/karpathy-ponytail-simplicity`), and EGM/Graphify/Agency-Agents spec review (`01-planning-process/egm-spec-review`), with non-overlapping boundaries against `api-ai-billing`, `three-js-web`, `solid-clean-code`, and `codegraph-intelligence`.
4.  **Indirect Prompt Injection Screening & AppSec Enrichment**: Integrates `NastaFour/prompt-shield` (`03-ai-ml/prompt-shield`) with its zero-token Python stdlib CLI scanner (`scripts/safe_read.py`, rule IDs `IPI100–IPI501`, non-echoing exit `3` quarantine diagnostics) and enriches `live-cve-security-intel` (`v1.1.0`) and `security-audit` (`v2.0.0 -> v2.1.0`) with `bug-hunter` differential triage and `prompt-shield` handoff.
5.  **Anti-Slop UI/UX & 22-Repo Open-Source Motion Studio**: Adds `05-frontend/ai-design-check-stageshow` (`@enmera/ai-design-check` 70 deterministic rules + `Stageshow` workflow) and upgrades `hallmark-design-study` (`v1.1.0`), `motion-video-pipeline` (`v1.1.0`, 22 open-source motion repos in progressive `references/`), and `web-animation-sources` (`v1.1.0`), partitioned across all 8 Design Archetypes (`A–H`, including `F`) so flat-surface dashboard rules do not block 3D/WebGL creative builds.

## The Problem

Empirical inspection of `skillsGV v3.2.0` exposed six bottlenecks:

1.  **40,053 Tokens of Dead Text in Deprecated Skills**: Twenty skills marked `deprecated: "true"` in `catalog.json` (`12 sdd-*`, `professional-planner`, `speckit-integration`, `expert-debugger`, `frontend-designer`, `electronjs`, `nextjs`, `state-management`, `tailwindcss`) retain `160,214 bytes` (`~40,053 tokens`) of legacy instructions (`sdd-archive/SKILL.md` alone is `4,699 tokens`).
2.  **Oversized Decision & Planning Entrypoints**: While `tier0-context.md` stays compact (`~430 tokens` across 9 `TIER0_SKILLS`), reading `decision-gate/SKILL.md` (`207 lines`, `11,456 bytes`) or `brainstorming/SKILL.md` (`259 lines`) loads verbose inline examples, CLI code tables, and a Graphviz DOT diagram instead of keeping core contracts in `SKILL.md` and examples under `references/`.
3.  **Eight Divergent Walkers & `2,507` vs `246` Skill Inflation**: `EXCLUDED_DIRS` / `skipDirs` are duplicated across `_shared/catalog-manifest.mjs`, `validate-skills.mjs`, `catalog-doctor.mjs`, `skill-router.mjs`, `skills-loader.mjs`, `install-skills.mjs`, `scripts/check-install-state.mjs`, and `test/catalog-integrity.test.mjs`. Local workspaces (`Anti rats/`) with `.agents/skills`, `.claude/skills`, etc. inflate counts from `246` to `2,507`, breaking `--strict`, `doctor`, routing, and registry generation.
4.  **Missing Proactive Runtime Resource Budgets & Anti-Slop Spec Discipline**: Existing `performance-refactor` (`46 lines`) covers post-hoc refactoring only, leaving RAM streaming, leak cleanup, worker offload, N+1 DB queries, and Karpathy/Ponytail surgical edit discipline uncovered.
5.  **Unchecked Untrusted Files Before Ingestion**: Agents reading third-party repos, issues, or downloaded docs have no deterministic pre-read byte/encoding/cipher/polyglot scanner before content enters the context window.
6.  **Unpartitioned UI Rules Block Immersive 3D/Motion Work**: Applying flat SaaS UI linting uniformly across all frontend archetypes (`A–H` in `05-frontend/design-driven/SKILL.md`) blocks 3D/WebGL/shader/scroll storytelling unless explicit archetype partitioning and `[Beyond-Baseline: <visual rationale>]` waivers are defined alongside non-waivable accessibility floors.

## Governance & Tier Definitions

*   **Context Loading Tiers (`Tier-0` vs `Tier-1`)**: `Tier-0` (`TIER0_SKILLS` = 9 always-on meta-skills summarized in `tier0-context.md`) is never loaded into `tier1toLoad` slots (`skill-router.mjs` caps Tier-1 loading at `<= 5` skills per turn). `references/*.md` files are lazy-loaded only when the agent executes detailed examples, extended matrices, or tool recipes.
*   **Catalog Installer Tiers (`core`, `extended`, `full`)**: `install-skills.mjs --tier` filters installations by `catalog.json` tier (`36 core + 68 extended = 104 <= 105`, leaving `147 full`; total `251`), keeping `coreCount` in `[30, 45]` and `core + extended` in `[80, 105]` inside `test/catalog-integrity.test.mjs`. `_shared/catalog-manifest.mjs` (`buildManifest`) will read `metadata.tier` / top-level `tier` from `SKILL.md` so `generate-indexes.mjs --write` assigns `extended` declaratively.
*   **Phase D1b & `Floor, Not Ceiling` (`[Beyond-Baseline: ...]`)**: Visual tasks select one of 8 Design Archetypes (`A` Technical Monograph, `B` Industrial Spec-Sheet, `C` The Gallery, `D` The Kinetic Utility, `E` The Precision Instrument, `F` The Humanist Companion, `G` The System Native, `H` Bespoke/Lateral Exploration). Under `Floor, Not Ceiling`, flat-surface layout/card/typography rules enforce strictly on **`A, B, E, F, G`**, while **`C, D, H`** may waive layout/viewport-lock/shader aesthetic rules with an explicit `[Beyond-Baseline: <visual rationale>]` thesis. **WCAG contrast, keyboard focus, semantic landmarks, and broken overflow remain non-waivable across ALL `A–H`**.
*   **External EGM & ODD Bridge**: `T1` (already completed externally in `~/.gemini/config/plugins/egm`) installed the 10-Goldfish, 7-skill EGM plugin (`Elephant` spec author -> zero-context `Goldfish` reviewers across 7 lenses: `egm-zoom-out`, `egm-comprehension`, `egm-design`, `egm-implementation-readiness`, `egm-codebase-details`, `egm-structural`/`egm-style`, `egm-inventive-catalyst`; plus `/egm-drift-report`). `T2–T6` implement the approved spec in atomic commits on the feature branch.

## Goals

*   **G1 — Reclaim `~41,500 Tokens`**: Compress all 20 deprecated `SKILL.md` bodies into `<150-token` redirect stubs while preserving mandatory frontmatter, original authors, non-downgraded single `metadata.version`, `allows-script-exec` (`sdd-apply`), legacy redirect triggers (especially `sdd-orchestrator` so `evals.json` keeps routing to `odd-workflow`), and sibling files. Extract verbose content from `decision-gate` (`207 -> <80` lines) and `brainstorming` (`259 -> <85` lines) into `references/`.
*   **G2 — Centralize All 7 Skill Walkers & Preserve Tier Bounds (`251` Skills)**: Centralize `walkSkillPaths(root, { isCatalogRoot } = {})` with `samePath` Windows normalization, dot-dir + `"Anti rats"` + `copia-de-seguridad*` exclusion, `/^\d{2}-[a-z0-9-]+$/` (`00-..12-`), and `ROOT_SKILL_ALLOWLIST = ["professional-planner"]` across `_shared/catalog-manifest.mjs` and all 7 skill walkers (`validate-skills.mjs`, `catalog-doctor.mjs` `walkSkillFiles`, `skill-router.mjs`, `skills-loader.mjs`, `install-skills.mjs`, `check-install-state.mjs`, `test/catalog-integrity.test.mjs`), keeping `catalog-doctor.mjs` `walkCatalogFiles` preserving `.github`/`.atl`/`scripts/`/`docs/` and keeping `core + extended = 104 <= 105`.
*   **G3 — Gentle-AI `4.4.0` Kernel & Governance Alignment (`Provider Contract 1.5`)**: Update governance/kernels/docs across `AGENTS.md` (`<6.5 KB`), `README.md`, `README.es.md`, `_shared/bootstrap-kernel-{full,minimal}.md`, `_shared/review-ledger-contract.md`, `odd-workflow`, `gentle-orchestrator`, `gentle-ai-review-4r`, `code-reviewer`, `rdd-defect-workflow`, `00-meta-skills/harness-map.md`, `00-meta-skills/skill-router/SKILL.md`, `gentle-ai-dsh/{AGENTS.md,README.md,ISSUES.md}`, and `test/kernel-inject.test.mjs`, keeping `Provider Contract 1.5` intact and excluding CLI installer trivia from `AGENTS.md`.
*   **G4 — Five Cohesive Skills (`246 -> 251`) & Four Canonical Upgrades Without Overlap**: Add `03-ai-ml/prompt-shield` (`extended`), `06-code-quality/app-resource-efficiency` (`extended`), `06-code-quality/karpathy-ponytail-simplicity` (`full`), `05-frontend/ai-design-check-stageshow` (`full`), and `01-planning-process/egm-spec-review` (`full`), plus upgrade `hallmark-design-study` (`v1.1.0`), `motion-video-pipeline` (`v1.1.0`), `web-animation-sources` (`v1.1.0`), `live-cve-security-intel` (`v1.1.0`), and `security-audit` (`v2.0.0 -> v2.1.0`).
*   **G5 — 100% Deterministic Verification**: Pass `validate-skills.mjs --strict` (`251/251`), `router-replay.mjs --consistency`, `catalog-doctor.mjs`, `python 03-ai-ml/prompt-shield/scripts/safe_read.py 03-ai-ml/prompt-shield/SKILL.md` + exit-`3` unit test, `sync-addon.mjs --check`, `pnpm test`, `pnpm test:addon`, and `pnpm benchmark`.

## Non-Goals

*   **NG1 — No Internal Duplication of External EGM Plugin**: `~/.gemini/config/plugins/egm` stays external to `00-meta-skills/`.
*   **NG2 — No Fragmentation Into 40+ Micro-Skills**: Consolidating the 22 Motion Studio repos, 2026 design galleries, Karpathy/Ponytail/Caveman/Addy Osmani workflows, and defensive security extensions avoids trigger dilution across the router's `triggerScore + keyword` scorer under the `<=5` Tier-1 cap.
*   **NG3 — No Deletion of Deprecated Skill Paths**: Deprecated skills remain as redirect stubs for `.skills-install/manifest.json` and `evals.json` compatibility.
*   **NG4 — No Root Binary or `node_modules` Bloat**: Node CLIs (pinned `@enmera/ai-design-check@latest` or explicit workspace version, `Remotion`) run on demand via `pnpm dlx` in target projects; native GPU/GUI Motion Studio tools (`FFmpeg`, `Taichi`, `SPlisHSPlasH`, `Qwen3-TTS`, `RIFE`, `OpenToonz`, `OBS Studio`, `Audacity`, `Subtitle Edit`) are documented as optional local binary / MCP recipes in `references/`.

## Open Questions

Resolved during `/egm-review` + `/egm-resolve`: tier derivation in `buildManifest`, preservation of `sdd-orchestrator` legacy triggers, `Provider Contract 1.5` continuity, `12-matt-pocock` category inclusion, `Archetype F` flat-surface classification, `PROSE_COUNT_DOCS` completeness, and consolidation of all 7 skill walkers.

## Critical User Journeys (CUJs)

### CUJ 1: Spec-First Design & Adversarial Goldfish Review via EGM + ODD
*   **Given** an active repo with `skillsGV v3.3.0` and `~/.gemini/config/plugins/egm`, **when** running `/egm-brainstorm`, `/egm-draft`, `/egm-review`, and ODD tracking, **then** 7 Goldfish lenses critique the spec while preserving `[Beyond-Baseline: ...]` improvements, handing off approved tasks cleanly into `odd/tasks/<feature>.md`.

### CUJ 2: Zero-Token Pre-Read Screening via `prompt-shield`
*   **Given** an untrusted external file, third-party repo doc, or fetched skill, **when** invoked via `python 03-ai-ml/prompt-shield/scripts/safe_read.py <path>` (per `AGENTS.md` / `prompt-shield` pre-read workflow), **then** `safe_read.py` scans raw bytes/text in Python stdlib (`0` LLM tokens): clean inputs exit `0`; flagged `IPI100–IPI501` payloads exit `3` emitting **only non-echoing rule IDs, counts, and redacted offsets** (never streaming raw injection text into LLM context).

### CUJ 3: Archetype-Aware Anti-Slop UI Audit & 22-Repo Motion Studio
*   **Given** a frontend task in Archetypes `A, B, E, F, G` (flat/editorial/enterprise UI) or `C, D, H` (3D/WebGL/kinetic/lateral), **when** loading `design-driven`, `ai-design-check-stageshow`, `hallmark-design-study`, and `motion-video-pipeline`, **then** `A, B, E, F, G` enforce all 70 `@enmera/ai-design-check` rules + `Hallmark`'s 8-viewport check (`320px–1920px`), while `C, D, H` unlock 3D/shader/motion choreography under `[Beyond-Baseline: <visual rationale>]` (keeping WCAG contrast/focus/landmarks mandatory).

### CUJ 4: Lean Tier-1 Routing & Runtime Resource Optimization
*   **Given** a performance-sensitive or decision task, **when** `decision-gate` (`TIER0_SKILLS` summary in `tier0-context.md`, full `<80`-line `SKILL.md` when read), `app-resource-efficiency`, or `karpathy-ponytail-simplicity` runs, **then** verbose `references/*.md` load lazily only when needed, deprecated hits redirect in `<150` tokens, and changes enforce CPU/RAM/GPU/IO/LLM budgets with surgical diffs.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### 1. System Architecture & Data Flow

```text
+-----------------------------------------------------------------------------------+
|                        External Specification Harness (EGM)                       |
|  ~/.gemini/config/plugins/egm (Elephant Draft -> 7 Goldfish Critics -> Resolve)   |
+-----------------------------------------+-----------------------------------------+
                                          | Approved Spec / Handoff
                                          v
+-----------------------------------------------------------------------------------+
|                     skillsGV v3.3.0 Governance & Boot Kernel                      |
|  AGENTS.md (<6.5 KB, Contract 1.5, Gentle-AI 4.4.0) + tier0-context.md (9 core)   |
+-------------------+-------------------------------------------+-------------------+
                    | External File CLI Pre-Read                | --query Routing
                    v                                           v
+---------------------------------------+   +---------------------------------------+
|  03-ai-ml/prompt-shield               |   |  00-meta-skills/skill-router          |
|  scripts/safe_read.py (0 LLM tokens)  |   |  triggerScore + kwScore + overlap-mat |
|  Non-echoing Exit 3 Quarantine        |   |  251 Skills (00-..12- + allowlist)    |
+---------------------------------------+   +-------------------+-------------------+
                                                                |
                                                                v
+-----------------------------------------------------------------------------------+
|                   Tier 1 On-Demand Execution & Lazy references/                   |
|  251 Skills (36 core + 68 extended = 104 <= 105, 147 full) | 20 Redirect Stubs    |
+-----------------------------------------------------------------------------------+
```

### 2. Subsystem 1: Canonical Catalog Walker Consolidation (`251` Skills)

1.  **Single Source of Truth (`_shared/catalog-manifest.mjs`)**: Export `ROOT_SKILL_ALLOWLIST = new Set(["professional-planner"])`, `CATALOG_CATEGORY_RE = /^\d{2}-[a-z0-9-]+$/`, `samePath(a, b)` (Windows case-insensitive normalized `resolve`), and `walkSkillPaths(root, { isCatalogRoot } = {})`.
    *   Skip `EXCLUDED_DIRS` (`"gentle-ai-dsh"`, `"_shared"`, `"node_modules"`, `".git"`, `"Anti rats"`), any dot-directory (`entry.name.startsWith(".")`), and `"copia-de-seguridad*"`.
    *   When `isCatalogRoot ?? samePath(root, REPO_ROOT)` is `true` at depth `0`, descend **only** into directories matching `CATALOG_CATEGORY_RE` (`00-..12-`, including `12-matt-pocock`) or present in `ROOT_SKILL_ALLOWLIST`. Temp unit-test fixtures omit `isCatalogRoot` unless explicitly testing root allowlist behavior, and `walkSkillPaths("gentle-ai-dsh/skills")` continues to index flat mirror subdirs.
2.  **Migrate All 7 Skill Walkers + Integrity Test**: Reuse `walkSkillPaths` (joining `root` back with `join(dir, rel)` when callers read files!) across `_shared/catalog-manifest.mjs`, `validate-skills.mjs`, `catalog-doctor.mjs` (`walkSkillFiles` only; keep `walkCatalogFiles` indexing `.github`, `.atl`, `scripts/`, `docs/`, while updating `walkMarkdownFiles` to also skip dot-dirs/`"Anti rats"`/`copia-de-seguridad*`), `skill-router.mjs`, `skills-loader.mjs`, `install-skills.mjs` (`collectSkills` retaining category + tier filtering), `scripts/check-install-state.mjs` (`collectCatalogSkills`), and `test/catalog-integrity.test.mjs`.
3.  **Frontmatter `tier` Support in `buildManifest`**: Update `_shared/catalog-manifest.mjs` (`readSkillTier`) to inspect `metadata.tier` / top-level `tier` before falling back to `prev?.tier ?? (tier0.has(name) ? "core" : "full")`. Add `py` to `catalog-doctor.mjs` `REFERENCE_EXTENSIONS` (`line 326`) so `scripts/safe_read.py` references validate cleanly.

### 3. Subsystem 2: Deprecated Stub Compression (`-37,000 Tokens`) & Reference Extraction

1.  **20 Deprecated Stubs (`<150` Tokens Each)**: Compress the Markdown body of all 20 deprecated skills (`12 sdd-*`, `professional-planner`, `speckit-integration`, `expert-debugger`, `frontend-designer`, `electronjs`, `nextjs`, `state-management`, `tailwindcss`) to a concise redirect notice while **preserving** each skill's existing `metadata.trigger` (critical for `sdd-orchestrator/evals.json` `"sdd new"`/`"sdd continue"` routing), original `metadata.author`, non-downgraded single `metadata.version` (`"2.0.0"` on `professional-planner`), `delegate_only`, and `allows-script-exec` (`sdd-apply`, preserving sibling `scripts/`).
2.  **`decision-gate` (`207 -> <80` Lines)**: Move worked CLI matrix examples, `default_source` verbose table, and Engram conflict transcript (`L48–58, L71–78, L115–125, L181–204`) to `02-dev-roles/decision-gate/references/decision-examples.md`; keep `metadata.time_budget_sec: 180`, core 4-step rules, `scripts/resolve-default.mjs`, `references/default-resolution.md`, and `Integration` table (`../../` links stay in `SKILL.md` or adjust `../../../` if referenced in `references/`).
3.  **`brainstorming` (`259 -> <85` Lines)**: Move the Graphviz DOT `Process Flow` (`L112–163`), verbose `The Process` subsections (`L164–209`), and detailed `Visual Companion` essay (`L242–258`) + supplementary divergent/convergent checklists into `01-planning-process/brainstorming/references/ideation-frameworks.md`; preserve `allows-script-exec`, `visual-companion.md` link, `HARD-GATE`, `Three Paths`, `Red Flags`, concise `Checklist`, and `Transition to Downstream Pipeline`. State lazy-load policy: load `references/*.md` only when executing examples/templates.

### 4. Subsystem 3: Gentle-AI `4.4.0` Kernel, Governance & All 8 `PROSE_COUNT_DOCS`

*   Keep **`Provider Contract 1.5`** unchanged across `_shared/review-ledger-contract.md`, `AGENTS.md`, `harness-map.md`, `gentle-ai-review-4r`, `code-reviewer`, and `rdd-defect-workflow`.
*   Codify agent-operational Gentle-AI `4.4.0` updates (`Antigravity agy 1.4` native `jd-judge-a`/`jd-judge-b`/`jd-fix-agent` parity, model tiers `inherit`/`flash_lite`/`flash`/`pro`, `<24 KB` per owned rule file, EGM -> ODD handoff bridge, and concise pre-read note for `safe_read.py` on untrusted external files) without bloating `AGENTS.md` (`<6.5 KB`, zero bare `npm` tokens) with installer cache/registry trivia.
*   Update ALL 8 `PROSE_COUNT_DOCS` enforced by `validate-skills.mjs` (`SKILLS.md`, `AGENTS.md`, `README.md`, `00-meta-skills/harness-map.md`, `00-meta-skills/skill-loader/tier0-context.md`, `gentle-ai-dsh/AGENTS.md` [migrated from SDD/`14` Tier-0 to ODD/`9` Tier-0 parity + `251`], `gentle-ai-dsh/README.md`, `gentle-ai-dsh/ISSUES.md`), PLUS generator source `00-meta-skills/skill-router/SKILL.md` (`246 -> 251`, then run `skills-loader.mjs --emit-tier0 --force` to update `tier0-context.json` + `tier0-context.md`), PLUS `README.es.md`, PLUS `test/kernel-inject.test.mjs` lines 65 & 94 (`Gentle-AI 4.4.0`).

### 5. Subsystem 4 & 5: Five Cohesive Skills (`246 -> 251`) & Four Canonical Upgrades

*   **`03-ai-ml/prompt-shield` (`metadata.tier: "extended"`, `v1.0.0`)**: Fetch verified upstream files from `NastaFour/prompt-shield` (`SKILL.md`, `scripts/safe_read.py`, `references/detection-heuristics.md`, `assets/forensic-report-template.md`); normalize to `skillsGV` strict frontmatter (`description` with `Use when` + `Don't use for`, quoted semver `version`, `allowed-tools`, descriptive `allows-curl`/`allows-script-exec` if `auditScripts` flags regex patterns in `safe_read.py`), verify non-echoing exit-`3` quarantine diagnostics, and add clean + exit-`3` unit tests.
*   **`02-dev-roles/live-cve-security-intel` (`v1.0.0 -> v1.1.0`) & `02-dev-roles/security-audit` (`v2.0.0 -> v2.1.0`)**: Update `compatibility` to `Gentle-AI 4.4.0+`, add `bug-hunter` differential/race-condition triage, preserve `"defending code"`, and link `../../03-ai-ml/prompt-shield/SKILL.md`.
*   **`05-frontend/ai-design-check-stageshow` (`full`, `v1.0.0`)**: `@enmera/ai-design-check` (70 rules, `pnpm dlx @enmera/ai-design-check`) + `Stageshow` (`look -> story -> example -> film -> fixes`), strictly partitioned by Archetypes `A–H` (`A, B, E, F, G` flat-surface; `C, D, H` visual `[Beyond-Baseline: ...]` waivers; contrast/focus/landmarks non-waivable).
*   **`05-frontend/hallmark-design-study` (`v1.0.0 -> v1.1.0`)**: Place 50-style taxonomy & 755 free-licensed photo curation guide (with offline/broken-URL fallback) under `references/hallmark-catalog.md` so `SKILL.md` stays crisp (`<180` lines), covering 3-direction style proposals, 8-viewport Playwright/browser check (`320px–1920px`), blind zero-context critic review, and anti-AI cliché rules (`Gentle-AI 4.4.0+`).
*   **`11-mcp-hybrid/motion-video-pipeline` (`v1.0.0 -> v1.1.0`)**: Keep `SKILL.md` concise (`<150` lines) defining the 6-stage `Idea -> storyboard -> build -> animate -> mix -> export` orchestrator and move all 22 verified Motion Studio repo tables (`01 Remotion` through `22 FFmpeg`, clearly separating `pnpm dlx` JS packages from optional local binary/Python/GPU/GUI tools) into `references/motion-studio-22.md`.
*   **`05-frontend/web-animation-sources` (`v1.0.0 -> v1.1.0`)**: Update `"10 referencias"` prose in `SKILL.md` and `references/animation-sources.md`; add structured table rows for all 2026 UI/3D/scroll/component galleries (`scrolltide.co` through `enesozturk/dimensional-drawing`, avoiding duplicating existing `reactbits.dev`).
*   **`06-code-quality/app-resource-efficiency` (`metadata.tier: "extended"`, `v1.0.0`)**: Concrete runtime profiling/leak probes & budgets across RAM streaming/backpressure, CPU worker offload, I/O/DB N+1 & cursor pagination, GPU/WebGL `.dispose()` + `<16.6ms` frame budget (cross-referencing `05-frontend/three-js-web` & `motion-accessibility`), and AI latency/batching (cross-referencing `03-ai-ml/api-ai-billing` for pricing/caching).
*   **`06-code-quality/karpathy-ponytail-simplicity` (`full`, `v1.0.0`)**: Karpathy's 4 Coding Rules + Ponytail veteran simplicity + Caveman token-lean output + Addy Osmani pragmatic quality, cross-referencing `06-code-quality/solid-clean-code`.
*   **`01-planning-process/egm-spec-review` (`full`, `v1.0.0`)**: Bridges external EGM (`~/.gemini/config/plugins/egm`), `Graphify-Labs/graphify` (optional external/multi-repo knowledge graphs; defers local repo mapping to `00-meta-skills/codegraph-intelligence`), and `msitarzewski/agency-agents` lenses -> `odd-workflow`.

### 6. Subsystem 6: Router Disambiguation & 4-Way Catalog Sync

1.  **`00-meta-skills/skill-router/references/overlap-matrix.json` & `routing-corpus.jsonl`**:
    *   Extend `"security-defense-suite"` (`canonical: "security-audit"`) with `"prompt-shield"`.
    *   Extend `"anti-slop-frontend"` (`canonical: "design-driven"`) with `"ai-design-check-stageshow"`.
    *   Add `"resource-efficiency-optimization"` (`canonical: "app-resource-efficiency"`, `members: ["app-resource-efficiency", "performance-refactor"]`).
    *   Add `"simplicity-clean-code"` (`canonical: "solid-clean-code"`, `members: ["solid-clean-code", "karpathy-ponytail-simplicity"]`).
    *   Add unitary `"spec-review-egm"` (`canonical: "egm-spec-review"`, `members: ["egm-spec-review"]`) with explicit `group` corpus cases so `node 00-meta-skills/skill-router/scripts/router-replay.mjs --consistency` passes 100%, keeping Tier-0 `odd-workflow` cleanly out of `tier1toLoad`. Note `UNAMBIGUOUS_UI_MARKERS` vs `motion-video-pipeline`: ensure `motion-video-pipeline` prompts route cleanly to `motion-video-pipeline` as primary.
2.  **Qualified Sync Commands**:
    *   `node 00-meta-skills/skill-registry/scripts/generate-indexes.mjs --write`
    *   `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-tier0 --force`
    *   `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry`
    *   `node scripts/sync-addon.mjs --write`

## Alternatives Considered

*   **Alternative A (40+ Single-Repo Skills vs 5 Cohesive Skills)**: Adding 40+ micro-skills creates trigger tie-storms in `skill-router.mjs`'s exact-trigger + keyword scorer (`<=5` Tier-1 cap) and overflows `core + extended <= 105`. Consolidating into 5 cohesive skills preserves every capability at `251` skills.
*   **Alternative B (Vendor EGM Inside `00-meta-skills/` vs External Plugin)**: Vendoring 10 subagents + 7 EGM skills violates `validate-skills.mjs --strict` schemas and duplicates external maintenance. Keeping `~/.gemini/config/plugins/egm` external plus `01-planning-process/egm-spec-review` avoids schema drift.
*   **Alternative C (Centralized `walkSkillPaths` vs Per-Script Local Walkers)**: Patching 4 of 8 walkers individually left `skill-router`, `skills-loader`, `install-skills`, and `check-install-state` exposed to `Anti rats/` inflation. Centralizing in `_shared/catalog-manifest.mjs` eliminates 6+ copies.
*   **Alternative D (Retain `decision-gate` in `TIER0_SKILLS` vs Demote to Tier-1)**: Demoting `decision-gate` changes `TIER0_SKILLS` (`9 -> 8`) and `CANONICAL_TIER0` contract across `test/kernel-inject.test.mjs`; keeping it in `TIER0_SKILLS` while shrinking full `SKILL.md` read payload via `references/` captures Tier-1 load savings without breaking Tier-0 parity.

## Risks & Limits

*   **Pre-Read Boundary on `prompt-shield`**: `safe_read.py` protects inputs read through its CLI/workflow; native agent `read_file` does not auto-execute Python hooks unless explicitly invoked per `AGENTS.md` / `prompt-shield` guidance. Mitigation: document mandatory `safe_read.py` pre-read step for untrusted external files and verify non-echoing exit `3` diagnostics.
*   **`core + extended` Tier Headroom (`104 / 105`)**: Setting `prompt-shield` and `app-resource-efficiency` to `extended` leaves `1` slot before `test/catalog-integrity.test.mjs` (`80..105`). Future `extended` additions must revisit that test bound.
*   **External Tool & Network Volatility**: `@enmera/ai-design-check`, `Graphify`, `agency-agents`, and 755 curated photography links rely on external ecosystems/CDNs. Mitigation: mark optional tools with explicit workspace/local fallbacks and offline tolerance in `hallmark-design-study/references/`.
*   **Cross-Platform Python Invocation**: Windows environments may expose `python` or `py -3` rather than `python3`. Document `python`/`python3` resolution in `prompt-shield/SKILL.md`.

### Additional Resources

*   [`concepts_brief.md`](../../concepts_brief.md) · [`consolidated_review_report.md`](../../consolidated_review_report.md) · [`odd/tasks/skills-v3.3-egm-gentle440-design-motion.md`](../../odd/tasks/skills-v3.3-egm-gentle440-design-motion.md) · [`AGENTS.md`](../../AGENTS.md) · [`SKILLS.md`](../../SKILLS.md)

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files & Work Units (`T1` Done; `T2`–`T6` Ready)

#### Group 1: Walker Consolidation & Tier Manifest Support (`T2`)
1.  `./_shared/catalog-manifest.mjs` (**Modify**) — Export `ROOT_SKILL_ALLOWLIST = new Set(["professional-planner"])`, `CATALOG_CATEGORY_RE = /^\d{2}-[a-z0-9-]+$/`, `samePath`, skip dot-dirs/`"Anti rats"`/`copia-de-seguridad*`, apply root category+allowlist check on `isCatalogRoot`, and update `buildManifest` (`readSkillTier`) to honor `metadata.tier`/`tier` from `SKILL.md`.
2.  `./00-meta-skills/skill-validator/scripts/validate-skills.mjs`, `./00-meta-skills/skill-router/scripts/skill-router.mjs`, `./00-meta-skills/skill-loader/scripts/skills-loader.mjs`, `./00-meta-skills/skill-sync/scripts/install-skills.mjs`, `./scripts/check-install-state.mjs` (**Modify**) — Reuse canonical `walkSkillPaths(root, { isCatalogRoot })` (joining `root` back; preserving `install-skills.mjs` category/tier filters).
3.  `./00-meta-skills/catalog-doctor/scripts/catalog-doctor.mjs` (**Modify**) — Migrate `walkSkillFiles` to canonical root-aware filter, keep `walkCatalogFiles` preserving `CATALOG_OWNED_DOTDIRS` (`.github`, `.atl`) and repo `scripts/`/`docs/`, harden `walkMarkdownFiles` against dot-dirs/`"Anti rats"`/`copia-de-seguridad*`, and add `py` to `REFERENCE_EXTENSIONS`.
4.  `./test/catalog-integrity.test.mjs` (**Modify**) — Reuse `walkSkillPaths` (joining base dir so `walkSkills('.')` and `walkSkills('gentle-ai-dsh/skills')` succeed) + add unit tests for `{ isCatalogRoot: true }` allowlisted `professional-planner`, non-allowlisted root exclusion, Windows case-insensitive `samePath`, and `.agents/skills/x/SKILL.md` exclusion.

#### Group 2: Gentle-AI `4.4.0` Kernel & Governance Alignment (`T2`)
5.  `./AGENTS.md`, `./README.md`, `./README.es.md`, `./_shared/bootstrap-kernel-full.md`, `./_shared/bootstrap-kernel-minimal.md`, `./_shared/review-ledger-contract.md` (**Modify**) — Upgrade `4.3.1 -> 4.4.0`, preserve `Provider Contract 1.5`, add concise `agy 1.4` / `jd-*` / `<24 KB` / EGM bridge / pre-read `safe_read.py` rule without CLI installer bloat (`AGENTS.md < 6.5 KB`), update `246 -> 251` where present (`README.md`, `README.es.md`).
6.  `./00-meta-skills/odd-workflow/SKILL.md`, `./00-meta-skills/gentle-orchestrator/SKILL.md`, `./02-dev-roles/gentle-ai-review-4r/SKILL.md`, `./02-dev-roles/code-reviewer/SKILL.md`, `./02-dev-roles/rdd-defect-workflow/SKILL.md`, `./00-meta-skills/harness-map.md`, `./00-meta-skills/skill-router/SKILL.md` (**Modify**) — Update `4.3.1 -> 4.4.0`, keep `Provider Contract 1.5`, update `246 -> 251` in `harness-map.md` and `skill-router/SKILL.md`, cross-reference `app-resource-efficiency` & `karpathy-ponytail-simplicity` in `code-reviewer/SKILL.md`.
7.  `./test/kernel-inject.test.mjs` (**Modify**) — Update lines 65 and 94 `"Gentle-AI 4.3.1" -> "Gentle-AI 4.4.0"`.

#### Group 3: Deprecated Stubs (`-37k` Tokens) & Reference Extraction (`T2`)
8.  20 Deprecated `SKILL.md` files (`00-meta-skills/sdd-{apply,archive,design,explore,init,onboard,orchestrator,propose,research,spec,tasks,verify}`, `01-planning-process/speckit-integration`, `professional-planner`, `02-dev-roles/{expert-debugger,frontend-designer}`, `05-frontend/{electronjs,nextjs,state-management,tailwindcss}`) (**Modify**) — Compress body to `<150-token` redirect stub while preserving existing `metadata.trigger` (critical for `sdd-orchestrator/evals.json`), `metadata.author`, non-downgraded `metadata.version`, `delegate_only`, and `allows-script-exec` (`sdd-apply`).
9.  `./02-dev-roles/decision-gate/SKILL.md` (**Modify**) + `./02-dev-roles/decision-gate/references/decision-examples.md` (**Create**) — Compress `207 -> <80` lines; extract verbose matrix/Engram/CLI output tables cleanly keeping `metadata.time_budget_sec: 180` & `references/default-resolution.md` (and `../../../` relative link depth if moved).
10. `./01-planning-process/brainstorming/SKILL.md` (**Modify**) + `./01-planning-process/brainstorming/references/ideation-frameworks.md` (**Create**) — Compress `259 -> <85` lines; extract Graphviz DOT flow, extended `The Process` subsections, `Visual Companion` essay, and ideation frameworks cleanly keeping `allows-script-exec`, `visual-companion.md` link, `HARD-GATE`, `Three Paths`, `Red Flags`, `Checklist`, and `Transition`.

#### Group 4: Anti-Slop Frontend, Hallmark & 22-Repo Motion Studio (`T3`)
11. `./05-frontend/ai-design-check-stageshow/SKILL.md` (**Create**, `full`, `v1.0.0`) — Pinned `@enmera/ai-design-check` (70 rules) + `Stageshow` workflow partitioned across `A, B, E, F, G` (flat-surface) vs `C, D, H` (`[Beyond-Baseline: ...]`, WCAG contrast/focus non-waivable).
12. `./05-frontend/hallmark-design-study/SKILL.md` (**Modify**, `v1.0.0 -> v1.1.0`) + `./05-frontend/hallmark-design-study/references/hallmark-catalog.md` (**Create**) — 50 styles (3 directions/site), 755 curated free-licensed photo guide + offline fallback, 8-viewport check (`320px–1920px`), blind critic review, `Gentle-AI 4.4.0+`.
13. `./11-mcp-hybrid/motion-video-pipeline/SKILL.md` (**Modify**, `v1.0.0 -> v1.1.0`) + `./11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md` (**Create**) — Keep `SKILL.md` `<150` lines; move all 22 verified Motion Studio repo tables into `references/motion-studio-22.md` (`Animation · Physics · 3D · Render · Delivery`).
14. `./05-frontend/web-animation-sources/SKILL.md` & `./05-frontend/web-animation-sources/references/animation-sources.md` (**Modify**, `v1.0.0 -> v1.1.0`) — Update `"10 referencias"` prose and add all 2026 galleries.

#### Group 5: `prompt-shield` & AppSec Enrichment (`T4` — Isolated Security Commit)
15. `./03-ai-ml/prompt-shield/{SKILL.md,scripts/safe_read.py,references/detection-heuristics.md,assets/forensic-report-template.md}` (**Create**, `metadata.tier: "extended"`, `v1.0.0`) + `./test/prompt-shield.test.mjs` (**Create**) — Install `NastaFour/prompt-shield`, verify non-echoing exit-`3` diagnostics, pass strict frontmatter checks (`description` exclusion, `allowed-tools`, descriptive `allows-*`), add exit-`0` / exit-`3` / missing-file tests.
16. `./02-dev-roles/live-cve-security-intel/SKILL.md` (`v1.0.0 -> v1.1.0`) & `./02-dev-roles/security-audit/SKILL.md` (`v2.0.0 -> v2.1.0`) (**Modify**) — Add `bug-hunter` differential triage, retain `"defending code"`, link `../../03-ai-ml/prompt-shield/SKILL.md`, update `Gentle-AI 4.4.0+`.

#### Group 6: Efficiency, Simplicity & EGM Spec Review (`T5`)
17. `./06-code-quality/app-resource-efficiency/SKILL.md` (**Create**, `metadata.tier: "extended"`, `v1.0.0`) — Runtime RAM/CPU/I/O/DB N+1/leak probes (`--heap-prof`, worker offload, pagination), cross-referencing `three-js-web`, `motion-accessibility`, and `api-ai-billing`.
18. `./06-code-quality/karpathy-ponytail-simplicity/SKILL.md` (**Create**, `full`, `v1.0.0`) — Karpathy 4 rules + Ponytail + Caveman + Addy Osmani, cross-referencing `solid-clean-code`.
19. `./01-planning-process/egm-spec-review/SKILL.md` (**Create**, `full`, `v1.0.0`) — EGM (`Elephant-Goldfish`) + `Graphify` (external/doc graphs, deferring local code to `codegraph-intelligence`) + `agency-agents` -> `odd-workflow`.

#### Group 7: Router Disambiguation, 4-Way Catalog Sync & Verification (`T6`)
20. `./00-meta-skills/skill-router/references/overlap-matrix.json` & `./00-meta-skills/skill-router/references/routing-corpus.jsonl` (**Modify**) — Extend `security-defense-suite` & `anti-slop-frontend`; add `resource-efficiency-optimization`, `simplicity-clean-code`, and `spec-review-egm` with exact `group` corpus cases.
21. `./package.json` (`3.3.0`), `./catalog.json`, `./SKILLS.md`, `./.atl/skill-registry.md`, `./00-meta-skills/skill-loader/tier0-context.{json,md}`, `./gentle-ai-dsh/AGENTS.md`, `./gentle-ai-dsh/README.md`, `./gentle-ai-dsh/ISSUES.md`, generated `./gentle-ai-dsh/skills/**` & `./gentle-ai-dsh/_shared/**`, and `./odd/tasks/skills-v3.3-egm-gentle440-design-motion.md` (**Modify**).

### Verification Plan

*   **Per Work-Unit Gate (`T3`–`T5`)**: `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs <skill-dir> --strict` (single-skill strict gate before global index rebuild in `T6`).
*   **4-Way Sync & Parity (`T6`)**: `node 00-meta-skills/skill-registry/scripts/generate-indexes.mjs --write`, `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-tier0 --force`, `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry`, `pnpm build:addon`, `node scripts/sync-addon.mjs --check`.
*   **Full Catalog Gates (`T6`)**: `pnpm validate:strict` (`251/251`), `node 00-meta-skills/skill-router/scripts/router-replay.mjs --consistency` (`100%`), `pnpm doctor` (`7/7`), `python 03-ai-ml/prompt-shield/scripts/safe_read.py 03-ai-ml/prompt-shield/SKILL.md` (`exit 0`), `pnpm test`, `pnpm test:addon`, `pnpm benchmark`.

--------------------------------------------------------------------------------

*Approved after 5-Goldfish EGM Review*
