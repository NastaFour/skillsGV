/**
 * test/ui-diff.test.mjs — TDD suite for 05-frontend/ui-diff and enhanced
 * multi-framework static + DOM-geometry checks in verify-frontend-gates.mjs.
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
const UI_DIFF_CLI = join(REPO_ROOT, "05-frontend", "ui-diff", "scripts", "ui-diff.mjs");
const FRONTEND_GATES_CLI = join(REPO_ROOT, "05-frontend", "design-driven", "scripts", "verify-frontend-gates.mjs");

function makeFixture(t, prefix = "skillsgv-uidiff-") {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => {
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  });
  return dir;
}

function runCli(script, args, cwd = REPO_ROOT) {
  const res = spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
  return { code: res.status ?? 1, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
}

test("ui-diff: evaluateDomGeometry detects Rosan Dance style geometry bugs and passes clean layout", async () => {
  const { evaluateDomGeometry } = await import("../05-frontend/ui-diff/scripts/ui-diff.mjs");
  assert.equal(typeof evaluateDomGeometry, "function");

  const broken = evaluateDomGeometry({
    viewportName: "desktop",
    viewport: { width: 1280, height: 800 },
    scrollWidth: 1320,
    clientWidth: 1280,
    heroFoldItems: [{ selector: "dl.hero-stats", top: 730, bottom: 824 }],
    siblingGroups: [
      {
        kind: "stat-strip",
        selector: "dl.hero-stats",
        items: [
          { label: "+15", top: 772.41, height: 42 },
          { label: "3+", top: 752.98, height: 42 },
        ],
      },
      {
        kind: "uniform-grid",
        selector: ".bento-grid",
        items: [
          { label: "card-1", top: 900, height: 444.75 },
          { label: "card-3", top: 1400, height: 468 },
        ],
      },
    ],
    tapTargets: [
      { selector: "button.tiny", width: 20, height: 20 },
      { selector: "button.desktop-compact", width: 80, height: 32 },
      { selector: "a.inline-prose", width: 50, height: 18, inlineTextLink: true },
    ],
    brokenImages: [{ src: "/missing.webp", alt: "Hero" }],
    monoProseNodes: [{ selector: "p.subtitle", textPreview: "Academia de baile..." }],
    consoleErrors: ["Hydration mismatch"],
  });

  const checks = new Set(broken.issues.map((i) => i.check));
  assert.ok(checks.has("horizontal-overflow"), `missing horizontal-overflow in ${[...checks]}`);
  assert.ok(checks.has("above-fold-clipping"), `missing above-fold-clipping in ${[...checks]}`);
  assert.ok(checks.has("sibling-alignment-drift"), `missing sibling-alignment-drift in ${[...checks]}`);
  assert.ok(checks.has("grid-height-variance"), `missing grid-height-variance in ${[...checks]}`);
  assert.ok(checks.has("small-tap-target"), `missing small-tap-target in ${[...checks]}`);
  assert.ok(checks.has("broken-image"), `missing broken-image in ${[...checks]}`);
  assert.ok(checks.has("mono-prose"), `missing mono-prose in ${[...checks]}`);
  assert.ok(checks.has("console-error"), `missing console-error in ${[...checks]}`);
  assert.ok(broken.errors >= 7);

  const clean = evaluateDomGeometry({
    viewportName: "mobile",
    viewport: { width: 390, height: 844 },
    scrollWidth: 390,
    clientWidth: 390,
    heroFoldItems: [{ selector: ".hero-cta", top: 520, bottom: 572 }],
    siblingGroups: [
      {
        kind: "stat-strip",
        selector: "dl.hero-stats",
        items: [
          { label: "+15", top: 720, height: 42 },
          { label: "3+", top: 721, height: 42 },
        ],
      },
      {
        kind: "uniform-grid",
        selector: ".bento-grid",
        items: [
          { label: "card-1", top: 900, height: 448 },
          { label: "card-2", top: 900, height: 450 },
        ],
      },
    ],
    tapTargets: [{ selector: "button.menu", width: 44, height: 44 }],
    brokenImages: [],
    monoProseNodes: [],
    consoleErrors: [],
  });
  assert.equal(clean.errors, 0, `expected 0 errors on clean layout, got ${JSON.stringify(clean.issues)}`);
  assert.equal(clean.warnings, 0);
});

test("ui-diff CLI exposes --help, handles missing Playwright gracefully, and has zero _shared imports", (t) => {
  const src = readFileSync(UI_DIFF_CLI, "utf8");
  assert.equal(/from\s+["'][^"']*_shared/.test(src), false, "ui-diff.mjs must have zero _shared imports");

  const help = runCli(UI_DIFF_CLI, ["--help"]);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /--mode/);
  assert.match(help.stdout, /--strict-browser/);

  const dir = makeFixture(t);
  const degraded = runCli(UI_DIFF_CLI, ["--url", "http://127.0.0.1:49999", "--mode", "auto", "--json"], dir);
  assert.equal(degraded.code, 0, degraded.stderr);
  const parsed = JSON.parse(degraded.stdout);
  assert.equal(parsed.status, "degraded");
  assert.equal(parsed.reason, "playwright-unavailable");

  const strict = runCli(UI_DIFF_CLI, ["--url", "http://127.0.0.1:49999", "--strict-browser", "--json"], dir);
  assert.equal(strict.code, 3);
});

test("verify-frontend-gates scans .astro files, enforces v4 static checks, and accepts clean Astro apps", (t) => {
  const runnerSrc = readFileSync(FRONTEND_GATES_CLI, "utf8");
  assert.equal(/from\s+["'][^"']*_shared/.test(runnerSrc), false, "verify-frontend-gates.mjs must keep zero _shared imports");

  const badDir = makeFixture(t, "skillsgv-astro-bad-");
  mkdirSync(join(badDir, "src", "pages"), { recursive: true });
  writeFileSync(
    join(badDir, "package.json"),
    JSON.stringify({ name: "astro-bad", dependencies: { astro: "^5.0.0", gsap: "^3.12.0" } }),
    "utf8"
  );
  writeFileSync(join(badDir, "astro.config.mjs"), "export default {};\n", "utf8");
  writeFileSync(
    join(badDir, "src", "pages", "index.astro"),
    [
      "---",
      'import gsap from "gsap";',
      "---",
      '<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></head>',
      "<body>",
      '  <section class="h-screen"><div onClick="openMenu()">Menu</div><p class="font-mono">Bad prose</p><img src="/hero.webp" /></section>',
      "</body></html>",
    ].join("\n"),
    "utf8"
  );

  const badRes = runCli(FRONTEND_GATES_CLI, ["--srcDir", join(badDir, "src"), "--webDir", badDir, "--skip-build-config", "--json"]);
  assert.equal(badRes.code, 1, `expected errors on dirty .astro fixture: ${badRes.stdout}`);
  const badJson = JSON.parse(badRes.stdout);
  const allChecks = new Set([
    ...badJson.craftChecks.map((c) => c.check),
    ...badJson.scripts.flatMap((s) => (s.issues || []).map((i) => i.check)),
  ]);
  assert.ok(allChecks.has("non-semantic-clickable"), `missing non-semantic-clickable: ${[...allChecks]}`);
  assert.ok(allChecks.has("legacy-100vh"), `missing legacy-100vh: ${[...allChecks]}`);
  assert.ok(allChecks.has("zoom-disabled-viewport"), `missing zoom-disabled-viewport: ${[...allChecks]}`);
  assert.ok(allChecks.has("mono-prose"), `missing mono-prose: ${[...allChecks]}`);
  assert.ok(allChecks.has("img-missing-alt-or-size"), `missing img-missing-alt-or-size: ${[...allChecks]}`);
  assert.ok(allChecks.has("kinetic-missing-cleanup-or-reduced-motion"), `missing kinetic safety check: ${[...allChecks]}`);

  const goodDir = makeFixture(t, "skillsgv-astro-ok-");
  mkdirSync(join(goodDir, "src", "pages"), { recursive: true });
  writeFileSync(
    join(goodDir, "package.json"),
    JSON.stringify({ name: "astro-good", dependencies: { astro: "^5.0.0" } }),
    "utf8"
  );
  writeFileSync(join(goodDir, "astro.config.mjs"), "export default {};\n", "utf8");
  writeFileSync(
    join(goodDir, "src", "pages", "index.astro"),
    [
      "<html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" /></head>",
      "<body>",
      '  <main class="min-h-[100svh]"><button type="button" class="focus-visible:outline-2 active:scale-95">Ver</button><div onClick={() => openModal()} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openModal()}>Menu</div><img onLoad={() => ready()} src="/hero.webp" alt="Escenario" width="1200" height="800" /></main>',
      "</body></html>",
    ].join("\n"),
    "utf8"
  );

  const goodRes = runCli(FRONTEND_GATES_CLI, [
    "--srcDir", join(goodDir, "src"),
    "--webDir", goodDir,
    "--skip-build-config",
    "--live", "http://127.0.0.1:49999",
    "--json",
  ]);
  assert.equal(goodRes.code, 0, `expected clean .astro pass: ${goodRes.stdout} ${goodRes.stderr}`);
  const goodJson = JSON.parse(goodRes.stdout);
  assert.equal(goodJson.ok, true);
  assert.ok(goodJson.liveAudit && goodJson.liveAudit.status === "degraded");
});
