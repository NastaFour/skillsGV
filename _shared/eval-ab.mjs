/**
 * eval-ab.mjs — Shared engine for live A/B evaluation harness.
 *
 * Runs randomized, blind comparative evaluations comparing:
 * - Arm Control (Bare): baseline agent prompt without skill.
 * - Arm Treatment (Skill): agent prompt with loaded/injected skill instructions.
 *
 * Implements:
 * 1. Prompt pair synthesis (bare vs skill-injected).
 * 2. Positional debiasing via blind randomization.
 * 3. Rubric scoring (deterministic rule compliance + quality heuristics).
 * 4. Blind judge execution and unblinding.
 * 5. Aggregate metrics calculation and reporting table formatter.
 * 6. Full A/B loop execution with history persistence under evals/results/.
 *
 * Node-only, ESM, Windows-first, no external dependencies.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REPO_ROOT,
  findEvalSuites,
  readEvalJson,
  parseExpectation,
} from "./eval-harness.mjs";
import { walkSkillPaths, readSkillName } from "./catalog-manifest.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Builds bare and skill-injected prompt pair for an evaluation item.
 */
export function buildAbPair(evalContext, root = REPO_ROOT) {
  const { skill, evalItem } = evalContext;
  const barePrompt = evalItem.prompt;

  let skillContent = "";
  // Locate the skill directory
  for (const relPath of walkSkillPaths(root)) {
    if (readSkillName(root, relPath) === skill) {
      const skillFile = join(root, ...relPath.split("/"));
      if (existsSync(skillFile)) {
        skillContent = readFileSync(skillFile, "utf8");
      }
      break;
    }
  }

  const skillPrompt = skillContent
    ? `<skill_instructions name="${skill}">\n${skillContent.trim()}\n</skill_instructions>\n\nTask: ${barePrompt}`
    : barePrompt;

  return {
    skill,
    evalId: evalItem.id,
    barePrompt,
    skillPrompt,
  };
}

/**
 * Blinds arms into Candidate 1 and Candidate 2 with 50/50 randomization.
 * Returns { candidate1, candidate2, mapping: { candidate1, candidate2 } }.
 */
export function blindRandomize(bareArm, skillArm) {
  const isBareFirst = Math.random() < 0.5;
  if (isBareFirst) {
    return {
      candidate1: { ...bareArm },
      candidate2: { ...skillArm },
      mapping: { candidate1: "bare", candidate2: "skill" },
    };
  }
  return {
    candidate1: { ...skillArm },
    candidate2: { ...bareArm },
    mapping: { candidate1: "skill", candidate2: "bare" },
  };
}

/**
 * Deterministic rubric scoring based on expectation checks and output structure.
 */
export function scoreRubric(candidateText = "", expectations = []) {
  const text = String(candidateText ?? "");
  let passedChecks = 0;
  const totalChecks = expectations.length;

  for (const exp of expectations) {
    const parsed = parseExpectation(exp);
    if (!parsed.ok) continue;
    const { kind, value } = parsed;

    if (kind === "contains") {
      if (text.includes(value)) passedChecks++;
    } else if (kind === "not-contains") {
      if (!text.includes(value)) passedChecks++;
    } else if (kind === "regex") {
      try {
        const re = new RegExp(value, "i");
        if (re.test(text)) passedChecks++;
      } catch {
        // ignore invalid regex
      }
    } else if (kind === "routes-to") {
      // Ignored for candidate text evaluation (evaluated offline by harness)
      passedChecks++;
    }
  }

  const complianceRate = totalChecks > 0 ? Number((passedChecks / totalChecks).toFixed(2)) : 1.0;

  // Base score 1.0 to 5.0 scale
  let baseScore = 1.0 + complianceRate * 3.5;
  if (text.trim().length > 30) {
    baseScore += 0.5; // Has substantive output
  }

  // Penalty if excessive bloat (> 15k chars) without substance
  if (text.length > 15_000 && complianceRate < 0.5) {
    baseScore -= 1.0;
  }

  const totalScore = Number(Math.max(1.0, Math.min(5.0, baseScore)).toFixed(1));

  return {
    passedChecks,
    totalChecks,
    complianceRate,
    totalScore,
  };
}

