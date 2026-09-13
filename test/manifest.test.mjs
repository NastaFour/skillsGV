/**
 * WU1a — catalog manifest + generated indexes (RED-first, task 1a.4).
 *
 * Covers the catalog-manifest spec scenarios against temp fixtures:
 * - a skill added to the tree without regenerating the manifest fails the
 *   check naming the missing skill;
 * - a divergent index (SKILLS.md / AGENTS.md) fails with a summarized diff;
 * - regeneration is idempotent (second --write reports no changes);
 * - an Auto-Invoke entry pointing to an unknown skill fails the gate.
 *
 * All fixtures are OS temp dirs. The real catalog and the real home are never
 * touched; every CLI run pins the root explicitly with --root.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "00-meta-skills", "skill-registry", "scripts", "generate-indexes.mjs");

function runCli(root, args) {
  try {
    const stdout = execFileSync("node", [CLI, ...args, "--root", root, "--json"], { encoding: "utf8" });
    return { code: 0, json: JSON.parse(stdout), stdout };
  } catch (err) {
    const stdout = err.stdout ?? "";
    let json = null;
    try { json = stdout ? JSON.parse(stdout) : null; } catch { /* non-JSON output (usage errors) */ }
    return { code: err.status ?? 1, json, stdout };
  }
}

function write(p, content) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content, "utf8");
}

function writeSkill(root, relDir, name) {
  write(
    join(root, relDir, name, "SKILL.md"),
    `---\nname: ${name}\ndescription: "Fixture skill ${name}. Use when testing."\n---\n\nFixture body for ${name}.\n`
  );
}

const ROW_B = "| skill-b | [00-alpha/skill-b/SKILL.md](00-alpha/skill-b/SKILL.md) |";

function skillsMd({ count = 3 } = {}) {
  return [
    "# SKILLS.md — Índice de Skills",
    "",
    `Catálogo de **${count} skills** compatible con la spec.`,
    "",
    "## 00-alpha",
    "",
    "| Skill | Path |",
    "|---|---|",
    "| skill-a | [00-alpha/skill-a/SKILL.md](00-alpha/skill-a/SKILL.md) ← nota de a |",
    ROW_B,
    "",
    "## 01-beta",
    "",
    "| Skill | Path |",
    "|---|---|",
    "| skill-c | [01-beta/skill-c/SKILL.md](01-beta/skill-c/SKILL.md) |",
    "",
  ].join("\n");
}

function agentsMd({ alphaCell = "skill-a, skill-b" } = {}) {
  return [
    "# AGENTS.md — fixture",
    "",
    "## 📂 Categorías de Skills",
    "",
    "| Categoría | Path | Skills |",
    "|---|---|---|",
    `| Alpha | \`00-alpha/\` | ${alphaCell} |`,
    "| Beta | `01-beta/` | skill-c |",
    "",
    "## 🤖 Auto-Invoke List (root)",
    "",
    "| Acción | Skills |",
    "|---|---|",
    "| Algo de alpha | `00-alpha/skill-a` |",
    "",
  ].join("\n");
}

/** Temp catalog fixture: two categories, three skills, Tier 0 = skill-a.
 *  Both indexes carry deliberate drift (stale count, incomplete AGENTS.md cell)
 *  so a correct --write must regenerate them. */
function catalogFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "wu1a-cat-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(
    join(root, "00-meta-skills", "skill-loader", "scripts", "skills-loader.mjs"),
    'const TIER0_SKILLS = [\n  "skill-a",\n];\n'
  );
  writeSkill(root, "00-alpha", "skill-a");
  writeSkill(root, "00-alpha", "skill-b");
  writeSkill(root, "01-beta", "skill-c");
  write(join(root, "SKILLS.md"), skillsMd({ count: 2 }));
  write(join(root, "AGENTS.md"), agentsMd({ alphaCell: "skill-a" }));
  return root;
}

test("manifest: --write bootstraps catalog.json (notes, autoInvoke, Tier 0) and regenerates drifted indexes", (t) => {
  const root = catalogFixture(t);
  const w = runCli(root, ["--write"]);
  assert.equal(w.code, 0);
  assert.equal(w.json.ok, true);
  assert.equal(w.json.skills, 3);
  assert.deepEqual([...w.json.written].sort(), ["AGENTS.md", "SKILLS.md", "catalog.json"]);

  const manifest = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.totals.skills, 3);
  assert.equal(manifest.skills.length, 3);
  const byName = new Map(manifest.skills.map((s) => [s.name, s]));
  assert.equal(byName.get("skill-a").tier0, true);
  assert.equal(byName.get("skill-b").tier0, false);
  assert.equal(byName.get("skill-a").note, "← nota de a");
  assert.equal(byName.get("skill-a").autoInvoke, true);
  assert.equal(byName.get("skill-b").autoInvoke, false);
  assert.equal(byName.get("skill-c").category, "01-beta");

  // Regenerated indexes: stale count fixed, incomplete cell completed.
  const skillsOut = readFileSync(join(root, "SKILLS.md"), "utf8");
  assert.match(skillsOut, /Catálogo de \*\*3 skills\*\*/);
  const agentsOut = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.match(agentsOut, /\| Alpha \| `00-alpha\/` \| skill-a, skill-b \|/);

  const c = runCli(root, ["--check"]);
  assert.equal(c.code, 0);
  assert.equal(c.json.ok, true);
  assert.deepEqual(c.json.issues, []);
});

