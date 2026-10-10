import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  matchCatalogSkills,
  detectDomains,
  synthesizeSkill,
  runDistiller,
} from '../00-meta-skills/skill-distiller/scripts/distill-project-skills.mjs';

test('matchCatalogSkills identifies relevant catalog skills from dependencies', () => {
  const manifest = {
    name: 'ecommerce-api',
    dependencies: {
      react: '^19.0.0',
      prisma: '^6.0.0',
      express: '^4.21.0',
    },
    devDependencies: {
      typescript: '^5.7.0',
      vitest: '^3.0.0',
      playwright: '^1.50.0',
    },
  };

  const matches = matchCatalogSkills(manifest);
  assert.deepEqual(matches, [
    'express',
    'playwright',
    'prisma',
    'react-19',
    'testing-patterns',
    'typescript',
  ]);
});

test('detectDomains discovers domain subdirectories in src/modules and src/services', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'distiller-domains-'));
  try {
    mkdirSync(join(tempDir, 'src', 'modules', 'billing'), { recursive: true });
    mkdirSync(join(tempDir, 'src', 'modules', 'identity'), { recursive: true });
    mkdirSync(join(tempDir, 'src', 'services', 'notifications'), { recursive: true });

    const domains = detectDomains(tempDir);
    assert.deepEqual(domains, ['billing', 'identity', 'notifications']);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('synthesizeSkill generates agentskills.io compliant SKILL.md with Absolute Bans', () => {
  const skillMd = synthesizeSkill({
    domain: 'order-fulfillment',
    targetName: 'shop-backend',
    catalogMatches: ['prisma', 'testing-patterns'],
    domains: ['order-fulfillment', 'billing'],
  });

  assert.match(skillMd, /^---\nname: order-fulfillment/);
  assert.match(skillMd, /description: .* Do NOT use for .*\n/);
  assert.match(skillMd, /scope: \[project-local\]/);
  assert.match(skillMd, /## 🚫 Absolute Bans/);
  assert.match(skillMd, /## 📐 Before & After Patterns/);
  assert.match(skillMd, /## 🧪 Testing Protocol/);
  assert.match(skillMd, /Arrange-Act-Assert/);
});

test('runDistiller creates project-scoped SKILL.md in .agent/skills/ in temp workspace', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'distiller-run-'));
  try {
    writeFileSync(
      join(tempDir, 'package.json'),
      JSON.stringify({
        name: 'cloud-wallet',
        dependencies: { zod: '^3.24.0', fastify: '^5.0.0' },
      }),
      'utf8'
    );

    mkdirSync(join(tempDir, 'src', 'domain', 'transactions'), { recursive: true });

    // Dry run first
    const dryResult = runDistiller({ target: tempDir, dryRun: true });
    assert.equal(dryResult.dryRun, true);
    assert.equal(dryResult.selectedDomain, 'transactions');

    // Real execution
    const realResult = runDistiller({ target: tempDir, dryRun: false });
    assert.equal(realResult.dryRun, false);

    const generatedSkillFile = join(tempDir, '.agent', 'skills', 'transactions', 'SKILL.md');
    const content = readFileSync(generatedSkillFile, 'utf8');
    assert.match(content, /name: transactions/);
    assert.match(content, /cloud-wallet/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});