/**
 * Blind judge decision mapper. Takes blinded candidates and a judge function,
 * returning unblinded winner ('skill', 'bare', or 'tie').
 */
export function evaluateBlindJudge(blinded, judgeFn) {
  const choice = judgeFn(blinded.candidate1, blinded.candidate2);
  let winner = "tie";
  let loser = null;

  if (choice === "candidate1") {
    winner = blinded.mapping.candidate1;
    loser = blinded.mapping.candidate2;
  } else if (choice === "candidate2") {
    winner = blinded.mapping.candidate2;
    loser = blinded.mapping.candidate1;
  }

  return {
    winner,
    loser,
    judgeChoice: choice,
    mapping: blinded.mapping,
  };
}

/**
 * Computes summary statistics over an array of evaluated task results.
 */
export function calculateAbSummary(results = []) {
  const totalTasks = results.length;
  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      skillWins: 0,
      bareWins: 0,
      ties: 0,
      skillWinRatePercent: 0,
      bareWinRatePercent: 0,
      tieRatePercent: 0,
      avgScoreLift: 0,
      avgBareScore: 0,
      avgSkillScore: 0,
      avgDurationDeltaMs: 0,
      avgCharDelta: 0,
    };
  }

  const skillWins = results.filter((r) => r.winner === "skill").length;
  const bareWins = results.filter((r) => r.winner === "bare").length;
  const ties = results.filter((r) => r.winner === "tie").length;

  const skillWinRatePercent = Number(((skillWins / totalTasks) * 100).toFixed(1));
  const bareWinRatePercent = Number(((bareWins / totalTasks) * 100).toFixed(1));
  const tieRatePercent = Number(((ties / totalTasks) * 100).toFixed(1));

  let totalBareScore = 0;
  let totalSkillScore = 0;
  let totalDurationDelta = 0;
  let totalCharDelta = 0;

  for (const r of results) {
    const bareScore = r.bare?.score ?? 0;
    const skillScore = r.skill?.score ?? 0;
    totalBareScore += bareScore;
    totalSkillScore += skillScore;
    totalDurationDelta += (r.skill?.durationMs ?? 0) - (r.bare?.durationMs ?? 0);
    totalCharDelta += (r.skill?.outputChars ?? 0) - (r.bare?.outputChars ?? 0);
  }

  const avgBareScore = Number((totalBareScore / totalTasks).toFixed(2));
  const avgSkillScore = Number((totalSkillScore / totalTasks).toFixed(2));
  const avgScoreLift = Number((avgSkillScore - avgBareScore).toFixed(2));
  const avgDurationDeltaMs = Math.round(totalDurationDelta / totalTasks);
  const avgCharDelta = Math.round(totalCharDelta / totalTasks);

  return {
    totalTasks,
    skillWins,
    bareWins,
    ties,
    skillWinRatePercent,
    bareWinRatePercent,
    tieRatePercent,
    avgBareScore,
    avgSkillScore,
    avgScoreLift,
    avgDurationDeltaMs,
    avgCharDelta,
  };
}

/**
 * Formats A/B summary statistics as a markdown / terminal table.
 */
