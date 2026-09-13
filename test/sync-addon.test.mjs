import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkMirror,
  syncMirror,
  runCli,
  assertSafeMirrorRoot,
} from "../scripts/sync-addon.mjs";

/**
 * Fixture layout mirrors the real repo: the mirror lives under the catalog
 * root (inside gentle-ai-dsh/, which the canonical walk excludes).
 *
 *   <root>/canonical/
 *     00-meta/skill-a/{SKILL.md, scripts/run.mjs}
 *     01-dev/skill-b/{SKILL.md, references/guide.md}
 *     _shared/{roster.json, eval-harness.mjs (canonical-only)}
 *     gentle-ai-dsh/skills/            <- mirror
 *       skill-a/{SKILL.md (divergent), scripts/run.mjs, extra.txt}
 *       skill-c/SKILL.md               <- orphan skill
 *       docs-dir/notes.txt             <- non-skill dir (never purged)
 *       _shared/{roster.json (divergent), mirror-extra.md (mirror-only)}
 */
function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "sync-addon-test-"));
  const cat = join(root, "canonical");
  const mir = join(cat, "gentle-ai-dsh", "skills");

  // Canonical skills
  const skillADir = join(cat, "00-meta", "skill-a");
  const skillBDir = join(cat, "01-dev", "skill-b");
  mkdirSync(join(skillADir, "scripts"), { recursive: true });
  mkdirSync(join(skillBDir, "references"), { recursive: true });
  writeFileSync(join(skillADir, "SKILL.md"), "---\nname: skill-a\n---\n# Skill A\n", "utf8");
  writeFileSync(join(skillADir, "scripts", "run.mjs"), "console.log('a');\n", "utf8");
  writeFileSync(join(skillBDir, "SKILL.md"), "---\nname: skill-b\n---\n# Skill B\n", "utf8");
  writeFileSync(join(skillBDir, "references", "guide.md"), "Guide B\n", "utf8");

  // Canonical _shared: one file shared with the mirror, one canonical-only.
  mkdirSync(join(cat, "_shared"), { recursive: true });
  writeFileSync(join(cat, "_shared", "roster.json"), '{\n  "tier": "canonical"\n}\n', "utf8");
  writeFileSync(join(cat, "_shared", "eval-harness.mjs"), "// canonical only\n", "utf8");

  // Mirror: only skill-a, with an extra file and modified SKILL.md, plus an
  // orphan skill-c, a non-skill docs dir and a curated _shared.
  const mirADir = join(mir, "skill-a");
  const mirCDir = join(mir, "skill-c");
  const mirDocs = join(mir, "docs-dir");
  const mirShared = join(mir, "_shared");
  mkdirSync(join(mirADir, "scripts"), { recursive: true });
  mkdirSync(mirCDir, { recursive: true });
  mkdirSync(mirDocs, { recursive: true });
  mkdirSync(mirShared, { recursive: true });

  writeFileSync(join(mirADir, "SKILL.md"), "---\nname: skill-a\n---\n# Skill A DIVERGENT\n", "utf8");
  writeFileSync(join(mirADir, "scripts", "run.mjs"), "console.log('a');\n", "utf8");
  writeFileSync(join(mirADir, "extra.txt"), "extra\n", "utf8");
  writeFileSync(join(mirCDir, "SKILL.md"), "---\nname: skill-c\n---\n", "utf8");
  writeFileSync(join(mirDocs, "notes.txt"), "docs are not skills\n", "utf8");
  writeFileSync(join(mirShared, "roster.json"), '{\n  "tier": "stale-mirror"\n}\n', "utf8");
  writeFileSync(join(mirShared, "mirror-extra.md"), "curated addon extra\n", "utf8");

  return { root, cat, mir };
}

