#!/usr/bin/env node
/**
 * router-replay.mjs — Deterministic offline replay of the skill-router over a
 * JSONL routing corpus (slice-2 E2 / design A6).
 *
 * Corpus format (references/routing-corpus.jsonl), one case per line:
 *   {"id":"...","query":"...","expectedPrimary":"...","group?":"...","source?":"..."}
 *
 * For every well-formed case this script spawns the existing CLI contract:
 *   spawnSync(process.execPath, [routerPath, "--query", query, "--json"])
 * Arguments are always passed as an array WITHOUT shell:true, so queries that
 * contain shell metacharacters (`;`, `|`, `$()`, backticks) are handed to the
 * router as plain text (threat matrix: subprocess execution). Each case has a
 * hard timeout and its exit code is captured.
 *
 * Zero model calls: routing is pure deterministic scoring inside the router,
 * so two consecutive runs emit byte-identical output.
 *
 * Output (stdout, single JSON object):
 *   {
 *     tool, corpus, offline,
 *     total, exactMatches, accuracy,
 *     discrepancies: [{id, line, query, expected, got}],
 *     malformedLines: [{line, reason}],
 *     consistency: {checked, groupsInMatrix, groupsCovered,
 *                   missingCanonicalCoverage[], fixturesMigrated,
 *                   fixturesMissingFromCorpus[], error?}
 *   }
 *
 * Exit codes: 0 = all cases match and corpus is clean,
 *             1 = discrepancies, malformed lines, consistency errors, or
 *                 reference inputs (overlap-matrix.json /
 *                 overlap-smoke-tests.json) that are missing or unparseable
 *                 while --no-consistency was not passed (FAIL CLOSED),
 *             2 = unreadable corpus / usage error.
 *
 * Usage:
 *   node router-replay.mjs [--corpus <path>] [--router <path>]
 *                          [--timeout <ms>] [--no-consistency]
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROUTER = join(__dirname, "skill-router.mjs");
const DEFAULT_CORPUS = join(__dirname, "..", "references", "routing-corpus.jsonl");
const MATRIX_PATH = join(__dirname, "..", "references", "overlap-matrix.json");
const FIXTURE_PATH = join(__dirname, "..", "references", "overlap-smoke-tests.json");

// --- CLI -----------------------------------------------------------------
const args = process.argv.slice(2);
let corpusPath = DEFAULT_CORPUS;
let routerPath = DEFAULT_ROUTER;
let caseTimeoutMs = 15000;
let consistency = true;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--corpus") corpusPath = args[++i];
  else if (args[i] === "--router") routerPath = args[++i];
  else if (args[i] === "--timeout") caseTimeoutMs = parseInt(args[++i], 10);
  else if (args[i] === "--no-consistency") consistency = false;
  else if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: router-replay.mjs [--corpus <path>] [--router <path>] [--timeout <ms>] [--no-consistency]");
    process.exit(0);
  }
}

function failUsage(message) {
  console.error(`router-replay: ${message}`);
  process.exit(2);
}

if (!existsSync(routerPath)) failUsage(`router not found: ${routerPath}`);
if (!existsSync(corpusPath)) failUsage(`corpus not found: ${corpusPath}`);

// --- Corpus loading ------------------------------------------------------
function validateCase(c) {
  if (typeof c !== "object" || c === null || Array.isArray(c)) return "line is not a JSON object";
  if (typeof c.id !== "string" || c.id.trim() === "") return "missing non-empty string field 'id'";
  if (typeof c.query !== "string" || c.query.trim() === "") return "missing non-empty string field 'query'";
  if (typeof c.expectedPrimary !== "string" || c.expectedPrimary.trim() === "") return "missing non-empty string field 'expectedPrimary'";
  return null;
}

const cases = [];
const malformedLines = [];
const seenIds = new Set();
try {
  const raw = readFileSync(corpusPath, "utf8");
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].trim();
    if (text === "") continue; // blank/trailing lines are skipped, not counted
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      malformedLines.push({ line: i + 1, reason: "invalid JSON" });
      continue;
    }
    const schemaError = validateCase(parsed);
    if (schemaError) {
      malformedLines.push({ line: i + 1, reason: schemaError });
      continue;
    }
    if (seenIds.has(parsed.id)) {
      malformedLines.push({ line: i + 1, reason: `duplicate case id '${parsed.id}'` });
      continue;
    }
    seenIds.add(parsed.id);
    cases.push({ ...parsed, line: i + 1 });
  }
} catch (err) {
  failUsage(`cannot read corpus: ${err.message}`);
}

// --- Replay --------------------------------------------------------------
function runCase(query) {
  // Args array + NO shell:true: metacharacters can never reach a shell.
  const res = spawnSync(process.execPath, [routerPath, "--query", query, "--json"], {
    shell: false,
    encoding: "utf8",
    timeout: caseTimeoutMs,
  });
  if (res.error) {
    return { primary: `(spawn-error: ${res.error.code || res.error.message})` };
  }
  if (res.status !== 0) {
    return { primary: `(exit ${res.status}: ${(res.stderr || "").trim().slice(0, 200)})` };
  }
  try {
    return { primary: JSON.parse(res.stdout).primary };
  } catch {
    return { primary: "(unparseable router stdout)" };
  }
}

const discrepancies = [];
for (const c of cases) {
  const { primary } = runCase(c.query);
  if (primary !== c.expectedPrimary) {
    discrepancies.push({
      id: c.id,
      line: c.line,
      query: c.query,
      expected: c.expectedPrimary,
      got: primary,
    });
  }
}

// --- Triple consistency: overlap-matrix <-> smoke fixtures <-> corpus ----
function readJsonSafe(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function buildConsistency() {
  const result = {
    checked: false,
    groupsInMatrix: 0,
    groupsCovered: 0,
    missingCanonicalCoverage: [],
    fixturesMigrated: 0,
    fixturesMissingFromCorpus: [],
  };
  if (!consistency) return result;
  const matrix = readJsonSafe(MATRIX_PATH);
  const fixture = readJsonSafe(FIXTURE_PATH);
  if (!matrix || !Array.isArray(matrix.groups) || !fixture || !Array.isArray(fixture.tests)) {
    return { ...result, error: "matrix or fixture references unavailable" };
  }
  result.checked = true;
  // (1) every matrix group has >=1 corpus case resolving to its canonical
  for (const group of matrix.groups) {
    result.groupsInMatrix += 1;
    const covered = cases.some((c) => c.group === group.id && c.expectedPrimary === group.canonical);
    if (covered) result.groupsCovered += 1;
    else result.missingCanonicalCoverage.push(group.id);
  }
  // (2) every smoke fixture was migrated into the corpus verbatim
  for (const t of fixture.tests) {
    const migrated = cases.some(
      (c) => c.id === t.id && c.query === t.query && c.expectedPrimary === t.expectedPrimary
    );
    if (migrated) result.fixturesMigrated += 1;
    else result.fixturesMissingFromCorpus.push(t.id);
  }
  return result;
}

// --- Report (stable key order -> byte-identical across runs) -------------
const total = cases.length;
const exactMatches = total - discrepancies.length;
const report = {
  tool: "router-replay",
  corpus: corpusPath,
  offline: true,
  total,
  exactMatches,
  accuracy: total > 0 ? Math.round((exactMatches / total) * 10000) / 10000 : 0,
  discrepancies,
  malformedLines,
  consistency: buildConsistency(),
};
console.log(JSON.stringify(report, null, 2));

const failed =
  discrepancies.length > 0 ||
  malformedLines.length > 0 ||
  (report.consistency.checked
    ? report.consistency.missingCanonicalCoverage.length > 0 ||
      report.consistency.fixturesMissingFromCorpus.length > 0
    : consistency); // gate enabled but not checked: reference inputs missing/unparseable -> FAIL CLOSED
if (consistency && !report.consistency.checked) {
  console.error(`router-replay: consistency gate failed closed: ${report.consistency.error || "not checked"}`);
}
process.exit(failed ? 1 : 0);
