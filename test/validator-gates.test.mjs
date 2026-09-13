/**
 * WU3a — validator quality gates (RED-first, task 3a.1).
 *
 * Covers the new rules of the skill-quality-gates spec against temp fixtures
 * (never the real catalog nor the home directory):
 * - 500-line SKILL.md body budget (strict error past it, exact limit passes);
 * - Tier 0 token budget (warning, run stays green);
 * - SKILL.md token guidance (non-blocking guidance);
 * - description exclusion clause (non-blocking advisory);
 * - script audit on scripts/ and bin/ only, with frontmatter allowlists;
 * - requires-mcp declaration rules and mcp-manifest.json parity;
 * - --check-deps dependency resolution (runs only under the flag);
 * - manifest-* catalog checks delegated to _shared/catalog-manifest.mjs.
 *
 * All fixtures are OS temp dirs; every CLI run pins the fixture root as the
 * target path, so the real catalog is never modified or scanned.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VALIDATOR = join(ROOT, "00-meta-skills", "skill-validator", "scripts", "validate-skills.mjs");
const GENERATOR = join(ROOT, "00-meta-skills", "skill-registry", "scripts", "generate-indexes.mjs");

function makeRoot(t) {
  const root = mkdtempSync(join(tmpdir(), "wu3a-gates-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(p, content) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content, "utf8");
}

/** Minimal valid skill: required fields, no warnings (strict-clean by default). */
function skillFixture(root, { dir = "00-alpha", name = "skill-a", desc = "Fixture skill. Use when testing.", extraFront = "", body = null, bodyLines = null } = {}) {
  const text = body ?? `${Array.from({ length: bodyLines ?? 1 }, (_, i) => `Fixture body line ${i + 1}.`).join("\n")}\n`;
  const lines = [`---`, `name: ${name}`, `description: "${desc}"`, `allowed-tools: Read`];
  if (extraFront) lines.push(extraFront.replace(/\n$/, ""));
  lines.push(`---`, text);
  write(join(root, dir, name, "SKILL.md"), lines.join("\n"));
}

function runValidator(root, flags = []) {
  try {
    const stdout = execFileSync("node", [VALIDATOR, root, "--json", ...flags], { encoding: "utf8" });
    return { code: 0, json: JSON.parse(stdout), stdout };
  } catch (err) {
    const stdout = err.stdout ?? "";
    let json = null;
    try { json = stdout ? JSON.parse(stdout) : null; } catch { /* non-JSON output */ }
    return { code: err.status ?? 1, json, stdout };
  }
}

const issuesOf = (json) => (json?.results ?? []).flatMap((r) => r.issues.map((i) => ({ ...i, file: r.file })));
const findIssue = (json, check) => issuesOf(json).find((i) => i.check === check);
const findIssues = (json, check) => issuesOf(json).filter((i) => i.check === check);

test("skill-lines-budget: 501 body lines fail strict; exactly 500 passes", (t) => {
  const over = makeRoot(t);
  skillFixture(over, { bodyLines: 501 });
  const r1 = runValidator(over, ["--strict", "--skip-index-sync"]);
  assert.equal(r1.code, 1, r1.stdout);
  const hit = findIssue(r1.json, "skill-lines-budget");
  assert.ok(hit, "501-line body must raise skill-lines-budget");
  assert.match(hit.msg, /501/);
  assert.match(hit.msg, /500/);

  const exact = makeRoot(t);
  skillFixture(exact, { bodyLines: 500 });
  const r2 = runValidator(exact, ["--strict", "--skip-index-sync"]);
  assert.equal(r2.code, 0, r2.stdout);
  assert.equal(findIssue(r2.json, "skill-lines-budget"), undefined);
});

test("tier0-token-budget: over ~2K estimated tokens warns without failing the run", (t) => {
  const root = makeRoot(t);
  skillFixture(root);
  write(join(root, "00-meta-skills", "skill-loader", "tier0-context.md"), "x".repeat(9000));
  const r = runValidator(root, ["--skip-index-sync"]);
  assert.equal(r.code, 0, r.stdout);
  const hit = findIssue(r.json, "tier0-token-budget");
  assert.ok(hit, "over-budget Tier 0 context must emit a warning");
  assert.equal(hit.severity, "warning");
  assert.match(hit.msg, /2048/);
});

test("skill-token-guidance: SKILL.md over ~5K tokens is non-blocking guidance", (t) => {
  const root = makeRoot(t);
  skillFixture(root, { body: `${"z".repeat(21000)}\n` });
  const r = runValidator(root, ["--strict", "--skip-index-sync"]);
  assert.equal(r.code, 0, r.stdout);
  const hit = findIssue(r.json, "skill-token-guidance");
  assert.ok(hit, "over-budget SKILL.md must emit guidance");
  assert.equal(hit.severity, "info");
});

