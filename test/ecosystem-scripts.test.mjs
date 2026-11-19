/**
 * test/ecosystem-scripts.test.mjs — Ecosystem-wide stability tests for skill scripts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

function makeFixture(t, prefix = "skillsgv-eco-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  });
  return dir;
}

function runNode(scriptRel, args = [], cwd = REPO_ROOT) {
  const scriptPath = join(REPO_ROOT, scriptRel);
  const res = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    encoding: "utf8",
  });
  return { code: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}

function walkSkillScripts(dir, out = []) {
  const IGNORE = new Set(["node_modules", ".git", "dist", "Anti rats", "gentle-ai-dsh", "test", "odd"]);
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name) || e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (dir === REPO_ROOT && e.name === "scripts") continue;
    if (e.isDirectory()) walkSkillScripts(full, out);
    else if (/[\\/]scripts[\\/][^\\/]+\.mjs$/.test(full)) out.push(full);
  }
  return out;
}

test("ecosystem: zero skill scripts call findProjectRoot(__dirname)", () => {
  const scripts = walkSkillScripts(REPO_ROOT);
  const offenders = [];
  for (const s of scripts) {
    const src = readFileSync(s, "utf8");
    if (/findProjectRoot\s*\(\s*__dirname\s*\)/.test(src)) {
      offenders.push(relative(REPO_ROOT, s).replace(/\\/g, "/"));
    }
  }
  assert.deepEqual(offenders, [], `Scripts still using findProjectRoot(__dirname): ${offenders.join(", ")}`);
});

test("check-module-level-loads: does NOT flag standard JS new Map() but still flags loadStripe and L.map", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "cache.ts"),
    `const lookup = new Map<string, number>();\nexport function get(k: string) { return lookup.get(k); }\n`,
    "utf8"
  );
  const cleanRes = runNode("05-frontend/lazy-loading-patterns/scripts/check-module-level-loads.mjs", ["--srcDir", dir, "--json"]);
  assert.equal(cleanRes.code, 0, `Unexpected error on standard JS new Map(): ${cleanRes.stdout} ${cleanRes.stderr}`);
  const cleanJson = JSON.parse(cleanRes.stdout);
  assert.equal(cleanJson.errors, 0);

  writeFileSync(
    join(dir, "stripe.ts"),
    `import { loadStripe } from "@stripe/stripe-js";\nconst stripePromise = loadStripe("pk_test");\n`,
    "utf8"
  );
  const badRes = runNode("05-frontend/lazy-loading-patterns/scripts/check-module-level-loads.mjs", ["--srcDir", dir, "--json"]);
  assert.equal(badRes.code, 1, `Expected exit 1 for module-level loadStripe: ${badRes.stdout}`);
  const badJson = JSON.parse(badRes.stdout);
  assert.ok(badJson.errors >= 1);
});

test("check-pkg-exists: ignores node: prefixed builtin modules", (t) => {
  const dir = makeFixture(t);
  writeFileSync(
    join(dir, "index.mjs"),
    `import { readFileSync } from "node:fs";\nimport { join } from "node:path";\nexport const p = join(".", "a");\n`,
    "utf8"
  );
  const res = runNode("06-code-quality/dependency-guardian/scripts/check-pkg-exists.mjs", ["--dir", dir, "--json"]);
  assert.equal(res.code, 0, `Expected exit 0 for node: builtins: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.errors, 0);
  assert.equal(json.warnings, 0);
});

test("check-deep-links: supports --dir on standalone Expo app and emits --json", (t) => {
  const dir = makeFixture(t);
  writeFileSync(join(dir, "app.json"), JSON.stringify({ expo: { name: "Demo", scheme: "demo", ios: { associatedDomains: ["applinks:demo.app"] } } }), "utf8");
  const okRes = runNode("05-frontend/deep-linking-mobile/scripts/check-deep-links.mjs", ["--dir", dir, "--json"]);
  assert.equal(okRes.code, 0, `Expected pass: ${okRes.stdout} ${okRes.stderr}`);
  const okJson = JSON.parse(okRes.stdout);
  assert.equal(okJson.errors, 0);

  writeFileSync(join(dir, "app.json"), JSON.stringify({ expo: { name: "NoScheme" } }), "utf8");
  const badRes = runNode("05-frontend/deep-linking-mobile/scripts/check-deep-links.mjs", ["--dir", dir, "--json"]);
  assert.equal(badRes.code, 1, `Expected fail on missing scheme: ${badRes.stdout}`);
});

test("check-eas-config: supports --dir and handles invalid JSON without crashing", (t) => {
  const dir = makeFixture(t);
  writeFileSync(join(dir, "eas.json"), "{ invalid json", "utf8");
  writeFileSync(join(dir, "app.json"), JSON.stringify({ expo: { version: "1.0.0" } }), "utf8");
  const res = runNode("08-devops/store-deployment-eas/scripts/check-eas-config.mjs", ["--dir", dir, "--json"]);
  assert.equal(res.code, 1, `Expected controlled exit 1 on invalid JSON: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.ok(json.issues.some((i) => i.check === "invalid-json"));
});

test("check-lottie: respects --srcDir without scanning unrelated repo root", (t) => {
  const dir = makeFixture(t);
  writeFileSync(join(dir, "Hero.tsx"), `export const Hero = () => <div>Hello</div>;\n`, "utf8");
  const res = runNode("05-frontend/lottie-animations/scripts/check-lottie.mjs", ["--srcDir", dir, "--json"]);
  assert.equal(res.code, 0, `Expected clean exit: ${res.stdout} ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  assert.equal(json.issues.length, 0);
});
