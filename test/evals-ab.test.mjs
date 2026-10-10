import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  buildAbPair,
  blindRandomize,
  scoreRubric,
  evaluateBlindJudge,
  calculateAbSummary,
  formatAbSummaryTable,
  runAbLoop,
} from '../_shared/eval-ab.mjs';

function makeMockRoot() {
  const root = mkdtempSync(join(tmpdir(), 'skills-ab-test-'));
  const skillDir = join(root, '06-code-quality', 'mock-skill');
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(
    join(skillDir, 'SKILL.md'),
    `---
name: mock-skill
description: "mock quality skill"
---

# Mock Skill Instructions
- Always use conventional commits: type(scope): description
- Never add Co-Authored-By attribution.
- Commit code, tests, and docs together.
`,
    'utf8'
  );
  writeFileSync(
    join(skillDir, 'evals.json'),
    JSON.stringify(
      {
        evals: [
          {
            id: 'mock-eval-1',
            prompt: 'plan a commit for a bug fix',
            files: [],
            expected_output: 'fix(core): resolve null pointer in parser\n\nIncludes test and documentation.',
            expectations: ['contains:fix(', 'not-contains:Co-Authored-By', 'regex:test|docs'],
          },
        ],
      },
      null,
      2
    ),
    'utf8'
  );
  return { root, skillDir };
}

test('buildAbPair creates bare and skill-injected task prompts', () => {
  const { root } = makeMockRoot();
  try {
    const pair = buildAbPair(
      {
        skill: 'mock-skill',
        evalItem: {
          id: 'test-1',
          prompt: 'plan a commit for a bug fix',
          expectations: ['contains:fix('],
        },
      },
      root
    );

    assert.equal(pair.barePrompt, 'plan a commit for a bug fix');
    assert.ok(pair.skillPrompt.includes('Mock Skill Instructions'), 'skillPrompt must contain skill instructions');
    assert.ok(pair.skillPrompt.includes('plan a commit for a bug fix'), 'skillPrompt must contain task prompt');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('blindRandomize blinds arms and unblind mapping recovers true identities', () => {
  const bareArm = { arm: 'bare', text: 'bare response' };
  const skillArm = { arm: 'skill', text: 'skill response' };

  // Test across multiple runs to verify randomized assignment and correct mapping
  for (let i = 0; i < 20; i++) {
    const blinded = blindRandomize(bareArm, skillArm);
    assert.ok(blinded.candidate1);
    assert.ok(blinded.candidate2);
    assert.ok(['bare', 'skill'].includes(blinded.mapping.candidate1));
    assert.ok(['bare', 'skill'].includes(blinded.mapping.candidate2));
    assert.notEqual(blinded.mapping.candidate1, blinded.mapping.candidate2);

    if (blinded.mapping.candidate1 === 'bare') {
      assert.equal(blinded.candidate1.text, bareArm.text);
      assert.equal(blinded.candidate2.text, skillArm.text);
    } else {
      assert.equal(blinded.candidate1.text, skillArm.text);
      assert.equal(blinded.candidate2.text, bareArm.text);
    }
  }
});

test('scoreRubric evaluates compliance expectations and quality heuristics', () => {
  const expectations = ['contains:fix(', 'not-contains:Co-Authored-By', 'regex:test|docs'];

  const compliantText = 'fix(core): resolve issue\nAdded tests and docs.';
  const nonCompliantText = 'I resolved the bug!\nCo-Authored-By: AI Assistant';

  const goodScore = scoreRubric(compliantText, expectations);
  const badScore = scoreRubric(nonCompliantText, expectations);

  assert.equal(goodScore.passedChecks, 3);
  assert.equal(goodScore.totalChecks, 3);
  assert.equal(goodScore.complianceRate, 1.0);
  assert.ok(goodScore.totalScore > badScore.totalScore, 'compliant text must have higher rubric score');

  assert.equal(badScore.passedChecks, 0);
  assert.equal(badScore.complianceRate, 0);
});

test('evaluateBlindJudge determines winner and unblinds correctly', () => {
  const bareArm = { arm: 'bare', text: 'Poor response', score: 1.0 };
  const skillArm = { arm: 'skill', text: 'Excellent response with conventional commits', score: 5.0 };

  const blinded = blindRandomize(bareArm, skillArm);
  const judgment = evaluateBlindJudge(blinded, (c1, c2) => {
    // Deterministic mock judge choosing candidate with higher score
    if (c1.score > c2.score) return 'candidate1';
    if (c2.score > c1.score) return 'candidate2';
    return 'tie';
  });

  assert.equal(judgment.winner, 'skill');
  assert.equal(judgment.loser, 'bare');
});

test('calculateAbSummary computes aggregate metrics across evaluated tasks', () => {
  const mockResults = [
    {
      taskId: 'task-1',
      skill: 'mock-skill',
      winner: 'skill',
      bare: { durationMs: 1200, outputChars: 300, score: 2.0 },
      skill: { durationMs: 1400, outputChars: 250, score: 4.5 },
    },
    {
      taskId: 'task-2',
      skill: 'mock-skill',
      winner: 'skill',
      bare: { durationMs: 1100, outputChars: 400, score: 2.5 },
      skill: { durationMs: 1300, outputChars: 220, score: 5.0 },
    },
    {
      taskId: 'task-3',
      skill: 'mock-skill',
      winner: 'tie',
      bare: { durationMs: 900, outputChars: 150, score: 3.0 },
      skill: { durationMs: 950, outputChars: 140, score: 3.0 },
    },
  ];

  const summary = calculateAbSummary(mockResults);

  assert.equal(summary.totalTasks, 3);
  assert.equal(summary.skillWins, 2);
  assert.equal(summary.bareWins, 0);
  assert.equal(summary.ties, 1);
  assert.equal(summary.skillWinRatePercent, 66.7);
  assert.equal(summary.bareWinRatePercent, 0.0);
  assert.equal(summary.tieRatePercent, 33.3);
  assert.ok(summary.avgScoreLift > 0, 'avg score lift must be positive');

  const table = formatAbSummaryTable(summary);
  assert.ok(table.includes('A/B Evaluation Summary'));
  assert.ok(table.includes('66.7%'));
});

test('runAbLoop executes loop with mock agent runner and writes results', () => {
  const { root } = makeMockRoot();
  try {
    const mockAgentRunner = (prompt) => {
      if (prompt.includes('Mock Skill Instructions')) {
        return {
          stdout: 'fix(core): resolve null pointer\nIncludes test and docs.',
          stderr: '',
          exitCode: 0,
          durationMs: 100,
        };
      }
      return {
        stdout: 'Fixed bug.\nCo-Authored-By: AI',
        stderr: '',
        exitCode: 0,
        durationMs: 80,
      };
    };

    const runResult = runAbLoop({
      root,
      agentRunner: mockAgentRunner,
      skillFilter: 'mock-skill',
      persistHistory: true,
    });

    assert.equal(runResult.tasksCount, 1);
    assert.equal(runResult.summary.skillWins, 1);
    assert.ok(runResult.historyPath, 'historyPath must be generated');

    const fullHistoryPath = join(root, runResult.historyPath);
    assert.ok(existsSync(fullHistoryPath), 'persisted history file must exist');

    const historyData = JSON.parse(readFileSync(fullHistoryPath, 'utf8'));
    assert.equal(historyData.results.length, 1);
    assert.equal(historyData.results[0].winner, 'skill');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
