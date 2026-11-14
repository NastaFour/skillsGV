# skillsGV v3.3.0: Total System Improvement, Token-Waste Elimination, Resource Optimization & Gentle-AI 4.4.0

* **Author:** NastaFour
* **Date:** 2026-11-08
* **EGM Phase:** Elephant Ideation & Stress-Test (`concepts_brief.md`)
* **External Plugin Status:** Installed at `~/.gemini/config/plugins/egm` (`[egm](customization://egm)`) with `rules/AGENTS.md` Floor-Not-Ceiling bridge

---

## Overview

`skillsGV v3.3.0` upgrades the portable 246-skill monorepo catalog to **251 skills** under **Gentle-AI 4.4.0**, **Google's Elephant-Goldfish Model (EGM)**, and the **Floor, Not Ceiling (`Enseñanza > Dogma`)** contract. The upgrade addresses five concrete objectives requested by the author:

1. **External EGM Plugin + Internal Workflow Bridge**: Run `google/elephant-goldfish-model` as an independent Antigravity plugin (`~/.gemini/config/plugins/egm`) that drafts specifications with full project memory (**Elephant**) and audits them with zero-context subagents (**Goldfish**), without restricting agent capability.
2. **Zero Token Waste & Sharper AI Coding Responses**: Eliminate empirical token bloat across the catalog (`~40,053 tokens` currently trapped in 20 deprecated `SKILL.md` files plus `~4,500 tokens` in oversized Tier-0/planning skills) and enforce **Karpathy + Ponytail + Caveman** coding discipline (surgical diffs, surfaced assumptions, simplest veteran-proven implementation, zero conversational fluff).
3. **App & AI Runtime Resource Optimization**: Add a dedicated engineering skill (`06-code-quality/app-resource-efficiency`) governing CPU, RAM/Heap streaming, GPU/60fps frame budgets, database/network I/O, and LLM compute/token efficiency for any application the AI builds or refactors.
4. **Zero-Trust Prompt Injection Defense (`NastaFour/prompt-shield`) & Defensive Security**: Integrate `03-ai-ml/prompt-shield` (0-token Python stdlib `safe_read.py` byte/cipher/polyglot scanner + Tripartite Forensic Report) alongside `bug-hunter` and `defending-code` patterns in `live-cve-security-intel` and `security-audit`.
5. **Anti-Slop UI/UX & 22-Repo Open-Source Motion Studio**: Integrate `@enmera/ai-design-check` (70 deterministic rules), `Stageshow` (`look -> story -> example -> film -> fixes`), Together AI `Hallmark` (50 styles with 3 proposals per site, 755 free photos, 8-viewport real-browser check, blind critic agent), curated 3D/scroll galleries (`scrolltide.co`, `motionsites.ai`, `kolpusites.com`, `navbar.gallery`, `footer.design`, `cta.gallery`, `styles.refero.design`, `supahero.io`, etc.), and the 22-repository open-source Motion Studio pipeline (`Remotion` through `FFmpeg`).

---

## Analysis & Elephant Stress-Test (Critique First)

Before accepting the proposed additions, the Elephant audited the current `skillsGV` repository (`246` skills, `1,294,073` bytes across all `SKILL.md` files) and stress-tested the failure modes of this expansion:

### 1. Empirical Token-Waste Audit (What Was Hidden in `skillsGV`)
* **Finding A — Deprecated Skill Bloat (`40,053 tokens` wasted)**:
  13 legacy SDD skills (`00-meta-skills/sdd-*` and `professional-planner`) consume **135,768 bytes (`~33,942 tokens`)**, and 7 other deprecated skills consume another **24,446 bytes (`~6,111 tokens`)** — totaling **160,214 bytes (`~40,053 tokens`)** of dead instructions. Any agent or subagent that reads a deprecated skill before redirecting burns up to `4,699 tokens` on a single obsolete file (`sdd-archive/SKILL.md`).
  * **Counter-Measure**: Compress all 20 deprecated `SKILL.md` files into 15-line redirect stubs (`<150 tokens` each) pointing directly to `odd-workflow` or their modern replacement (`react-19`, `nextjs-15`, `tailwind-4`, `zustand-5`), reclaiming **~37,000 tokens** immediately.
