/**
 * test/modern-web-guidance.test.mjs — TDD suite for modern-web-guidance legacy-scan.mjs
 * and integration checks for shader-dev & openseo Astro local SEO docs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const LEGACY_SCAN_CLI = join(REPO_ROOT, "05-frontend", "modern-web-guidance", "scripts", "legacy-scan.mjs");

function makeFixture(t) {
  const dir = mkdtempSync(join(tmpdir(), "skillsgv-mwg-"));
  t.after(() => {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  });
  return dir;
}

test("legacy-scan.mjs flags 2015 web workarounds, maps to modern-platform-map.md, and has zero _shared imports", (t) => {
  const src = readFileSync(LEGACY_SCAN_CLI, "utf8");
  assert.equal(/from\s+["'][^"']*_shared/.test(src), false, "legacy-scan.mjs must have zero _shared imports");

  const dir = makeFixture(t);
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "legacy.tsx"),
    [
      "window.addEventListener('scroll', () => { const y = window.pageYOffset; });",
      "const ro = new ResizeObserver(() => {});",
      "document.execCommand('copy');",
      "export const Hero = () => <section className='h-screen'>Hero</section>;",
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    join(dir, "src", "anim.css"),
    "@keyframes slide { from { top: 0px; left: 0px; } to { top: 20px; left: 20px; } }\n",
    "utf8"
  );

  const res = spawnSync(process.execPath, [LEGACY_SCAN_CLI, "--srcDir", join(dir, "src"), "--json"], {
    cwd: dir,
    encoding: "utf8",
  });
  assert.equal(res.status, 0, `expected exit 0 warning report: ${res.stderr}`);
  const json = JSON.parse(res.stdout);
  const checks = new Set(json.issues.map((i) => i.check));
  assert.ok(checks.has("legacy-scroll-listener"), `missing legacy-scroll-listener in ${[...checks]}`);
  assert.ok(checks.has("legacy-page-y-offset"), `missing legacy-page-y-offset in ${[...checks]}`);
  assert.ok(checks.has("legacy-resize-observer-breakpoint"), `missing legacy-resize-observer-breakpoint in ${[...checks]}`);
  assert.ok(checks.has("legacy-exec-command"), `missing legacy-exec-command in ${[...checks]}`);
  assert.ok(checks.has("legacy-100vh"), `missing legacy-100vh in ${[...checks]}`);
  assert.ok(checks.has("non-composited-keyframes"), `missing non-composited-keyframes in ${[...checks]}`);
  assert.ok(json.issues.every((i) => /modern-platform-map\.md#/.test(i.guideRef || "")), "every issue must cite a specific section in modern-platform-map.md");
});

test("legacy-scan.mjs returns 0 issues on modern native web primitives", (t) => {
  const dir = makeFixture(t);
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "modern.css"),
    [
      ".reveal { animation: fadeUp linear both; animation-timeline: view(); }",
      "@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }",
      ".hero { min-height: 100svh; container-type: inline-size; }",
    ].join("\n"),
    "utf8"
  );
  const res = spawnSync(process.execPath, [LEGACY_SCAN_CLI, "--srcDir", join(dir, "src"), "--json"], {
    cwd: dir,
    encoding: "utf8",
  });
  assert.equal(res.status, 0, res.stderr);
  const json = JSON.parse(res.stdout);
  assert.equal(json.issues.length, 0, `expected 0 issues, got ${JSON.stringify(json.issues)}`);
});
