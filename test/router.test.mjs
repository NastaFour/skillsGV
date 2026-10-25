import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTurnCachePath } from '../_shared/script-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

function runRouter(query) {
  const stdout = execFileSync('node', [join(REPO_ROOT, '00-meta-skills/skill-router/scripts/skill-router.mjs'), '--query', query, '--json'], {
    encoding: 'utf8'
  });
  return JSON.parse(stdout);
}

test('routes chained pr to chained-pr skill', () => {
  const res = runRouter('chained pr');
  assert.equal(res.primary, 'chained-pr');
  assert.equal(res.confidence, 1);
});

test('routes find skills to find-skills skill', () => {
  const res = runRouter('find skills');
  assert.equal(res.primary, 'find-skills');
  assert.equal(res.confidence, 1);
});

test('routes go unit tests to go-testing skill', () => {
  const res = runRouter('go tests');
  assert.equal(res.primary, 'go-testing');
  assert.equal(res.confidence, 1);
});

test('routes booking slot conflict to booking-scheduling-domain skill', () => {
  const res = runRouter('booking slot conflict');
  assert.equal(res.primary, 'booking-scheduling-domain');
  assert.equal(res.confidence, 1);
});

test('routes two judges to judgment-day skill', () => {
  const res = runRouter('two judges');
  assert.equal(res.primary, 'judgment-day');
  assert.equal(res.confidence, 1);
});

test('uppercase acronym triggers shorter than MIN_TRIGGER_LENGTH still route (jwt)', () => {
  const res = runRouter('implement jwt authentication and login flow');
  assert.equal(res.primary, 'jwt-bcrypt');
});

test('uppercase acronym triggers shorter than MIN_TRIGGER_LENGTH still route (orm)', () => {
  const res = runRouter('setup the orm for the database layer');
  assert.ok(
    res.tier1toLoad.includes('prisma-orm') || res.secondary.includes('prisma-orm'),
    `expected prisma-orm routed for orm query, got ${JSON.stringify(res)}`
  );
});

test('tier1toLoad never cannibalizes slots with Tier 0 always-on skills', () => {
  const res = runRouter('write unit tests with vitest');
  const TIER0 = ['odd-workflow','skill-router','skill-loader','skill-validator','testing-patterns','code-reviewer','engram-integration','dod-checker','decision-gate'];
  for (const t0 of TIER0) {
    assert.ok(!res.tier1toLoad.includes(t0), `tier1toLoad must not include Tier 0 skill ${t0}: ${JSON.stringify(res.tier1toLoad)}`);
  }
  assert.ok(res.tier1toLoad.length > 0, 'tier1toLoad should still carry domain skills');
});

test('deprecated skills are skipped from primary assignment', () => {
  const res = runRouter('nextjs legacy');
  assert.notEqual(res.primary, 'nextjs');
});

test('router detects suggestsStructuredFlow only when explicit SDD keywords are present', () => {
  const resSDD = runRouter('sdd init new feature');
  assert.equal(resSDD.suggestsStructuredFlow, true);

  const resODD = runRouter('build a new responsive dashboard with charts and tables');
  assert.equal(resODD.suggestsStructuredFlow, false);
});

test('router critical markers detects generalized security/payment terms', () => {
  const stdoutSec = execFileSync('node', ['00-meta-skills/skill-router/scripts/skill-router.mjs', '--query', 'update security credentials', '--diff', '10', '--json'], { encoding: 'utf8' });
  const resSec = JSON.parse(stdoutSec);
  assert.equal(resSec.trivial, false, 'Security query should not be marked trivial even with low diff');

  const stdoutTriv = execFileSync('node', ['00-meta-skills/skill-router/scripts/skill-router.mjs', '--query', 'fix typo in button label', '--diff', '5', '--json'], { encoding: 'utf8' });
  const resTriv = JSON.parse(stdoutTriv);
  assert.equal(resTriv.trivial, true, 'Small typo fix should be marked trivial');
});

test('router redirects deprecated skills to canonical equivalents', () => {
  const resElectron = runRouter('electronjs');
  assert.equal(resElectron.primary, 'electron');
  assert.equal(resElectron.deprecatedHit, 'electronjs');

  const resTailwind = runRouter('tailwindcss');
  assert.equal(resTailwind.primary, 'tailwind-4');
  assert.equal(resTailwind.deprecatedHit, 'tailwindcss');

  const resDesigner = runRouter('frontend-designer');
  assert.equal(resDesigner.primary, 'frontend-design');
  assert.equal(resDesigner.deprecatedHit, 'frontend-designer');

  const resDebugger = runRouter('expert-debugger');
  assert.equal(resDebugger.primary, 'systematic-debugging');
  assert.equal(resDebugger.deprecatedHit, 'expert-debugger');
});

