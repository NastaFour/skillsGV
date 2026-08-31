import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const bin = resolve(here, '..', 'bin', 'gentle-dsh.mjs');

function run(args) {
  return spawnSync(process.execPath, [bin, ...args], { stdio: 'ignore' });
}

test('--dry-run does not write anything', () => {
  const d = mkdtempSync(join(tmpdir(), 'gdsh-'));
  const r = run(['--dry-run', '--dsh-home', d, '--agents-home', d]);
  assert.equal(r.status, 0, 'dry-run exit 0');
  assert.equal(existsSync(join(d, '.agent-presets')), false, 'no .agent-presets written');
  assert.equal(existsSync(join(d, 'AGENTS.md')), false, 'no AGENTS.md written');
  rmSync(d, { recursive: true, force: true });
});

test('install into a temp DSH_HOME then doctor PASS', () => {
  const d = mkdtempSync(join(tmpdir(), 'gdsh-'));
  const r = run(['--dsh-home', d, '--agents-home', d, '--set-default']);
  assert.equal(r.status, 0, 'install exit 0');
  assert.equal(existsSync(join(d, '.agent-presets', 'gentle-ai', 'agent.cordis.yml')), true, 'preset installed');
  assert.equal(existsSync(join(d, 'AGENTS.md')), true, 'AGENTS.md installed');
  assert.equal(existsSync(join(d, 'skills', 'sdd-orchestrator', 'SKILL.md')), true, 'skills installed');
  const dr = run(['doctor', '--dsh-home', d, '--agents-home', d]);
  assert.equal(dr.status, 0, 'doctor PASS');
  rmSync(d, { recursive: true, force: true });
});

test('--uninstall restores a backed-up AGENTS.md', () => {
  const d = mkdtempSync(join(tmpdir(), 'gdsh-'));
  writeFileSync(join(d, 'AGENTS.md'), 'ORIGINAL-CONTENT', 'utf8');
  const inst = run(['--dsh-home', d, '--agents-home', d]);
  assert.equal(inst.status, 0, 'install exit 0');
  const un = run(['--uninstall', '--dsh-home', d, '--agents-home', d]);
  assert.equal(un.status, 0, 'uninstall exit 0');
  assert.equal(readFileSync(join(d, 'AGENTS.md'), 'utf8'), 'ORIGINAL-CONTENT', 'AGENTS.md restored');
  assert.equal(existsSync(join(d, '.agent-presets', 'gentle-ai')), false, 'preset removed');
  rmSync(d, { recursive: true, force: true });
});