* **Finding B — Tier-0 & Core Planning Bloat (`~4,500 tokens` per session)**:
  Tier-0 base context (`AGENTS.md` + kernels + 9 Tier-0 skills) currently measures **73,944 bytes (`~18,486 tokens`)**. Inside Tier 0, `02-dev-roles/decision-gate/SKILL.md` is **207 lines (`11,456 B` / `~2,864 tokens`)**, and in Tier 1 `01-planning-process/brainstorming/SKILL.md` is **260 lines (`~4,163 tokens`)**.
  * **Counter-Measure**: Extract extended examples from `decision-gate` and `brainstorming` into `references/` and compress their `SKILL.md` entrypoints to `<85` lines (`~1,100 tokens`), cutting active session token consumption by **~4,500 tokens** without losing a single rule.

### 2. Counter-Argument Against Skill Fragmentation (The "40-Repo Dumping" Trap)
* **Risk**: Creating separate skills for each of the 22 Motion Studio repositories, 14 GitHub UI repositories, and 10 Claude Code repositories would add 40+ overlapping skills. Because `skill-router.mjs` enforces a strict cap of `≤5` skills per turn, fragmented skills dilute BM25/keyword routing scores and displace critical architecture or security skills.
* **Inventive Resolution (Deep Module Consolidation)**:
  Instead of 40 shallow skills, consolidate the new capabilities into **5 deep, non-overlapping skills** (`246 -> 251` total skills) and **4 targeted upgrades** to existing canonical skills, backed by deterministic disambiguation rules in `overlap-matrix.json` and `routing-corpus.jsonl`.

### 3. Resolving the Contradiction Between Strict Linter Rules and "Floor, Not Ceiling"
* **Contradiction**: `@enmera/ai-design-check` enforces 70 strict rules (flat buttons, no gradients, 4px grid, single card header pattern) and `Hallmark` bans eyebrow labels and colored headline words. However, 3D/scroll showcases from `scrolltide.co`, `motionsites.ai`, and `kolpusites.com` intentionally use custom shaders, glassmorphism (`glass.samasante.com`), and kinetic typography.
* **Resolution**: Partition rules by **Design Archetype (`A–H`)**:
  * **Hard Floor (All Archetypes)**: Accessibility (`focus-visible` ring preserved, `prefers-reduced-motion`, contrast ratios), zero placeholder garbage (`"Welcome back, Alex!"`, emoji-as-icons, `Lorem ipsum`), 8-viewport responsive check (`320px` to `1920px`), and semantic token binding (`DESIGN_SYSTEM.md`).
  * **Archetype-Scoped Rules**: SaaS/Dashboard archetypes (`A` Monograph, `B` Spec-Sheet, `E` Precision, `G` System Native) enforce the full 70-rule `@enmera/ai-design-check` flat-surface discipline; immersive/creative archetypes (`C` Gallery, `D` Kinetic, `H` Bespoke) unlock 3D/WebGL, shader surfaces, and scroll choreography when declared via `[Beyond-Baseline: <visual rationale>]`.

---

## Goals vs. Non-Goals

