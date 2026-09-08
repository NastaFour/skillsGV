import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
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

test('catalog has exactly 209 active skills', () => {
  assert.equal(skills.length, 209, 'Total skills count should be exactly 209');
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

