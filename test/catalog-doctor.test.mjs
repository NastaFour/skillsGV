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
  for (const id of ["validator-strict", "manifest-consistency", "dependency-check", "mcp-parity"]) {
    assert.equal(byId.get(id).rootScope, ROOT_SCOPE.TARGET, `${id} must honor --root`);
  }
  for (const id of ["installer-dryrun", "loader-status"]) {
    assert.equal(byId.get(id).rootScope, ROOT_SCOPE.CATALOG, `${id} is catalog-fixed`);
    assert.match(byId.get(id).rootNote, /--root does not relocate/, `${id} must document the limitation`);
  }
});

test("catalog-doctor: executes 6 checks and outputs structured results", () => {
  const res = runDoctorJson(["--root", REPO_ROOT]);
  assert.ok(res.json, "Expected valid JSON output: " + res.stdout);
  assert.equal(typeof res.json.ok, "boolean");
  assert.equal(res.json.totalChecks, 6);
  assert.ok(Array.isArray(res.json.checks));
  assert.equal(res.json.checks.length, 6);

  const checkIds = res.json.checks.map((c) => c.id);
  assert.deepEqual(checkIds, [
    "validator-strict",
    "installer-dryrun",
    "loader-status",
    "manifest-consistency",
    "dependency-check",
    "mcp-parity",
  ]);
  // Each result carries the root scope; catalog-fixed checks explain themselves.
  for (const check of res.json.checks) {
    assert.ok(check.rootScope, `${check.id} must report rootScope`);
  }
  for (const id of ["installer-dryrun", "loader-status"]) {
    assert.match(res.json.checks.find((c) => c.id === id).rootNote, /--root does not relocate/);
  }
});

test("catalog-doctor: PASS exit 0 when all checks pass on catalog root", () => {
  const res = runDoctorJson(["--root", REPO_ROOT]);
  assert.equal(res.code, 0, `Expected exit 0, got ${res.code}: ${res.stdout}`);
  assert.equal(res.json.ok, true);
  assert.equal(res.json.failed, 0);
  assert.equal(res.json.passed, 6);
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
  assert.equal(res.code, 0);
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
