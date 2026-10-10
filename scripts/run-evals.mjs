#!/usr/bin/env node
/**
 * run-evals.mjs — opt-in live loop and history for the per-skill eval harness.
 *
 * The gate is completely OFFLINE: `pnpm test` runs `test/evals.test.mjs`
 * (deterministic, no network, no model). This script is the opposite half —
 * it is never wired to `pnpm test` or CI and must be run explicitly:
 *
 *   node scripts/run-evals.mjs --live [--skill <name>] [--agent-cmd "<cmd>"] [--timeout <ms>]
 *   node scripts/run-evals.mjs --ab [--skill <name>] [--agent-cmd "<cmd>"] [--judge-cmd "<cmd>"] [--max-tasks <n>]
 *   node scripts/run-evals.mjs --ab-summary [file]
 *   node scripts/run-evals.mjs --compare [--skill <name>]
 *
 * --ab executes double-blind randomized A/B evaluation comparing:
 * - Arm Control (Bare): baseline agent prompt without skill.
 * - Arm Treatment (Skill): agent prompt with loaded/injected skill instructions.
 * - Judge: blind evaluation (via --judge-cmd / EVAL_JUDGE_CMD or deterministic rubric).
 * Results are saved to `evals/results/ab-<timestamp>.json`.
 *
 * --live executes each eval prompt against the configured agent command
 * (--agent-cmd or EVAL_AGENT_CMD) and records the run in `evals/results/<timestamp>.json`.
 *
 * --compare reads the two most recent history files and reports regressions.
 *
 * Node-only, ESM, Windows-first, no deps.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REPO_ROOT,
  evaluateExpectation,
  findEvalSuites,
  readEvalJson,
  validateEvalSuite,
} from "../_shared/eval-harness.mjs";
import {
  runAbLoop,
  formatAbSummaryTable,
  calculateAbSummary,
} from "../_shared/eval-ab.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_DIR = join(REPO_ROOT, "evals", "results");
const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_CHARS = 20_000;
const MAX_STDERR_CHARS = 2_000;

function printHelp() {
  console.log(`run-evals.mjs — opt-in live loop + history for skill evals

Usage:
  node scripts/run-evals.mjs --live [--skill <name>] [--agent-cmd "<cmd>"] [--timeout <ms>]
  node scripts/run-evals.mjs --ab [--skill <name>] [--agent-cmd "<cmd>"] [--judge-cmd "<cmd>"] [--max-tasks <n>]
  node scripts/run-evals.mjs --ab-summary [file]
  node scripts/run-evals.mjs --compare [--skill <name>]

Modes:
  --live            Execute each eval prompt against the configured agent.
  --ab              Execute double-blind randomized A/B trial (Bare vs Skill).
  --ab-summary      Format and print table from latest (or specified) ab-*.json.
  --compare         Diff the two most recent runs in evals/results/.

Options:
  --agent-cmd <cmd> Command to invoke agent (or set EVAL_AGENT_CMD env var).
  --judge-cmd <cmd> Optional LLM judge command for A/B (or set EVAL_JUDGE_CMD).
  --skill <name>    Restrict to one skill suite.
  --max-tasks <n>   Maximum number of tasks to run (useful for quick pilots).
  --timeout <ms>    Per-eval timeout in ms (default ${DEFAULT_TIMEOUT_MS}).

This script never runs in pnpm test/CI; the offline gate is test/evals.test.mjs.`);
}

const args = process.argv.slice(2);
let mode = null;
let skillFilter = null;
let agentCmd = null;
let judgeCmd = null;
let maxTasks = null;
let summaryFile = null;
let timeoutMs = DEFAULT_TIMEOUT_MS;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--live") mode = "live";
  else if (a === "--ab") mode = "ab";
  else if (a === "--ab-summary") {
    mode = "ab-summary";
    if (args[i + 1] && !args[i + 1].startsWith("--")) {
      summaryFile = args[++i];
    }
  } else if (a === "--compare") mode = "compare";
  else if (a === "--skill") skillFilter = args[++i];
  else if (a === "--agent-cmd") agentCmd = args[++i];
  else if (a === "--judge-cmd") judgeCmd = args[++i];
  else if (a === "--max-tasks") maxTasks = parseInt(args[++i], 10);
  else if (a === "--timeout") timeoutMs = parseInt(args[++i], 10);
  else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${a}`);
    printHelp();
    process.exit(2);
  }
}

if (!mode) {
  console.error("Usage error: pass --live, --ab, --ab-summary, or --compare.");
  printHelp();
  process.exit(2);
}

if ((mode === "live" || mode === "ab") && (!Number.isInteger(timeoutMs) || timeoutMs <= 0)) {
  console.error("Usage error: --timeout must be a positive integer (ms).");
  process.exit(2);
}

function selectSuites() {
  const suites = findEvalSuites(REPO_ROOT).filter((s) => !skillFilter || s.skill === skillFilter);
  if (suites.length === 0) {
    console.error(`No eval suites found${skillFilter ? ` for skill "${skillFilter}"` : ""}.`);
    process.exit(2);
  }
  return suites;
}

function assertValidSchemas(suites) {
  const problems = [];
  for (const suite of suites) {
    const loaded = readEvalJson(suite.evalsPath);
    if (!loaded.ok) {
      problems.push(`${suite.skill}: ${loaded.error}`);
      continue;
    }
    for (const err of validateEvalSuite(loaded.raw, { skill: suite.skill }).errors) {
      problems.push(`${err.skill} ${err.evalId} ${err.field}: ${err.message}`);
    }
  }
  if (problems.length > 0) {
    console.error(`Invalid eval suites:\n${problems.join("\n")}`);
    process.exit(2);
  }
}

// --- Tokenizer & Process Spawner ---------------------------------------------

function tokenizeCommand(command) {
  const tokens = [];
  let current = "";
  let quote = null;
  for (const ch of command) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

const winQuote = (value) => (/[\s"&|<>^]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

function spawnAgent(tokens, prompt, timeout) {
  const started = Date.now();
  const options = { encoding: "utf8", timeout, maxBuffer: 16 * 1024 * 1024 };
  let result = spawnSync(tokens[0], [...tokens.slice(1), prompt], options);
  if (result.error && process.platform === "win32") {
    const line = [tokens[0], ...tokens.slice(1), prompt].map(winQuote).join(" ");
    result = spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", line], options);
  }
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? (result.error ? -1 : 0),
    durationMs: Date.now() - started,
  };
}

function writeHistory(payload) {
  mkdirSync(HISTORY_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(HISTORY_DIR, `${stamp}.json`);
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return `evals/results/${stamp}.json`;
}

// --- Live Single-Arm Mode ----------------------------------------------------

function runLive() {
  const command = agentCmd ?? process.env.EVAL_AGENT_CMD ?? null;
  if (!command || !command.trim()) {
    console.error("Missing agent command: pass --agent-cmd \"<cmd>\" or set EVAL_AGENT_CMD.");
    console.error('Example: $env:EVAL_AGENT_CMD = "opencode run"; node scripts/run-evals.mjs --live');
    process.exit(2);
  }
  const tokens = tokenizeCommand(command);
  if (tokens.length === 0) {
    console.error(`Agent command "${command}" resolved to zero tokens.`);
    process.exit(2);
  }

  const suites = selectSuites();
  assertValidSchemas(suites);

  const startedAt = new Date().toISOString();
  const results = [];
  for (const suite of suites) {
    const { raw } = readEvalJson(suite.evalsPath);
    for (const item of raw.evals) {
      if (maxTasks && results.length >= maxTasks) break;
      const run = spawnAgent(tokens, item.prompt, timeoutMs);
      const checks = item.expectations.map((exp) =>
        evaluateExpectation(exp, { text: run.stdout, prompt: item.prompt, root: REPO_ROOT })
      );
      const ok = checks.every((c) => c.ok);
      results.push({
        skill: suite.skill,
        evalId: item.id,
        prompt: item.prompt,
        ok,
        exitCode: run.exitCode,
        durationMs: run.durationMs,
        checks,
        output: run.stdout.slice(0, MAX_OUTPUT_CHARS),
        outputTruncated: run.stdout.length > MAX_OUTPUT_CHARS,
        stderr: run.stderr.slice(0, MAX_STDERR_CHARS),
      });
      console.log(`${ok ? "✔" : "✖"} ${suite.skill} ${item.id} (exit ${run.exitCode}, ${run.durationMs}ms)`);
      for (const check of checks) {
        if (!check.ok) console.log(`    ✖ ${check.expectation} — ${check.detail}`);
      }
    }
  }

  const failureCount = results.reduce((n, r) => n + r.checks.filter((c) => !c.ok).length, 0);
  const checkCount = results.reduce((n, r) => n + r.checks.length, 0);
  const summary = {
    suites: suites.length,
    evals: results.length,
    evalsGreen: results.filter((r) => r.ok).length,
    checks: checkCount,
    failed: failureCount,
  };
  const historyPath = writeHistory({
    version: 1,
    mode: "live",
    agentCmd: command,
    startedAt,
    finishedAt: new Date().toISOString(),
    summary,
    results,
  });

  console.log("");
  console.log(
    `Evals: ${summary.evalsGreen}/${summary.evals} green · checks: ${checkCount - failureCount}/${checkCount} · history: ${historyPath}`
  );
  console.log("Reminder: this run never gates; the offline gate is `pnpm test`.");
  process.exitCode = failureCount === 0 ? 0 : 1;
}

// --- Live Double-Blind A/B Mode ----------------------------------------------

function runAb() {
  const command = agentCmd ?? process.env.EVAL_AGENT_CMD ?? null;
  if (!command || !command.trim()) {
    console.error("Missing agent command: pass --agent-cmd \"<cmd>\" or set EVAL_AGENT_CMD.");
    console.error('Example: $env:EVAL_AGENT_CMD = "opencode run"; node scripts/run-evals.mjs --ab');
    process.exit(2);
  }
  const tokens = tokenizeCommand(command);
  if (tokens.length === 0) {
    console.error(`Agent command "${command}" resolved to zero tokens.`);
    process.exit(2);
  }

  const suites = selectSuites();
  assertValidSchemas(suites);

  const judgeCommand = judgeCmd ?? process.env.EVAL_JUDGE_CMD ?? null;
  const judgeTokens = judgeCommand ? tokenizeCommand(judgeCommand) : null;

  console.log(`Starting Live A/B Trial across ${suites.length} suite(s)...`);
  console.log(`  Agent runner: ${command}`);
  console.log(`  Judge runner: ${judgeCommand ? judgeCommand : "Deterministic Rubric (Auto-Score)"}`);
  console.log("");

  const agentRunner = (prompt) => spawnAgent(tokens, prompt, timeoutMs);

  let judgeRunner = null;
  if (judgeTokens && judgeTokens.length > 0) {
    judgeRunner = (c1, c2, item) => {
      const judgePrompt = [
        `You are an impartial judge evaluating two candidate AI responses for a task.`,
        `Task: ${item.prompt}`,
        ``,
        `--- Candidate 1 ---`,
        c1.stdout,
        `--- Candidate 2 ---`,
        c2.stdout,
        ``,
        `Evaluate both candidates on task completion, correctness, adherence to conventions, and conciseness.`,
        `Reply ONLY with valid JSON in this exact format:`,
        `{"winner": "candidate1" | "candidate2" | "tie", "reason": "concise explanation"}`,
      ].join("\n");

      const run = spawnAgent(judgeTokens, judgePrompt, timeoutMs);
      try {
        const parsed = JSON.parse(run.stdout.trim());
        if (["candidate1", "candidate2", "tie"].includes(parsed.winner)) {
          return parsed.winner;
        }
      } catch {
        // Fall back to score comparison
      }
      return c1.score > c2.score ? "candidate1" : c2.score > c1.score ? "candidate2" : "tie";
    };
  }

  const abRun = runAbLoop({
    root: REPO_ROOT,
    agentRunner,
    judgeRunner,
    skillFilter,
    maxTasks,
    persistHistory: true,
  });

  for (const r of abRun.results) {
    const icon = r.winner === "skill" ? "🏆 [Skill Win]" : r.winner === "bare" ? "⚠️  [Bare Win]" : "🤝 [Tie]";
    console.log(`${icon} ${r.skill} :: ${r.taskId}`);
    console.log(`    Bare: score ${r.bare.score}/5, ${r.bare.outputChars} chars, ${r.bare.durationMs}ms`);
    console.log(`    Skill: score ${r.skill.score}/5, ${r.skill.outputChars} chars, ${r.skill.durationMs}ms`);
  }

  console.log("");
  console.log(formatAbSummaryTable(abRun.summary));
  if (abRun.historyPath) {
    console.log(`\nPersisted run artifact: ${abRun.historyPath}`);
  }
}

// --- A/B Summary Mode --------------------------------------------------------

function runAbSummary() {
  let targetPath = null;
  if (summaryFile) {
    targetPath = join(REPO_ROOT, summaryFile);
    if (!existsSync(targetPath)) targetPath = summaryFile;
  } else {
    if (!existsSync(HISTORY_DIR)) {
      console.error(`No history directory found at ${HISTORY_DIR}.`);
      process.exit(2);
    }
    const files = readdirSync(HISTORY_DIR).filter((f) => f.startsWith("ab-") && f.endsWith(".json")).sort();
    if (files.length === 0) {
      console.error("No ab-*.json results found in evals/results/. Run --ab first.");
      process.exit(2);
    }
    targetPath = join(HISTORY_DIR, files[files.length - 1]);
  }

  if (!existsSync(targetPath)) {
    console.error(`Results file not found: ${targetPath}`);
    process.exit(2);
  }

  const payload = JSON.parse(readFileSync(targetPath, "utf8"));
  const summary = payload.summary ?? calculateAbSummary(payload.results ?? []);
  console.log(formatAbSummaryTable(summary));
  console.log(`\nSource: ${targetPath}`);
}

// --- Compare Mode ------------------------------------------------------------

function runCompare() {
  if (!existsSync(HISTORY_DIR)) {
    console.error(`No history yet: ${HISTORY_DIR} does not exist. Run --live first.`);
    process.exit(2);
  }
  const files = readdirSync(HISTORY_DIR).filter((f) => !f.startsWith("ab-") && f.endsWith(".json")).sort();
  if (files.length < 2) {
    console.error(`History has ${files.length} run(s); --compare needs at least 2.`);
    process.exit(2);
  }
  const [previousFile, currentFile] = files.slice(-2);
  const previous = JSON.parse(readFileSync(join(HISTORY_DIR, previousFile), "utf8"));
  const current = JSON.parse(readFileSync(join(HISTORY_DIR, currentFile), "utf8"));

  const flatten = (run) => {
    const map = new Map();
    for (const result of run.results ?? []) {
      if (skillFilter && result.skill !== skillFilter) continue;
      for (const check of result.checks ?? []) {
        map.set(`${result.skill}::${result.evalId}::${check.expectation}`, check);
      }
    }
    return map;
  };
  const before = flatten(previous);
  const after = flatten(current);
  const regressions = [];
  const fixes = [];
  const added = [];
  const removed = [];
  for (const [key, check] of after) {
    const old = before.get(key);
    if (!old) added.push(key);
    else if (old.ok && !check.ok) regressions.push(`${key} — ${check.detail}`);
    else if (!old.ok && check.ok) fixes.push(key);
  }
  for (const key of before.keys()) {
    if (!after.has(key)) removed.push(key);
  }

  console.log(`Eval history compare${skillFilter ? ` (skill: ${skillFilter})` : ""}`);
  console.log(`  previous: evals/results/${previousFile} (${previous.startedAt ?? "?"})`);
  console.log(`  current:  evals/results/${currentFile} (${current.startedAt ?? "?"})`);
  console.log(`  regressions: ${regressions.length} · fixes: ${fixes.length} · added: ${added.length} · removed: ${removed.length}`);
  for (const line of regressions) console.log(`  ✖ regression: ${line}`);
  for (const line of fixes) console.log(`  ✔ fixed: ${line}`);
  for (const line of added) console.log(`  + added: ${line}`);
  for (const line of removed) console.log(`  - removed: ${line}`);
  process.exitCode = regressions.length === 0 ? 0 : 1;
}

if (mode === "live") runLive();
else if (mode === "ab") runAb();
else if (mode === "ab-summary") runAbSummary();
else runCompare();