test("checkMirror detects missing skills, orphan skills, file and _shared divergences", () => {
  const { root, cat, mir } = makeFixture();
  try {
    const res = checkMirror(cat, mir);
    assert.equal(res.pass, false);
    assert.equal(res.totalCanonicalSkills, 2);
    assert.equal(res.totalMirrorSkills, 2); // skill-a, skill-c (docs-dir is not skill-like)

    assert.deepEqual(res.missingSkills, ["skill-b"]);
    assert.deepEqual(res.orphanSkills, ["skill-c"]);
    assert.equal(res.skillDivergences.length, 1);

    const divA = res.skillDivergences[0];
    assert.equal(divA.skillName, "skill-a");
    assert.deepEqual(divA.modified, ["SKILL.md"]);
    assert.deepEqual(divA.extraInMirror, ["extra.txt"]);
    assert.deepEqual(divA.missingInMirror, []);

    // _shared intersection: only the file present in BOTH trees is checked.
    assert.equal(res.sharedIntersection.filesChecked, 1);
    assert.deepEqual(res.sharedIntersection.divergences, ["roster.json"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("syncMirror synchronizes skills, purges skill-like orphans, and syncs the _shared intersection", () => {
  const { root, cat, mir } = makeFixture();
  try {
    const stats = syncMirror(cat, mir);
    assert.equal(stats.canonicalCount, 2);
    assert.equal(stats.createdSkills, 1); // skill-b created
    assert.equal(stats.removedOrphanSkills, 1); // skill-c removed
    assert.ok(stats.copiedFiles >= 3); // skill-a SKILL.md, skill-b SKILL.md + references/guide.md
    assert.equal(stats.deletedFiles, 1); // extra.txt deleted
    assert.equal(stats.sharedFilesChecked, 1); // roster.json in both trees
    assert.equal(stats.sharedFilesSynced, 1); // stale mirror copy refreshed

    // Orphan skill-c must be gone; the non-skill docs dir must remain.
    assert.equal(existsSync(join(mir, "skill-c")), false);
    assert.equal(existsSync(join(mir, "docs-dir", "notes.txt")), true);

    // Extra file must be gone
    assert.equal(existsSync(join(mir, "skill-a", "extra.txt")), false);

    // Skill-b must be present
    assert.ok(existsSync(join(mir, "skill-b", "SKILL.md")));
    assert.ok(existsSync(join(mir, "skill-b", "references", "guide.md")));

    // _shared: intersection corrected, mirror-only extras kept, canonical-only untouched.
    assert.equal(readFileSync(join(mir, "_shared", "roster.json"), "utf8"), readFileSync(join(cat, "_shared", "roster.json"), "utf8"));
    assert.equal(readFileSync(join(mir, "_shared", "mirror-extra.md"), "utf8"), "curated addon extra\n");
    assert.equal(existsSync(join(mir, "_shared", "eval-harness.mjs")), false, "canonical-only _shared files are not copied by intersection sync");

    // Parity check must now pass 100%
    const checkRes = checkMirror(cat, mir);
    assert.equal(checkRes.pass, true);
    assert.deepEqual(checkRes.missingSkills, []);
    assert.deepEqual(checkRes.orphanSkills, []);
    assert.deepEqual(checkRes.skillDivergences, []);
    assert.deepEqual(checkRes.sharedIntersection.divergences, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runCli exits with expected status codes", () => {
  const { root, cat, mir } = makeFixture();
  try {
    // --check fails initially
    const codeFail = runCli(["--catalog", cat, "--mirror", mir, "--check", "--json"]);
    assert.equal(codeFail, 1);

    // --write succeeds
    const codeWrite = runCli(["--catalog", cat, "--mirror", mir, "--write", "--json"]);
    assert.equal(codeWrite, 0);

    // --check succeeds after write
    const codePass = runCli(["--catalog", cat, "--mirror", mir, "--check", "--json"]);
    assert.equal(codePass, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("assertSafeMirrorRoot rejects the catalog root, its ancestors and outside paths", () => {
  const { root, cat, mir } = makeFixture();
  try {
    assert.doesNotThrow(() => assertSafeMirrorRoot(cat, mir));
    assert.throws(() => assertSafeMirrorRoot(cat, cat), /unsafe mirror root/);
    assert.throws(() => assertSafeMirrorRoot(cat, root), /unsafe mirror root/);
    assert.throws(() => assertSafeMirrorRoot(cat, join(root, "..", "elsewhere")), /unsafe mirror root/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dangerous --mirror is rejected (exit 2) before any mutation", () => {
  const { root, cat, mir } = makeFixture();
  try {
    const before = readFileSync(join(cat, "00-meta", "skill-a", "SKILL.md"), "utf8");

    // Mirror == catalog root: a write used to risk purging the whole catalog.
    const selfMirror = runCli(["--catalog", cat, "--mirror", cat, "--write"]);
    assert.equal(selfMirror, 2);
    assert.equal(readFileSync(join(cat, "00-meta", "skill-a", "SKILL.md"), "utf8"), before, "catalog untouched");

    // Mirror outside the catalog root.
    const outside = runCli(["--catalog", cat, "--mirror", join(root, "outside"), "--write"]);
    assert.equal(outside, 2);

    // Mirror dir was never created by the rejected runs.
    assert.equal(existsSync(join(root, "outside")), false);

    // Direct API guard too.
    assert.throws(() => syncMirror(cat, cat), /unsafe mirror root/);

    // The legitimate mirror is still writable after the rejected attempts.
    assert.equal(runCli(["--catalog", cat, "--mirror", mir, "--write"]), 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