export function formatAbSummaryTable(summary) {
  return [
    `### ⚖️ Live A/B Evaluation Summary`,
    ``,
    `| Metric | Arm: Bare (Control) | Arm: Skill (Treatment) | Delta / Lift |`,
    `|---|---|---|---|`,
    `| **Win Rate** | ${summary.bareWinRatePercent}% (${summary.bareWins}/${summary.totalTasks}) | **${summary.skillWinRatePercent}%** (${summary.skillWins}/${summary.totalTasks}) | **+${Number((summary.skillWinRatePercent - summary.bareWinRatePercent).toFixed(1))}%** |`,
    `| **Ties** | - | - | ${summary.tieRatePercent}% (${summary.ties}/${summary.totalTasks}) |`,
    `| **Average Score (1-5)** | ${summary.avgBareScore} | **${summary.avgSkillScore}** | **+${summary.avgScoreLift}** |`,
    `| **Avg Duration** | - | - | ${summary.avgDurationDeltaMs >= 0 ? "+" : ""}${summary.avgDurationDeltaMs} ms |`,
    `| **Avg Output Chars** | - | - | ${summary.avgCharDelta >= 0 ? "+" : ""}${summary.avgCharDelta} chars |`,
    ``,
    `*Evaluated across ${summary.totalTasks} task(s) under double-blind randomized assignment.*`,
  ].join("\n");
}

/**
 * Executes full A/B evaluation loop over available eval suites.
 */
export function runAbLoop({
  root = REPO_ROOT,
  agentRunner,
  judgeRunner = null,
  skillFilter = null,
  maxTasks = null,
  persistHistory = true,
}) {
  if (typeof agentRunner !== "function") {
    throw new Error("runAbLoop requires an agentRunner function: (prompt) => { stdout, stderr, exitCode, durationMs }");
  }

  const suites = findEvalSuites(root).filter((s) => !skillFilter || s.skill === skillFilter);
  const results = [];

  outerLoop: for (const suite of suites) {
    const loaded = readEvalJson(suite.evalsPath);
    if (!loaded.ok) continue;

    for (const item of loaded.raw.evals) {
      if (maxTasks && results.length >= maxTasks) break outerLoop;

      const pair = buildAbPair({ skill: suite.skill, evalItem: item }, root);

      // Execute Arm A: Bare
      const bareRun = agentRunner(pair.barePrompt);
      const bareScore = scoreRubric(bareRun.stdout, item.expectations);
      const bareArm = {
        arm: "bare",
        stdout: bareRun.stdout,
        durationMs: bareRun.durationMs,
        outputChars: (bareRun.stdout || "").length,
        score: bareScore.totalScore,
        complianceRate: bareScore.complianceRate,
        passedChecks: bareScore.passedChecks,
      };

      // Execute Arm B: Skill
      const skillRun = agentRunner(pair.skillPrompt);
      const skillScore = scoreRubric(skillRun.stdout, item.expectations);
      const skillArm = {
        arm: "skill",
        stdout: skillRun.stdout,
        durationMs: skillRun.durationMs,
        outputChars: (skillRun.stdout || "").length,
        score: skillScore.totalScore,
        complianceRate: skillScore.complianceRate,
        passedChecks: skillScore.passedChecks,
      };

      // Double-blind randomization
      const blinded = blindRandomize(bareArm, skillArm);

      // Judging
      const judgment = evaluateBlindJudge(blinded, (c1, c2) => {
        if (typeof judgeRunner === "function") {
          return judgeRunner(c1, c2, item);
        }
        // Default deterministic judge based on rubric score & compliance
        if (c1.score > c2.score) return "candidate1";
        if (c2.score > c1.score) return "candidate2";
        if (c1.complianceRate > c2.complianceRate) return "candidate1";
        if (c2.complianceRate > c1.complianceRate) return "candidate2";
        return "tie";
      });

      results.push({
        taskId: item.id,
        skill: suite.skill,
        prompt: item.prompt,
        winner: judgment.winner,
        loser: judgment.loser,
        bare: bareArm,
        skill: skillArm,
      });
    }
  }

  const summary = calculateAbSummary(results);

  let historyPath = null;
  if (persistHistory && results.length > 0) {
    const historyDir = join(root, "evals", "results");
    mkdirSync(historyDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `ab-${timestamp}.json`;
    const fullPath = join(historyDir, fileName);

    const payload = {
      timestamp: new Date().toISOString(),
      tasksCount: results.length,
      summary,
      results,
    };

    writeFileSync(fullPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    historyPath = `evals/results/${fileName}`;
  }

  return {
    tasksCount: results.length,
    results,
    summary,
    historyPath,
  };
}
