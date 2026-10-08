import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename } from 'node:path';

function walkSkills(dir) {
  let out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (['node_modules', '.git', 'gentle-ai-dsh', '_shared'].includes(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkSkills(full));
    else if (e.isFile() && e.name === 'SKILL.md') out.push(full);
  }
  return out;
}

const skills = walkSkills('.');

test('catalog active skills count matches catalog.json', () => {
  const catalog = JSON.parse(readFileSync('catalog.json', 'utf8'));
  const expected = catalog.totals?.skills || Object.keys(catalog.skills || {}).length;
  assert.equal(skills.length, expected, `Total skills count (${skills.length}) should match catalog.json (${expected})`);
});

test('zero [APP] placeholder in all skills', () => {
  const violations = [];
  for (const s of skills) {
    const c = readFileSync(s, 'utf8');
    if (c.includes('[APP]')) violations.push(s);
  }
  assert.deepEqual(violations, [], 'No skill should contain [APP]');
});

test('zero barber business logic in all skills', () => {
  const violations = [];
  for (const s of skills) {
    const c = readFileSync(s, 'utf8');
    if (/barber reassignment|barber not found|barber\.profile/i.test(c)) {
      violations.push(s);
    }
  }
  assert.deepEqual(violations, [], 'No skill should contain barber shop logic');
});

test('zero QuickOrder / supermercado business logic in all skills', () => {
  const violations = [];
  for (const s of skills) {
    const c = readFileSync(s, 'utf8');
    if (/QuickOrder|supermercado/i.test(c)) {
      violations.push(s);
    }
  }
  assert.deepEqual(violations, [], 'No skill should contain QuickOrder or supermarket remnants');
});

test('all skills declare strict semver version X.Y.Z', () => {
  const violations = [];
  for (const s of skills) {
    const c = readFileSync(s, 'utf8');
    const vMatch = c.match(/version:\s*"?([^"\r\n]+)"?/);
    if (!vMatch || !/^\d+\.\d+\.\d+$/.test(vMatch[1].trim().replace(/^['"]|['"]$/g, ''))) {
      violations.push({ skill: s, version: vMatch ? vMatch[1] : 'missing' });
    }
  }
  assert.deepEqual(violations, [], 'All skills must have valid 3-digit semver');
});

test('all skills declare allowed-tools', () => {
  const violations = [];
  for (const s of skills) {
    const c = readFileSync(s, 'utf8');
    if (!c.includes('allowed-tools:')) {
      violations.push(s);
    }
  }
  assert.deepEqual(violations, [], 'All skills must declare allowed-tools');
});

test('residual proyecto.txt does not exist in catalog', () => {
  assert.equal(existsSync('01-planning-process/proyecto.txt'), false, 'proyecto.txt should be deleted');
});

test('zero [APP], barber, or supermarket contamination in gentle-ai-dsh/skills', () => {
  const dshSkills = walkSkills('gentle-ai-dsh/skills');
  const violations = [];
  for (const s of dshSkills) {
    const c = readFileSync(s, 'utf8');
    if (/barber reassignment|\[APP\]|QuickOrder|supermercado|barbergo|mobile-barber/i.test(c)) {
      violations.push(s);
    }
  }
  assert.deepEqual(violations, [], 'gentle-ai-dsh/skills must have zero contamination');
});

test('all skills in catalog.json have a valid tier (core | extended | full)', () => {
  const catalog = JSON.parse(readFileSync('catalog.json', 'utf8'));
  const validTiers = new Set(['core', 'extended', 'full']);
  const violations = [];
  for (const s of catalog.skills) {
    if (!validTiers.has(s.tier)) violations.push(`${s.name}: invalid tier "${s.tier}"`);
  }
  assert.deepEqual(violations, [], 'All skills must declare a valid tier');
  const coreCount = catalog.skills.filter((s) => s.tier === 'core').length;
  const extCount = catalog.skills.filter((s) => s.tier === 'extended').length;
  assert.ok(coreCount >= 30 && coreCount <= 45, `Core tier should have ~35 skills, got ${coreCount}`);
  assert.ok(coreCount + extCount >= 80 && coreCount + extCount <= 105, `Core+Extended should have ~90 skills, got ${coreCount + extCount}`);
});

test('installer --tier filters skills properly in dry-run', () => {
  const script = '00-meta-skills/skill-sync/scripts/install-skills.mjs';
  const outCore = execFileSync('node', [script, '--dry-run', '--tier', 'core', '--tool', 'claude-code'], { encoding: 'utf8' });
  const coreMatch = outCore.match(/Found (\d+) skills in catalog/);
  assert.ok(coreMatch, 'Core tier output should report skill count');
  const countCore = parseInt(coreMatch[1], 10);
  assert.ok(countCore >= 30 && countCore <= 45, `Core count in installer should be ~35, got ${countCore}`);

  const outExt = execFileSync('node', [script, '--dry-run', '--tier', 'extended', '--tool', 'claude-code'], { encoding: 'utf8' });
  const extMatch = outExt.match(/Found (\d+) skills in catalog/);
  assert.ok(extMatch, 'Extended tier output should report skill count');
  const countExt = parseInt(extMatch[1], 10);
  assert.ok(countExt >= 80 && countExt <= 105, `Extended count in installer should be ~90, got ${countExt}`);
  assert.ok(countExt > countCore, 'Extended count should exceed Core count');

  const outFull = execFileSync('node', [script, '--dry-run', '--tier', 'full', '--tool', 'claude-code'], { encoding: 'utf8' });
  const fullMatch = outFull.match(/Found (\d+) skills in catalog/);
  assert.ok(fullMatch, 'Full tier output should report skill count');
  const countFull = parseInt(fullMatch[1], 10);
  assert.ok(countFull > countExt, 'Full count should exceed Extended count');
});

