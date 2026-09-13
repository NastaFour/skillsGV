/**
 * WU0 — installer lifecycle fixtures (RED-first).
 *
 * Covers the three threat boundaries from the change design:
 * - documentation-like paths: only directories containing SKILL.md are skills;
 *   docs, _shared and gentle-ai-dsh are never counted.
 * - repository selection: scripts resolve the repo from their own location,
 *   never from the current working directory.
 * - commit state: staged files must stay inside the work-unit allowlist.
 *
 * All fixtures are temp dirs. The real home and the real git index are never touched.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GIT_PREFLIGHT = join(ROOT, "scripts", "git-preflight.mjs");
const CHECK_STATE = join(ROOT, "scripts", "check-install-state.mjs");

function runNode(script, args, options = {}) {
  try {
    return { code: 0, stdout: execFileSync("node", [script, ...args], { encoding: "utf8", ...options }) };
  } catch (err) {
    return { code: err.status ?? 1, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

function tempDir(t, prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function write(p, content) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content, "utf8");
}

function writeSkill(root, name) {
  write(join(root, name, "SKILL.md"), `---\nname: ${name}\n---\nbody\n`);
}

function git(dir, args) {
  return execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" });
}

/** Temp repo with a.md committed and b.md staged. */
function stagedRepo(t) {
  const repo = tempDir(t, "wu0-repo-");
  git(repo, ["init", "-q"]);
  git(repo, ["config", "user.email", "wu0@test.test"]);
  git(repo, ["config", "user.name", "wu0-test"]);
  write(join(repo, "a.md"), "a\n");
  write(join(repo, "b.md"), "b\n");
  git(repo, ["add", "a.md"]);
  git(repo, ["commit", "-q", "-m", "init"]);
  git(repo, ["add", "b.md"]);
  return repo;
}

/** Temp catalog + temp home with a single .claude runtime and an install manifest. */
function stateFixture(t, { catalogSkills, homeSkills = [], owned = [], previous = [], foreign = [] }) {
  const catalog = tempDir(t, "wu0-cat-");
  const home = tempDir(t, "wu0-home-");
  for (const name of catalogSkills) writeSkill(join(catalog, "00-test"), name);
  // Excluded material: docs dir without SKILL.md, _shared marker, addon bundle copy.
  write(join(catalog, "00-test", "docs-dir", "NOTES.md"), "docs\n");
  write(join(catalog, "_shared", "SKILL.md"), "---\nname: _shared\n---\n");
  writeSkill(join(catalog, "gentle-ai-dsh", "skills", "bundled"), "bundled");
  const runtimeRoot = join(home, ".claude", "skills");
  for (const name of [...homeSkills, ...foreign]) writeSkill(runtimeRoot, name);
  const entry = (name) => ({ dest: join(runtimeRoot, name, "SKILL.md"), src: "x", sha256: "x", prevState: "new" });
  write(
    join(home, ".skills-install", "manifest.json"),
    JSON.stringify(
      {
        version: 1,
        generation: 2,
        ts: new Date().toISOString(),
        tool: "claude-code",
        mode: "copy",
        entries: owned.map(entry),
        previousGenerations: previous.length
          ? [{ generation: 1, ts: null, tool: "claude-code", mode: "copy", entries: previous.map(entry) }]
          : [],
        history: [],
      },
      null,
      2
    )
  );
  return { catalog, home };
}

function checkJson(args) {
  const result = runNode(CHECK_STATE, [...args, "--json"]);
  return { ...result, json: result.stdout ? JSON.parse(result.stdout) : null };
}

function runtimeOf(json, id) {
  return json.runtimes.find((r) => r.id === id);
}

test("install-state: only directories with SKILL.md count; docs, _shared and gentle-ai-dsh are excluded", (t) => {
  const f = stateFixture(t, { catalogSkills: ["skill-a"], homeSkills: ["skill-a"], owned: ["skill-a"] });
  const r = checkJson(["--catalog", f.catalog, "--home", f.home, "--strict"]);
  assert.equal(r.code, 0);
  assert.equal(r.json.catalog.total, 1);
  assert.equal(r.json.summary.pass, true);
});

test("install-state: divergent count fails with runtime, expected and observed", (t) => {
  const f = stateFixture(t, { catalogSkills: ["skill-a", "skill-b"], homeSkills: ["skill-a"], owned: ["skill-a"] });
  const human = runNode(CHECK_STATE, ["--catalog", f.catalog, "--home", f.home, "--strict"]);
  assert.equal(human.code, 1);
  assert.match(human.stdout, /claude-code/);
  assert.match(human.stdout, /expected 2/i);
  assert.match(human.stdout, /observed 1/i);
  const j = checkJson(["--catalog", f.catalog, "--home", f.home, "--strict"]);
  assert.deepEqual(runtimeOf(j.json, "claude-code").missing, ["skill-b"]);
  assert.equal(j.json.summary.pass, false);
});

test("install-state: skill extracted without registration fails the gate", (t) => {
  const f = stateFixture(t, {
    catalogSkills: ["skill-a", "skill-b"],
    homeSkills: ["skill-a", "skill-b"],
    owned: ["skill-a"],
  });
  const j = checkJson(["--catalog", f.catalog, "--home", f.home, "--strict"]);
  assert.equal(j.code, 1);
  assert.deepEqual(runtimeOf(j.json, "claude-code").unregistered, ["skill-b"]);
  assert.equal(j.json.summary.pass, false);
});

test("install-state: foreign skills are info not fatal; registration in any generation counts", (t) => {
  const f = stateFixture(t, {
    catalogSkills: ["skill-a"],
    homeSkills: ["skill-a"],
    owned: [],
    previous: ["skill-a"],
    foreign: ["foreign-x"],
  });
  const j = checkJson(["--catalog", f.catalog, "--home", f.home, "--strict"]);
  assert.equal(j.code, 0);
  const rt = runtimeOf(j.json, "claude-code");
  assert.deepEqual(rt.foreign, ["foreign-x"]);
  assert.deepEqual(rt.unregistered, []);
  assert.deepEqual(rt.missing, []);
  assert.equal(j.json.summary.pass, true);
});

test("git-preflight: staged files outside the allowlist fail", (t) => {
  const repo = stagedRepo(t);
  const r = runNode(GIT_PREFLIGHT, ["--repo", repo, "--paths", "a.md", "--json"]);
  assert.equal(r.code, 1);
  const j = JSON.parse(r.stdout);
  assert.deepEqual(j.extras, ["b.md"]);
  assert.deepEqual(j.missing, ["a.md"]);
});

test("git-preflight: matching stage passes; pending allowlist entries need --allow-partial", (t) => {
  const repo = stagedRepo(t);
  assert.equal(runNode(GIT_PREFLIGHT, ["--repo", repo, "--paths", "b.md"]).code, 0);
  assert.equal(runNode(GIT_PREFLIGHT, ["--repo", repo, "--paths", "b.md,c.md"]).code, 1);
  assert.equal(runNode(GIT_PREFLIGHT, ["--repo", repo, "--paths", "b.md,c.md", "--allow-partial"]).code, 0);
});

test("git-preflight: resolves the repository from the script location, never from cwd", (t) => {
  const repo = stagedRepo(t);
  const r = runNode(GIT_PREFLIGHT, ["--paths", "x.md", "--allow-partial", "--json"], { cwd: repo });
  const j = JSON.parse(r.stdout);
  assert.equal(j.repo, ROOT);
  assert.notEqual(j.repo, repo);
});
