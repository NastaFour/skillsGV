import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR_SCRIPT = join(REPO_ROOT, '00-meta-skills/skill-validator/scripts/validate-skills.mjs');

function runValidatorOnTempSkill(frontmatterBody) {
  const tmpRoot = mkdtempSync(join(tmpdir(), 'skill-val-test-'));
  const skillDir = join(tmpRoot, 'sample-skill');
  mkdirSync(skillDir, { recursive: true });
  const skillPath = join(skillDir, 'SKILL.md');
  writeFileSync(skillPath, `${frontmatterBody}\n\n# Sample Skill\n\nBody text.\n`, 'utf8');
  try {
    const stdout = execFileSync('node', [VALIDATOR_SCRIPT, tmpRoot, '--skip-index-sync', '--json'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return JSON.parse(stdout);
  } catch (err) {
    if (err.stdout) return JSON.parse(err.stdout);
    throw err;
  } finally {
    try { rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
  }
}

test('validate-skills passes with 0 errors in strict mode on entire catalog', () => {
  const stdout = execFileSync('node', ['00-meta-skills/skill-validator/scripts/validate-skills.mjs', '--skip-index-sync', '--strict'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  });
  assert.match(stdout, /(\d+)\s+pass\s+[·•\-]\s+0\s+with issues/);
  const passCount = parseInt(stdout.match(/(\d+)\s+pass\s+[·•\-]\s+0\s+with issues/)[1], 10);
  assert.ok(passCount >= 230, `Expected at least 230 passing skills, got ${passCount}`);
  assert.match(stdout, /0 errors · 0 warnings/);
});

test('frontmatter-strict-yaml catches unquoted colon-space in scalars', () => {
  const res = runValidatorOnTempSkill(`---
name: sample-skill
description: Trigger: sample skill. Use when testing validator. Do NOT use for production.
license: MIT
compatibility: Requiere Node 20+. Windows-first: scripts en .mjs.
allowed-tools: Read
metadata:
  trigger: ["sample"]
  version: "1.0.0"
---`);
  const issues = res.results[0].issues.filter((i) => i.check === 'frontmatter-strict-yaml');
  assert.ok(issues.length >= 2, `Expected at least 2 frontmatter-strict-yaml issues, got ${JSON.stringify(issues)}`);
  assert.ok(issues.every((i) => i.severity === 'error'));
});

test('frontmatter-strict-yaml catches trailing text after closing quotes and unclosed quotes', () => {
  const res = runValidatorOnTempSkill(`---
name: sample-skill
description: "Implement a piece of work." Use when testing validator. Do NOT use for production.
license: MIT
compatibility: "Unclosed quote scalar
allowed-tools: Read
metadata:
  trigger: ["sample"]
  version: "1.0.0"
---`);
  const issues = res.results[0].issues.filter((i) => i.check === 'frontmatter-strict-yaml');
  assert.equal(issues.length, 2, `Expected 2 frontmatter-strict-yaml issues, got ${JSON.stringify(issues)}`);
  assert.match(issues[0].msg, /trailing text after closing double quote/i);
  assert.match(issues[1].msg, /unclosed double-quoted scalar/i);
});

test('frontmatter-strict-yaml catches tab indentation in frontmatter', () => {
  const res = runValidatorOnTempSkill(`---
name: sample-skill
description: "Sample skill. Use when testing validator. Do NOT use for production."
license: MIT
allowed-tools: Read
metadata:
\ttrigger: ["sample"]
  version: "1.0.0"
---`);
  const issues = res.results[0].issues.filter((i) => i.check === 'frontmatter-strict-yaml');
  assert.equal(issues.length, 1, `Expected 1 tab indentation issue, got ${JSON.stringify(issues)}`);
  assert.match(issues[0].msg, /tab indentation/i);
});

test('frontmatter-strict-yaml passes when scalars with colons are properly quoted or use block scalars', () => {
  const res = runValidatorOnTempSkill(`---
name: sample-skill
description: "Trigger: sample skill. Use when testing validator. Do NOT use for production."
license: MIT
compatibility: "Requiere Node 20+. Windows-first: scripts en .mjs."
allowed-tools: Read
metadata:
  trigger: ["sample"]
  version: "1.0.0"
---`);
  const strictIssues = res.results[0].issues.filter((i) => i.check === 'frontmatter-strict-yaml');
  assert.equal(strictIssues.length, 0, `Expected 0 frontmatter-strict-yaml issues, got ${JSON.stringify(strictIssues)}`);
  assert.equal(res.errors, 0);
});

test('validateStrictYamlFrontmatter can be imported directly and validates multiline quotes, >2+ headers, and list colons', async () => {
  const { validateStrictYamlFrontmatter } = await import('../00-meta-skills/skill-validator/scripts/validate-skills.mjs');
  assert.equal(typeof validateStrictYamlFrontmatter, 'function');

  // Valid multiline double-quoted scalar and >2+ block scalar
  const validIssues = validateStrictYamlFrontmatter(`name: sample-skill
description: "First line of a valid
  multiline quoted description: with colon"
notes: >2+
  indented block scalar: with colon
metadata:
  trigger:
    - "quoted: trigger"`);
  assert.equal(validIssues.length, 0, `Expected 0 issues for valid YAML, got ${JSON.stringify(validIssues)}`);

  // Invalid unquoted colon in list item and unclosed multiline quote before next key
  const invalidIssues = validateStrictYamlFrontmatter(`name: sample-skill
description: "Unclosed quote before next key
license: MIT
metadata:
  trigger:
    - unquoted: colon in list item`);
  assert.equal(invalidIssues.length, 2, `Expected 2 issues, got ${JSON.stringify(invalidIssues)}`);
  assert.match(invalidIssues[0].msg, /unclosed double-quoted scalar/i);
  assert.match(invalidIssues[1].msg, /unquoted ": " in list item scalar/i);
});
