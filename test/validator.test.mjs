import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('validate-skills passes with 0 errors in strict mode on entire catalog', () => {
  const stdout = execFileSync('node', ['00-meta-skills/skill-validator/scripts/validate-skills.mjs', '--skip-index-sync', '--strict'], {
    encoding: 'utf8'
  });
  assert.match(stdout, /209 pass/);
  assert.match(stdout, /0 errors/);
});
