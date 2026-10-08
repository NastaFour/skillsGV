# Contributing to skillsGV

Thank you for your interest in contributing to **skillsGV**! We are building the most token-efficient, portable, and reliable skill harness for AI coding agents.

Whether you are fixing a bug, adding a new skill, improving evals, or refining the router, this guide outlines the standards, architecture, and workflow for all contributions.

---

## 🏛️ Guiding Principles

1. **Portable & Agent-Agnostic**: Skills must run on any modern agent (Claude Code, Cursor, Gemini CLI, OpenCode, Codex, Copilot, Antigravity, Windsurf) conforming to the [agentskills.io](https://agentskills.io/specification) standard.
2. **Token Efficiency First**: Always-on context is precious. Never bloat `AGENTS.md` or kernel files. Rely on Two-Tier progressive disclosure: Tier 0 at startup, Tier 1 (≤5 skills) loaded on demand via the router.
3. **ODD by Default**: Every feature and fix follows Organic-Driven Development (ODD): authorize, explore, classify, track in `odd/tasks/<feature>.md`, implement atomically, and close with observed verification.
4. **Deterministic Quality Gates**: No skill is merged without passing strict validation (`pnpm validate:strict`), offline evals (`pnpm test`), and health checks (`pnpm doctor`).
5. **Tooling Rule: pnpm ONLY**: Never use `npm` or `npx`. All scripts, dependencies, and commands must use `pnpm` (or `pnpm dlx`).

---

## 🚀 Development Setup

### Prerequisites
- **Node.js**: `20.x` or `22.x` (LTS recommended)
- **pnpm**: `v9.0.0+` or `v11.x` (`pnpm --version`)
- **Git**: `2.30+`

### Quickstart
```bash
git clone https://github.com/NastaFour/skillsGV.git
cd skillsGV
pnpm install
pnpm doctor
```

---

## 🧪 Verification Commands

Before opening a pull request, run the complete verification suite locally:

```bash
# 1. Strict catalog validator (checks frontmatter, triggers, line limits, and licenses)
pnpm validate:strict

# 2. Automated test suite (all unit tests, eval suites, and router invariants)
pnpm test

# 3. Addon build & test (verifies on-demand gentle-ai-dsh mirror)
pnpm test:addon

# 4. Catalog doctor (6-point unified health audit)
pnpm doctor

# 5. Harness benchmark (token savings & routing precision)
pnpm benchmark
```

All 5 commands must pass with zero errors and zero warnings.

---

## 📦 How to Add a New Skill

Each skill is a self-contained module located under a category folder (e.g., `04-backend/my-skill/`).

### 1. Skill Structure
```
category/my-skill/
├── SKILL.md                  # Required: Main instruction file with YAML frontmatter
├── evals.json                # Strongly recommended: Anthropic eval schema suite
├── references/               # Optional: In-depth technical guides and recipes
└── scripts/                  # Optional: Deterministic helper scripts (Node.js ESM)
```

### 2. Frontmatter Contract (`SKILL.md`)
The YAML frontmatter must follow the [agentskills.io](https://agentskills.io/specification) specification:

```markdown
---
name: my-skill
description: Comprehensive description of what this skill does. Use when doing X, Y, or Z. Do NOT use for A or B.
license: MIT
compatibility: "Compatible with Claude Code, Cursor, Gemini CLI, OpenCode, Codex. Requires Node 20+."
allowed-tools: Bash(node:*) Read Write Edit
metadata:
  trigger: ["my skill", "trigger phrase 1", "trigger phrase 2"]
  scope: [global, project]
  version: "1.0.0"
---

# 🛠️ My Skill Title

Concise instruction body guiding the agent...
```

#### Frontmatter Rules
- **`name`**: Lowercase alphanumeric with hyphens, matching the directory name.
- **`description`**: Must explain what the skill does AND include an explicit exclusion clause (e.g. `Do NOT use for ...`).
- **`metadata.trigger`**: Must be a non-empty array of lowercase trigger keywords and intent phrases.
- **Body length**: Strictly ≤500 lines of body markdown (enforced by `validate:strict`). Keep large reference manuals under `references/`.

### 3. Tier Classification
Add your skill to `catalog.json` with its appropriate tier:
- `core`: Foundational cross-cutting harness and universal engineering skills (Tier 1).
- `extended`: Specialist developer roles, review lenses, and prominent fullstack frameworks (Tier 2).
- `full`: Domain-specific libraries, niche SDKs, or cloud-specific modules (Tier 3).

### 4. Authoring an Eval Suite (`evals.json`)
Core and high-impact skills must ship an `evals.json` file conforming to the Anthropic eval schema:

```json
{
  "evals": [
    {
      "id": "my-skill-primary-workflow",
      "prompt": "my skill: execute primary workflow with specific parameters",
      "files": [],
      "expected_output": "Gold output demonstrating expected agent response and standards.",
      "expectations": [
        "routes-to:my-skill",
        "contains:Key requirement",
        "regex:pattern|alternative",
        "not-contains:legacy-anti-pattern"
      ]
    },
    {
      "id": "my-skill-edge-case",
      "prompt": "trigger phrase 2: handle edge case scenario",
      "files": [],
      "expected_output": "Gold output for edge case scenario.",
      "expectations": [
        "routes-to:my-skill",
        "contains:Edge case handled"
      ]
    }
  ]
}
```

---

## 📝 Commit & PR Guidelines

### Conventional Commits
All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(skill): add new postgres-tuning skill`
- `fix(router): prevent false positive on payment keyword`
- `docs(readme): add benchmark metrics table`
- `refactor(loader): streamline tier resolution`
- `test(evals): add evals for docker skill`

> [!IMPORTANT]
> **No AI Attribution**: Do NOT include `Co-Authored-By` or AI attribution footers in commit messages.

### Pull Request Process
1. Create a feature branch: `git checkout -b feat/my-new-skill`
2. Follow ODD: track implementation steps and keep commits atomic as reviewable work units (≤400 changed lines per work unit).
3. Run `pnpm validate:strict` and `pnpm test`.
4. Submit your pull request using our PR template.

---

## ⚖️ License & Attribution

By contributing to skillsGV, you agree that your contributions will be licensed under the MIT License unless an upstream skill explicitly carries a compatible permissive license (e.g. Apache-2.0).
