import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  checkMirror,
  syncMirror,
  runCli,
  walkFilesRecursive,
} from "../scripts/sync-addon.mjs";

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "sync-addon-test-"));
  const cat = join(root, "canonical");
  const mir = join(root, "mirror");

  // Create a minimal canonical catalog: category/skill-a, category/skill-b
  const skillADir = join(cat, "00-meta", "skill-a");
  const skillBDir = join(cat, "01-dev", "skill-b");
  mkdirSync(join(skillADir, "scripts"), { recursive: true });
  mkdirSync(join(skillBDir, "references"), { recursive: true });

  writeFileSync(join(skillADir, "SKILL.md"), "---\nname: skill-a\n---\n# Skill A\n", "utf8");
  writeFileSync(join(skillADir, "scripts", "run.mjs"), "console.log('a');\n", "utf8");
  writeFileSync(join(skillBDir, "SKILL.md"), "---\nname: skill-b\n---\n# Skill B\n", "utf8");
  writeFileSync(join(skillBDir, "references", "guide.md"), "Guide B\n", "utf8");

  // Mirror starts with only skill-a, but with an extra file and modified SKILL.md, plus an orphan skill-c and _shared
  const mirADir = join(mir, "skill-a");
  const mirCDir = join(mir, "skill-c");
  const mirShared = join(mir, "_shared");
  mkdirSync(join(mirADir, "scripts"), { recursive: true });
  mkdirSync(mirCDir, { recursive: true });
  mkdirSync(mirShared, { recursive: true });

  writeFileSync(join(mirADir, "SKILL.md"), "---\nname: skill-a\n---\n# Skill A DIVERGENT\n", "utf8");
  writeFileSync(join(mirADir, "scripts", "run.mjs"), "console.log('a');\n", "utf8");
  writeFileSync(join(mirADir, "extra.txt"), "extra\n", "utf8");
  writeFileSync(join(mirCDir, "SKILL.md"), "---\nname: skill-c\n---\n", "utf8");
  writeFileSync(join(mirShared, "support.txt"), "support shared resource\n", "utf8");

  return { root, cat, mir };
}

test("checkMirror detects missing skills, orphan skills, and file divergences", () => {
  const { root, cat, mir } = makeFixture();
  try {
    const res = checkMirror(cat, mir);
    assert.equal(res.pass, false);
    assert.equal(res.totalCanonicalSkills, 2);
    assert.equal(res.totalMirrorSkills, 2); // skill-a, skill-c (_shared excluded)

    assert.deepEqual(res.missingSkills, ["skill-b"]);
    assert.deepEqual(res.orphanSkills, ["skill-c"]);
    assert.equal(res.skillDivergences.length, 1);

    const divA = res.skillDivergences[0];
    assert.equal(divA.skillName, "skill-a");
    assert.deepEqual(divA.modified, ["SKILL.md"]);
    assert.deepEqual(divA.extraInMirror, ["extra.txt"]);
    assert.deepEqual(divA.missingInMirror, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("syncMirror synchronizes skills, deletes extra files and orphans, and preserves _shared", () => {
  const { root, cat, mir } = makeFixture();
  try {
    const stats = syncMirror(cat, mir);
    assert.equal(stats.canonicalCount, 2);
    assert.equal(stats.createdSkills, 1); // skill-b created
    assert.equal(stats.removedOrphanSkills, 1); // skill-c removed
    assert.ok(stats.copiedFiles >= 3); // skill-a SKILL.md, skill-b SKILL.md + references/guide.md
    assert.equal(stats.deletedFiles, 1); // extra.txt deleted

    // _shared must stay intact
    assert.ok(existsSync(join(mir, "_shared", "support.txt")));
    assert.equal(readFileSync(join(mir, "_shared", "support.txt"), "utf8"), "support shared resource\n");

    // Orphan skill-c must be gone
    assert.equal(existsSync(join(mir, "skill-c")), false);

    // Extra file must be gone
    assert.equal(existsSync(join(mir, "skill-a", "extra.txt")), false);

    // Skill-b must be present
    assert.ok(existsSync(join(mir, "skill-b", "SKILL.md")));
    assert.ok(existsSync(join(mir, "skill-b", "references", "guide.md")));

    // Parity check must now pass 100%
    const checkRes = checkMirror(cat, mir);
    assert.equal(checkRes.pass, true);
    assert.deepEqual(checkRes.missingSkills, []);
    assert.deepEqual(checkRes.orphanSkills, []);
    assert.deepEqual(checkRes.skillDivergences, []);
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
