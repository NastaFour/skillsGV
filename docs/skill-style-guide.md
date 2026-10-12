# Skill Style Guide — skillsGV

Normative source for authoring and refactoring skills in this catalog: every `SKILL.md`, its frontmatter, and its references MUST follow this guide. The bundled copy at `00-meta-skills/skill-improver/references/skill-style-guide.md` mirrors the core rules for installed global skills when this repo doc is unavailable; keep both aligned, with this file as the authority.

## 1. What a skill is

A skill is a **runtime instruction contract for an LLM**, not human documentation. It tells the model when to activate, which rules are non-negotiable, how to branch, what to do in order, and what to return. Create a skill only when the pattern is reused; one-off or trivial guidance belongs in plain documentation.

## 2. Folder layout and naming

```
<skill-name>/
├── SKILL.md              # Required: frontmatter + body
├── references/           # Optional: docs, schemas, background
├── scripts/              # Optional: executable helpers
└── assets/               # Optional: templates, fixtures, images
```

- The folder name MUST equal the frontmatter `name` (validator error otherwise).
- `name` MUST be 1–64 characters, match `^[a-z0-9-]+$`, and contain no leading hyphen, trailing hyphen, or consecutive hyphens (`--`).
- Keep each skill under its category folder; the catalog walk excludes `_shared/`, the vendored addon mirror, and dot-directories.

## 3. Frontmatter

Required for this catalog: `name`, `description`, `license`, `metadata.author`, `metadata.version`. Recommended: `metadata.trigger` (keyword list) and `metadata.scope` (`root-only`, `global`, `project`).

| Field | Rule |
|---|---|
| `description` | One physical line, YAML-safe, quoted. Trigger words first: `"Trigger: ... . {What it does}."` State what AND when; add an exclusion (`Do NOT use for ...`) where misuse is plausible. |
| `description` length | agentskills.io hard cap: 1024 characters. Catalog norm: MUST be ≤250, target ≤160. |
| `license` | License name or file reference. |
| `compatibility` | Optional; MUST be ≤500 characters. |
| `allowed-tools` | Optional, space-separated tool grants (`Read`, `Edit`, `Bash(node:*)`). Grant the minimum the workflow needs. |
| `metadata.requires-mcp` | When set, `metadata.mcp-fallback` MUST also be set, and parity with `mcp-manifest.json` is enforced by `pnpm doctor`. |

Never add a `Keywords` section: discovery reads the frontmatter only.

## 4. Required section order

Write sections in this order; omit one only when it is truly irrelevant:

1. **Activation Contract** — exact situations that load the skill.
2. **Hard Rules** — constraints the model MUST NOT violate.
3. **Decision Gates** — compact table or bullets for real branching choices.
4. **Execution Steps** — ordered operational workflow.
5. **Output Contract** — the exact final format or artifacts.
6. **References** — local files only; supporting detail lives outside the body.

## 5. Body budget and progressive disclosure

- Target **180–450 tokens**; recommended maximum **700**; hard maximum **1000**.
- The validator warns above 500 body lines and ~5120 estimated tokens.
- Move templates, schemas, and generated examples to `assets/`; move conceptual depth and edge cases to `references/`; move executable helpers to `scripts/`.
- **Progressive disclosure**: inline what every branch needs; push behind a local pointer what only some branches reach. Keep a concept's definition, rules, and caveats under one heading (co-location) so reading one part brings its neighbours.

## 6. Writing rules

DO:

- Write imperative runtime instructions: "Load X", "Check Y", "Return Z".
- Lead with activation triggers and hard constraints.
- Make every step end on a **checkable completion criterion** (done vs not-done, not a feeling).
- Use compact tables for decision gates; keep examples minimal and executable.
- Reuse **leading words** — short pretrained concepts the model thinks with — as repeated tokens instead of repeating explanations.
- Prompt the positive target behaviour; keep prohibitions only as hard guardrails and pair each with what to do instead.
- Keep every meaning in a single source of truth; do not restate `package.json`, config, or directory layout the agent can look up.

DON'T:

- Explain history, motivation, or tutorial background.
- Duplicate long docs inside the skill body.
- Add generic advice the model cannot execute.
- Use external URLs as primary references.
- Hide critical rules below examples.

## 7. References inside skills

- Reference local files only; prefer paths relative to the skill directory (`references/x.md`, `scripts/helper.mjs`).
- Relative references are validated by `catalog-doctor` (`skill-references` check) through the resolution ladder: skill directory, catalog root, `skills/` install prefix, then catalog-wide suffix match.
- Target-project paths (`.cursor/mcp.json`, `src/lib/api.ts`), upstream repository paths, and output templates (`<filename>.png`, `YYYY-MM-DD`, `PROJECT_NAME`) are prose or placeholders, never resolvable catalog references.

## 8. Validation and gates

Run before declaring a skill ready:

```bash
node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict
pnpm doctor        # includes the skill-references integrity check
pnpm test          # includes the catalog-doctor and token-audit suites
```

The validator also enforces catalog-wide policies: no `npm`/`npx` mentions (use `pnpm` / `pnpm dlx`), no `any` in code samples (use `unknown` plus narrowing), and no LocalStorage for tokens.

## 9. Quality checklist

- [ ] Folder name equals `name`; name is 1–64 chars of `[a-z0-9-]` without `--`.
- [ ] `description` is one quoted line, ≤250 chars, trigger words first, what + when (+ exclusion).
- [ ] Required frontmatter fields present; MCP declarations carry a fallback and manifest parity.
- [ ] Required sections exist in order; decision points are tables, not prose branches.
- [ ] Body within budget; depth disclosed into `references/`, `assets/`, or `scripts/`.
- [ ] Hard rules are testable; the output contract states exactly what to return.
- [ ] References resolve locally; no target-project or upstream paths as references.
- [ ] `validate-skills --strict`, `pnpm doctor`, and `pnpm test` pass.
