/**
 * test/frontend-gates.test.mjs — TDD suite for token-audit, check-tokens,
 * validate-build-config (Tailwind v4 + non-Vite + standalone tsconfig),
 * and verify-frontend-gates.mjs unified runner.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

function makeFixture(t, prefix = "skillsgv-fe-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  });
  return dir;
}

function runScript(relPath, args = [], cwd = REPO_ROOT) {
  const res = spawnSync(process.execPath, [join(REPO_ROOT, relPath), ...args], {
    cwd,
    encoding: "utf8",
  });
  return { code: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}

test("token-audit: exempts multiline CSS custom properties while flagging plain CSS and comments", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "index.css"),
    [
      ":root {",
      "  --raw-card-shadow:",
      "    0 1px 2px oklch(0.25 0.04 42 / 0.05),",
      "    0 12px 28px -10px oklch(0.32 0.06 44 / 0.12);",
      "  --brand: #7c3aed;",
      "}",
      ":root { --inline: oklch(0.5 0.1 200); }",
      ".bad-card {",
      "  color: oklch(0.5 0.2 25);",
      "}",
      "/* --fake-in-comment: #ff00aa; */",
    ].join("\n") + "\n",
    "utf8"
  );

  const res = runScript("05-frontend/design-driven/scripts/token-audit.mjs", ["--srcDir", dir, "--json"]);
  assert.equal(res.code, 1, `Expected 2 findings: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.total, 2, `Expected exactly 2 findings, got: ${JSON.stringify(json.findings)}`);
  assert.deepEqual(
    json.findings.map((f) => [f.line, f.rule]),
    [
      [9, "raw-color-function"],
      [11, "hardcoded-hex"],
    ]
  );
});

test("check-tokens: ignores decimal ticket #1842, token files, multiline CSS vars, and 2px height; flags padding: 13px", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "Feed.tsx"),
    `export const Feed = () => <p>Merged PR #1842 in release #2026</p>;\n`,
    "utf8"
  );
  writeFileSync(
    join(dir, "index.css"),
    [
      ":root {",
      "  --card-shadow:",
      "    0 2px 4px #112233;",
      "  --duration-fast: 120ms;",
      "}",
      ".divider { height: 2px; width: 14px; }",
      ".sloppy { padding: 13px; }",
    ].join("\n") + "\n",
    "utf8"
  );

  const res = runScript("05-frontend/design-system-tokens/scripts/check-tokens.mjs", ["--srcDir", dir, "--json"]);
  assert.equal(res.code, 0, `Expected warning-only exit 0: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.issues.filter((i) => i.check === "hardcoded-hex").length, 0, `False hex: ${JSON.stringify(json.issues)}`);
  const spacingIssues = json.issues.filter((i) => i.check === "non-8pt-spacing");
  assert.equal(spacingIssues.length, 1, `Expected only padding: 13px: ${JSON.stringify(spacingIssues)}`);
  assert.equal(spacingIssues[0].line, 7);
});

test("validate-build-config: passes standalone Tailwind v4 + Vite + tsconfig.app.json", (t) => {
  const dir = makeFixture(t);
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "demo-tw4",
      dependencies: { react: "^19.0.0" },
      devDependencies: { vite: "^6.0.0", "@vitejs/plugin-react": "^4.0.0", tailwindcss: "^4.1.0", "@tailwindcss/vite": "^4.1.0" },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "vite.config.ts"),
    `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nexport default defineConfig({ plugins: [react(), tailwindcss()] });\n`,
    "utf8"
  );
  writeFileSync(join(dir, "src", "index.css"), `@import "tailwindcss";\n`, "utf8");
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ files: [], references: [{ path: "./tsconfig.app.json" }] }), "utf8");
  writeFileSync(join(dir, "tsconfig.app.json"), JSON.stringify({ compilerOptions: { strict: true } }), "utf8");

  const res = runScript("06-code-quality/build-config-validator/scripts/validate-build-config.mjs", ["--webDir", dir, "--json"]);
  assert.equal(res.code, 0, `TW4 standalone should pass: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.errors, 0);
  assert.equal(json.warnings, 0, `Expected 0 warnings on clean TW4 app: ${JSON.stringify(json.issues)}`);
});