test("desc-exclusion: missing exclusion marker is advisory; the marker silences it", (t) => {
  const missing = makeRoot(t);
  skillFixture(missing, { desc: "Fixture skill. Use when testing." });
  const r1 = runValidator(missing, ["--strict", "--skip-index-sync"]);
  assert.equal(r1.code, 0, r1.stdout);
  const hit = findIssue(r1.json, "desc-exclusion");
  assert.ok(hit, "description without an exclusion clause must be flagged");
  assert.equal(hit.severity, "info");

  const withMarker = makeRoot(t);
  skillFixture(withMarker, { desc: "Fixture skill. Use when testing. Do NOT use for production." });
  const r2 = runValidator(withMarker, ["--strict", "--skip-index-sync"]);
  assert.equal(r2.code, 0, r2.stdout);
  assert.equal(findIssue(r2.json, "desc-exclusion"), undefined);
});

test("script-audit: curl in scripts/ fails; curl in references/ is not code", (t) => {
  const root = makeRoot(t);
  skillFixture(root);
  write(join(root, "00-alpha", "skill-a", "scripts", "x.mjs"), 'const cmd = "curl https://example.com";\nexport const run = () => cmd;\n');
  write(join(root, "00-alpha", "skill-a", "references", "x.md"), "Docs may mention curl; fenced docs are not audited.\n");
  const r = runValidator(root, ["--skip-index-sync"]);
  assert.equal(r.code, 1, r.stdout);
  const hits = findIssues(r.json, "script-audit");
  assert.equal(hits.length, 1);
  assert.match(hits[0].msg, /scripts[\\/]x\.mjs/);
  assert.match(hits[0].msg, /curl/);
  assert.equal(hits[0].severity, "error");
});

test("script-audit: child_process errors without allowlist; allows-script-exec demotes to info", (t) => {
  const script = 'import { execFileSync } from "node:child_process";\nexport const run = () => execFileSync("node", ["--version"]);\n';

  const bare = makeRoot(t);
  skillFixture(bare);
  write(join(bare, "00-alpha", "skill-a", "scripts", "run.mjs"), script);
  const r1 = runValidator(bare, ["--strict", "--skip-index-sync"]);
  assert.equal(r1.code, 1, r1.stdout);
  assert.equal(findIssue(r1.json, "script-audit").severity, "error");

  const allowed = makeRoot(t);
  skillFixture(allowed, { extraFront: 'allows-script-exec: "spawns the tool CLI by design"' });
  write(join(allowed, "00-alpha", "skill-a", "scripts", "run.mjs"), script);
  const r2 = runValidator(allowed, ["--strict", "--skip-index-sync"]);
  assert.equal(r2.code, 0, r2.stdout);
  const hit = findIssue(r2.json, "script-audit");
  assert.ok(hit, "justified child_process must still be reported");
  assert.equal(hit.severity, "info");
});

test("requires-mcp: top-level rejected, fallback required, manifest parity enforced", (t) => {
  const top = makeRoot(t);
  skillFixture(top, { extraFront: 'requires-mcp: ["figma"]' });
  const r1 = runValidator(top, ["--skip-index-sync"]);
  assert.equal(r1.code, 1, r1.stdout);
  assert.ok(findIssue(r1.json, "requires-mcp-top-level"), "top-level requires-mcp must be rejected");

  const noFallback = makeRoot(t);
  skillFixture(noFallback, { extraFront: 'metadata:\n  trigger: ["x"]\n  requires-mcp: ["figma"]' });
  const r2 = runValidator(noFallback, ["--skip-index-sync"]);
  assert.equal(r2.code, 1, r2.stdout);
  assert.ok(findIssue(r2.json, "requires-mcp-fallback-missing"), "metadata.requires-mcp without mcp-fallback must fail");

  const valid = makeRoot(t);
  skillFixture(valid, { extraFront: 'metadata:\n  trigger: ["x"]\n  requires-mcp: ["figma"]\n  mcp-fallback: "static export -> degrade -> pipeline continues"' });
  write(join(valid, "mcp-manifest.json"), JSON.stringify({ version: 1, servers: { figma: { purpose: "x", requiredBy: ["skill-a"] } } }, null, 2));
  const r3 = runValidator(valid, ["--strict", "--skip-index-sync"]);
  assert.equal(r3.code, 0, r3.stdout);
  assert.equal(findIssue(r3.json, "requires-mcp-parity"), undefined);

  const broken = makeRoot(t);
  skillFixture(broken, { extraFront: 'metadata:\n  trigger: ["x"]\n  requires-mcp: ["figma"]\n  mcp-fallback: "static export -> degrade -> pipeline continues"' });
  write(join(broken, "mcp-manifest.json"), JSON.stringify({ version: 1, servers: { figma: { purpose: "x", requiredBy: ["other-skill"] } } }, null, 2));
  const r4 = runValidator(broken, ["--skip-index-sync"]);
  assert.equal(r4.code, 1, r4.stdout);
  assert.ok(findIssue(r4.json, "requires-mcp-parity"), "manifest parity mismatch must fail");
});

