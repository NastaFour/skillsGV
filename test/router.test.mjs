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