test('router automatically detects UI surface tasks and injects design-driven into tier1toLoad', () => {
  const resUI = runRouter('crear un componente de dashboard en react');
  assert.equal(resUI.isUiTask, true, 'Visual dashboard query should be detected as UI task');
  assert.ok(resUI.tier1toLoad.includes('design-driven'), 'tier1toLoad must include design-driven for UI tasks');

  const resEn = runRouter('create a button component in react');
  assert.equal(resEn.isUiTask, true, 'English UI component query must be detected as UI task');
  assert.ok(resEn.tier1toLoad.includes('design-driven'), 'tier1toLoad must include design-driven for English UI tasks');

  const resAccents = runRouter('diseño de login en react');
  assert.equal(resAccents.isUiTask, true, 'Spanish query with accents (diseño) must be detected as UI task');
  assert.ok(resAccents.tier1toLoad.includes('design-driven'), 'tier1toLoad must include design-driven for accented UI tasks');

  const resBackend = runRouter('database migration with prisma postgres');
  assert.equal(resBackend.isUiTask, false, 'Database query should not be detected as UI task');
});

test('router: getTurnCachePath derives workspace-scoped paths using cwd hash', () => {
  const p1 = getTurnCachePath("C:/workspace/project-a");
  const p2 = getTurnCachePath("C:/workspace/project-b");
  assert.notEqual(p1, p2);
  assert.match(p1, /\.skill-router-turn-[a-f0-9]{12}\.json$/);
  assert.match(p2, /\.skill-router-turn-[a-f0-9]{12}\.json$/);
});

test('router: getTurnCachePath respects custom override path', () => {
  const custom = join(tmpdir(), "custom-turn-cache.json");
  const resolved = getTurnCachePath("C:/workspace/project-a", custom);
  assert.equal(resolved, resolve(custom));
});

test('router: derives workspace-scoped turn cache file based on cwd', (t) => {
  const dir1 = mkdtempSync(join(tmpdir(), "router-ws1-"));
  const dir2 = mkdtempSync(join(tmpdir(), "router-ws2-"));
  const cache1 = getTurnCachePath(dir1);
  const cache2 = getTurnCachePath(dir2);
  t.after(() => {
    try { rmSync(dir1, { recursive: true, force: true }); } catch {}
    try { rmSync(dir2, { recursive: true, force: true }); } catch {}
    try { if (existsSync(cache1)) rmSync(cache1); } catch {}
    try { if (existsSync(cache2)) rmSync(cache2); } catch {}
  });

  assert.notEqual(cache1, cache2);

  execFileSync('node', [join(REPO_ROOT, '00-meta-skills/skill-router/scripts/skill-router.mjs'), '--query', 'chained pr', '--json'], {
    cwd: dir1,
    encoding: 'utf8'
  });

  assert.equal(existsSync(cache1), true, 'Cache 1 should exist');
  assert.equal(existsSync(cache2), false, 'Cache 2 should not exist yet');

  const data1 = JSON.parse(readFileSync(cache1, 'utf8'));
  assert.equal(data1.query, 'chained pr');
  assert.ok(Array.isArray(data1.tier1));
  assert.ok(data1.tier1.includes('chained-pr'));

  execFileSync('node', [join(REPO_ROOT, '00-meta-skills/skill-router/scripts/skill-router.mjs'), '--query', 'two judges', '--json'], {
    cwd: dir2,
    encoding: 'utf8'
  });

  assert.equal(existsSync(cache2), true, 'Cache 2 should exist');
  const data2 = JSON.parse(readFileSync(cache2, 'utf8'));
  assert.equal(data2.query, 'two judges');
  assert.ok(data2.tier1.includes('judgment-day'));
});

test('router: respects explicit --turn-cache CLI override', (t) => {
  const customCache = join(tmpdir(), `custom-turn-${Date.now()}.json`);
  t.after(() => {
    try { if (existsSync(customCache)) rmSync(customCache); } catch {}
  });

  execFileSync('node', [
    join(REPO_ROOT, '00-meta-skills/skill-router/scripts/skill-router.mjs'),
    '--query', 'chained pr',
    '--json',
    '--turn-cache', customCache
  ], {
    encoding: 'utf8'
  });

  assert.equal(existsSync(customCache), true);
  const data = JSON.parse(readFileSync(customCache, 'utf8'));
  assert.equal(data.query, 'chained pr');
});

