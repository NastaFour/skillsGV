import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetrics, formatMarkdown, formatTerminal } from '../scripts/benchmark-evals.mjs';
import { REPO_ROOT } from '../_shared/catalog-manifest.mjs';

test('benchmark-evals calculates runtime-derived metrics for the catalog', () => {
  const metrics = calculateMetrics(REPO_ROOT);

  // Token metrics: every figure derives from the two measured byte counts.
  assert.ok(metrics.tokens.baselineTokens > 0, 'baseline tokens must be positive');
  assert.ok(metrics.tokens.currentTokens > 0, 'current tokens must be positive');
  assert.ok(metrics.tokens.currentTokens < metrics.tokens.baselineTokens, 'current tokens must be lower than baseline');
  const expectedSavings = Number(
    (((metrics.tokens.baselineTokens - metrics.tokens.currentTokens) / metrics.tokens.baselineTokens) * 100).toFixed(1)
  );
  assert.equal(metrics.tokens.tokenSavingsPercent, expectedSavings, 'token savings must derive from the measured token figures');

  // Eval metrics: no fixed totals; expectations come from the metrics object
  // plus the harness schema (every suite ships at least two evals).
  assert.ok(metrics.quality.suitesCount > 0, 'must evaluate at least one suite');
  assert.ok(metrics.quality.evalsCount >= metrics.quality.suitesCount * 2, 'every suite must contribute at least two evals');
  assert.ok(metrics.quality.totalChecks > 0, 'must run at least one expectation check');
  assert.equal(metrics.quality.checksFailed, 0, 'must have 0 failed checks');
  assert.equal(
    metrics.quality.checksPassed,
    metrics.quality.totalChecks - metrics.quality.checksFailed,
    'passed checks must complement failed checks'
  );
  assert.equal(metrics.quality.successRatePercent, 100, 'a clean run must report 100% success');

  // Routing metrics: precision derives from the live routing results.
  assert.ok(metrics.routing.totalRoutingQueries > 0, 'must run at least one routing eval');
  const expectedPrecision = Number(((metrics.routing.routingPassed / metrics.routing.totalRoutingQueries) * 100).toFixed(1));
  assert.equal(metrics.routing.precisionPercent, expectedPrecision, 'routing precision must derive from the routing results');
});

test('benchmark-evals formatters report only measured figures', () => {
  const metrics = calculateMetrics(REPO_ROOT);
  const md = formatMarkdown(metrics);
  assert.ok(md.includes('skillsGV Benchmark'), 'markdown must contain title');
  assert.ok(/historical monolithic kernel/i.test(md), 'markdown must label the baseline as a fixed historical reference');
  assert.ok(md.includes(String(metrics.tokens.tokenSavingsPercent)), 'markdown must report the computed token savings');
  assert.ok(md.includes(String(metrics.quality.successRatePercent)), 'markdown must report the computed success rate');
  assert.ok(md.includes(String(metrics.routing.precisionPercent)), 'markdown must report the computed routing precision');
  assert.ok(!/Process Governance/i.test(md), 'markdown must not claim unmeasured process governance');
  assert.ok(!/Persistent Memory/i.test(md), 'markdown must not claim unmeasured persistent memory');

  const term = formatTerminal(metrics);
  assert.ok(term.includes('skillsGV Harness Benchmark'), 'terminal output must contain title');
  assert.ok(term.includes('PASS'), 'terminal output must contain PASS entries');
  assert.ok(!/Anthropic/i.test(term), 'terminal output must not invoke Anthropic schema language for offline checks');
  assert.ok(term.includes(String(metrics.quality.totalChecks)), 'terminal output must print the runtime check count');
});
