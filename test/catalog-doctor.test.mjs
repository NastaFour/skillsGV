/**
 * test/catalog-doctor.test.mjs — Unified Catalog Doctor test suite
 *
 * Requirements (spec: catalog-doctor):
 * - PASS exit 0 when all diagnostic checks pass.
 * - FAIL actionable exit != 0 when any check fails, naming the check and the cause.
 * - Read-only invariant: no filesystem or manifest mutation occurs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { DOCTOR_COMMAND_TABLE, ROOT_SCOPE } from "../00-meta-skills/catalog-doctor/scripts/catalog-doctor.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(__dirname, "..");
export const DOCTOR_CLI = join(
  REPO_ROOT,
  "00-meta-skills",
  "catalog-doctor",
  "scripts",
  "catalog-doctor.mjs"
);

function runDoctor(args = [], cwd = REPO_ROOT) {
  try {
    const stdout = execFileSync("node", [DOCTOR_CLI, ...args], {
      cwd,
      encoding: "utf8",
      env: { ...process.env },
    });
    return { code: 0, stdout, error: null };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      error: err,
    };
  }
}

function runDoctorJson(args = [], cwd = REPO_ROOT) {
  const res = runDoctor([...args, "--json"], cwd);
  try {
    res.json = JSON.parse(res.stdout);
  } catch {
    res.json = null;
  }
  return res;
}

function hashDirectory(dir) {
  const hashes = new Map();
  function walk(curr) {
    for (const entry of readdirSync(curr, { withFileTypes: true })) {
      const full = join(curr, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const content = readFileSync(full);
        const hash = createHash("sha256").update(content).digest("hex");
        hashes.set(full, hash);
      }
    }
  }
  walk(dir);
  return hashes;
}

function makeFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "catalog-doctor-test-"));
  t.after(() => {
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {}
  });
  return root;
}

function setupValidFixture(root) {
  // Minimal fixture with valid skill, mcp-manifest.json, SKILLS.md, AGENTS.md, catalog.json
  const figmaDir = join(root, "11-mcp-hybrid", "figma-mcp");
  mkdirSync(figmaDir, { recursive: true });
  writeFileSync(
    join(figmaDir, "SKILL.md"),
    `---
name: figma-mcp
description: "Trigger: figma mcp. Inspect Figma files. Use when reading design. Do NOT use for coding."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  trigger: ["figma mcp"]
  scope: [global]
  version: "1.0.0"
  requires-mcp: ["figma"]
  mcp-fallback: "Servidor ausente -> export estatico -> limite: sin nodos; pipeline no falla"
---
# Figma MCP
Fixture content.
`,
    "utf8"
  );

  writeFileSync(
    join(root, "mcp-manifest.json"),
    JSON.stringify(
      {
        version: 1,
        servers: {
          figma: {
            purpose: "Inspect design context",
            install: "figma --url https://mcp.figma.com/mcp",
            spec: "https://mcp.figma.com/mcp",
            requiredBy: ["figma-mcp"],
          },
        },
      },
      null,
      2
    ),
    "utf8"
  );

  return root;
}

function writeSkillFile(root, relDir, name, body) {
  const dir = join(root, relDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "SKILL.md"),
    `---
name: ${name}
description: "Trigger: fixture. Use when testing reference integrity. Do NOT use in production."
license: MIT
allowed-tools: Read
metadata:
  trigger: ["fixture"]
  version: "1.0.0"
---
${body}
`,
    "utf8"
  );
  return dir;
}

test("catalog-doctor CLI: exposes --help and reports options", () => {
  const res = runDoctor(["--help"]);
  assert.equal(res.code, 0);
  assert.match(res.stdout, /catalog-doctor/i);
  assert.match(res.stdout, /--root/);
  assert.match(res.stdout, /--json/);
  assert.match(res.stdout, /--check/);
  // Root scope is documented explicitly, including the catalog-fixed checks.
  assert.match(res.stdout, /Root scope/);
  assert.match(res.stdout, /--root does not relocate/);
});

test("catalog-doctor: every check declares its root scope; catalog-fixed ones carry an explicit note", () => {
  const byId = new Map(DOCTOR_COMMAND_TABLE.map((c) => [c.id, c]));
  for (const id of ["validator-strict", "manifest-consistency", "dependency-check", "mcp-parity", "skill-references"]) {
    assert.equal(byId.get(id).rootScope, ROOT_SCOPE.TARGET, `${id} must honor --root`);
  }
  for (const id of ["installer-dryrun", "loader-status"]) {
    assert.equal(byId.get(id).rootScope, ROOT_SCOPE.CATALOG, `${id} is catalog-fixed`);
    assert.match(byId.get(id).rootNote, /--root does not relocate/, `${id} must document the limitation`);
  }
});

test("catalog-doctor: executes 7 checks and outputs structured results", () => {
  const res = runDoctorJson(["--root", REPO_ROOT]);
  assert.ok(res.json, "Expected valid JSON output: " + res.stdout);
  assert.equal(typeof res.json.ok, "boolean");
  assert.equal(res.json.totalChecks, 7);
  assert.ok(Array.isArray(res.json.checks));
  assert.equal(res.json.checks.length, 7);

  const checkIds = res.json.checks.map((c) => c.id);
  assert.deepEqual(checkIds, [
    "validator-strict",
    "installer-dryrun",
    "loader-status",
    "manifest-consistency",
    "dependency-check",
    "mcp-parity",
    "skill-references",
  ]);
  // Each result carries the root scope; catalog-fixed checks explain themselves.
  for (const check of res.json.checks) {
    assert.ok(check.rootScope, `${check.id} must report rootScope`);
  }
  for (const id of ["installer-dryrun", "loader-status"]) {
    assert.match(res.json.checks.find((c) => c.id === id).rootNote, /--root does not relocate/);
  }
});

test("catalog-doctor: real catalog run passes every check (strict gate)", () => {
  const res = runDoctorJson(["--root", REPO_ROOT]);
  assert.equal(res.code, 0, `Expected all checks green: ${res.stdout}`);
  assert.equal(res.json.ok, true);
  assert.equal(res.json.totalChecks, 7);
  assert.equal(res.json.passed, 7);
  assert.equal(res.json.failed, 0);
  for (const check of res.json.checks) {
    assert.equal(check.pass, true, `${check.id} must pass: ${check.cause || ""}`);
  }
  assert.equal(res.json.passed + res.json.failed, res.json.totalChecks);
});

test("catalog-doctor: FAIL actionable exit != 0 when manifest consistency fails", (t) => {
  const root = makeFixture(t);
  setupValidFixture(root);

  // Intentionally add an unindexed skill to trigger manifest consistency failure
  const orphanDir = join(root, "00-meta-skills", "unindexed-skill");
  mkdirSync(orphanDir, { recursive: true });
  writeFileSync(
    join(orphanDir, "SKILL.md"),
    `---
name: unindexed-skill
description: "Trigger: unindexed. Use when testing. Do NOT use in production."
license: MIT
allowed-tools: Read
metadata:
  trigger: ["unindexed"]
  version: "1.0.0"
---
# Unindexed
`,
    "utf8"
  );

  const res = runDoctorJson(["--root", root, "--check", "manifest-consistency"]);
  assert.notEqual(res.code, 0);
  assert.equal(res.json.ok, false);
  const manifestCheck = res.json.checks.find((c) => c.id === "manifest-consistency");
  assert.ok(manifestCheck);
  assert.equal(manifestCheck.pass, false);
  assert.ok(manifestCheck.cause, "Expected actionable cause for failure");
});

test("catalog-doctor: FAIL actionable exit != 0 when MCP parity fails", (t) => {
  const root = makeFixture(t);
  setupValidFixture(root);

  // Break parity: server lists a skill that does not declare requires-mcp
  writeFileSync(
    join(root, "mcp-manifest.json"),
    JSON.stringify(
      {
        version: 1,
        servers: {
          figma: {
            purpose: "Inspect design context",
            requiredBy: ["non-existent-skill"],
          },
        },
      },
      null,
      2
    ),
    "utf8"
  );

  const res = runDoctorJson(["--root", root, "--check", "mcp-parity"]);
  assert.notEqual(res.code, 0);
  assert.equal(res.json.ok, false);
  const mcpCheck = res.json.checks.find((c) => c.id === "mcp-parity");
  assert.ok(mcpCheck);
  assert.equal(mcpCheck.pass, false);
  assert.match(mcpCheck.cause, /parity|non-existent-skill/i);
});

test("catalog-doctor: read-only invariant (no files or manifest mutated)", (t) => {
  const beforeHashes = hashDirectory(REPO_ROOT);
  const res = runDoctor(["--root", REPO_ROOT]);
  // The gate is strict: the real catalog must be fully green.
  assert.equal(res.code, 0, `Expected doctor exit 0 on the real catalog: ${res.stdout}`);
  const afterHashes = hashDirectory(REPO_ROOT);

  // Compare hashes
  assert.equal(
    beforeHashes.size,
    afterHashes.size,
    "File count changed during doctor execution"
  );
  for (const [path, hash] of beforeHashes) {
    const afterHash = afterHashes.get(path);
    assert.equal(afterHash, hash, `File mutated by doctor: ${path}`);
  }
});

test("catalog-doctor skill-references: healthy skill passes when links and backtick paths exist", (t) => {
  const root = makeFixture(t);
  const dir = writeSkillFile(
    root,
    join("01-cat", "healthy-skill"),
    "healthy-skill",
    "Read [the reference](references/x.md) and run `scripts/helper.mjs`."
  );
  mkdirSync(join(dir, "references"), { recursive: true });
  writeFileSync(join(dir, "references", "x.md"), "# X\n", "utf8");
  mkdirSync(join(dir, "scripts"), { recursive: true });
  writeFileSync(join(dir, "scripts", "helper.mjs"), "// helper\n", "utf8");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
  const check = res.json.checks[0];
  assert.equal(check.id, "skill-references");
  assert.equal(check.pass, true);
});

test("catalog-doctor skill-references: dangling link fails naming path and owning SKILL.md", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("02-cat", "ghost-skill"),
    "ghost-skill",
    "Run [the helper](scripts/missing.mjs) to continue."
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0);
  const check = res.json.checks[0];
  assert.equal(check.pass, false);
  assert.match(check.cause, /scripts\/missing\.mjs/);
  assert.match(check.cause, /ghost-skill\/SKILL\.md/);
});

test("catalog-doctor skill-references: dangling backtick path fails naming the path", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("03-cat", "backtick-skill"),
    "backtick-skill",
    "Run `scripts/missing-helper.mjs --json` before release."
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0);
  const check = res.json.checks[0];
  assert.equal(check.pass, false);
  assert.match(check.cause, /scripts\/missing-helper\.mjs/);
});

test("catalog-doctor skill-references: URLs, anchors and placeholder paths do not produce findings", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("04-cat", "clean-skill"),
    "clean-skill",
    [
      "See [the docs](https://example.com/guide.md).",
      "See [the anchor](#local-anchor).",
      "Mail [the team](mailto:team@example.com).",
      "Write output to `design-artifacts/<project>/design-dna.md`.",
      "Home installs live under `~/.config/opencode/skills/clean-skill/SKILL.md`.",
      "Template example:",
      "```markdown",
      "[Related skill 1](../category/related/SKILL.md)",
      "```",
    ].join("\n") + "\n"
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
  const check = res.json.checks[0];
  assert.equal(check.pass, true);
});

test("catalog-doctor: --check skill-references filters to just this check", (t) => {
  const root = makeFixture(t);
  writeSkillFile(root, join("05-cat", "only-skill"), "only-skill", "No references here.");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0);
  assert.equal(res.json.totalChecks, 1);
  assert.equal(res.json.checks.length, 1);
  assert.equal(res.json.checks[0].id, "skill-references");
});

test("catalog-doctor skill-references: dot-relative code examples are skipped", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("06-cat", "dot-relative-skill"),
    "dot-relative-skill",
    "Import the pool first: `import db from './db.js'` before querying."
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
});

test("catalog-doctor skill-references: target-project dotdirs and placeholder segments are skipped", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("07-cat", "target-layout-skill"),
    "target-layout-skill",
    [
      "Register the server in `.cursor/mcp.json` for Cursor.",
      "Add a release entry under `.changeset/config.json`.",
      "Write daily notes to `.sessions/YYYY-MM-DD.md`.",
      "Archive review copies under `archive/YYYY-MM-DD/review.md`.",
    ].join("\n") + "\n"
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
});

test("catalog-doctor skill-references: catalog-owned .github paths are still validated", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("08-cat", "workflow-skill"),
    "workflow-skill",
    "The gate runs in `.github/workflows/ci.yml`."
  );

  const bad = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(bad.code, 0, "a missing file under the catalog-owned .github must still fail");
  assert.match(bad.json.checks[0].cause, /\.github\/workflows\/ci\.yml/);

  mkdirSync(join(root, ".github", "workflows"), { recursive: true });
  writeFileSync(join(root, ".github", "workflows", "ci.yml"), "name: CI\n", "utf8");

  const good = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(good.code, 0, `Expected clean pass: ${good.stdout} ${good.stderr}`);
});

test("catalog-doctor skill-references: install-layout skills/ prefix resolves from repo root", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("09-cat", "install-layout-skill"),
    "install-layout-skill",
    "Shared resolver contract: `skills/_shared/skill-resolver.md`."
  );
  mkdirSync(join(root, "_shared"), { recursive: true });
  writeFileSync(join(root, "_shared", "skill-resolver.md"), "# Resolver\n", "utf8");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
});

test("catalog-doctor skill-references: catalog-wide suffix search resolves unique basenames", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("10-cat", "professional-planner"),
    "professional-planner",
    "See `project-tracker/SKILL.md` for the ledger format."
  );
  writeSkillFile(root, join("10-cat", "project-tracker"), "project-tracker", "Ledger structure.");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
});

test("catalog-doctor skill-references: dangling TypeScript reference is detected (extended extensions)", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("11-cat", "ts-ref-skill"),
    "ts-ref-skill",
    "Run `scripts/missing-helper.ts` before release."
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0);
  assert.match(res.json.checks[0].cause, /scripts\/missing-helper\.ts/);
});

test("catalog-doctor skill-references: two runs produce byte-identical output with sorted findings", (t) => {
  const root = makeFixture(t);
  // Created in reverse order on purpose: reported findings must be sorted, not filesystem-ordered.
  writeSkillFile(root, join("20-cat", "z-skill"), "z-skill", "Missing `scripts/zz.mjs`.");
  writeSkillFile(root, join("10-cat", "a-skill"), "a-skill", "Missing `scripts/aa.mjs`.");

  const first = runDoctorJson(["--root", root, "--check", "skill-references"]);
  const second = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(first.code, 0);
  assert.equal(first.stdout, second.stdout, "consecutive runs must be byte-identical");

  const cause = first.json.checks[0].cause;
  assert.ok(
    cause.indexOf("a-skill/SKILL.md") < cause.indexOf("z-skill/SKILL.md"),
    `findings must be sorted by skill then path: ${cause}`
  );
});

test("catalog-doctor skill-references: target-project application source roots are skipped", (t) => {
  const root = makeFixture(t);
  writeSkillFile(
    root,
    join("12-cat", "app-layout-skill"),
    "app-layout-skill",
    [
      "Define the contract in `packages/contracts/src/location.ts` (Zod schema + inferred type).",
      "Keep the root route in `app/page.tsx`.",
      "Check a single file with `src/lib/api.ts`.",
    ].join("\n") + "\n"
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout} ${res.stderr}`);
});

test("catalog-doctor skill-references: skill-local scripts/ path does not resolve via an unrelated skill", (t) => {
  const root = makeFixture(t);
  const skillA = writeSkillFile(root, join("13-cat", "skill-a"), "skill-a", "Owns [the helper](scripts/helper.mjs).");
  mkdirSync(join(skillA, "scripts"), { recursive: true });
  writeFileSync(join(skillA, "scripts", "helper.mjs"), "// helper\n", "utf8");
  writeSkillFile(root, join("13-cat", "skill-b"), "skill-b", "Run `scripts/helper.mjs` before release.");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0, `Expected a finding for skill-b: ${res.stdout}`);
  const cause = res.json.checks[0].cause;
  assert.match(cause, /skill-b\/SKILL\.md -> scripts\/helper\.mjs/);
  assert.doesNotMatch(cause, /skill-a\/SKILL\.md/, "skill-a referencing its own script must stay clean");
});

test("catalog-doctor skill-references: dot-relative markdown links are validated locally (code examples still skipped)", (t) => {
  const root = makeFixture(t);
  const dir = writeSkillFile(
    root,
    join("14-cat", "dot-link-skill"),
    "dot-link-skill",
    "See [the sibling](./missing-sibling.md), the [format](./CONTEXT-FORMAT.md), and `import db from './db.js'`."
  );
  writeFileSync(join(dir, "CONTEXT-FORMAT.md"), "# Format\n", "utf8");
  // Suffix decoy: a `./` link must NOT resolve through another skill's file.
  mkdirSync(join(root, "14-cat", "decoy-skill"), { recursive: true });
  writeFileSync(join(root, "14-cat", "decoy-skill", "missing-sibling.md"), "# Decoy\n", "utf8");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0, `Expected the missing dot-relative link to fail: ${res.stdout}`);
  const cause = res.json.checks[0].cause;
  assert.match(cause, /missing-sibling\.md/);
  assert.doesNotMatch(cause, /CONTEXT-FORMAT\.md/, "an existing dot-relative sibling must resolve");
  assert.doesNotMatch(cause, /db\.js/, "dot-relative code examples must stay skipped");
});

test("catalog-doctor skill-references: parent-relative ../ references are validated (broken ones flagged)", (t) => {
  const root = makeFixture(t);
  writeSkillFile(root, join("15-cat", "skill-a"), "skill-a", "Broken peer [link](../missing-peer/SKILL.md) must be flagged.");
  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0, `Expected a finding for the broken ../ reference: ${res.stdout}`);
  assert.match(res.json.checks[0].cause, /missing-peer/);
});

test("catalog-doctor skill-references: existing parent-relative ../ peers resolve cleanly", (t) => {
  const root = makeFixture(t);
  writeSkillFile(root, join("15-cat", "skill-a"), "skill-a", "Valid peer [link](../skill-b/SKILL.md) resolves.");
  writeSkillFile(root, join("15-cat", "skill-b"), "skill-b", "Peer target.");
  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass: ${res.stdout}`);
});

test("catalog-doctor skill-references: parent-relative refs with skill-local tails do not suffix-resolve", (t) => {
  const root = makeFixture(t);
  const owner = writeSkillFile(root, join("16-cat", "owner"), "owner", "Run [helper](../other-skill/scripts/helper.mjs) first.");
  mkdirSync(join(owner), { recursive: true });
  // Decoy: an unrelated skill owns scripts/helper.mjs  -  suffix search must NOT resolve the ../ ref through it.
  const decoy = writeSkillFile(root, join("17-cat", "other-skill"), "other-skill", "Decoy.");
  mkdirSync(join(decoy, "scripts"), { recursive: true });
  writeFileSync(join(decoy, "scripts", "helper.mjs"), "// decoy\n", "utf8");
  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0, `Expected the broken ../other-skill/scripts/helper.mjs to be flagged: ${res.stdout}`);
  assert.match(res.json.checks[0].cause, /other-skill\/scripts\/helper\.mjs/);
});

test("catalog-doctor skill-references: healthy references/*.md files pass across resolution ladder", (t) => {
  const root = makeFixture(t);
  const skillDir = writeSkillFile(
    root,
    join("18-cat", "doc-skill"),
    "doc-skill",
    "Parent skill body."
  );
  // Add references directory with a healthy doc and sibling
  const refDir = join(skillDir, "references");
  mkdirSync(refDir, { recursive: true });
  writeFileSync(join(refDir, "sibling.md"), "# Sibling\n", "utf8");
  writeFileSync(
    join(refDir, "guide.md"),
    [
      "# Guide",
      "See [the sibling](sibling.md).",
      "See [the owning skill](../SKILL.md).",
      "Run [the helper](../scripts/helper.mjs).",
      "Uses [shared resolver](../../../_shared/skill-resolver.md).",
      "Also resolves from root via `_shared/skill-resolver.md`.",
    ].join("\n") + "\n",
    "utf8"
  );
  mkdirSync(join(skillDir, "scripts"), { recursive: true });
  writeFileSync(join(skillDir, "scripts", "helper.mjs"), "// helper\n", "utf8");
  mkdirSync(join(root, "_shared"), { recursive: true });
  writeFileSync(join(root, "_shared", "skill-resolver.md"), "# Shared\n", "utf8");

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.equal(res.code, 0, `Expected clean pass for healthy references: ${res.stdout} ${res.stderr}`);
});

test("catalog-doctor skill-references: broken ../../ from references/ is flagged (pre-commit-gga class)", (t) => {
  const root = makeFixture(t);
  const skillA = writeSkillFile(
    root,
    join("19-cat", "skill-a"),
    "skill-a",
    "Skill A body."
  );
  // Decoy/peer skill in another category
  writeSkillFile(
    root,
    join("20-cat", "skill-b"),
    "skill-b",
    "Skill B body."
  );

  // In skill-a/references/guide.md:
  // From references/, ../.. reaches 19-cat, NOT the repo root.
  // So ../../skill-b/SKILL.md is broken (needs ../../../20-cat/skill-b/SKILL.md).
  // Suffix search must NOT forgive this broken relative navigation.
  const refDir = join(skillA, "references");
  mkdirSync(refDir, { recursive: true });
  writeFileSync(
    join(refDir, "guide.md"),
    "Broken link: [skill-b](../../skill-b/SKILL.md).\n",
    "utf8"
  );

  const res = runDoctorJson(["--root", root, "--check", "skill-references"]);
  assert.notEqual(res.code, 0, `Expected broken ../../ in references/ to fail: ${res.stdout}`);
  const cause = res.json.checks[0].cause;
  assert.match(cause, /skill-a\/references\/guide\.md/);
  assert.match(cause, /skill-b\/SKILL\.md/);
});