test("manifest: skill added to the tree without regeneration fails naming the missing skill", (t) => {
  const root = catalogFixture(t);
  assert.equal(runCli(root, ["--write"]).code, 0);

  writeSkill(root, "01-beta", "skill-c2");
  const c = runCli(root, ["--check"]);
  assert.equal(c.code, 1);
  assert.equal(c.json.ok, false);
  const missing = c.json.issues.find((i) => i.code === "skill-missing-from-manifest");
  assert.ok(missing, "check must report the skill missing from the manifest");
  assert.match(missing.detail, /skill-c2/);
  assert.match(missing.detail, /01-beta\/skill-c2\/SKILL\.md/);
});

test("manifest: divergent index fails with a summarized diff", (t) => {
  const root = catalogFixture(t);
  assert.equal(runCli(root, ["--write"]).code, 0);

  // Drift A: a hand-edited row note.
  write(join(root, "SKILLS.md"), skillsMd().replace(ROW_B, `${ROW_B} ← nota inyectada`).replace(/^Catálogo.*$/m, "Catálogo de **3 skills** compatible con la spec."));
  const a = runCli(root, ["--check"]);
  assert.equal(a.code, 1);
  const driftA = a.json.issues.filter((i) => i.code === "index-drift");
  assert.equal(driftA.length, 1);
  assert.match(driftA[0].detail, /SKILLS\.md/);
  assert.match(driftA[0].detail, /line \d+/);
  assert.match(driftA[0].detail, /expected/);
  assert.match(driftA[0].detail, /skill-b/);

  // Drift B: stale prose count.
  write(join(root, "SKILLS.md"), skillsMd({ count: 99 }));
  const b = runCli(root, ["--check"]);
  assert.equal(b.code, 1);
  const driftB = b.json.issues.find((i) => i.code === "index-drift");
  assert.match(driftB.detail, /99/);
  assert.match(driftB.detail, /3 skills/);
});

test("manifest: regeneration is idempotent (second --write makes no changes)", (t) => {
  const root = catalogFixture(t);
  assert.equal(runCli(root, ["--write"]).code, 0);
  const before = {
    skills: readFileSync(join(root, "SKILLS.md"), "utf8"),
    agents: readFileSync(join(root, "AGENTS.md"), "utf8"),
    catalog: readFileSync(join(root, "catalog.json"), "utf8"),
  };

  const again = runCli(root, ["--write"]);
  assert.equal(again.code, 0);
  assert.deepEqual(again.json.written, []);
  assert.equal(readFileSync(join(root, "SKILLS.md"), "utf8"), before.skills);
  assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8"), before.agents);
  assert.equal(readFileSync(join(root, "catalog.json"), "utf8"), before.catalog);
  assert.equal(runCli(root, ["--check"]).code, 0);
});

test("manifest: Auto-Invoke entry pointing to an unknown skill fails the gate", (t) => {
  const root = catalogFixture(t);
  assert.equal(runCli(root, ["--write"]).code, 0);

  write(
    join(root, "AGENTS.md"),
    agentsMd({ alphaCell: "skill-a, skill-b" }).replace(
      "| Algo de alpha | `00-alpha/skill-a` |",
      "| Algo de alpha | `00-alpha/skill-a` + `00-alpha/skill-zzz` |"
    )
  );

  const c = runCli(root, ["--check"]);
  assert.equal(c.code, 1);
  const unknown = c.json.issues.find((i) => i.code === "auto-invoke-unknown");
  assert.ok(unknown, "unknown Auto-Invoke reference must fail");
  assert.match(unknown.detail, /skill-zzz/);
});

test("manifest: missing catalog.json and missing AGENTS.md fail closed", (t) => {
  const root = mkdtempSync(join(tmpdir(), "wu1a-cat-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeSkill(root, "00-alpha", "skill-a");
  const c = runCli(root, ["--check"]);
  assert.equal(c.code, 1);
  assert.ok(c.json.issues.some((i) => i.code === "manifest-missing"));
  assert.ok(c.json.issues.some((i) => i.code === "agents-index-missing"));
  assert.ok(c.json.issues.some((i) => i.code === "skills-index-missing"));
});
