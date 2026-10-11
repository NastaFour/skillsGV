import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

function runRouter(query) {
  const stdout = execFileSync('node', ['00-meta-skills/skill-router/scripts/skill-router.mjs', '--query', query, '--json'], {
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

  const resBackend = runRouter('database migration with prisma postgres');
  assert.equal(resBackend.isUiTask, false, 'Database query should not be detected as UI task');
});

