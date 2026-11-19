# skillsGV

[![CI](https://github.com/NastaFour/skillsGV/actions/workflows/ci.yml/badge.svg)](https://github.com/NastaFour/skillsGV/actions)
[![Version](https://img.shields.io/badge/version-3.5.0-blue.svg)](package.json)
[![Specification](https://img.shields.io/badge/spec-agentskills.io-success.svg)](https://agentskills.io/specification)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Package Manager](https://img.shields.io/badge/package%20manager-pnpm%20only-orange.svg)](#package-manager-rules)
[![Skills Count](https://img.shields.io/badge/skills-251-purple.svg)](#categories)
[![Process](https://img.shields.io/badge/process-ODD%20(Gentle--AI%204.6.0)-brightgreen.svg)](#organic-driven-development)

> **Portable multi-agent skill catalog and process harness** for AI coding assistants. Brings [Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai) 4.6.0 Organic-Driven Development (ODD, Provider Contract `1.6.0`), NVIDIA `SkillSpector`/`SkillEvaluator` gates, Cloudflare 6-phase AppSec auditing, a **3-Phase Frontend Engine + unified `verify-frontend-gates.mjs` runner**, dual-judge adversarial review (Judgment Day), persistent memory (Engram), and deterministic keyword routing to **ANY** agent — whether running on cheap flash models or flagship reasoning models.
>
> 🌐 *Para documentación en Español, ver [`README.es.md`](README.es.md).*

---

## 🌟 Why skillsGV?

Most AI coding setups suffer from two extremes:
1. **Monolithic prompt bloat**: stuffing hundreds of rules into `AGENTS.md` or system prompts, burning 15k+ tokens per turn and degrading reasoning on flash models.
2. **Fragmented, undisciplined agents**: agents write uncontrolled code without tests, forget past architectural decisions across sessions, and produce generic "AI-slop" designs.

**skillsGV solves this with a structured, layered harness:**

- 🎯 **251 skills** complying with [agentskills.io](https://agentskills.io/specification), scored `0–100` under **NVIDIA `SkillEvaluator` Tier-1 Quality Score (`--quality-score >= 70`)** and verified across **7 harnesses** (`--harness-check`).
- ⚡ **Two-Tier Progressive Disclosure**: Tier 0 baseline (~2K tokens) + Tier 1 loaded strictly on-demand via deterministic keyword routing (`skill-router`).
- 🔄 **ODD-Exclusive Workflow (Gentle-AI 4.6.0) + Auto-EGM Plan Gate**: Authorize → Explore (CodeGraph first) → Keep authorized work moving (tool-backed human decisions) → Classify → **Auto-EGM Plan Review** ([`egm-spec-review`](01-planning-process/egm-spec-review/SKILL.md): 3 Goldfishes default, 5 critical; 0 overhead on Small) → `odd/tasks/<feature>.md` + parent-adjudicated `## Allowed edit surfaces` (no `## Key Learnings` bloat) → 3-tier verification (`_shared/verify-method.md` in `mktemp -d` + differential check + orchestrator-owned next step when corrections exhaust) → Selective install (`--skills <list>`) & always-on kernel triggers → Close with `Risk: item N (reason)` or `Risk: none`.
- ⚖️ **Adversarial Verification (Judgment Day)**: Two blind, independent LLM judges review substantive diffs before declaring completion.
- 🛡️ **Defensive Security, Cloudflare 6-Phase Audit, NVIDIA `SkillSpector` & `prompt-shield`**: Static skill/MCP checks (`TT1–6`, `LP1–4`, `TP1–4`, `RP1–3`, `SC8`, `SC10`), Cloudflare Coverage Ledger & `confirmed` 6-tuple certainty contract (`security-audit`), `prompt-shield` (`safe_read.py`), live OSV.dev CVEs (`live-cve-security-intel`), and runtime `ai-safety-agent-guard`.
- 🏗️ **250-Point Production Engineering & Distributed SRE**: Complete readiness checklist (`production-readiness-250`) and fault-tolerant distributed resilience (`distributed-resilience-sre`) covering monetary math (no floats for money), UTC/IANA timezones, idempotency keys, outbox/DLQ patterns, circuit breakers, and graceful `SIGTERM` shutdowns.
- 🎨 **10x Anti-Slop Design Governance, Typography & Motion Studio**: Unites `impeccable`, `taste-skill` (+ UIZZE `UI_CONTRACT`), `design-driven` (D1b + Think Outside the Box), **Hallmark v2.0** (21 macrostructures, SaaS Section Deck, `P-H-E-S-R-V`), **Hue** Hero Stage physics, **Google Stitch** `extract-design-md`, **UI UX Pro Max v2** (192 palettes, WCAG 2.2 `ime-composition-enter`, DTCG, RTL), **Interface Design** (Anti-Reinvention + `design-deslop`), **Emil Kowalski** (`mobile-native` 11 fixes, `break-ui`, `@starting-style`), **Jakub Krehel** 19 polish rules, **StageShow v1.1.1**, **Official `shadcn/ui` 2026**, **Better Typography** zero-CLS `@font-face`, and 22-repo Motion Studio.
- ⚡ **Token Efficiency & Simplicity Discipline**: `~41,500` tokens compressed across the catalog without losing behavior, plus `karpathy-ponytail-simplicity` (minimal assumptions, surgical diffs) and `app-resource-efficiency` (lifecycle, battery, and memory budgets).
- 🌟 **Floor, Not Ceiling Architecture**: Hard invariants prevent regressions and security vulnerabilities, while explicitly empowering models to propose superior modern patterns (`[Beyond-Baseline]`).
- 🧠 **Cross-Session Memory**: Seamless MCP integration with [Engram](https://github.com/Gentleman-Programming/engram) (`mem_save`, `mem_search`, `mem_judge`).
- 🤖 **Universal Agent Portability**: One install script works with Claude Code, Gemini CLI, Cursor, Antigravity, OpenCode, Codex, GitHub Copilot, Windsurf, Kiro, and DeepSeek.

---

## 🚀 Quick Start

### 1. One-Command Install (Recommended)

Install using your preferred agent's native ecosystem:

```bash
# Via Skills CLI (Vercel Labs / skills.sh)
pnpm dlx skills add NastaFour/skillsGV

# In Claude Code / OpenCode / Cursor and other agents: use the manual
# clone & install below. Plugin-marketplace and `gemini extensions`
# commands are NOT available; do not rely on them.
```

### 2. Manual Clone & Install

```bash
# Clone the repository
git clone https://github.com/NastaFour/skillsGV.git
cd skillsGV

# Preview what will be installed across detected tools
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --dry-run

# Install globally for all detected agents
node 00-meta-skills/skill-sync/scripts/install-skills.mjs
```

*Requirements: Node.js 20+ (Pure Node.js `.mjs` scripts — Windows-first, zero native bash dependencies).*

### 3. One-Liner for Any Autonomous Agent

Give this instruction to any AI coding assistant inside your target repository:

```text
Clone https://github.com/NastaFour/skillsGV and run `node install.mjs --target .` — follow its AGENTS.md.
```

In project-level installs, the installer **activates the always-on kernel**:
- Injects `skillsGV:kernel` into the files your harness automatically loads (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, or `.github/copilot-instructions.md`).
- Updates `.gitignore` to prevent installed skill folders from ever being committed to your source code repository.
- Generates `.skills-install/manifest.json` for deterministic `--rollback` and `--uninstall`.

---

## 🔄 How It Works: The Layered Architecture

```mermaid
flowchart TD
    User["User Request"] --> Kernel["Always-on Kernel (AGENTS.md / GEMINI.md)"]
    Kernel --> Router["Deterministic Router (skill-router.mjs)"]
    Router -->|Picks ≤5 skills| Loader["Tier 1 On-Demand Loader"]
    Loader --> ODD["Organic-Driven Development (ODD)"]
    ODD --> Authorize["1. Authorize (Read-only guard)"]
    Authorize --> Explore["2. Explore & Classify"]
    Explore --> FeatureDoc["3. odd/tasks/<feature>.md + Engram Mirror"]
    FeatureDoc --> Implement["4. Task-by-task with TDD & Evidence"]
    Implement --> Commit["5. Work-Unit Conventional Commit"]
    Commit --> Review["6. Verification Gate / Judgment Day"]
    Review --> Done["Verified Completion"]
```

### Feature Comparison

| Capability | Raw Prompting | Generic Skills Repos | skillsGV |
|---|:---:|:---:|:---:|
| **Standardized Skills** | ❌ | ✅ | ✅ (agentskills.io) |
| **Progressive Disclosure** | ❌ | ⚠️ (Manual) | ✅ (Tier 0/1 deterministic routing) |
| **Organic Process (ODD)** | ❌ | ❌ | ✅ (Gentle-AI 4.6.0 alignment) |
| **Dual-Judge Review** | ❌ | ❌ | ✅ (`judgment-day`) |
| **Persistent Memory** | ❌ | ❌ | ✅ (Engram MCP) |
| **Anti-Slop Design System** | ❌ | ❌ | ✅ (3-Phase Engine + `verify-frontend-gates.mjs`) |
| **Multi-Agent Roster Switcher** | ❌ | ❌ | ✅ (21 agents across strong/mid/cheap) |
| **Automated Validator** | ❌ | ❌ | ✅ (`validate-skills.mjs --strict`) |

### 📊 Benchmark: With vs Without skillsGV Harness

Offline deterministic benchmark over the core skill suites that ship `evals.json` — `skill-router` routing evals plus expectation checks. The "Without skillsGV" column is a fixed historical reference, never a re-measured arm; every "With skillsGV" figure is computed at runtime by `pnpm benchmark`.

| Metric | Without skillsGV (Historical Baseline) | With skillsGV (Harness) | Measured Delta |
|---|---|---|---|
| **Always-On Context Cost** | ~6,167 tokens (historical monolithic kernel, fixed reference) | current `AGENTS.md` size, measured by `pnpm benchmark` | token reduction computed at runtime |
| **Skill Routing Determinism** | ad-hoc prompt guesswork (not measured) | deterministic `skill-router` evals, results measured by `pnpm benchmark` | routing precision computed at runtime |
| **Evaluated Core Skills** | no offline evals | the core suites shipping `evals.json`, counted at runtime | suite count computed at runtime |
| **Quality & Invariant Checks** | not run | offline expectation checks, pass rate measured by `pnpm benchmark` | pass rate computed at runtime |

Run the benchmark locally:
```bash
pnpm benchmark
```

#### ⚖️ Live A/B Trial: Bare Agent vs Skill Treatment (Measured)

Double-blind randomized A/B trial run across core engineering skills with Gemini Flash on trap-driven engineering benchmarks:

| Arm | Win Rate | Quality Score (1-5) | Protocol & Standards Compliance |
|---|---|---|---|
| **Bare Agent (Control)** | 0% (0/5) | 2.46 | Fell for traps: AI attribution trailers, unapproved runner leaks, no severity taxonomy, premature code generation |
| **With skillsGV (Treatment)** | **100%** (5/5) | **4.72** (+2.26 lift) | Absolute bans respected: pure atomic Conventional Commits, AAA testing with pnpm, 4R review taxonomy, ODD tracking first, Clean Architecture boundaries |
| **Ties** | 0% (0/5) | - | Disambiguated by strict negative constraints |

*Evaluated across 5 trap-driven tasks under double-blind randomized assignment. Run artifact: `evals/results/ab-*.json`.*
View the measured trial summary:
```bash
node scripts/run-evals.mjs --ab-summary
```

---

## 🛠️ CLI Flags & Advanced Installation

The primary installer is `00-meta-skills/skill-sync/scripts/install-skills.mjs`.

| Flag | Description |
|---|---|
| `--target <path>` | Install into a specific project. Omit to install globally across detected tools. |
| `--tool <id>` | Target specific tools: `claude-code`, `opencode`, `cursor`, `copilot`, `codex`, `gemini-cli`, `antigravity`, `kiro`, `windsurf`, `deepseek`, `dsh`. |
| `--all-tools` | Install for all known tools without automatic detection. |
| `--only <list>` | Install specific categories only (e.g. `--only "04-backend,05-frontend"`). |
| `--symlink` | Use directory junctions/symlinks instead of copying (single source of truth). |
| `--dry-run` | Preview actions without touching the filesystem. |
| `--uninstall` | Safely remove catalog files and clean kernel injections using manifest. |
| `--rollback` | Roll back the most recent install generation. |
| `--no-kernel` | Skip kernel injection and `.gitignore` updates. |

### Examples

```bash
# Specific project, targeting Claude Code and Cursor only
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --target "C:\projects\my-app" --tool claude-code --tool cursor

# Only frontend and backend skills via symlinks
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --only "04-backend,05-frontend" --symlink

# Roll back changes if an installation fails
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --rollback
```

---

## 📂 Categories

The catalog contains **251 skills** distributed across structured domains:

| Category | Path | Key Skills & Focus |
|---|---|---|
| **Meta-Skills** | `00-meta-skills/` | `skill-router`, `skill-validator`, `skill-loader`, `skill-creator`, `agent-roster`, `odd-workflow` |
| **Planning & Process** | `01-planning-process/` | `idea-to-prd-express`, `app-flow-spec`, `engram-integration`, `brainstorming`, `tech-escalation-adr`, `egm-spec-review` |
| **Dev Roles** | `02-dev-roles/` | `architecture-designer`, `code-reviewer`, `systematic-debugging`, `judgment-day`, `security-audit`, `live-cve-security-intel`, `dod-checker` |
| **AI & MLOps** | `03-ai-ml/` | `ai-orchestration`, `ai-sdk-5`, `llm-integration`, `rag-knowledge-systems`, `multimodal-ai-pipelines`, `ai-safety-agent-guard`, `prompt-shield`, `prompt-engineering` |
| **Backend** | `04-backend/` | `nodejs`, `expressjs`, `prisma-orm`, `postgresql`, `distributed-resilience-sre`, `socketio`, `django-drf`, `spring-boot-3`, `java-21` |
| **Frontend** | `05-frontend/` | `react-19`, `nextjs-15`, `design-driven`, `hallmark-design-study`, `ai-design-check-stageshow`, `scroll-world-storytelling`, `frontend-slides-deck`, `tailwind-4`, `impeccable`, `taste-skill` |
| **Code Quality** | `06-code-quality/` | `production-readiness-250`, `typescript`, `solid-clean-code`, `karpathy-ponytail-simplicity`, `app-resource-efficiency`, `pnpm-workspaces`, `biome`, `turborepo`, `work-unit-commits` |
| **Testing** | `07-testing/` | `testing-patterns` (TDD RED/GREEN), `playwright`, `pytest`, `go-testing` |
| **DevOps** | `08-devops/` | `ci-cd`, `observability`, `monitoring`, `kill-switches`, `store-deployment-eas` |
| **Media & Graphics** | `09-media-graphics/` | `nano-banana`, `banana-claude` |
| **MCP Hybrids** | `11-mcp-hybrid/` | `component-scrapper-mcp`, `figma-mcp`, `motion-video-pipeline`, `oklch-theme-injector`, `open-design`, `openseo` |
| **Matt Pocock Suite** | `12-matt-pocock/` | `ask-matt`, `domain-modeling`, `grilling`, `scaffold-exercises`, `tdd`, `writing-for-agents` |

---

## 🤖 Agent Roster & Multi-Model Switching

Manage model assignments across all **21 agents** in the ecosystem (`strong`, `mid`, `cheap` tiers) with zero vendor lock-in:

```powershell
# Preview provider changes without applying
node 00-meta-skills/agent-roster/scripts/set-models.mjs --profile glm --dry-run

# Switch all 21 agents to GLM profile
node 00-meta-skills/agent-roster/scripts/set-models.mjs --profile glm --apply

# Set individual tiers dynamically
node 00-meta-skills/agent-roster/scripts/set-models.mjs --strong opencode-go/glm-5.3 --apply
node 00-meta-skills/agent-roster/scripts/set-models.mjs --mid opencode-go/glm-5.2 --apply
node 00-meta-skills/agent-roster/scripts/set-models.mjs --cheap opencode-go/glm-5.2 --apply
```

---

## 🔒 Package Manager Rules

> ⚠️ **pnpm only — `npm` and `npx` are rejected.**
>
> All scripts and commands require `pnpm` (and `pnpm dlx` in place of `npx`). The strict mechanical validator fails if `npm` or `npx` appears in skill instructions unless justified via `allows-npm: <reason>` in frontmatter.

---

## 🧪 Testing & Validation

Run the complete offline test and validation suite:

```bash
# Run all unit tests (112+ tests)
pnpm test

# Strict mechanical specification validation (0 errors, 0 warnings required)
pnpm validate:strict

# Catalog health check
pnpm doctor

# Benchmark / telemetry status
node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --status
```

---

## 📜 Credits & Attributions

This repository synthesizes, adapts, and organizes open-source standards and methodologies from exceptional engineers across the tech community:

- **[Gentleman Programming](https://github.com/Gentleman-Programming)**: ODD process harness, Engram persistent memory, Judgment Day protocol, 21-agent roster, GGA pre-commit verification.
- **[Anthropic](https://github.com/anthropics/skills)**: Core Agent Skills patterns, directory structure, and foundational prompts.
- **[Vercel Labs](https://github.com/vercel-labs/agent-skills)**: React/Next.js composition and performance patterns.
- **[Matt Pocock](https://github.com/mattpocock)**: The 23 engineering skills in `12-matt-pocock/`.
- **[Paul Bakaus](https://github.com/pbakaus/impeccable)**: Impeccable design system governance (Apache-2.0).
- **[Leonxlnx](https://github.com/Leonxlnx/taste-skill)**: Taste-skill anti-slop aesthetic dial system (MIT).
- **[Corey Haines](https://coreyhaines.com/)**: CRO and conversion funnels.
- **[Adam Wathan & Steve Schoger](https://www.refactoringui.com/)**: Refactoring UI visual design rules.
- **[Emil Kowalski](https://animations.dev/)**: Physics-based animations and fluid micro-interactions.
- **[Donald Miller](https://storybrand.com/)**: StoryBrand SB7 narrative architecture.
- **[Jesse Vincent](https://github.com/obra/superpowers)**: Superpowers agent capabilities concepts.
- **[Google (`elephant-goldfish-model`)](https://github.com/google/elephant-goldfish-model)**: Zero-context Goldfish adversarial plan review integrated into [`egm-spec-review`](01-planning-process/egm-spec-review/SKILL.md) and the Auto-EGM Plan Gate.
- **[NastaFour (`prompt-shield`)](https://github.com/NastaFour/prompt-shield)**: Indirect prompt-injection scanner and `safe_read.py` wrapper integrated into `ai-safety-agent-guard` (Apache-2.0).
- **[Together AI (`Hallmark`)](https://github.com/togethercomputer) / `@enmera/ai-design-check` / [Benji Taylor (`Stageshow`)](https://github.com/benjitaylor/skills)**: Visual DNA extraction, headless UI/interaction verification, and interactive presentation tooling (`hallmark-design-study`, `ai-design-check-stageshow`).
- **22-Repo Open-Source Motion Studio**: Curated GSAP, Motion, Theatre.js, Rive, Lottie, Three.js/R3F, and procedural video stack cataloged in [`motion-studio-22.md`](11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md) (`motion-video-pipeline`, `web-animation-sources`).
- **[Andrej Karpathy](https://github.com/karpathy) / [Addy Osmani](https://addyosmani.com/) / Ponytail, Caveman & Graphify**: Surgical simplicity, `~41,500`-token catalog compression without behavior loss, and runtime resource budgeting (`karpathy-ponytail-simplicity`, `app-resource-efficiency`).
- **[msitarzewski (`agency-agents`)](https://github.com/msitarzewski/agency-agents)**: Specialist agent role archetypes and defensive verification patterns (`bug-hunter`, `defending-code`).
- **[NVIDIA (`SkillSpector` & `SkillEvaluator`)](https://github.com/nvidia/skillspector)**: Static taint/MCP security rules, 7-harness portability checks, Tier-1 Quality Score, Wilson 95% CI, and statistical skill lift metrics ([docs](https://docs.nvidia.com/skills/skillevaluator)).
- **[Cloudflare (`security-audit-skill`)](https://github.com/cloudflare/security-audit-skill)**: 6-phase Coverage Ledger audit architecture, 6-tuple certainty contract, verifier budget reserve, and race-safe scratch promotion.
- **[Nutlope (`hallmark` v2)](https://github.com/Nutlope/hallmark) / [Dominik Martin (`hue`)](https://github.com/dominikmartn/hue) / [Google Labs (`stitch-skills`)](https://github.com/google-labs-code/stitch-skills) / [UIZZE (`anti-ui-slop`)](https://github.com/uizze/uizze)**: 21 macrostructures, Hue Hero Stage physics, static `DESIGN_SYSTEM.md` extraction, `UI_CONTRACT`, and `image-to-ui`.
- **[Jakub Krehel (`make-interfaces-feel-better`)](https://github.com/jakubkrehel/make-interfaces-feel-better) / [Dammyjay93 (`interface-design`)](https://github.com/Dammyjay93/interface-design) / [NextLevelBuilder (`ui-ux-pro-max`)](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) / [`shadcn/ui`](https://github.com/shadcn-ui/ui) / [J. Poindexter (`typography-skills`)](https://github.com/jpoindexter/typography-skills)**: 19 polish recipes, Anti-Reinvention & `design-deslop`, WCAG 2.2/DTCG/RTL design intelligence, official 2026 `shadcn/ui` patterns, and zero-CLS Better Typography.

### License

The integration glue-code, installation tooling, mechanical validators, and adapted skill manifests are licensed under the **MIT License**. Original works retain their respective licenses cited above.