test("validate-build-config: non-Vite Next.js TW4 project does not fail with vite-missing", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "demo-next-tw4",
      dependencies: { next: "^15.0.0", react: "^19.0.0" },
      devDependencies: { tailwindcss: "^4.1.0", "@tailwindcss/postcss": "^4.1.0" },
    }),
    "utf8"
  );
  writeFileSync(join(dir, "postcss.config.mjs"), `export default { plugins: { "@tailwindcss/postcss": {} } };\n`, "utf8");
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true } }), "utf8");

  const res = runScript("06-code-quality/build-config-validator/scripts/validate-build-config.mjs", ["--webDir", dir, "--json"]);
  assert.equal(res.code, 0, `Next TW4 should pass: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.errors, 0);
});

test("validate-build-config: legacy Tailwind v3 missing postcss.config.js still fails exit 1", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "demo-tw3",
      devDependencies: { vite: "^5.0.0", "@vitejs/plugin-react": "^4.0.0", tailwindcss: "^3.4.0" },
    }),
    "utf8"
  );
  writeFileSync(join(dir, "vite.config.ts"), `import react from "@vitejs/plugin-react";\nexport default { plugins: [react()] };\n`, "utf8");

  const res = runScript("06-code-quality/build-config-validator/scripts/validate-build-config.mjs", ["--webDir", dir, "--json"]);
  assert.equal(res.code, 1, `Legacy TW3 missing postcss/tailwind config must fail: ${res.stdout}`);
  const json = JSON.parse(res.stdout);
  assert.ok(json.issues.some((i) => i.check === "postcss-missing"));
  assert.ok(json.issues.some((i) => i.check === "tailwind-missing"));
});

test("verify-frontend-gates: clean TW4 project with spaces in path exits 0 and emits valid --json", (t) => {
  const parent = makeFixture(t, "skillsgv space test ");
  const dir = join(parent, "my demo app");
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "clean-demo",
      dependencies: { react: "^19.0.0" },
      devDependencies: { vite: "^6.0.0", "@vitejs/plugin-react": "^4.0.0", tailwindcss: "^4.1.0", "@tailwindcss/vite": "^4.1.0" },
    }),
    "utf8"
  );
  writeFileSync(
    join(dir, "vite.config.ts"),
    `import react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nexport default { plugins: [react(), tailwindcss()] };\n`,
    "utf8"
  );
  writeFileSync(join(dir, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true } }), "utf8");
  writeFileSync(
    join(dir, "src", "index.css"),
    `@import "tailwindcss";\n:root {\n  --surface-canvas: oklch(0.98 0.01 80);\n  --card-shadow:\n    0 1px 2px oklch(0.2 0.02 40 / 0.1);\n}\n@media (prefers-reduced-motion: reduce) { * { transition-duration: 0ms !important; } }\n`,
    "utf8"
  );
  writeFileSync(
    join(dir, "src", "App.tsx"),
    `export function App() { return <main className="bg-surface-canvas text-text-primary"><button className="focus-visible:outline-2 active:scale-95">Go</button></main>; }\n`,
    "utf8"
  );

  const res = runScript("05-frontend/design-driven/scripts/verify-frontend-gates.mjs", [
    "--srcDir", join(dir, "src"),
    "--webDir", dir,
    "--json",
  ]);
  assert.equal(res.code, 0, `Expected clean exit 0: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.ok, true);
  assert.equal(json.summary.errors, 0);
  assert.ok(json.scripts.some((s) => s.name === "token-audit" && s.status === "pass"));
  assert.ok(json.scripts.some((s) => s.name === "validate-build-config" && s.status === "pass"));
});

test("verify-frontend-gates: catches hardcoded hex and magic z-index 9999", (t) => {
  const dir = makeFixture(t);
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "Modal.tsx"),
    `export const Modal = () => <div style={{ color: "#ff00aa", zIndex: 9999 }} className="z-[9999]">Hi</div>;\n`,
    "utf8"
  );
  writeFileSync(join(dir, "src", "index.css"), `.overlay { z-index: 9999; }\n`, "utf8");

  const res = runScript("05-frontend/design-driven/scripts/verify-frontend-gates.mjs", [
    "--srcDir", join(dir, "src"),
    "--skip-build-config",
    "--json",
  ]);
  assert.equal(res.code, 1, `Expected exit 1 on hardcoded hex: ${res.stdout}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.ok, false);
  assert.ok(json.summary.errors >= 1);
  assert.ok(json.craftChecks.some((c) => c.check === "magic-z-index"));
});
