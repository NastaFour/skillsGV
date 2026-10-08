import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics, formatMarkdown, formatTerminal } from '../scripts/benchmark-evals.mjs';
import { REPO_ROOT } from '../_shared/catalog-manifest.mjs';

test('benchmark-evals calculates valid metrics for the catalog', () => {
  const metrics = calculateMetrics(REPO_ROOT);
  assert.ok(metrics.tokens.baselineTokens > 0, 'baseline tokens must be positive');
  assert.ok(metrics.tokens.currentTokens < metrics.tokens.baselineTokens, 'current tokens must be lower than baseline');
  assert.ok(metrics.tokens.tokenSavingsPercent > 50, 'token savings must be > 50%');

  assert.equal(metrics.quality.suitesCount >= 16, true, 'must evaluate at least 16 suites');
  assert.equal(metrics.quality.checksFailed, 0, 'must have 0 failed checks');
  assert.equal(metrics.quality.successRatePercent, 100, 'must have 100% success rate');

  assert.equal(metrics.routing.precisionPercent, 100, 'must have 100% routing precision');
  assert.ok(metrics.routing.totalRoutingQueries >= 32, 'must test at least 32 routing queries');
});

test('benchmark-evals formatters produce non-empty reports', () => {
  const metrics = calculateMetrics(REPO_ROOT);
  const md = formatMarkdown(metrics);
  assert.ok(md.includes('skillsGV Benchmark'), 'markdown must contain title');
  assert.ok(md.includes('token reduction'), 'markdown must report token reduction');

  const term = formatTerminal(metrics);
  assert.ok(term.includes('skillsGV Harness Benchmark'), 'terminal output must contain title');
  assert.ok(term.includes('PASS'), 'terminal output must contain PASS entries');
});
