import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('validate-skills passes with 0 errors in strict mode on entire catalog', () => {
  const stdout = execFileSync('node', ['00-meta-skills/skill-validator/scripts/validate-skills.mjs', '--skip-index-sync', '--strict'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  });
  assert.match(stdout, /(\d+) pass · 0 with issues/);
  const passCount = parseInt(stdout.match(/(\d+) pass · 0 with issues/)[1], 10);
  assert.ok(passCount >= 200, `Expected at least 200 passing skills, got ${passCount}`);
  assert.match(stdout, /0 errors · 0 warnings/);
});