test('multi-intent 4-artifact query loads all four core design and spec skills', () => {
  const res = runRouter('crear PRD.md APP_FLOW.md TRD.md y DESIGN_SYSTEM.md');
  const expected = ['idea-to-prd-express', 'app-flow-spec', 'architecture-designer', 'design-driven'];
  for (const skill of expected) {
    assert.ok(
      res.tier1toLoad.includes(skill),
      `tier1toLoad must include ${skill}, got: ${JSON.stringify(res.tier1toLoad)}`
    );
  }
});

test('querying deprecated exact name sdd-research redirects to odd-workflow', () => {
  const res = runRouter('sdd-research');
  assert.equal(res.primary, 'odd-workflow');
  assert.equal(res.deprecatedHit, 'sdd-research');
  assert.equal(res.confidence, 1);
});

test('isUiTask distinguishes pure backend logic from UI queries accurately', () => {
  const resDb = runRouter('diseño de base de datos y vistas sql');
  assert.equal(resDb.isUiTask, false, 'Database and SQL view design should not be marked as UI task');

  const resTs = runRouter('definir interfaces typescript para backend');
  assert.equal(resTs.isUiTask, false, 'Backend TypeScript interfaces should not be marked as UI task');

  const resForm = runRouter('Crear un formulario para conectar con la api');
  assert.equal(resForm.isUiTask, true, 'Form connected to API should be marked as UI task');

  const resDash = runRouter('Crear un dashboard para monitorear postgres');
  assert.equal(resDash.isUiTask, true, 'Dashboard for Postgres monitoring should be marked as UI task');
});

test('diacritic-insensitive trigger matching routes unaccented Spanish queries accurately', () => {
  const resAuth = runRouter('autenticacion con jwt');
  assert.equal(resAuth.primary, 'jwt-bcrypt');
  assert.equal(resAuth.confidence, 1);

  const resAuthOnly = runRouter('autenticacion de usuarios');
  assert.equal(resAuthOnly.primary, 'jwt-bcrypt');
  assert.equal(resAuthOnly.confidence, 1);

  const resTel = runRouter('telemetria');
  assert.ok(
    resTel.primary === 'monitoring' || resTel.tier1toLoad.includes('monitoring'),
    `Expected monitoring in routed skills for 'telemetria', got ${JSON.stringify(resTel)}`
  );
  assert.equal(resTel.confidence, 1);

  const resTelMet = runRouter('telemetria y metricas');
  assert.equal(resTelMet.primary, 'monitoring');
  assert.equal(resTelMet.confidence, 1);
});

test('Unicode word-boundary matching routes dotted triggers cleanly', () => {
  const resPrd = runRouter('PRD.md');
  assert.ok(
    resPrd.primary === 'idea-to-prd-express' || resPrd.primary === 'product-requirements-prd',
    `Expected PRD.md to route to idea-to-prd-express (or product-requirements-prd), got ${resPrd.primary}`
  );
  assert.equal(resPrd.confidence, 1);

  const resNode = runRouter('node.js');
  assert.equal(resNode.primary, 'nodejs');
  assert.equal(resNode.confidence, 1);

  const resSocket = runRouter('socket.io');
  assert.equal(resSocket.primary, 'socketio');
  assert.equal(resSocket.confidence, 1);
});

test('skill-router exports normalizeText and buildWordBoundaryRegex safely without exiting', async () => {
  const mod = await import('../00-meta-skills/skill-router/scripts/skill-router.mjs');
  assert.equal(typeof mod.normalizeText, 'function');
  assert.equal(typeof mod.buildWordBoundaryRegex, 'function');
  assert.equal(mod.normalizeText('Animación y Diseño'), 'animacion y diseno');
  assert.ok(mod.buildWordBoundaryRegex('node.js').test('usar node.js en backend'));
});

test('skill-router detects Spanish plural animaciones as UI task and injects design-driven', () => {
  const res = runRouter('crear animaciones fluidas en la vista principal');
  assert.equal(res.isUiTask, true);
  assert.ok(
    res.primary === 'design-driven' || res.secondary.includes('design-driven') || res.tier1toLoad.includes('design-driven'),
    `Expected design-driven in router output, got ${JSON.stringify(res)}`
  );
});