### In-Scope Goals
1. **External EGM Plugin (`~/.gemini/config/plugins/egm`)**: Keep Google's `elephant-goldfish-model` installed outside the repository as a native Antigravity plugin with `rules/AGENTS.md` enforcing `Floor, Not Ceiling` and ODD handoff compatibility.
2. **Gentle-AI `4.4.0` Kernel & Governance Alignment**: Update `AGENTS.md`, `README.md`, `_shared/bootstrap-kernel-*.md`, `_shared/review-ledger-contract.md`, `odd-workflow`, `gentle-orchestrator`, `gentle-ai-review-4r`, `code-reviewer`, and `rdd-defect-workflow` to Gentle-AI `4.4.0` (Antigravity 1.4 native `jd-judge-a`/`jd-judge-b`/`jd-fix-agent` parity, model tiering `inherit`/`flash_lite`/`flash`/`pro`, `<24 KB` `agy` rule budget, Gentle Shell `gs` / `gentle-pi 4.4.0` `/gentle:design`, Windows `%APPDATA%` & UTF-8 BOM safety, `CODEX_HOME`).
3. **Token-Waste Elimination Pass**:
   * Compress all 20 deprecated `SKILL.md` files into minimal redirect stubs (saving `~37,000 tokens`).
   * Compress `02-dev-roles/decision-gate/SKILL.md` (`207 -> <80` lines) and `01-planning-process/brainstorming/SKILL.md` (`260 -> <85` lines) via `references/` extraction (saving `~4,500 tokens` per active session).
4. **5 New High-Cohesion Skills (`246 -> 251`)**:
   * `03-ai-ml/prompt-shield`: Installed from `NastaFour/prompt-shield` (`SKILL.md`, `scripts/safe_read.py`, `references/detection-heuristics.md`, `assets/forensic-report-template.md`) for 0-token deterministic indirect prompt-injection quarantine (`IPI100–IPI501`).
   * `06-code-quality/app-resource-efficiency`: End-to-end resource optimization for apps and AI tasks (RAM/stream backpressure, CPU worker offloading, GPU `<16.6ms` frame budget & WebGL disposal, DB/network N+1 & payload compression, and LLM token/tier FinOps).
   * `06-code-quality/karpathy-ponytail-simplicity`: Synthesizes `multica-ai/andrej-karpathy-skills` (anti-stumble rules), `DietrichGebert/ponytail` (veteran simplicity), `JuliusBrussee/caveman` (token-lean output without altering user prompts), and `addyosmani/agent-skills`.
   * `05-frontend/ai-design-check-stageshow`: Synthesizes `@enmera/ai-design-check` (70 deterministic UI rules + check/fix/recheck loop) and `benjitaylor/skills` `Stageshow` (`look -> story -> example -> film -> fixes`, faux UI stills, natural bento motion).
   * `01-planning-process/egm-spec-review`: Bridges `google/elephant-goldfish-model` (`Elephant` + `Goldfish` + `/egm-drift-report`), `Graphify-Labs/graphify` (knowledge-graph mapping), and `msitarzewski/agency-agents` (`Reality Checker` & `Whimsy Injector`).
5. **4 Canonical Skill Upgrades**:
   * `05-frontend/hallmark-design-study` (`v1.1.0`): 50 styles (propose 3 per web), 755 free-licensed photo rules, 8-viewport browser audit (`320px–1920px`), blind zero-context critic pass, and anti-AI-cliché rules.
   * `11-mcp-hybrid/motion-video-pipeline` (`v1.1.0`): Full 22-repo Open-Source Motion Studio stack (`01 Remotion` to `22 FFmpeg`, `Idea -> storyboard -> build -> animate -> mix -> export`).
   * `05-frontend/web-animation-sources` (`v1.1.0`): Expand `references/animation-sources.md` with the 2026 UI/3D/scroll directories (`scrolltide.co`, `motionsites.ai`, `kolpusites.com`, `navbar.gallery`, `footer.design`, `cta.gallery`, `styles.refero.design`, `supahero.io`, `3dicons.co`, `glass.samasante.com`, `land-book.com`, `recent.design`, `landdding.com`, `fontinlogo.com`, `godly.website`, `60fps.design`, `21st.dev`, `reactbits.dev`, `magicui.design`, `uiverse.io`, `mobbin.com`, `DavidHDev/canvas-ui`, `enesozturk/dimensional-drawing`).
   * `02-dev-roles/live-cve-security-intel` & `02-dev-roles/security-audit`: Add explicit `bug-hunter` and `defending-code` triggers and defensive verification checklists.

