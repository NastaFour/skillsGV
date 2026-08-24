# Judgment Ledger — slice-2

Round-1 blind dual review (Judgment Day, two independent blind judges) over
target `615afa2` on `main`. The table below is the merged frozen round-1
findings set. Every finding was authorized for fixing; corrections were applied
directly on `main` as atomic work units (one commit per ID).

## Round-1 findings

| ID | Severity | Judge attribution | Location | Finding |
|---|---|---|---|---|
| L1 | CRITICAL | Blind dual review, round 1 (merged) | `SKILLS.md:3` | Header counter says «150 skills»; catalog has 151 (validator counts 151 pass). |
| L2 | WARNING | Blind dual review, round 1 (merged) | `00-meta-skills/skill-sync/scripts/install-skills.mjs` (~449-473) | `--uninstall` never lists retained FOREIGN (never-owned) files: cmdUninstall only iterates manifest entries, although help text promises listing. |
| L3 | WARNING | Blind dual review, round 1 (merged) | `00-meta-skills/sdd-apply/scripts/apply-journal.mjs` (~119-153) | TOCTOU race in orphan-lock recovery: two concurrent openers can both pass the stale check and each unlink the other's fresh lock → double ownership. |
| L4 | WARNING | Blind dual review, round 1 (merged) | `00-meta-skills/skill-router/scripts/router-replay.mjs` (~151-173, 209-215) | Triple-consistency gate FAILS OPEN: missing/unparseable overlap-matrix.json or overlap-smoke-tests.json yields checked:false → exit 0. |
| L5 | WARNING | Blind dual review, round 1 (merged) | `_shared/model-routing/profiles.schema.json` (~39-61) | Doc says non-empty phase profile has `alias` obligatorio, but schema allows notes-only objects. |
| I1 | INFO | Blind dual review, round 1 (merged) | `05-frontend/three-js-web/SKILL.md:44`; `02-dev-roles/code-reviewer/references/review-policy.md:7` | Voseo in new artifacts violates the catalog neutral-Spanish convention («evaluá», «clasificá»). |
| I2 | INFO | Blind dual review, round 1 (merged) | `00-meta-skills/skill-sync/scripts/install-skills.mjs` (~64 vs ~196) | Help example shows repeatable `--tool`, parser is last-wins. |
| I3 | INFO | Blind dual review, round 1 (merged) | `05-frontend/three-js-web/SKILL.md:3`; `05-frontend/web-animation-sources/SKILL.md:3` | Descriptions exceed the ≤250-char guideline (config.yaml rules.apply). |

## Corrections

| ID | Fix commit (SHA) | Evidence |
|---|---|---|
| L1 | `4fd6718` | Counter corrected to **151**; recursive grep confirms no other prose counter says "150 skills". Final validator strict run reports "151 SKILL.md files scanned · 151 pass", exit 0. |
| L2 | `9fa1e2b` | Read-only foreign-file discovery added to cmdUninstall (+ dry-run preview). Scratch target: install (11 owned files) + planted `my-foreign-skill\SKILL.md` → uninstall lists it under «Retained foreign/user-edited files (1)», foreign file still on disk, all owned files removed. Re-proven on final code (temp dir). |
| I2 | `e30905f` | `--tool` collects into an array; filter matches any repeated value; help documents repeatability. Scratch run with `--tool claude-code --tool cursor` populated both `.claude/skills` and `.cursor/skills`. |
| L3 | `39eb0d6` | Lock now carries a unique token at creation; recovery is an atomic rename-steal re-verified against the token (ENOENT/EACCES = contention; mismatch restores the displaced lock and backs off; unparseable orphans fail closed exit 3). New `apply-journal.test.mjs`: 5 rounds of two concurrent recoverers → exactly one `unit-recorded` event + verify exit 0; fresh lock never recovered; corrupt orphan fails closed. Final run: 3 pass / 0 fail. Happy-path record/idempotence/verify smoke unchanged. |
| L4 | `27aeefd` | Enabled-but-unchecked consistency gate now counts as failure (exit 1) with stderr reason. Final state: replay ×2 byte-identical, exit 0 (accuracy 1, 8/8 groups, 12/12 fixtures); scratch copy with matrix deleted exits 1 with «consistency gate failed closed». Repo reference paths untouched. |
| L5 | `f574320` | `phaseProfile` is now oneOf: empty object (`maxProperties: 0`, inherits `defaultAlias`) OR object requiring `alias`; provider/notes optional alongside alias. Focused keyword validator (scratch): `profiles.example.json` VALID; all-empty-phase doc VALID; notes-only phase INVALID (single oneOf error at that phase); provider-without-alias INVALID. |
| I1 | `8fe302d` | Neutral forms: «evalúe trade-offs» (three-js-web), «clasifique cada hallazgo» (review-policy). No semantic changes. |
| I3 | `1f3074a` | three-js-web description 368 → 245 chars; web-animation-sources 405 → 242 chars. Trigger-first wording and key keywords preserved (three.js, react-three-fiber, drei, spline / animaciones, referencias). |

## Final verification suite (post-corrections, HEAD `1f3074a`)

| Check | Result |
|---|---|
| `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` | exit 0 — 151 pass · 0 issues |
| Router smoke tests (`overlap-smoke-tests.json` fixtures via router CLI) | 12 pass / 0 fail / 12 total |
| Replay ×2 | exit 0 both runs, stdout byte-identical |
| Fail-closed proof | scratch copy without `overlap-matrix.json` → exit ≠ 0 with reason (repo refs untouched) |
| Journal concurrency test (`node --test apply-journal.test.mjs`) | 3 pass / 0 fail |
| Uninstall foreign listing (temp dir) | foreign file listed under retained block and preserved on disk |
| `git status --porcelain` | clean |

No review lifecycle actions were run beyond this ledger; nothing pushed.

## Scoped re-judgment (final)

- Judge B: clean (indings: []) — all 8 IDs verified fixed at HEAD, no fix-caused defects.
- Judge A: 2 findings — (1) WARNING fix-caused, pply-journal.mjs:173-185: residual narrow race where a slow recoverer can rename away a live writer's fresh lock during the restore window (triple interleaving recoverer+acquirer; much narrower than the original TOCTOU, which the fix correctly closes for the two-recoverer case proven by tests); (2) SUGGESTION fix-caused, install-skills.mjs:457-462: discoverForeignFiles under-lists symlink/junction foreign entries (retained but not listed).
- Disposition per protocol: single-judge WARNING/SUGGESTION are recorded as suspect/follow-up, not auto-fixed. No confirmed severe findings remain.

## Terminal verdict

- Rounds used: judgment 1 + correction 1 (8 fixes, commits 4fd6718..004809f) + scoped re-judgment.
- Confirmed severe after re-judgment: none. Suspects: 1 WARNING (journal lock triple-interleaving window), 1 SUGGESTION (symlink listing). INFO follow-ups unchanged.
- Independent gates at close: validate-skills --strict exit 0 (151 pass), worktree clean.
- **JUDGMENT: APPROVED** — emitted by the orchestrator per the judgment-day protocol, 2026-08-24. Follow-ups recorded in this ledger and Engram.
