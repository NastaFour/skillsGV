import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { REPO_ROOT } from '../_shared/catalog-manifest.mjs';
import {
  evaluateExpectation,
  findEvalSuites,
  readEvalJson,
  runOfflineEvaluations,
  runRouter,
  validateEvalSuite,
} from '../_shared/eval-harness.mjs';

// The four top skills that must ship evals.json (design: skills-25-upgrade).
const TOP_SKILLS = ['skill-router', 'sdd-orchestrator', 'judgment-day', 'agent-roster'];

function makeFixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), 'skills-evals-'));
  const dir = join(root, '00-meta-skills', 'fixture-skill');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), '---\nname: fixture-skill\ndescription: "fixture suite"\n---\n\n# fixture\n', 'utf8');
  return { root, dir };
}

function writeSuite(dir, suite) {
  writeFileSync(join(dir, 'evals.json'), `${JSON.stringify(suite, null, 2)}\n`, 'utf8');
}

function okEval(id, extra = {}) {
  return {
    id,
    prompt: `prompt for ${id}`,
    files: [],
    expected_output: `gold output ${id}`,
    expectations: ['contains:gold output'],
    ...extra,
  };
}

function formatProblems(problems) {
  return problems.length === 0 ? 'no problems' : `\n${problems.join('\n')}`;
}

test('top skills ship an evals.json suite', () => {
  const names = findEvalSuites(REPO_ROOT).map((s) => s.skill);
  for (const skill of TOP_SKILLS) {
    assert.ok(names.includes(skill), `${skill} must ship evals.json (found: ${names.join(', ')})`);
  }
});

test('catalog evals.json suites are schema-valid', () => {
  const problems = [];
  for (const suite of findEvalSuites(REPO_ROOT)) {
    const loaded = readEvalJson(suite.evalsPath);
    if (!loaded.ok) {
      problems.push(`${suite.skill}: ${loaded.error}`);
      continue;
    }
    for (const err of validateEvalSuite(loaded.raw, { skill: suite.skill }).errors) {
      problems.push(`${err.skill} ${err.evalId} ${err.field}: ${err.message}`);
    }
  }
  assert.deepEqual(problems, [], `schema errors:${formatProblems(problems)}`);
});

test('catalog evals pass offline with routes-to via the real skill-router', () => {
  const { suites, summary } = runOfflineEvaluations(REPO_ROOT);
  const problems = [];
  for (const suite of suites) {
    for (const err of suite.schemaErrors) problems.push(`${suite.skill} ${err.evalId} ${err.field}: ${err.message}`);
    for (const result of suite.results) {
      for (const check of result.checks) {
        if (!check.ok) problems.push(`${suite.skill} ${result.evalId} "${check.expectation}": ${check.detail}`);
      }
    }
  }
  assert.deepEqual(problems, [], `offline eval failures:${formatProblems(problems)}`);
  assert.ok(summary.suites >= TOP_SKILLS.length, `expected at least ${TOP_SKILLS.length} suites, found ${summary.suites}`);
  assert.ok(summary.checks >= 20, `expected at least 20 expectation checks, found ${summary.checks}`);
});

test('routes-to consults the real skill-router CLI', () => {
  const routed = runRouter(REPO_ROOT, 'two judges: adversarial review of the staged diff');
  assert.equal(routed.ok, true, routed.error);
  assert.equal(routed.primary, 'judgment-day');

  // A wrong routes-to target must fail: proves the check reads the router result.
  const wrong = evaluateExpectation('routes-to:code-reviewer', {
    text: '',
    prompt: 'two judges: adversarial review of the staged diff',
    root: REPO_ROOT,
  });
  assert.equal(wrong.ok, false, 'routes-to:code-reviewer must not pass while the router picks judgment-day');
});

test('valid fixture suite passes schema and evaluates green', () => {
  const { root, dir } = makeFixtureRoot();
  try {
    writeSuite(dir, {
      evals: [
        okEval('e1'),
        okEval('e2', { expectations: ['contains:gold', 'regex:gold output e2', 'not-contains:NOPE'] }),
      ],
    });
    const { suites, summary } = runOfflineEvaluations(root);
    assert.equal(summary.suites, 1);
    assert.equal(summary.failed, 0, JSON.stringify(suites, null, 2));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('unmet expectation turns the fixture suite red naming eval and expectation', () => {
  const { root, dir } = makeFixtureRoot();
  try {
    writeSuite(dir, {
      evals: [okEval('e1'), okEval('e2', { expectations: ['contains:GOLD-NEVER-PRESENT'] })],
    });
    const { suites, summary } = runOfflineEvaluations(root);
    assert.equal(summary.failed, 1);
    const failing = suites[0].results.find((r) => !r.ok);
    assert.equal(failing.evalId, 'e2');
    assert.equal(failing.checks[0].expectation, 'contains:GOLD-NEVER-PRESENT');
    assert.equal(failing.checks[0].ok, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('invalid schema: missing expected_output fails naming eval and field', () => {
  const { root, dir } = makeFixtureRoot();
  try {
    const bad = okEval('e1');
    delete bad.expected_output;
    writeSuite(dir, { evals: [bad, okEval('e2')] });
    const loaded = readEvalJson(join(dir, 'evals.json'));
    assert.equal(loaded.ok, true);
    const { ok, errors } = validateEvalSuite(loaded.raw, { skill: 'fixture-skill' });
    assert.equal(ok, false);
    assert.ok(
      errors.some((e) => e.evalId === 'e1' && e.field === 'expected_output'),
      `expected an e1/expected_output error, got: ${JSON.stringify(errors)}`
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('invalid schema: fewer than 2 evals fails', () => {
  const { root, dir } = makeFixtureRoot();
  try {
    writeSuite(dir, { evals: [okEval('e1')] });
    const loaded = readEvalJson(join(dir, 'evals.json'));
    const { ok, errors } = validateEvalSuite(loaded.raw, { skill: 'fixture-skill' });
    assert.equal(ok, false);
    assert.ok(
      errors.some((e) => e.field === 'evals' && /at least 2/.test(e.message)),
      `expected an evals/at-least-2 error, got: ${JSON.stringify(errors)}`
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('invalid schema: unknown expectation kind fails naming the slot', () => {
  const { root, dir } = makeFixtureRoot();
  try {
    writeSuite(dir, {
      evals: [okEval('e1'), okEval('e2', { expectations: ['contains:gold', 'verify:something'] })],
    });
    const loaded = readEvalJson(join(dir, 'evals.json'));
    const { ok, errors } = validateEvalSuite(loaded.raw, { skill: 'fixture-skill' });
    assert.equal(ok, false);
    assert.ok(
      errors.some((e) => e.evalId === 'e2' && e.field === 'expectations[1]'),
      `expected an e2/expectations[1] error, got: ${JSON.stringify(errors)}`
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