test("--check-deps: reports skill, dependency and cause; never runs without the flag", (t) => {
  const root = makeRoot(t);
  skillFixture(root, { extraFront: 'metadata:\n  trigger: ["x"]\n  requires: ["env:WU3A_DEFINITELY_UNSET", "bin:wu3a-not-a-real-bin"]' });

  const off = runValidator(root, ["--skip-index-sync"]);
  assert.equal(off.code, 0, off.stdout);
  assert.equal(findIssue(off.json, "check-deps"), undefined);

  const on = runValidator(root, ["--skip-index-sync", "--check-deps"]);
  assert.equal(on.code, 1, on.stdout);
  const hits = findIssues(on.json, "check-deps");
  assert.equal(hits.length, 2);
  assert.ok(hits.some((h) => /skill-a/.test(h.msg) && /env:WU3A_DEFINITELY_UNSET/.test(h.msg) && /not set/.test(h.msg)), "must report skill, dependency and cause");
  assert.ok(hits.some((h) => /bin:wu3a-not-a-real-bin/.test(h.msg)));

  const satisfied = makeRoot(t);
  skillFixture(satisfied, { extraFront: 'metadata:\n  trigger: ["x"]\n  requires: ["node:>=0"]' });
  const ok = runValidator(satisfied, ["--skip-index-sync", "--check-deps"]);
  assert.equal(ok.code, 0, ok.stdout);
});

// --- manifest-* and prose counts ---------------------------------------------

function skillsIndexMd() {
  return [
    "# SKILLS.md — fixture",
    "",
    "Catálogo de **2 skills** compatible.",
    "",
    "## 00-alpha",
    "",
    "| Skill | Path |",
    "|---|---|",
    "| skill-a | [00-alpha/skill-a/SKILL.md](00-alpha/skill-a/SKILL.md) |",
    "",
    "## 01-beta",
    "",
    "| Skill | Path |",
    "|---|---|",
    "| skill-b | [01-beta/skill-b/SKILL.md](01-beta/skill-b/SKILL.md) |",
    "",
  ].join("\n");
}

function agentsIndexMd() {
  return [
    "# AGENTS.md — fixture",
    "",
    "| Categoría | Path | Skills |",
    "|---|---|---|",
    "| Alpha | `00-alpha/` | skill-a |",
    "| Beta | `01-beta/` | skill-b |",
    "",
    "## 🤖 Auto-Invoke List (root)",
    "",
    "| Acción | Skills |",
    "|---|---|",
    "| Algo de alpha | `00-alpha/skill-a` |",
    "",
  ].join("\n");
}

function manifestFixture(t) {
  const root = makeRoot(t);
  skillFixture(root, { dir: "00-alpha", name: "skill-a" });
  skillFixture(root, { dir: "01-beta", name: "skill-b" });
  write(join(root, "00-meta-skills", "skill-loader", "scripts", "skills-loader.mjs"), 'const TIER0_SKILLS = [\n  "skill-a",\n];\n');
  write(join(root, "SKILLS.md"), skillsIndexMd());
  write(join(root, "AGENTS.md"), agentsIndexMd());
  execFileSync("node", [GENERATOR, "--write", "--root", root], { encoding: "utf8" });
  return root;
}

test("manifest-*: consistent catalog is clean; tree drift and unknown Auto-Invoke fail", (t) => {
  const root = manifestFixture(t);

  const clean = runValidator(root, []);
  const manifestIssues = issuesOf(clean.json).filter((i) => i.check.startsWith("manifest-"));
  assert.deepEqual(manifestIssues.map((i) => i.check), [], "consistent fixture must not raise manifest-* issues");

  skillFixture(root, { dir: "01-beta", name: "skill-c" });
  const drift = runValidator(root, []);
  assert.equal(drift.code, 1, drift.stdout);
  const missing = findIssue(drift.json, "manifest-skill-missing");
  assert.ok(missing, "tree skill missing from the manifest must fail");
  assert.match(missing.msg, /skill-c/);

  const autoRoot = manifestFixture(t);
  write(join(autoRoot, "AGENTS.md"), agentsIndexMd().replace("| Algo de alpha | `00-alpha/skill-a` |", "| Algo de alpha | `00-alpha/skill-a` + `00-alpha/skill-zzz` |"));
  const auto = runValidator(autoRoot, []);
  assert.equal(auto.code, 1, auto.stdout);
  const unknown = findIssue(auto.json, "manifest-auto-invoke-unknown");
  assert.ok(unknown, "Auto-Invoke reference outside the manifest must fail");
  assert.match(unknown.msg, /skill-zzz/);
});

test("manifest-prose-count: docs declaring a divergent total fail naming doc, declared and real", (t) => {
  const root = makeRoot(t);
  skillFixture(root);
  write(join(root, "README.md"), "Catálogo de **150 skills** conforme a la especificación.\n");
  write(join(root, "openspec", "config.yaml"), "context: |\n  Proyecto: fixture (catálogo de 151 skills)\n");

  const r = runValidator(root, []);
  assert.equal(r.code, 1, r.stdout);
  const hits = findIssues(r.json, "manifest-prose-count");
  assert.ok(hits.some((h) => /README\.md/.test(h.msg) && /150/.test(h.msg) && /has 1\b/.test(h.msg)), "README drift must name doc, declared and real counts");
  assert.ok(hits.some((h) => /config\.yaml/.test(h.msg) && /151/.test(h.msg)));
});
