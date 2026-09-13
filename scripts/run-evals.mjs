#!/usr/bin/env node
/**
 * run-evals.mjs — opt-in live loop and history for the per-skill eval harness.
 *
 * The gate is completely OFFLINE: `pnpm test` runs `test/evals.test.mjs`
 * (deterministic, no network, no model). This script is the opposite half —
 * it is never wired to `pnpm test` or CI and must be run explicitly:
 *
 *   node scripts/run-evals.mjs --live [--skill <name>] [--agent-cmd "<cmd>"] [--timeout <ms>]
 *   node scripts/run-evals.mjs --compare [--skill <name>]
 *
 * --live executes every eval prompt against the configured agent command
 * (--agent-cmd or the EVAL_AGENT_CMD env var; the prompt is appended as the
 * final argument) and records the run in `evals/results/<timestamp>.json`.
 * contains/not-contains/regex check the live stdout; routes-to still invokes
 * the local skill-router (routing is a deterministic local invariant). The
 * exit code reflects the live results for local scripting — no gate depends
 * on it.
 *
 * --compare reads the two most recent history files and reports regressions
 * (true -> false), fixes (false -> true), and added/removed checks. Exit 1
 * when a regression is found.
 *
 * Never invents an agent command: without --agent-cmd/EVAL_AGENT_CMD the live
 * mode stops with instructions. Node-only, ESM, Windows-first, no deps.
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_DIR = join(REPO_ROOT, "evals", "results");
const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_CHARS = 20_000;
const MAX_STDERR_CHARS = 2_000;

function printHelp() {
  console.log(`run-evals.mjs — opt-in live loop + history for skill evals

Usage:
  node scripts/run-evals.mjs --live [--skill <name>] [--agent-cmd "<cmd>"] [--timeout <ms>]
  node scripts/run-evals.mjs --compare [--skill <name>]

  --live            Execute each eval prompt against the configured agent.
                    Agent command: --agent-cmd or EVAL_AGENT_CMD (required).
                    Example: $env:EVAL_AGENT_CMD = "opencode run"; node scripts/run-evals.mjs --live
  --compare         Diff the two most recent runs in evals/results/.
  --skill <name>    Restrict to one skill suite (both modes).
  --timeout <ms>    Per-eval timeout for --live (default ${DEFAULT_TIMEOUT_MS}).

This script never runs in pnpm test/CI; the offline gate is test/evals.test.mjs.`);
}

const args = process.argv.slice(2);
let mode = null;
let skillFilter = null;
let agentCmd = null;
let timeoutMs = DEFAULT_TIMEOUT_MS;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--live") mode = "live";
  else if (a === "--compare") mode = "compare";
  else if (a === "--skill") skillFilter = args[++i];
  else if (a === "--agent-cmd") agentCmd = args[++i];
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
  console.error("Usage error: pass --live or --compare.");
  printHelp();
  process.exit(2);
}
if (mode === "live" && (!Number.isInteger(timeoutMs) || timeoutMs <= 0)) {
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

// --- Live mode ---------------------------------------------------------------

/** Best-effort tokenizer for a command line (double/single quoted segments). */
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

/** cmd.exe quoting fallback for .cmd/.bat launchers (pnpm, etc.) on Windows. */
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

// --- Compare mode --------------------------------------------------------------

function runCompare() {
  if (!existsSync(HISTORY_DIR)) {
    console.error(`No history yet: ${HISTORY_DIR} does not exist. Run --live first.`);
    process.exit(2);
  }
  const files = readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json")).sort();
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
else runCompare();