### Out-of-Scope Non-Goals
* **No Forking of EGM Inside `skillsGV`**: The full EGM runtime (`agents/*.md` and `resources/document_standards/*.md`) stays in `~/.gemini/config/plugins/egm` so it updates cleanly as an external plugin without bloating `skillsGV` validation.
* **No Heavy Binary Dependencies**: The 22 Motion Studio tools and `@enmera/ai-design-check` are documented as on-demand `pnpm dlx` / modular pipelines, never installed as mandatory root `node_modules` dependencies of this repository.
* **No Offensive Exploitation**: Security skills (`prompt-shield`, `live-cve-security-intel`, `security-audit`, `ai-safety-agent-guard`) operate strictly as defensive guards and forensic auditors.

---

## Alternatives Weighed

1. **Alternative 1 — Create 40+ Individual Skills (1 per GitHub Repo / Website Link)**:
   * *Rejected by author & Elephant architecture*: Creates severe routing collisions in `skill-router.mjs` (which caps active skills at `≤5` per turn) and bloats registry maintenance. Grouping into 5 deep skills + 4 canonical upgrades preserves 100% of the techniques and URLs with zero router degradation.
2. **Alternative 2 — Vendor the Entire `google/elephant-goldfish-model` Repo Inside `00-meta-skills/`**:
   * *Rejected by author*: Author explicitly requested keeping `elephant-goldfish-model` installed externally as a separate plugin (`~/.gemini/config/plugins/egm`) that interoperates with `skillsGV` under `Floor, Not Ceiling`.
3. **Alternative 3 — Delete the 20 Deprecated Skills Entirely from Disk**:
   * *Rejected by Elephant backward-compatibility check*: External workspaces or historical `odd/tasks/*.md` logs may still reference legacy skill paths (`sdd-apply`, `nextjs`, `tailwindcss`). Compressing them into `<150-token` redirect stubs saves `~37,000 tokens` while preserving 100% path backward compatibility and passing `catalog-doctor.mjs`.

---

## Key Decisions & Planned ODD Work Units (`T1`–`T6`)

| Task | Scope | Target Token / Quality Impact |
| :--- | :--- | :--- |
| **T1** (`S1`) | Install `~/.gemini/config/plugins/egm` + `rules/AGENTS.md` Floor-Not-Ceiling bridge | Completed (`[egm](customization://egm)` ready on reload; active live in this session) |
| **T2** (`S2`) | Upgrade `skillsGV` governance & kernels to **Gentle-AI `4.4.0`** + compress 20 deprecated skills (`-37k tok`) + compress `decision-gate` & `brainstorming` (`-4.5k tok`) | Saves **~41,500 tokens** across catalog & Tier 0; full Gentle-AI 4.4.0 parity |
| **T3** (`S3`) | Create `05-frontend/ai-design-check-stageshow` + upgrade `hallmark-design-study`, `motion-video-pipeline` (22 repos), and `web-animation-sources` | Eliminates AI UI slop (70 deterministic rules + 50 Hallmark styles + 22-repo motion studio) |
| **T4** (`S4`) | Install `03-ai-ml/prompt-shield` (`NastaFour/prompt-shield`) + enrich `live-cve-security-intel` & `security-audit` (`bug-hunter`, `defending-code`) | 0-token `safe_read.py` indirect prompt injection shield (`IPI100–IPI501`) |
| **T5** (`S5`) | Create `06-code-quality/app-resource-efficiency`, `06-code-quality/karpathy-ponytail-simplicity`, and `01-planning-process/egm-spec-review` | App CPU/RAM/GPU/IO/LLM optimization + Karpathy/Ponytail/Caveman coding quality |
| **T6** (`S6`) | Update `overlap-matrix.json` & `routing-corpus.jsonl`, run 4-way sync (`251` skills, `v3.3.0`), sync `gentle-ai-dsh`, and pass `validate-skills --strict`, `router-replay`, `catalog-doctor`, `safe_read.py`, and `node --test` | 100% deterministic verification across all 251 skills |
