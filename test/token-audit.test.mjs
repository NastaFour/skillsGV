/**
 * test/token-audit.test.mjs — token-audit gate test suite
 *
 * Contract (published in 05-frontend/design-driven/SKILL.md):
 *   node 05-frontend/design-driven/scripts/token-audit.mjs --srcDir <project-dir> [--json]
 *
 * Exit codes: 0 = clean, 1 = findings, 2 = usage error.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const AUDIT_SCRIPT = join(
  REPO_ROOT,
  "05-frontend",
  "design-driven",
  "scripts",
  "token-audit.mjs"
);

function runAudit(args, cwd = REPO_ROOT) {
  const res = spawnSync(process.execPath, [AUDIT_SCRIPT, ...args], {
    cwd,
    encoding: "utf8",
  });
  return { code: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}

function makeFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "token-audit-test-"));
  t.after(() => {
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {}
  });
  return root;
}

test("token-audit: flags hardcoded hex colors in .tsx sources", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Button.tsx"),
    `export const Button = () => <button style={{ color: "#ff00aa" }}>Save</button>;\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir]);
  assert.equal(res.code, 1, `Expected findings (exit 1): ${res.stdout} ${res.stderr}`);
  assert.match(res.stdout, /hardcoded-hex/);
  assert.match(res.stdout, /Button\.tsx:1/);
});

test("token-audit: does not flag hex in token/theme definition files", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "tokens.css"),
    `:root {\n  --brand: #7c3aed;\n  --accent: #ff00aa;\n}\n`,
    "utf8"
  );
  writeFileSync(
    join(dir, "theme-tokens.ts"),
    `export const theme = { brand: "#7c3aed", accent: "#ff00aa" };\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir]);
  assert.equal(res.code, 0, `Expected clean exit: ${res.stdout} ${res.stderr}`);
});

test("token-audit: exempts CSS custom-property lines and flags plain CSS declarations", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "styles.css"),
    `:root {\n  --brand: #7c3aed;\n}\n.card {\n  color: #ff00aa;\n}\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 1);
  assert.equal(json.findings[0].file, "styles.css");
  assert.equal(json.findings[0].line, 5, "the --brand definition line must be exempt");
  assert.equal(json.findings[0].rule, "hardcoded-hex");
});

test("token-audit: flags raw Tailwind color literals in class contexts", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div className="bg-white p-4">A</div>\n` +
      `<div className="bg-gray-100">B</div>\n` +
      `<span className="text-slate-500">C</span>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir]);
  assert.equal(res.code, 1);
  assert.match(res.stdout, /raw-tailwind-color/);
  assert.match(res.stdout, /Card\.tsx:1/);
  assert.match(res.stdout, /Card\.tsx:2/);
  assert.match(res.stdout, /Card\.tsx:3/);
});

test("token-audit: data-token-audit-ignore suppresses literals on the same element line", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div className="bg-white p-4">A</div>\n` +
      `<div className="bg-white p-4" data-token-audit-ignore>B</div>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 1);
  assert.equal(json.findings[0].file, "Card.tsx");
  assert.equal(json.findings[0].line, 1);
});

test("token-audit: flags hex hidden in comments on non-token files", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "legacy.ts"),
    `// TODO: replace #ff0000 with a design token\nexport const x = 1;\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir]);
  assert.equal(res.code, 1);
  assert.match(res.stdout, /hardcoded-hex/);
  assert.match(res.stdout, /legacy\.ts:1/);
});

test("token-audit: clean token-driven fixture exits 0 with empty JSON findings", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Clean.tsx"),
    `export const Clean = () => <div className="bg-surface text-on-surface">ok</div>;\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 0, `Expected clean exit: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.deepEqual(json.findings, []);
  assert.equal(json.total, 0);
});

test("token-audit: --json reports finding shape and totals", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Bad.tsx"),
    `<div style={{ color: "#aabbcc" }} className="bg-black">x</div>;\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 2);
  const rules = json.findings.map((f) => f.rule).sort();
  assert.deepEqual(rules, ["hardcoded-hex", "raw-tailwind-color"]);
  for (const finding of json.findings) {
    assert.equal(typeof finding.file, "string");
    assert.ok(finding.file.length > 0);
    assert.equal(finding.line, 1);
    assert.equal(typeof finding.snippet, "string");
    assert.ok(finding.snippet.length > 0);
  }
});

test("token-audit: missing --srcDir is a usage error (exit 2)", () => {
  const res = runAudit([]);
  assert.equal(res.code, 2, `Expected usage error: ${res.stdout} ${res.stderr}`);
  assert.match(res.stderr, /--srcDir/);
});

test("token-audit: nonexistent --srcDir is a usage error (exit 2)", (t) => {
  const dir = makeFixture(t);
  const missing = join(dir, "does-not-exist");
  const res = runAudit(["--srcDir", missing]);
  assert.equal(res.code, 2, `Expected usage error: ${res.stdout} ${res.stderr}`);
  assert.match(res.stderr, /--srcDir/);
});

test("token-audit: --help exits 0 and documents the CLI contract", () => {
  const res = runAudit(["--help"]);
  assert.equal(res.code, 0);
  assert.match(res.stdout, /--srcDir/);
  assert.match(res.stdout, /--json/);
  assert.match(res.stdout, /0 = clean, 1 = findings, 2 = usage error/);
});

test("token-audit: flags raw Tailwind literals in multiline class expressions", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div\n  className={\n    "flex bg-white p-4"\n  }\n>\n  A\n</div>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1, `Expected findings (exit 1): ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 1);
  assert.equal(json.findings[0].rule, "raw-tailwind-color");
  assert.equal(json.findings[0].line, 3, "the finding must point at the literal's line");
});

test("token-audit: data-token-audit-ignore anywhere in the multiline window suppresses the finding", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div\n  className={\n    "bg-white p-4"\n  }\n  data-token-audit-ignore\n>\n  B\n</div>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir]);
  assert.equal(res.code, 0, `Expected clean exit: ${res.stdout} ${res.stderr}`);
});

test("token-audit: flags a literal deep in a long multiline class list beyond the old fixed window", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div className={\n    "flex items-center"\n    + " justify-between gap-4"\n    + " rounded-lg border"\n    + " px-4 py-2 text-sm"\n    + " tracking-tight"\n    + " bg-white"\n  }\n>\n  A\n</div>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1, `Expected the deep literal to be flagged: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 1);
  assert.equal(json.findings[0].line, 7, "the finding must point at the literal's line");
});

test("token-audit: plain child text after the opening tag closes is not flagged", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div\n  className={\n    "flex p-4"\n  }\n>\n  <span>bg-white</span>\n</div>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 0, `Expected clean exit for child text: ${res.stdout} ${res.stderr}`);
  assert.equal(JSON.parse(res.stdout).total, 0);
});

test("token-audit: a child's data-token-audit-ignore does not suppress the parent element", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Card.tsx"),
    `<div\n  className={\n    "bg-white p-4"\n  }\n>\n  <span data-token-audit-ignore>b</span>\n</div>\n`,
    "utf8"
  );

  const res = runAudit(["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1, `Expected the parent finding to survive: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 1);
  assert.equal(json.findings[0].line, 3);
});
