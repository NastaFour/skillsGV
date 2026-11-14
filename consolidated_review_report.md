# Consolidated Goldfish Design Review Report — `skillsGV v3.3.0`

**Target Document**: [`docs/designs/skills-v3.3-egm-gentle440-design-motion.md`](docs/designs/skills-v3.3-egm-gentle440-design-motion.md)  
**Standards Audited Against**: `feature-spec-standard.md`, `zoom-out-standard.md`, `implementation-readiness-standard.md`, `AGENTS.md` (`ODD` + `Floor, Not Ceiling`)  
**Reviewers Spawned (Zero-Context Goldfishes)**: `egm-zoom-out`, `egm-comprehension`, `egm-design`, `egm-implementation-readiness`, `egm-codebase-details`  
**Pre-Resolution Verdict**: **NO-GO / Changes Required** (7 deduplicated Blockers, 4 deduplicated Majors/Contested Items)  
**Post-Resolution Status**: All accepted fixes applied to `docs/designs/skills-v3.3-egm-gentle440-design-motion.md` (`Status: Approved`).

---

## Deduplicated Findings & Resolutions

### Blockers

#### B1. Walker Hardening Omits 4 Active Walkers, Breaks `walkCatalogFiles`, & Misstates `12-matt-pocock`
- **Raised by**: `egm-design` (#1), `egm-zoom-out` (#1, #4), `egm-implementation-readiness` (#2), `egm-codebase-details` (#2, #3, #12, #13), `egm-comprehension` (#4)
- **Summary**:
  1. Spec patched only 4 walkers (`_shared/catalog-manifest.mjs`, `validate-skills.mjs`, `catalog-doctor.mjs`, `test/catalog-integrity.test.mjs`) and omitted 4 production/diagnostic walkers: `skill-router.mjs`, `skills-loader.mjs`, `install-skills.mjs`, and `scripts/check-install-state.mjs`.
  2. Applying root category + dot-dir filtering to `catalog-doctor.mjs` `walkCatalogFiles` would break reference resolution against `CATALOG_OWNED_DOTDIRS` (`.github`, `.atl`), `scripts/`, and `docs/`. Meanwhile `walkMarkdownFiles` also lacked `"Anti rats"` / dot-dir / `copia-de-seguridad*` guards.
  3. Replacing `walkSkills` directly with `walkSkillPaths` in `test/catalog-integrity.test.mjs` would fail on `walkSkills('gentle-ai-dsh/skills')` (relative return paths need `join(dir, rel)`), and strict `dir === REPO_ROOT` equality fails on Windows drive casing unless normalized with `samePath(resolve(dir), REPO_ROOT)`.
  4. Prose claimed categories `00-` through `11-`, omitting `12-matt-pocock` (27 skills; 13 category dirs `00-..09-`, `11-`, `12-`).
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Centralize canonical `walkSkillPaths(root, { isCatalogRoot } = {})`, `ROOT_SKILL_ALLOWLIST = new Set(["professional-planner"])`, `CATALOG_CATEGORY_RE = /^\d{2}-[a-z0-9-]+$/`, and `samePath` in `_shared/catalog-manifest.mjs`; reuse across all 7 skill walkers (`validate-skills.mjs`, `catalog-doctor.mjs` `walkSkillFiles`, `skill-router.mjs`, `skills-loader.mjs`, `install-skills.mjs`, `check-install-state.mjs`, `test/catalog-integrity.test.mjs` joining `root`); leave `walkCatalogFiles` preserving `CATALOG_OWNED_DOTDIRS` + repo docs; fix prose to `00-..12-`; add unit tests for allowlisted root, non-allowlisted root exclusion, Windows casing, and `.agents/` fixture exclusion.

#### B2. Uniform Deprecated Stub Template Breaks `sdd-orchestrator/evals.json` & Drops `allows-script-exec` / Versions / Authors
- **Raised by**: `egm-design` (#2), `egm-zoom-out` (#2), `egm-implementation-readiness` (#4), `egm-codebase-details` (#4, #15), `egm-comprehension` (#10)
- **Summary**: Overwriting `metadata.trigger` with `["<skill-name>-legacy"]` strips `["sdd new", "sdd continue", "sdd ff", ...]` from `sdd-orchestrator/SKILL.md`, breaking `test/evals.test.mjs` (`sdd-orchestrator/evals.json` asserts `routes-to:odd-workflow`). The uniform template also stripped `allows-script-exec` from `sdd-apply`, downgraded `professional-planner` `version: "2.0.0"` to `"1.0.0"`, misattributed non-Gentleman framework skills to `gentleman-programming`, and duplicated `version` at top-level + `metadata`.
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Compress only the Markdown **body** of the 20 deprecated `SKILL.md` files into a `<150`-token redirect stub while **preserving** each skill's existing `metadata.trigger`, original `metadata.author`, existing single `metadata.version` (non-downgraded), `delegate_only`, and `allows-script-exec` (on `sdd-apply`), with accurate retirement framing (`Gentle-AI 4.0.0` vs framework-superseded).

#### B3. `buildManifest` Ignores Frontmatter `tier` & Spec Conflates Context Tiers (`Tier-0`/`Tier-1`) with Catalog Tiers (`core`/`extended`/`full`)
- **Raised by**: `egm-comprehension` (#1), `egm-design` (#5), `egm-implementation-readiness` (#1), `egm-codebase-details` (#1)
- **Summary**: `_shared/catalog-manifest.mjs` `buildManifest` sets new non-Tier-0 skills to `"full"` and never reads `tier` / `metadata.tier` from `SKILL.md`, so `prompt-shield` and `app-resource-efficiency` would not receive `"extended"` in `catalog.json` (`102` instead of `104`). Meanwhile `G2` contradicted Section 5 by saying `test/catalog-integrity.test.mjs` bounds needed changing even though `104 <= 105` already fits, and the spec never distinguished `Tier-0`/`Tier-1` loading from `core`/`extended`/`full` installer tiers.
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Explicitly document both tier systems in Section 2; update `buildManifest` in `_shared/catalog-manifest.mjs` to honor `metadata.tier` / top-level `tier` in `SKILL.md` (`prompt-shield` and `app-resource-efficiency` declare `metadata.tier: "extended"`, the other 3 `"full"` -> `36 core + 68 extended = 104 <= 105`); remove the contradictory `G2` claim about changing `105`.

#### B4. Gentle-AI `4.4.0` Kernel/Prose Drift: `Provider Contract 1.4.0` Regression, Omitted `PROSE_COUNT_DOCS`, & Installer Trivia in `AGENTS.md`
- **Raised by**: `egm-comprehension` (#7), `egm-design` (#7), `egm-zoom-out` (#5, #7), `egm-implementation-readiness` (#3, #7), `egm-codebase-details` (#5, #6, #16, #17)
- **Summary**:
  1. Line 185 regressed `Provider Contract 1.5` to `1.4.0` despite existing `1.5` across `AGENTS.md`, `_shared/review-ledger-contract.md`, `gentle-ai-review-4r`, `code-reviewer`, and `rdd-defect-workflow`.
  2. Stuffing Windows installer changelog details (`ctime`, `%APPDATA%`, `gs.cmd`, bare `npm` word) into `AGENTS.md` threatens the `<6.5 KB` NFR and risks `no-npm` violations if copied into skill bodies.
  3. Omitted `gentle-ai-dsh/ISSUES.md`, `gentle-ai-dsh/AGENTS.md` (still on SDD / `246` / `14` Tier-0 skills), `gentle-ai-dsh/README.md`, `00-meta-skills/skill-router/SKILL.md` (source for `tier0-context.{md,json}` via `--emit-tier0 --force`), and `README.es.md`; used prohibited glob `./gentle-ai-dsh/**`.
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Preserve **`Provider Contract 1.5`** across all files; keep `Gentle-AI 4.4.0` updates focused on agent-operational rules (`agy 1.4` `jd-judge-a`/`jd-judge-b`/`jd-fix-agent`, tiers `inherit`/`flash_lite`/`flash`/`pro`, `<24 KB` rule ceiling) keeping `AGENTS.md < 6.5 KB` and zero bare `npm` tokens; replace `./gentle-ai-dsh/**` with explicit target files (`gentle-ai-dsh/AGENTS.md`, `README.md`, `ISSUES.md`, plus generated `skills/**` and `_shared/**`), `00-meta-skills/skill-router/SKILL.md`, `tier0-context.json`, and `README.es.md`.

#### B5. Router Scoring Mischaracterized (`BM25`), `overlap-matrix.json` Collisions, & `router-replay.mjs --consistency`
- **Raised by**: `egm-design` (#4), `egm-zoom-out` (#4), `egm-implementation-readiness` (#6), `egm-codebase-details` (#7)
- **Summary**: `skill-router.mjs` uses exact trigger regexes (`+1.0`) + capped keyword overlap (`min(kwHits/3, 0.5)`), not BM25. Also `overlap-matrix.json` uses named `groups` (already containing `security-defense-suite` and `anti-slop-frontend`) with an early `break;` on first match; `odd-workflow` is in `TIER0_SKILLS` (stripped from `tier1toLoad`); `UNAMBIGUOUS_UI_MARKERS` matches `motion`; and `router-replay.mjs --consistency` fails closed unless every group has a corpus case with matching `group` + `expectedPrimary`.
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Document exact `trigger+kw` mechanics; fold `prompt-shield` into existing `"security-defense-suite"` (`canonical: "security-audit"`) and `ai-design-check-stageshow` into existing `"anti-slop-frontend"` (`canonical: "design-driven"`); add `"resource-efficiency-optimization"` (`canonical: "app-resource-efficiency"`, `members: ["app-resource-efficiency", "performance-refactor"]`), `"simplicity-clean-code"` (`canonical: "solid-clean-code"`, `members: ["solid-clean-code", "karpathy-ponytail-simplicity"]`), and unitary `"spec-review-egm"` (`canonical: "egm-spec-review"`, scoped cleanly away from Tier-0 `odd-workflow`); add corpus entries with exact `group` tags and run `router-replay.mjs --consistency`; handle `motion-video-pipeline` cleanly so headless video synthesis doesn't misroute to `design-driven` as primary.

#### B6. `prompt-shield` Security Boundary, Exit-`3` Non-Echoing Telemetry, `py` Reference Extension, & Test Coverage
- **Raised by**: `egm-comprehension` (#5), `egm-design` (#3), `egm-zoom-out` (#7), `egm-implementation-readiness` (#5, #11), `egm-codebase-details` (#11, #12)
- **Summary**: Tier-1 `prompt-shield` cannot intercept native `read_file` unless wired into guidance/hooks (`AGENTS.md` / `engram-integration` / `skill-distiller`); printing matched injection strings on exit `3` leaks payloads into LLM context; `catalog-doctor.mjs` `REFERENCE_EXTENSIONS` omits `py`; `allows-curl` / `allows-script-exec` must carry reason strings; and no unit test covered exit `3` quarantine.
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Frame CUJ 2 accurately as an explicit pre-read CLI barrier (`safe_read.py` + `AGENTS.md` pre-read rule for untrusted external repos/docs); enforce that `safe_read.py` / wrapper diagnostics emit rule IDs/line numbers without echoing raw injection payloads on exit `3`; add `py` to `REFERENCE_EXTENSIONS` in `catalog-doctor.mjs`; add `node:test` tests covering both clean (`exit 0`) and quarantine (`exit 3`) cases.

#### B7. Missing `Archetype F` & Incomplete Governance / Task Definitions (`Phase D1b`, `T1`, `EGM`)
- **Raised by**: `egm-comprehension` (#2, #3), `egm-design` (#8), `egm-implementation-readiness` (#5), `egm-codebase-details` (#9)
- **Summary**: Archetype `F` (`The Humanist Companion`) was omitted from the `@enmera/ai-design-check` `A–H` partition; `Phase D1b`, `Floor, Not Ceiling`, `[Beyond-Baseline]` non-waivable invariants (contrast, focus, landmarks, overflow), the 7 EGM lenses, `/egm-drift-report`, and completed task `T1` (`S1–S6`) were under-specified inline.
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Assign **Archetype `F`** to flat-surface rules (`A, B, E, F, G`); restrict `[Beyond-Baseline: ...]` waivers in `C, D, H` strictly to viewport-lock/layout/shader expression rules while keeping WCAG contrast, keyboard accessibility, and responsiveness non-waivable across all `A–H`; document `Phase D1b`, the 7 Goldfish lenses, `/egm-drift-report`, `T1`, and clear `T2` sub-work-units cleanly inline.

---

### Majors & Contested Items

#### M1. YAGNI Challenge on 3 of the 5 New Skills (`karpathy-ponytail-simplicity`, `egm-spec-review`, `ai-design-check-stageshow`, `app-resource-efficiency` Scope)
- **Raised by**: `egm-zoom-out` (#3)
- **Resolution**: **PARTIAL `CONTEST` / PARTIAL `PROPOSE FIX`**:
  - **`CONTEST` (Reject deletion / preserve `246 -> 251`)**: Keeping all 5 consolidated skills (`03-ai-ml/prompt-shield`, `05-frontend/ai-design-check-stageshow`, `06-code-quality/app-resource-efficiency`, `06-code-quality/karpathy-ponytail-simplicity`, `01-planning-process/egm-spec-review`) is explicitly authorized by the user in `odd/tasks/skills-v3.3-egm-gentle440-design-motion.md` (`S3, S4, S5, S6`) and `concepts_brief.md` as the consolidated design (turning ~40 standalone skills into 5 high-cohesion Tier-1 skills).
  - **`PROPOSE FIX` (Accept scope tightening & cross-references)**: Tighten each skill's non-overlapping boundary (`app-resource-efficiency` focuses on runtime RAM/CPU/I/O/DB N+1/leak probes and cross-references `api-ai-billing` & `three-js-web`; `egm-spec-review` cross-references `codegraph-intelligence` rather than duplicating CodeGraph; `karpathy-ponytail-simplicity` focuses on cognitive anti-stumble + concise output inside `"simplicity-clean-code"` with `solid-clean-code`; `ai-design-check-stageshow` joins `"anti-slop-frontend"` owning `@enmera/ai-design-check` CLI + `Stageshow`).

#### M2. `decision-gate` & `brainstorming` Compression Mismatches, Relative Link Depth, & `references/` Lazy Loading
- **Raised by**: `egm-comprehension` (#9), `egm-design` (#6), `egm-implementation-readiness` (#8), `egm-codebase-details` (#14)
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Acknowledge `decision-gate` is Tier-0 (loaded on-demand in full when invoked, summarized in `tier0-context.md`); inspect actual sections of `brainstorming/SKILL.md` (`259` lines, no existing `SCAMPER`/`Six Thinking Hats`), moving its Graphviz `Process Flow` (`L112–163`), verbose `The Process` subsections (`L164–209`), and detailed `Visual Companion` essay (`L242–258`) into `references/ideation-frameworks.md` while preserving `allows-script-exec`, `visual-companion.md` link, `HARD-GATE`, `Three Paths`, `Red Flags`, `Checklist`, and `Transition`; move verbose worked examples/tables from `decision-gate/SKILL.md` to `references/decision-examples.md` preserving `metadata.time_budget_sec: 180`, `references/default-resolution.md`, and adjusting any moved `../../` links to `../../../`.

#### M3. `security-audit` Version (`2.0.0 -> 2.1.0`), `Hallmark` / `Motion Studio` `references/` Split, `10 referencias`, & Phantom `Motion Canvas`
- **Raised by**: `egm-comprehension` (#6, #8), `egm-design` (#9), `egm-zoom-out` (#6), `egm-implementation-readiness` (#5, #9), `egm-codebase-details` (#8, #9)
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Bump `02-dev-roles/security-audit/SKILL.md` from `"2.0.0"` to `"2.1.0"` (noting `"defending code"` already exists, enriching with `bug-hunter` differential triage & `prompt-shield` cross-ref + `Gentle-AI 4.4.0+`); remove phantom `Motion Canvas` mention; extract the 22-repo matrix into `11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md` (marking native/GUI tools accurately as optional local/MCP recipes rather than `pnpm dlx`) and `Hallmark`'s 50-style / 755-photo curation catalog into `05-frontend/hallmark-design-study/references/` (with offline fallback); update stale `"10 referencias"` prose in `web-animation-sources/SKILL.md`, `references/animation-sources.md`, and `SKILLS.md`.

#### M4. Standard Compliance: `## Risks & Limits`, No Unlinked `"Rejected by author:"`, Exact Frontmatter & Incremental Test Gating
- **Raised by**: `egm-comprehension` (#10), `egm-design` (#10, #11), `egm-zoom-out` (#8), `egm-implementation-readiness` (#9), `egm-codebase-details` (#10, #11)
- **Resolution**: **`PROPOSE FIX` (Accepted)** — Add `## Risks & Limits`; replace `"Rejected by author:"` phrasing with pure technical trade-offs and add missing alternatives (centralized walker vs 7 copies, `decision-gate` Tier-0 status, CLI vs hook `safe_read.py`); document intermediate per-unit `validate-skills.mjs <dir> --strict` vs `T6` full-repo `validate:strict`; standardize on `pnpm test` and `router-replay.mjs --consistency`.

---

## Resolution Log
- **5/5 Goldfish reviews consolidated**: `egm-comprehension`, `egm-design`, `egm-zoom-out`, `egm-implementation-readiness`, `egm-codebase-details`.
- **Reconciled spec updated**: [`docs/designs/skills-v3.3-egm-gentle440-design-motion.md`](docs/designs/skills-v3.3-egm-gentle440-design-motion.md) (`Status: Approved`), plus `design_draft.md`.
- **Ready for ODD implementation**: `T2`–`T6`.
